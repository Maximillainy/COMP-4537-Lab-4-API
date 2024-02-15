const http = require('http');
const url = require('url');
const functions = require('./modules/utils');

const endPoint = "/api/definitions/"
let numRequests = 0;
let dictionary = {};

http.createServer(function (req, res) {
    const reqPath = url.parse(req.url, true).pathname;
    numRequests++;

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
    if (req.method === "GET" && reqPath === endPoint) {
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
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ request: numRequests, definition: "Invalid input!" }));
        }
        res.end();
    }

    /**
     * Add a word and defintion to the dictionary
     * POST /api/definitions/ - Create new entry
     * 
     * Save entry to array in memory, no persistent storage
     * If a definition exists, respond: "Definition already exists!"
     */
    if (req.method === 'POST' && reqPath === endPoint) {
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

            if (functions.validateInput(word) && functions.validateInput(definition)) {
                if (dictionary[word]) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ request: numRequests, response: "Word already exists!" }));
                } else {
                    dictionary[word] = definition;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({ request: numRequests, response: "Successfully added word: " + word}));
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ request: numRequests, response: "Invalid input!" }));
            }
            res.end();
        })
        
    }

}).listen(8080);

console.log('Running server.js');
