const http = require('http');
const dispatcher = require('httpdispatcher');
const url = require('url');
const promise = require('bluebird');
const options = { promiseLib: promise };
const pgp = require('pg-promise')(options);
const parser = require('ua-parser-js');

const cn = 'postgres://postgres:123456@61.28.227.201:5432/dw?ssl=true';
var db = pgp(cn);

const PORT = 8080;

dispatcher.setStatic('resources');

dispatcher.onGet('/logs', (req, res) => {

    res.writeHead(200, { 'Content-type': 'application/json' });
    var json = JSON.stringify({
        message: 'Insert Logs Success'
    });
    res.end(json);
});

dispatcher.onPost('/post1', (req, res) => {
    res.writeHead(200, { 'Content-type': 'text/plain' });
    res.end('Got post data');
});

const handleRequest = (request, response) => {
    try {
        const queryParams = url.parse(request.url, true).query;
        var user_agent = parser(request.headers['user-agent']);
        insertLogs(queryParams, user_agent);
        dispatcher.dispatch(request, response);
    } catch (e) {
        console.error(e);
    } finally {

    }
};

// ===========================
function insertLogs(logBody, user_agent) {
    ts = new Date();
    var body = {
        ts: ts,
        body: {
            logs: logBody,
            user_agent: user_agent
        }
    };

    db.none('insert into logs.events_write(ts, body)' +
            'values(${ts}, ${body})', body)
        .then(function() {

        })
        .catch(function(err) {
            console.log(err);
        });
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log('Server listening on http://localhost:%s', PORT);
});
