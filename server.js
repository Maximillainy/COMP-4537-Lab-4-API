const http = require('http');
const url = require('url');
const functions = require('./modules/utils');
const endPoint = "/api/definitions/"
let numRequests = 0;
let dictionary = {};

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
    });
    
    /**
     * Client Request:
     * GET /api/definitions/?word=boo
     * 
     * Response format:
     * {
     * "request": 102,
     * "definition": "A written or printed work consisting of pages glued or sewn together"
     * }
     */
    if (req.method === "GET") {
        console.log("Recieved GET request!");
        numRequests++;
        const query = url.parse(req.url, true).query;
        const word = query.word;
        if (functions.validateInput(word)) {
            if (dictionary[word]) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ request: numRequests, definition: dictionary[word] }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ request: numRequests, definition: "Word not found!" }));
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'apllication/json' });
            res.write(JSON.stringify({ request: numRequests, definition: "Invalid input!" }));
        }
        console.log("res" + res);
        res.end();
    }

    /**
     * Add a word and defintion to the dictionary
     * POST /api/definitions/ - Create new entry
     * 
     * Save entry to array in memory, no persistent storage
     * If a definition exists, respond: "Definition already exists!"
     */
    if (req.method === 'POST' && req.url === endPoint) {
        console.log("Recieved POST request!");
        numRequests++;
        let body = '';
         req.on('data', function (chunk) {
            if (chunk != null) {
                body += chunk;
            }
        });

        req.on('end', function () {
            console.log(body);
            let query = JSON.parse(body);
            const word = query.word;
            const definition = query.definition;
            console.log('word:', word);
            console.log('definition:', definition);

            if (functions.validateInput(word) && functions.validateInput(definition)) {
                console.log("verified input");
                if (dictionary[word]) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ request: numRequests, response: "Definition already exists!" }));
                } else {
                    dictionary[word] = definition;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ request: numRequests, response: "Seccessfully added word: " + word}));
                }
            } else {
                console.log("invalid input");
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ request: numRequests, response: "Invalid input!" }));
            }
            res.end();
        })
        
    }

    console.log('Dictionary:', dictionary);

}).listen(8080);

console.log('Running server.js');
