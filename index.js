const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder');

const server = http.createServer((req, res) => {
  // parse the url
  const parsedURL = url.parse(req.url, true);

  // strip trailing slashes
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get the query string as an object
  const queryStringObj = parsedURL.query;

  // get the http method
  const method = req.method.toLowerCase();

  // get the headers as an object
  const headers = req.headers;

  // get the payload
  const decoder = new StringDecoder('utf8');
  let buffer = '';

  req.on('data', chunk => {
    buffer += decoder.write(chunk);
  });

  req.on('end', () => {
    buffer += decorder.end();
    res.end('whats happening\n');
  });

  console.log(method); // http method
  console.log(trimmedPath); // trimmed url path
  console.log(queryStringObj); // query string object
  console.log(headers); // headers
});

server.listen(3000, () => console.log('listening on port 3000'));
