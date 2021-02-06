'use strict';
const express = require('express');
var urljoin = require('url-join');
const app = express();
const fs = require('fs')  
const path = require('path')  
const axios = require('axios')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const loki = require('lokijs')
const port = 3535;
// app.use(express.static('maps'))
// app.use(morgan('combined'));


// ПРОПИСАТЬ ПУТИ ПРАВИЛЬНО, А ТО ПО АБСОЮТНОМУ ПУТИ ПМ НЕ МОЖЕТ КОРРЕКТНО ЗАПУСТИТЬ
// !!!
var db = new loki('vectores.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true, 
    autosaveInterval: 1000
});


app.use(express.static('../vectoresjs'))
app.use(express.static('./node_modules/mini.css/dist'))
// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  var entries = db.getCollection("entries");
  if (entries === null) {
    entries = db.addCollection('entries', { indices: ['word', 'wordpos'] });
  }
  // kick off any program logic or start listening to external events
  runProgramLogic();
}

// example method with any bootstrap logic to run after database initialized
function runProgramLogic() {
  var entryCount = db.getCollection("entries").count();
  console.log("number of entries in database : " + entryCount);
}

app.get('/',
// require('connect-ensure-login').ensureLoggedIn(),
function(req, res){
	// logger.log("info", req.headers['user-agent']);
res.sendFile(path.join(__dirname, '../vectoresjs/index.html'));
}); 


app.get('/last',
	function(req, res){
		var count  = db.getCollection("entries").count()
		if(count) {
			var dbres = db.getCollection("entries").get(count);
			console.log("last");
			// console.log(dbres);
			res.send(dbres.data);
		} else {
			res.sendFile(path.join(__dirname, '../vectoresjs/def.json'));
		}
}); 

app.get('/def', function(req, res){
	res.sendFile(path.join(__dirname, '../vectoresjs/data.json'));
}); 

app.get('/syn',
	function(req, res){
		let word  = "день";
		if (req.query.hasOwnProperty("word")){
			let wordIn = req.query["word"]; 
			if (/^[А-ЯЁа-яё]+[A-Za-z_]*$/.test(wordIn) && wordIn){
				console.log(wordIn);
				word = wordIn;
			}
		}
		//https://github.com/techfort/LokiJS/wiki
		var dbres = db.getCollection("entries").find({ word :word });
		// console.log("db", word, dbres.length);
		
		let model = "ruscorpora_upos_cbow_300_20_2019";
		let format  = "json";
		let newurl =  urljoin('https://rusvectores.org', model, encodeURIComponent(word), 'api', format)
		
	// logger.log("info", req.headers['user-agent']);
	
	if (dbres.length){
		//res.send({error});
		//console.log("in db", dbres.shift().data);
		console.log("SERVED FROM CACHE!");
		res.send(dbres.shift().data);
	} else {
		axios.get(newurl)
		  .then(response => {
			  //let obj = response.data;
			  //obj = obj[Object.keys(obj)[0]];
			  //obj = obj[Object.keys(obj)[0]];
			// console.log(obj);
			console.log(response.data);
			db.getCollection("entries").insert( { word : word, wordpos: word, data: response.data } );
			res.send(response.data);
			
			
			// axios.all([
			  // axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2017-08-03'),
			  // axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2017-08-02')
			// ]).then(axios.spread((response1, response2) => {
			  // console.log(response1.data.url);
			  // console.log(response2.data.url);
			// })).catch(error => {
			  // console.log(error);
			// });
			
		  })
		  .catch(error => {
			console.log(error);
			res.send({error});
		  });
	}
	// res.send(JSON.stringify({value: newurl}));
}); 

app.get('/sim',
	function(req, res){
		let word  = "день";
		if (req.query.hasOwnProperty("word")){
			let wordIn = req.query["word"]; 
			if (/^[A-Za-zА-ЯЁа-яёієїґ\']+[A-Za-z_]*$/.test(wordIn) && wordIn){
				console.log(wordIn);
				word = wordIn;
			}
		}
		const model = req.query["model"] || "ruscorpora_upos_cbow_300_20_2019";
		//https://github.com/techfort/LokiJS/wiki
		var dbres = db.getCollection("entries").find({ word :word });
		// console.log("db", word, dbres.length);
		
		let format  = "json";
		let newurl =  'http://localhost:5000/sim?m='+ model + "&w=" + encodeURIComponent(word);
		
		console.log("query", newurl);
	// logger.log("info", req.headers['user-agent']);
	
	if (dbres.length && false){
		//res.send({error});
		//console.log("in db", dbres.shift().data);
		console.log("SERVED FROM CACHE!");
		res.send(dbres.shift().data);
	} else {
		axios.get(newurl)
		  .then(response => {
			  //let obj = response.data;
			  //obj = obj[Object.keys(obj)[0]];
			  //obj = obj[Object.keys(obj)[0]];
			// console.log(obj);
			console.log(response.data);
			db.getCollection("entries").insert( { word : word, wordpos: word, data: response.data } );
			res.send(response.data);
			
			
			// axios.all([
			  // axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2017-08-03'),
			  // axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2017-08-02')
			// ]).then(axios.spread((response1, response2) => {
			  // console.log(response1.data.url);
			  // console.log(response2.data.url);
			// })).catch(error => {
			  // console.log(error);
			// });
			
		  })
		  .catch(error => {
			console.log(error);
			res.send({error});
		  });
	}
	// res.send(JSON.stringify({value: newurl}));
}); 


app.listen(port, () => {
    console.log('\nListening to port ' + port);
});