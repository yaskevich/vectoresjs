document.addEventListener("DOMContentLoaded", function(e) {
	var the_model = "ruwikiruscorpora_upos_skipgram_300_2_2019";
	MicroModal.init();
	var width = window.innerWidth, height = window.innerHeight;
		

	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);

	var force = d3.layout.force()
		.gravity(.05)
		.distance(100)
		.charge(-100)
		.size([width, height]);
		
	var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {return d.tip; });
		svg.call(tip);

	var datanodes  = [], datalinks  = [],  i = 1;	
	var delta = 0;
	var radius = 10;
		
	d3.select("#word").on("keypress", function() {
		if(d3.event.keyCode === 32 || d3.event.keyCode === 13){
			doClick();
		}
	  });

	function buildGraph(inlinks, innodes){
		
		d3.selectAll(".link").remove();
		d3.selectAll(".node").remove();
		d3.selectAll("circle").remove();
		
		console.log("step1");
		
		var links = inlinks;
	  force
		  //.nodes(json.nodes)
		  .nodes(innodes)
		  .links(inlinks)
		  .linkDistance(function(d) { 
			// var dv  = Math.round(d.value * 100) / 100;
			//var dis = (dv*100)-50;var dv  = Math.round(d.value * 100) / 100;
			var dis  = d.value * 100;
			var df = Math.log(dis);
			var koef  = isFinite(df)?df:1;
			dis = parseInt(dis * koef)+radius;
			
			console.log(d.key, d.value, koef, dis);
			return  dis; 
			}) 
		  .start();
		console.log("step2");

	  var linksel = svg.selectAll(".link")
		  .data(inlinks);
		  var link = linksel
		.enter().append("line")
		  .attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.val); });

		
		var nodesel = svg.selectAll(".node")
		  .data(innodes);
	  var node = nodesel
		.enter().append("g")
		  .attr("class", function(d) { return "node " + d.cls; })
		  .call(force.drag);

	  node.append("circle")
		 .attr("class", function(d) { return d.cls; })
		  .attr("r",radius)
			 .on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.on("click", function(d){
				var word  = d.name+"_"+d.tip;
				var startnode  = d.index;
				console.log(word, startnode);
				/*
				d3.json("/syn?word="+encodeURIComponent(word), function(data) {
					
					data = data[Object.keys(data)[0]];
					var wordpos = Object.keys(data)[0];
					data = data[wordpos];
					//console.log(datanodes.filter(function(d){return d.category == category;}));
					console.log(data);
					
					var src  = datanodes.filter(function(d){return d.key == word;}).shift();
					console.log(src);
					
					for(var k in data) {
					   var wTag = k.split("_");
					   
					   datanodes.push({"key":k, "name":wTag[0],"group":3, tip:wTag[1], cls:(Math.random() > 0.5 ? "low": "mid"), "flag":i});
					   //datalinks.push({"source":startnode,"target":i,"value":data[k]});
					   var tg  = datanodes.filter(function(d){return d.key == k;}).shift();
					   datalinks.push({"source":src,"target":tg,"value":data[k]});
					   i++;
					}
					console.log(datanodes);
					console.log(datalinks);
					// buildGraph(datanodes, datalinks);
				});
				*/
			});

	  node.append("text")
		  .attr("dx", 12)
		  .attr("dy", ".35em")
		  .text(function(d) { return d.name });

		  nodesel.exit().remove();
		  
	  force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	  });
	}	
		
		function getFromAPI(wrd){
		// var url = wrd?("/syn?word="+encodeURIComponent(wrd)): "/last";
		var url = wrd?("/sim?model="+the_model+"&word="+encodeURIComponent(wrd)): "/last";
			d3.json(url, function(data) {
				if (data) {
					buildFromAPI(wrd, data);	
				} else {
					// alert("Такого слова нет в модели :(")
					d3.select("#nomodel").text(wrd);
					MicroModal.show('modal-1'); 
					
				}
			});
		}
		
		function buildFromAPI(keyword, data){			
			console.log("input",keyword, data);
			data = data[Object.keys(data)[0]];
			var wordpos = Object.keys(data)[0];
			data = data[wordpos];
			var word2;
			if (!keyword){
				var pp = wordpos.split("_");
				keyword  = pp[0];
				word2 = pp[1];
			} else {
				word2  = wordpos.substring(keyword.length+1);
			}
			
			console.log("data", data);
			
			d3.select("#res").style("visibility", "visible");
			d3.select("#res2").html(wordpos)

			// console.log("word", keyword, wordpos);
			

			datanodes  = [], datalinks  = [],  i = 1;
			
			datanodes.push({"key":wordpos, "name":keyword,"group":3, tip:word2, cls:"high", "flag":1});
			for(var k in data) {
				
				var name = "ololo";
				var tip = "kek";
						
				if (descs[the_model]["src"][0]["pos"]){
					var wTag = k.split("_");
					name = wTag[0];
					tip = wTag[1];
				} else {
					name = k;
					tip = k;
				}
				
				// console.log(descs[the_model]["src"][0]["pos"], wTag);

				datanodes.push({"key":k, "name":name,"group":3, tip:tip, cls:(Math.random() > 0.5 ? "low": "mid"), "flag":i});
				var dif  = 1 - data[k];
				if ((delta && delta > dif) || !delta) { delta  = dif; }
				datalinks.push({"source":0,"target":i,"value":dif, "key":k});
				i++;
			}
			console.log(datanodes, datalinks);
			buildGraph(datalinks, datanodes);
		
		}
		
		d3.select("#search").on("click", function(){
			doClick();
		});

		
		function doClick(){
		var word = d3.select("#word").property("value"); 
			if (/^[A-Za-zА-ЯЁа-яёІієїґ\']+$/.test(word) && word) {
				//console.log("word", word);
				getFromAPI(word);
			} else {
				alert("Слово "+word+" не годится для поиска!");
			}
		}
		
		function buildDef(){
			d3.json("/def", function(data) {
				var nds  = [], lnks  = [],  i = 0;
				var query  = "";
				for(var k in data["frequencies"]) {
				   var wTag = k.split("_");
				   nds.push({"name":wTag[0],"group":3, tip:wTag[1], cls:data["frequencies"][k][1], "flag":i});
				   i ? lnks.push({"source":0,"target":i,"value":data["neighbors"][i-1][1]}): query = wTag[0];
				   i++;
				}
				//console.log(nds, lnks);
				//console.log({nds: nds, lnks:lnks});
				buildGraph(lnks, nds);	
				});
		}

		// buildDef();
		getFromAPI();
		
		
var descs = {

 "tayga_upos_skipgram_300_2_2019": {
	"tool": "Gensim",
	"alg": "Gensim Continuous Skipgram",
	"lang": "rus",
	"project": "RusVectores",
	"url": "https://rusvectores.org",

	"src": [ 
		{
		"title": "Taiga corpus", 
		"lang": "rus",
		"NER": true,
		"case": false,
		"url": "https://tatianashavrina.github.io/taiga_site/",
		"lem": true,
		"stop": "functional PoS",
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 4867000000
		}
	]
 }, 
 
 "tayga-func_upos_skipgram_300_5_2019" :{
	"tool": "Gensim",
	"alg": "Gensim Continuous Skipgram",
	"lang": "rus",
		"project": "RusVectores",
	"url": "https://rusvectores.org",

	"src": [ 
		{
		"title": "Taiga corpus", 
		"lang": "rus",
		"NER": true,
		"case": false,
		"url": "https://tatianashavrina.github.io/taiga_site/",
		"lem": true,
		"stop": null,
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 4867000000
		}
	]
 }, 
  "ruwikiruscorpora_upos_skipgram_300_2_2019" :{
	"tool": "Gensim",
	"alg": "Gensim Continuous Skipgram",
	"lang": "rus",
	"project": "RusVectores",
	"url": "https://rusvectores.org",

	"src": [ 
		{"title": "Russian National Corpus", "url": "http://ruscorpora.ru/",
		"lem": true,
		 "case": false,
		"NER": true,
		"stop": "functional PoS",
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 270000000
		},
		{"title": "Russian Wikipedia dump of December 2018", "url": "https://dumps.wikimedia.org/",
		"lem": true,
		"NER": true,
		"case": false,
		"stop": "functional PoS",
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 518531000,
		"tool": "https://github.com/RaRe-Technologies/gensim/blob/master/gensim/scripts/segment_wiki.py",
		}
	]
	
 }, "ruwikiruscorpora-func_upos_skipgram_300_5_2019" :{
	"tool": "Gensim",
	"alg": "Gensim Continuous Skipgram",
	"lang": "rus",
	"project": "RusVectores",
	"url": "https://rusvectores.org",

	"src": [ 
		{"title": "Russian National Corpus", "url": "http://ruscorpora.ru/",
		"lem": true,
		 "case": false,
		"NER": true,
		"stop": null,
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 270000000
		},
		{"title": "Russian Wikipedia dump of December 2018", "url": "https://dumps.wikimedia.org/",
		"lem": true,
		"NER": true,
		"case": false,
		"stop": null,
		"pos": "UPoS",
		"tokens": 518531000,
		"tool": "https://github.com/RaRe-Technologies/gensim/blob/master/gensim/scripts/segment_wiki.py",
		}
	]
	
 }, 
 
 "news_upos_skipgram_300_5_2019" :{
	"tool": "Gensim",
	"alg": "Gensim Continuous Skipgram",
		"project": "RusVectores",
	"url": "https://rusvectores.org",

	"lang": "rus",
	 "external_id": "news_upos_skipgram_300_5_2019",
    "handle": "http://vectors.nlpl.eu/repository/20/184.zip",
    "id": 184,
    "iterations": 10,
    "vocabulary size": 249318,
    "window": 5,
	"src": [ 
		{"title": "Russian News",
		"lem": true,
		 "case": false,
		"NER": true,
		"stop": "functional PoS",
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 2550000000
		}
	]
 }, 
 
 
 "ruscorpora_upos_cbow_300_20_2019" : {
	"tool": "Gensim",
	"alg": "Gensim Continuous Bag-of-Words",
	"project": "RusVectores",
	"url": "https://rusvectores.org",
	"lang": "rus",
    "external_id": "ruscorpora_upos_cbow_300_20_2019",
    "handle": "http://vectors.nlpl.eu/repository/20/180.zip",
    "id": 180,
    "iterations": 10,
    "vocabulary size": 189193,
    "window": 20,
	"src": [ 
		{ 
		"title": "Russian News",
		"lem": true,
		"case": false,
		"NER": true,
		"stop": "functional PoS",
		"morph": "UDPipe 1.2",
		"pos": "UPoS",
		"tokens": 2550000000
		}
	]
 }, 

 
 "GoogleNews-vectors-negative300": {
	"project": "word2vec (Google)",
	"alg": "skipgram?",
	"url": "https://code.google.com/archive/p/word2vec/",
	"handle": "https://s3.amazonaws.com/dl4j-distribution/GoogleNews-vectors-negative300.bin.gz",
	"vocabulary size": 3000000,
	"tool": "word2vec",
	"lang": "eng",
	"src": [
		{ "title": "Google News (about 100 billion words)" }
	]
 },
 "fiction.lowercased.lemmatized.word2vec.300d":  {	
	"alg": "Word2Vec",
	"dim": 300,
	"lang": "ukr",
	"project": "Lang-uk",
	"url": "https://lang.org.ua",
	"handle": "https://lang.org.ua/static/downloads/models/fiction.lowercased.lemmatized.word2vec.300d.bz2",
	"src" : [{
		"lem": true,
		"case": false,
		"pos": null,
		"title": "Fiction",
		"src" : "lang.org.ua",
		"url": "https://lang.org.ua"
	}]
 },

 "BulgarianCoNLL17":  {	
	"alg": "Word2Vec",
	"dim": 300,
	"lang": "ukr",
	"project": "vectors.nlpl.eu",
	"url": "https://vectors.nlpl.eu",
	"handle": "http://vectors.nlpl.eu/repository/20/33.zip",
	"src" : [{
		"lem": false,
		"case": false,
		"pos": null,
		"stops": null, 
		"title": "Bulgarian CoNLL17",
		"src" : "https://lindat.mff.cuni.cz",
		"url": "https://https://lindat.mff.cuni.cz",
		"tokens": 388433724
	}]
 }

 
}

var corpus = {
	"rus" : {
		"iso" : "rus",
		"name": "Russian",
		"n" : 7,
		"models": [
		"tayga_upos_skipgram_300_2_2019", "tayga-func_upos_skipgram_300_5_2019", "ruwikiruscorpora_upos_skipgram_300_2_2019", "ruwikiruscorpora-func_upos_skipgram_300_5_2019","news_upos_skipgram_300_5_2019", "ruscorpora_upos_cbow_300_20_2019"
		]
	},
	"ukr": {
		"iso" : "ukr",
		"name": "Ukrainian",
		"n": 1,
		"models": [
			"fiction.lowercased.lemmatized.word2vec.300d"
		]
	},	
	"bul": {
		"iso" : "bul",
		"name": "Bulgarian",
		"n": 1,
		"models": [
			"BulgarianCoNLL17"
		]
	},

	"eng" : {
		"iso" : "eng",
		"n": 3,
		"name": "English",
		"models": ["GoogleNews-vectors-negative300"]
	}
};

var myArray = Object.keys(corpus).map(key => corpus[key]);
console.log("aasfasfa", myArray);
	
var divs  = d3
	.select('.langmods')
	.selectAll('div')
	.data(myArray)
	.enter()
	.append('div')
	.classed("row", true);
	
	//<div class=""></div>  <div class="col-sm-10"></div>
	
	
	divs
	.append('div')
	.classed("col-sm-10", true)
	.append('button')
	.attr('class', function(d){
		// return 'primary '+ d.iso
		return d.iso == 'rus'? 'secondary '+ d.iso : d.iso
	})
	.on("click", function(d){
		console.log(d.iso);
		d3.select('.langmods').classed("hidden", true);
		var moddivs  = d3
		.select('.modlist')
		.selectAll('div')
		.data(corpus[d.iso]["models"])
		.enter()
		.append('div')
		.classed("row", true);
		
		d3.select('#modal-2-title').text("Select the model");
		moddivs
		.append('div')
		.classed("col-sm-10", true)
		.append('p')
		.html(function(d){
		console.log(d);
			var m = descs[d];
			var title = m["src"].map(function(x){return x.title}).join('/');
			var pos = m["src"].map(function(x){return x.pos}).join('');
			var stops = m["src"].map(function(x){return x.stop}).join('');
			//console.log(pos);
			return title +", by "+m["project"] + "<br/><small>" + m["alg"].replace("Gensim ", "") + (pos?", PoS":"")+ (stops?", stopwords":"") +"</small>";
		})

		moddivs
		.append('div')
		.classed("col-sm-2", true)
		.append('button')
		.classed("secondary", true)
		.on("click", function(d){
			// console.log("hehe", d);
			the_model = d;
			d3.select('title').text(d);
			MicroModal.close('modal-2'); 
		})
		.text("load")
		//
	})
	.text(function(d){
      // return '<button class=" +'">'+d.name+'</button>'; 
      return d.name;
    });
	
	divs
	.append("div")
	.classed("col-sm-2", true)
	.append('p')
	//.append('mark')
	.html(function(d){
		//return d.n +" "+ (d.n>1? "models": "model");
		return d.models.length;
	});
	
		d3.text('/status', function(error, resp) {
		if (error) {
			console.log("backend", error.status);
			d3.select('#word').style('visibility', 'hidden');
			d3.select('#search').style('visibility', 'hidden');
		} else {
			console.log("backend", resp);
			MicroModal.show('modal-2'); 
		}
	});


});