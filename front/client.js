document.addEventListener("DOMContentLoaded", function(e) {
    var the_model = "ruwikiruscorpora_upos_skipgram_300_2_2019";
    MicroModal.init();
    var width = window.innerWidth,
        height = window.innerHeight;



    d3.json('/api/menu', function(menu) {

        function buildFromAPI(keyword, data) {
            console.log("input", keyword, data);
			the_model  = Object.keys(data)[0];
            data = data[the_model];
            var wordpos = Object.keys(data)[0];
            data = data[wordpos];
            var word2;
            if (!keyword) {
                var pp = wordpos.split("_");
                keyword = pp[0];
                word2 = pp[1];
            } else {
                word2 = wordpos.substring(keyword.length + 1);
            }

            console.log("data", data);

            d3.select("#res").style("visibility", "visible");
			d3.select('.source').html(menu.descriptions[the_model]["src"][0]["title"]);
            d3.select("#res2").html(wordpos)

            // console.log("word", keyword, wordpos);


            datanodes = [], datalinks = [], i = 1;

            datanodes.push({
                "key": wordpos,
                "name": keyword,
                "group": 3,
                tip: word2,
                cls: "high",
                "flag": 1
            });
            for (var k in data) {

                var name = "ololo";
                var tip = "kek";

                if (menu.descriptions[the_model]["src"][0]["pos"]) {
                    var wTag = k.split("_");
                    name = wTag[0];
                    tip = wTag[1];
                } else {
                    name = k;
                    tip = k;
                }

                // console.log(menu.descriptions[the_model]["src"][0]["pos"], wTag);

                datanodes.push({
                    "key": k,
                    "name": name,
                    "group": 3,
                    tip: tip,
                    cls: (Math.random() > 0.5 ? "low" : "mid"),
                    "flag": i
                });
                var dif = 1 - data[k];
                if ((delta && delta > dif) || !delta) {
                    delta = dif;
                }
                datalinks.push({
                    "source": 0,
                    "target": i,
                    "value": dif,
                    "key": k
                });
                i++;
            }
            console.log(datanodes, datalinks);
            buildGraph(datalinks, datanodes);

        }
		
		
		function retrieveData(key, url) {
			console.log("query", url);
            d3.json(url, function(error, data) {
				if (error) {
					console.log("error", error);
				}
                if (data) {
					console.log("got", data);
					
					try{
						var stor = window.localStorage;
						stor.setItem('last', JSON.stringify(data))
					} catch(e) {
						console.log("error localStorage");
					}
					
				
                    buildFromAPI(key, data);
                } else {
                    // alert("Такого слова нет в модели :(")
                    d3.select("#nomodel").text(key);
                    MicroModal.show('modal-1');

                }
            });
		}
        function getFromAPI(wrd, isClicked) {
            // var url = wrd?("/syn?word="+encodeURIComponent(wrd)): "/last";
			if(!wrd) {
				try{
					var stor = window.localStorage;
					var last_data = stor.getItem('last');
					if (last_data){
						console.log("from localStorage OK");
						var datum =  JSON.parse(last_data);
						buildFromAPI(wrd, datum);
					} else {
						retrieveData('', "/last");
					}
				} catch(e) {
					console.log("error", e);
				}
			} else {
				console.log("get model", the_model);
				retrieveData(wrd, "/sim?model=" + the_model + "&word=" + encodeURIComponent(wrd) + (isClicked? "&click=1": ''));
			}
        }


        function buildGraph(inlinks, innodes) {

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
                    var dis = d.value * 100;
                    var df = Math.log(dis);
                    var koef = isFinite(df) ? df : 1;
                    dis = parseInt(dis * koef) + radius;

                    console.log(d.key, d.value, koef, dis);
                    return dis;
                })
                .start();
            console.log("step2");

            var linksel = svg.selectAll(".link")
                .data(inlinks);
            var link = linksel
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) {
                    return Math.sqrt(d.val);
                });


            var nodesel = svg.selectAll(".node")
                .data(innodes);
            var node = nodesel
                .enter().append("g")
                .attr("class", function(d) {
                    return "node " + d.cls;
                })
                .call(force.drag);

            node.append("circle")
                .attr("class", function(d) {
                    return d.cls;
                })
                .attr("r", radius)
                // .on('mouseover', tip.show)
                // .on('mouseout', tip.hide)
                .on("click", function(d) {
                    var word = d.tip? d.name + "_" + d.tip: d.name;
                    var startnode = d.index;
                    console.log("click item", word, startnode);
                });

            node.append("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
				.style('cursor', 'pointer')
                .text(function(d) {
                    return d.name
                })
				.on("click", function(d) {
                    var word = d.tip? d.name + "_" + d.tip: d.name;
                    console.log("click text", d);
					getFromAPI(d.key, true);
                });

            nodesel.exit().remove();

            force.on("tick", function() {
                link.attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });

                node.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            });
        }

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        var force = d3.layout.force()
            .gravity(.05)
            .distance(100)
            .charge(-100)
            .size([width, height]);

        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
            return d.tip;
        });
        svg.call(tip);

        var datanodes = [],
            datalinks = [],
            i = 1;
        var delta = 0;
        var radius = 10;

        d3.select("#word").on("keypress", function() {
            if (d3.event.keyCode === 32 || d3.event.keyCode === 13) {
                doClick();
            }
        });




        d3.select("#search").on("click", function() {
			console.log("search clicked");
            doClick();
        });


        function doClick() {
            var word = d3.select("#word").property("value");
            if (/^[A-Za-zА-ЯЁа-яёІієїґ\']+$/.test(word) && word) {
                //console.log("word", word);
                getFromAPI(word);
            } else {
                alert("Слово " + word + " не годится для поиска!");
            }
        }

        function buildDef() {
            d3.json("/def", function(data) {
                var nds = [],
                    lnks = [],
                    i = 0;
                var query = "";
                for (var k in data["frequencies"]) {
                    var wTag = k.split("_");
                    nds.push({
                        "name": wTag[0],
                        "group": 3,
                        tip: wTag[1],
                        cls: data["frequencies"][k][1],
                        "flag": i
                    });
                    i ? lnks.push({
                        "source": 0,
                        "target": i,
                        "value": data["neighbors"][i - 1][1]
                    }) : query = wTag[0];
                    i++;
                }
                //console.log(nds, lnks);
                //console.log({nds: nds, lnks:lnks});
                buildGraph(lnks, nds);
            });
        }

        // buildDef();
        getFromAPI();



        var myArray = Object.keys(menu.corpus).map(key => menu.corpus[key]);
        console.log("aasfasfa", myArray);

        var divs = d3
            .select('.langmods')
            .selectAll('div')
            .data(myArray)
            .enter()
            .append('div')
            .classed("row", true);

        divs
            .append('div')
            .classed("col-sm-10", true)
            .append('button')
            .attr('class', function(d) {
                // return 'primary '+ d.iso
                return d.iso == 'rus' ? 'secondary ' + d.iso : d.iso
            })
            .on("click", function(d) {
                console.log(d.iso);
                d3.select('.langmods').classed("hidden", true);
                var moddivs = d3
                    .select('.modlist')
                    .selectAll('div')
                    .data(menu.corpus[d.iso]["models"])
                    .enter()
                    .append('div')
                    .classed("row", true);

                d3.select('#modal-2-title').text("Select the model");
                moddivs
                    .append('div')
                    .classed("col-sm-10", true)
                    .append('p')
                    .html(function(d) {
                        console.log(d);
                        var m = menu.descriptions[d];
                        var title = m["src"].map(function(x) {
                            return x.title
                        }).join('/');
                        var pos = m["src"].map(function(x) {
                            return x.pos
                        }).join('');
                        var stops = m["src"].map(function(x) {
                            return x.stop
                        }).join('');
                        //console.log(pos);
                        return title + ", by " + m["project"] + "<br/><small>" + m["alg"].replace("Gensim ", "") + (pos ? ", PoS" : "") + (stops ? ", stopwords" : "") + "</small>";
                    })

                moddivs
                    .append('div')
                    .classed("col-sm-2", true)
                    .append('button')
                    .classed("secondary", true)
                    .on("click", function(d) {
                        console.log("hehe", d);
                        the_model = d;
						d3.select('title').text(d);
                        d3.select('.source').html(menu.descriptions[d]["src"][0]["title"]);
						
						d3.select('.langmods').classed("hidden", false);
						d3.select('.modlist').classed("hidden", true);
						
                        MicroModal.close('modal-2');
                    })
                    .text("load")
                //
            })
            .text(function(d) {
                // return '<button class=" +'">'+d.name+'</button>'; 
                return d.name;
            });

        divs
            .append("div")
            .classed("col-sm-2", true)
            .append('p')
            //.append('mark')
            .html(function(d) {
                //return d.n +" "+ (d.n>1? "models": "model");
                return d.models.length;
            });

        d3.text('/api/status', function(error, resp) {
            if (error) {
                console.log("backend", error.status);
                d3.select('#word').style('visibility', 'hidden');
                d3.select('#search').style('visibility', 'hidden');
            } else {
                console.log("backend", resp);				
				d3.select('.modsel').on("click", function(d) {
                        MicroModal.show('modal-2');
                    })
                
            }
        });

    });
});