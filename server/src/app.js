const path = require('path');
const api = require('./api.js');
const express = require('express');
var cors = require("cors");
const app = express()
app.use(cors())

//BDD
const {MongoClient} = require('mongodb');
const url = "mongodb+srv://mommy:PTi2vdZEmm3OWbqI@birdy-cluster.q2kqgur.mongodb.net/test/";
const client = new MongoClient(url, { useNewUrlParser: true });

client.connect(err => {
    if (err){
        console.log("Could not connect to MONGODB",err);
        return;
    }
})
const db = client.db('test')

// Détermine le répertoire de base
const basedir = path.normalize(path.dirname(__dirname));
console.debug(`Base directory: ${basedir}`);


const session = require("express-session");

app.use(session({
    secret: "technoweb rocks"
}));

app.use('/api', api.default(db));
app.post('/api', api.default(db));
// Démarre le serveur
app.on('close', () => {
});

client.close();
exports.default = app;

