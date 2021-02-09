'use strict';

import express from 'express';
import path from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import urljoin from 'url-join';
import axios from 'axios';
import loki from 'lokijs';
import proxy from 'http-proxy-middleware';
import dotenv from 'dotenv';
// const morgan = require('morgan')
// app.use(morgan('combined'));
import { fileURLToPath } from 'url';

(async () => {
	dotenv.config();
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const port = process.env.PORT || 4000;
	const backendPort = process.env.APIPORT || 5000;
	const defaultModel = process.env.MODEL;
	const clientPath = path.join(__dirname, '..', 'front');
	// check the paths for PM2
    const db = new loki('vectores.db', {
        autoload: true,
        autoloadCallback: databaseInitialize,
        autosave: true,
        autosaveInterval: 1000
    });
	
    function databaseInitialize() {
        let entries = db.getCollection("entries");
        if (entries === null) {
            entries = db.addCollection('entries', {
                indices: ['word', 'wordpos']
            });
        }
        const entryCount = db.getCollection("entries").count();
        console.log("Entries in DB: " + entryCount);
    }
	
    const app = express();
	app.set('trust proxy', true);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(clientPath));
    app.use(express.static('./node_modules/mini.css/dist'))
	app.use('/api', proxy.createProxyMiddleware({ target: `http://localhost:${backendPort}`, changeOrigin: true, pathRewrite: {'^/api' : '/'} }));
    app.get('/last', async (req, res) => {
        const count = db.getCollection("entries").count();
        if (count) {
            const dbres = db.getCollection("entries").get(count);
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
    app.get('/syn', async (req, res) => {
        let word = "день";
        if (req.query.hasOwnProperty("word")) {
            let wordIn = req.query["word"];
            if (/^[А-ЯЁа-яёіІЎўЇїA-Za-z_]*$/.test(wordIn) && wordIn) {
                console.log(wordIn);
                word = wordIn;
            }
        }
        //https://github.com/techfort/LokiJS/wiki
        const dbres = db.getCollection("entries").find({
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
                    res.send({ error });
                });
        }
    });
    app.get('/sim', async (req, res) => {
        let word = "";
        if (req.query.hasOwnProperty("word") && req.query["word"] && /^[A-Za-zА-ЯЁа-яёієїЎўЇїґ\'A-Za-z_\*\:]*$/.test(req.query["word"])) {
            word = req.query["word"];
        } else {
			return res.sendFile(path.join(clientPath, 'def.json'));
		}
        
        const dbres = db.getCollection("entries").find({ word: word });
		const model = req.query["model"] || defaultModel;
        const format = "json";
        const newurl = 'http://localhost:' + backendPort + '/sim?m=' + model + "&w=" + encodeURIComponent(word);
        console.log("query", newurl);
        
        if (dbres.length && false) {
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
                    res.send({ error });
                });
        }
        // res.send(JSON.stringify({value: newurl}));
    });
    app.listen(port);
    console.log("Server started on port " + port);
})();
