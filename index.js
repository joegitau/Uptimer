const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // parse the url
  const parsedURL = url.parse(req.url, true);

  // strip trailing slashes
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get the http method
  const method = req.method;

  res.end('whats happening\n');

  console.log(method); // http method
  console.log(trimmedPath); // trimmed url path
});

server.listen(3000, console.log('listening on port 3000'));
