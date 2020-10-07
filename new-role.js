const request = require('superagent')
const { user, password, endpoint } = require('./shared-data.js')
const roles = require('./roles.js');

// console.log(roles) Check for post

// const promises = roles.map(item =>
//     request.post(endpoint)
//         .auth(user, password)
//         .send(item)
// )
// Promise.all(promises).then(results => {
//     results.map(item => console.log(item.body))
// }).catch(e => console.log(e))

//IIFE (immediately invoked function expression!)
(async () => {
    const promises = roles.map(item =>
        request.post(endpoint)
            .auth(user, password)
            .send(item)
    )
    try {
        const results = await Promise.all(promises)
        results.map(item => console.log(item.body))
    } catch (e) {
        console.log(e.response.body)
    }

})() 
