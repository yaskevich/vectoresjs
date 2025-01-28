import express from 'express';
import path from 'path';
import loki from 'lokijs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3434;
const model = 'ruscorpora_upos_cbow_300_20_2019';
// let model = 'tayga_upos_skipgram_300_2_2019';
const format = 'json';
const colName = 'entries';

const autoloadCallback = () => {
    db.getCollection(colName) || db.addCollection(colName, { indices: ['word', 'wordpos'] });
    console.log('Records:', db.getCollection(colName).count());
};

const cssPath = path.join(__dirname, 'node_modules', 'mini.css', 'dist');
const staticPath = path.join(__dirname, '..', 'static');
const dbPath = path.join(__dirname, 'vectores.db');

const db = new loki(dbPath, {
    autoload: true, autoloadCallback, autosave: true, autosaveInterval: 1000
});

const app = express();
app.use(express.static(staticPath));
app.use(express.static(cssPath));

app.get('/', (req, res) => res.sendFile(path.join(staticPath, 'index.html')));

app.get('/last',
    (req, res) => {
        const count = db.getCollection(colName).count()
        if (count) {
            const dbres = db.getCollection(colName).get(count);
            // console.log("last");
            // console.log(dbres);
            res.send(dbres.data);
        } else {
            res.sendFile(path.join(staticPath, 'def.json'));
        }
    });

app.get('/def', (req, res) => res.sendFile(path.join(staticPath, 'data.json')));

app.get('/syn', async (req, res) => {
    // let userLangs = req.acceptsLanguages();
    // let curLang = userLangs ? userLangs[0].substring(0, 2) : "en";
    // console.log("user language:", curLang);
    let word = (req.query?.word && /^[А-ЯЁа-яё]+[A-Za-z_]*$/.test(req.query.word)) ? req.query.word : 'проблема';
    const url = ['https://rusvectores.org', model, encodeURIComponent(word), 'api', format].join('/');
    //https://github.com/techfort/LokiJS/wiki
    const dbres = db.getCollection(colName).find({ word });
    console.log(word, url);
    if (dbres.length) {
        // console.log('SERVED FROM CACHE!');
        res.send(dbres.shift().data);
    } else {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.log('ERROR', word);
                throw new Error(`Response status: ${response.status}`);
            }
            const data = await response.json();
            // console.log(data);
            db.getCollection(colName).insert({ word, wordpos: word, data });
            res.json(data);
        } catch (error) {
            console.error(error.message);
        }
    }
});

app.listen(port, () => console.log('Listening to port ' + port));
