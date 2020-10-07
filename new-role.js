const request = require('superagent')
const d = require('./shared-data.js')

request.post(d.endpoint)
    .auth(d.u, d.p)
    .set(d.contentType.contentType, d.contentType.Json)
    .send('{"id":"Atlanta-dev-role","name":"Atlanta-dev-role","description": "Atlanta dev team role","privileges":["nx-repository-admin-maven2-maven-central-*","nx-analytics-all"]}')
    .then(response => {
        console.log(response.body);
    }).catch(error => {
        console.log(JSON.stringify(error, null, 2));
    });