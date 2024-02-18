const http = require('http');
const url = require('url');
const functions = require('./modules/utils');

const endPoint = "/api/definitions/"
let numRequests = 0;
let dictionary = {};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST'
}

http.createServer(function (req, res) {
    const reqPath = url.parse(req.url, true).pathname;

    /**
     * Client Request:
     * GET /api/definitions/?word=book
     * 
     * Response format:
     * {
     * "request": 102,
     * "definition": "A written or printed work consisting of pages glued or sewn together"
     * }
     */
    if (req.method === "GET" && reqPath === endPoint) {
        numRequests++;
        const query = url.parse(req.url, true).query;
        const word = query.word.toLowerCase();
        try {
            if (functions.validateInput(word)) {
                if (dictionary[word]) {
                    res.writeHead(200, DEFAULT_HEADERS);
                    res.write(JSON.stringify({ request: numRequests, definition: dictionary[word] }));
                } else {
                    res.writeHead(400, DEFAULT_HEADERS);
                    res.write(JSON.stringify({ request: numRequests, definition: "Word not found!" }));
                }
            } else {
                throw new Error("Invalid input!");
            }
        } catch (error) {
            res.writeHead(400, DEFAULT_HEADERS);
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
     * 
     * 
     * Response format:
     * {
     * "request": 102,
     * "responce": "Successfully added word: book"
     * }
     */
    if (req.method === 'POST' && reqPath === endPoint) {
        numRequests++;
        let body = '';
         req.on('data', function (chunk) {
            if (chunk != null) {
                body += chunk;
            }
        });

        req.on('end', function () {
            try {
                console.log(body);
                let query = JSON.parse(body);
                const word = query.word.toLowerCase();
                const definition = query.definition;

                if (functions.validateInput(word) && functions.validateInput(definition)) {
                    if (dictionary[word]) {
                        res.writeHead(400, DEFAULT_HEADERS);
                        res.write(JSON.stringify({ request: numRequests, response: "Word already exists!" }));
                    } else {
                        dictionary[word] = definition;
                        res.writeHead(200, DEFAULT_HEADERS);
                        res.write(JSON.stringify({ request: numRequests, response: "Successfully added word: " + word}));
                    }
                } else {
                    res.writeHead(400, DEFAULT_HEADERS);
                    res.write(JSON.stringify({ request: numRequests, response: "Invalid input!" }));
                }
            } catch (error) {
                res.write(JSON.stringify({ request: numRequests, response: "Invalid input!" }));

            }
            res.end();
        })
    }

    /**
     * Endpoint not found or method not allowed
     */
    if (reqPath !== endPoint) {
        numRequests++;
        res.writeHead(404);
        res.write(JSON.stringify({ request: numRequests, error: "Not Found" }));
        res.end();
    } else if (req.method !== 'GET' && req.method !== 'POST') {
        numRequests++;
        res.writeHead(405);
        res.write(JSON.stringify({ request: numRequests, error: "Method not allowed" }));
        res.end();
    }

}).listen(8080);

console.log('Running server.js');
