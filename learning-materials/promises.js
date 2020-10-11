// Resolve and reject parameters for the new promise
let p = new Promise((resolve, reject) => {
// Define the promise in lines 4/5 --
// the arithmetic
    let a = 1 + 2
    if (a == 2) {
        resolve('Success') // This is inherited from the declared parameter above
    } else {
        reject('Failed') // This is inherited from the declared parameter above
    }
})

// then: when the promise is resolved
// anything thats run inside .then is going to run the resolved
p.then((message) => {
    console.log('This is in the then ' + message)
// catch: when the promise is rejected 
// running a catch catches errors  
}).catch((message) => {
    console.log('This is in the catch ' + message)
})