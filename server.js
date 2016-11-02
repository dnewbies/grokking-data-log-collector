const http = require('http');
const dispatcher = require('httpdispatcher');
const url = require('url');

const PORT = 8080;

dispatcher.setStatic('resources');

dispatcher.onGet('/page1', (req, res) => {
  res.writeHead(200, {'Content-type': 'text/plain'});
  res.end('Page One');
});

dispatcher.onPost('/post1', (req, res) => {
  res.writeHead(200, {'Content-type': 'text/plain'});
  res.end('Got post data');
});

const handleRequest = (request, response) => {
  try {
    const queryParams = url.parse(request.url, true).query;
    console.log(queryParams);
    dispatcher.dispatch(request, response);
  } catch (e) {
    console.error(e);
  } finally {

  }
};

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('Server listening on http://localhost:%s', PORT);
});
