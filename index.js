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
    res.end('Whats happenin!');
  });
}).listen(3000, () => console.log('listening on port 3000'));
