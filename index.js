const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const server = http.createServer;

server((req, res) => {
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
    buffer += decoder.end(); // return any remaining trailing bytes using the END string_decoder method
    console.log('Recieved Request payload:', buffer);

    // * request data
    const data = { method, headers, qs, path, payload: buffer };

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
}).listen(3000, () => console.log('listening on port 3000'));

// handlers
// Each handler takes in two args -> * REQUEST DATA and a CALLBACK: represents the response
const handlers = {
  sample(data, res) {
    res(200, { title: 'this is a sample route handler' });
  },
  notFound(data, res) {
    res(404, { title: 'Page Not Found' });
  }
};

// routes
const routes = {
  sample: handlers.sample,
  notFound: handlers.notFound
};
