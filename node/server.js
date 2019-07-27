'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
// app.get('/', (req, res) => {
//   res.send('Hello world tessssst\n');
// });
app.get('/test', (req, res) => {
    res.status(200).send(JSON.stringify({
        test: process.env.TEST
    }))
})

app.use(express.static('public'))

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

