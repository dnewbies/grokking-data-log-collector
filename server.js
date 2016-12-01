const http = require('http');
const dispatcher = require('httpdispatcher');
const url = require('url');
const promise = require('bluebird');
const options = { promiseLib: promise };
const pgp = require('pg-promise')(options);
const parser = require('ua-parser-js');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const cn = 'postgres://postgres:123456@61.28.227.201:5432/dw?ssl=true';
var db = pgp(cn);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 8080));

app.listen(app.get('port'), function() {
    console.log('Server start at port : ', app.get('port'));
});

app.get('/logs', function(req, res) {
    console.log(req.query);

    var user_agent = parser(req.headers['user-agent']);
    insertLogs(req.query, user_agent, function(data) {
      res.status(200)
          .json({
              message: 'Insert Logs Success'
          });
    });
});

function insertLogs(logBody, user_agent, callback) {
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
        .then(function(data) {
          return callback(data);
        })
        .catch(function(err) {
            console.log(err);
        });
}
