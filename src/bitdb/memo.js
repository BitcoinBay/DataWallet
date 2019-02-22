var fetch = require('isomorphic-unfetch');
var btoa = require('btoa');

var query = {
    "v": 3,
    "q": {
        "find": { "out.b0": { "op": 106 }, "out.h1": "6d02" },
        "limit": 10,
        "project": { "out.$": 1 }
    },
    "r": {
        "f": "[ .[] | { msg: .out[0].s2 } ]"
    }
}

// Turn the query into base64 encoded string.
// This is required for accessing a public bitdb node
var b64 = btoa(JSON.stringify(query));
var url = "https://bitdb.bitcoin.com/q/" + b64;

// Make an HTTP request to https://bitdb.bitcoin.com/q/ public endpoint
fetch(url).then(function(r) {
    return r.json()
}).then(function(r) {
    // "r.c" stands for confirmed transactions response array
    // Parse the response and render the results on the screen
    r.c.forEach(function(output) {
        console.log("New Post:", "\n", output.msg, "\n");
    })
})
