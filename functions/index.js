const functions = require("firebase-functions");
const express = require('express')

const app = express()

app.get('/hello-world', (req, res) => {
    return res.status(200).json({message: 'Hello World'})
});

exports.app = functions.https.onRequest(app);
