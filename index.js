const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const config = require('./config/config');
const utils = require('./src/utils');
const routes = require('./src/routes');

const httpsServer = https.createServer;
const httpServer = http.createServer;

// testing: create
// _data.create('mason', 'newFile', { name: 'mason' }, err => {
//   console.error(err);
// });

// testing: read
// _data.read('mason', 'newFile', (err, data) => {
//   if (err) return console.error(err);
//   console.log(data);
// });

// testing: update
// _data.update('mason', 'newFile', { age: 3 }, err => {
//   console.error(err);
// });

// testing: delete
// _data.delete('mason', 'newFile', err => {
//   console.error(err);
// });

// http server
httpServer((req, res) => {
  unifiedServer(req, res);
}).listen(config.httpPort, () =>
  console.log(`listening on port ${config.httpPort}`)
);

// https server
// https ssl cert and key
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

httpsServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
}).listen(config.httpsPort, () =>
  console.log(`listening on port ${config.httpsPort}`)
);

// serve both http and https servers
const unifiedServer = (res, req) => {
  // get the request method -> necessary while making routes
  const method = req.method.toLowerCase(); // url method
  const headers = req.headers; // http request headers

  // get the url path
  const parsedPath = url.parse(req.url, true); // returns amongst others - pathname, path, query{}
  const qs = parsedPath.query; // query string
  const path = parsedPath.pathname.replace(/^\/+|\/+$/g, ''); // standardize pathname to strip out trailing slashes

  // decode buffer object into string === buffer.toString()
  const decoder = new StringDecoder('utf8');
  let buffer = '';

  req.on('data', chunk => {
    buffer += decoder.write(chunk); // return the decoded string using the WRITE string_decoder method
  });

  req.on('end', () => {
    buffer += decoder.end(); // return any remaining/ trailing bytes using the END string_decoder method
    console.log('Recieved Request payload:', buffer);

    // * request data
    const data = {
      method,
      headers,
      qs,
      path,
      payload: utils.parseJsonToObj(buffer) // buffer parsed to json obj
    };

    // get the matching request route it to corresponding handler
    const route =
      typeof routes[path] !== 'undefined' ? routes[path] : routes['notFound'];

    // each route will accept two args - data and a callback (in this case, the response object as the handler will be out of scope)
    route(data, (statusCode, payload) => {
      typeof statusCode === 'number' ? statusCode : 200; // accepts what is provided or defaults to 200
      typeof payload === 'object' ? payload : {}; // the response sent back to client -> if empty, default to empty object

      // return stringified object to the client
      const payloadString = JSON.stringify(payload);

      // return response to client
      res.setHeader('Accept-Control-Accept-Origin', '*'); // cors
      res.writeHead(statusCode, { 'Content-Type': 'application/json' }); // status code & content type
      res.end(payloadString);

      console.log('Returned response: ', statusCode, payloadString);
    });
  });
};
