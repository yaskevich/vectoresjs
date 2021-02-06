'use strict';

import express from 'express';
import path from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import urljoin from 'url-join';
import axios from 'axios';
import loki from 'lokijs';
import dotenv from 'dotenv';
// const morgan = require('morgan')
// app.use(morgan('combined'));
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
	dotenv.config();
	const port = process.env.PORT || 4000;

	const backendPort = process.env.APIPORT || 5000;
	const defaultModel = process.env.MODEL;
	const clientPath = path.join(__dirname, '..', 'front');
	// check the paths for PM2
	
	
    var db = new loki('vectores.db', {
        autoload: true,
        autoloadCallback: databaseInitialize,
        autosave: true,
        autosaveInterval: 1000
    });

    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // app.use(express.static('public'));
    app.set('trust proxy', true);
    app.use(express.static(clientPath))
    app.use(express.static('./node_modules/mini.css/dist'))
    // implement the autoloadback referenced in loki constructor
    function databaseInitialize() {
        var entries = db.getCollection("entries");
        if (entries === null) {
            entries = db.addCollection('entries', {
                indices: ['word', 'wordpos']
            });
        }
        // kick off any program logic or start listening to external events
        runProgramLogic();
    }

    // example method with any bootstrap logic to run after database initialized
    function runProgramLogic() {
        var entryCount = db.getCollection("entries").count();
        console.log("number of entries in database : " + entryCount);
    }

    app.get('/last', async (req, res) => {
        var count = db.getCollection("entries").count();
        if (count) {
            var dbres = db.getCollection("entries").get(count);
            console.log("last");
            // console.log(dbres);
            res.send(dbres.data);
        } else {
            res.sendFile(path.join(clientPath, 'def.json'));
        }
    });


    app.get('/def', async (req, res) => {
        res.sendFile(path.join(clientPath, 'data.json'));
    });


    app.get('/menu', async (req, res) => {
        res.sendFile(path.join(__dirname, 'menu.json'));
    });


    app.get('/status', async (req, res) => {
        const newurl = 'http://localhost:' + backendPort + '/status';
        axios.get(newurl)
            .then(response => {
                console.log(response.data);
                res.sendStatus(response.status);
            })
            .catch(error => {
                // console.log(error);
                res.sendStatus(404);
            });
    });

    app.get('/syn', async (req, res) => {
        let word = "день";
        if (req.query.hasOwnProperty("word")) {
            let wordIn = req.query["word"];
            if (/^[А-ЯЁа-яё]+[A-Za-z_]*$/.test(wordIn) && wordIn) {
                console.log(wordIn);
                word = wordIn;
            }
        }
        //https://github.com/techfort/LokiJS/wiki
        var dbres = db.getCollection("entries").find({
            word: word
        });
        // console.log("db", word, dbres.length);
        let model = "ruscorpora_upos_cbow_300_20_2019";
        let format = "json";
        let newurl = urljoin('https://rusvectores.org', model, encodeURIComponent(word), 'api', format)
        // logger.log("info", req.headers['user-agent']);
        if (dbres.length) {
            //res.send({error});
            //console.log("in db", dbres.shift().data);
            console.log("SERVED FROM CACHE!");
            res.send(dbres.shift().data);
        } else {
            axios.get(newurl)
                .then(response => {
                    console.log(response.data);
                    db.getCollection("entries").insert({
                        word: word,
                        wordpos: word,
                        data: response.data
                    });
                    res.send(response.data);
                })
                .catch(error => {
                    console.log(error);
                    res.send({
                        error
                    });
                });
        }
    });

    app.get('/sim', async (req, res) => {

        let word = "день";
        if (req.query.hasOwnProperty("word")) {
            let wordIn = req.query["word"];
            if (/^[A-Za-zА-ЯЁа-яёієїґ\']+[A-Za-z_]*$/.test(wordIn) && wordIn) {
                console.log(wordIn);
                word = wordIn;
            }
        }
        const model = req.query["model"] || defaultModel;
        //https://github.com/techfort/LokiJS/wiki
        var dbres = db.getCollection("entries").find({
            word: word
        });
        // console.log("db", word, dbres.length);

        let format = "json";
        let newurl = 'http://localhost:' + backendPort + '/sim?m=' + model + "&w=" + encodeURIComponent(word);

        console.log("query", newurl);
        // logger.log("info", req.headers['user-agent']);

        if (dbres.length && false) {
            //res.send({error});
            //console.log("in db", dbres.shift().data);
            console.log("SERVED FROM CACHE!");
            res.send(dbres.shift().data);
        } else {
            axios.get(newurl)
                .then(response => {
                    console.log(response.data);
                    db.getCollection("entries").insert({
                        word: word,
                        wordpos: word,
                        data: response.data
                    });
                    res.send(response.data);
                })
                .catch(error => {
                    console.log(error);
                    res.send({
                        error
                    });
                });
        }
        // res.send(JSON.stringify({value: newurl}));		

    });

    // app.get('/menu', async(req,res) => {
    // res.sendFile(path.join(__dirname, 'menu.json'));
    // });		

    app.listen(port);
    console.log("Server started on port " + port);
})()