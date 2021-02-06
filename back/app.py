#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# ololo

from flask import Flask
from flask import make_response
from flask import jsonify
from flask import Flask, render_template
from flask import Flask, request, send_from_directory
import os
# apt install python3-enchant
# import enchant
import sys
import gensim, logging
import requests

# d = enchant.Dict("en_US")
app = Flask(__name__, static_url_path='')
import json
from pymagnitude import *
# <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
# <title>400 Bad Request</title>
# <h1>Bad Request</h1>
# <p>The browser (or proxy) sent a request that this server could not understand.</p>



# logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)


# models["tayga-func_upos_skipgram_300_5_2019"] = 

models = {}
# # mod_dirs = [file for subdir, dirs, files in os.walk("models") for file in dirs]
# # for dir in mod_dirs:
    # # print(dir)
    # # mod_path = os.path.abspath(os.path.join("models", dir, "model.bin"))
    # # if (os.path.isfile(mod_path)):
        # # models[dir] = gensim.models.KeyedVectors.load_word2vec_format(mod_path, binary=True)
    # # else:
        # # print("error", mod_path)

magn_files = [file for subdir, dirs, files in os.walk(os.path.join(os.getcwd(), "mgnmodels")) for file in files if file.endswith(".magnitude")]
models = { a.rsplit('.', 1)[0] : Magnitude(os.path.join(os.getcwd(),"mgnmodels", a), temp_dir=os.path.join(os.getcwd(), "sqlite") ) for a in magn_files }

print("models loaded", len(models), models)
model =  models["ruscorpora_upos_cbow_300_20_2019"]

# if m.endswith('.vec.gz'):
    # model = gensim.models.KeyedVectors.load_word2vec_format(m, binary=False)
# elif m.endswith('.bin.gz'):
    # model = gensim.models.KeyedVectors.load_word2vec_format(m, binary=True)
# else:
    # model = gensim.models.KeyedVectors.load(m)
    
# model.init_sims(replace=True)


# @app.route('/', methods=['GET', 'POST'])
# def index():
    # word = request.form.get('word', '')
    # rep = ''
    # print(word)
    # if word:
        # sug = d.suggest(word)
        # print(sug)
        # if sug:
            # # http://stackoverflow.com/questions/14853694/python-jsonify-dictionary-in-utf-8
            # # rep = jsonify(sug)
            # rep = json.dumps(sug, ensure_ascii=False).encode('utf8')
    # return make_response(rep)

@app.route('/ruvec', methods=['GET', 'POST'])
def ruvec():
    word1 = request.form.get('w1', '')
    word2 = request.form.get('w2', '')
    pos = request.form.get('pos', '').upper()
    cos  = model.similarity(word1+'_'+pos, word2+'_'+pos)
    return make_response(str(int(round(cos*100, 0))))
    
@app.route('/sim', methods=['GET', 'POST'])
def sim():
    resp = {"tag": 'UNK'}
    topn = 10
    unit = ""
    w = request.args.get('w', '')
    model_id = request.args.get('m', '')
    print("model in ", model_id)
    
    if model_id not in models:
        model_id = "ruwikiruscorpora_upos_skipgram_300_2_2019"
    
    print("query", w, model_id)
    # pos = request.form.get('pos', '').upper()
    if w:
        print(w)
        if "upos" in model_id:
            r = requests.get('http://lindat.mff.cuni.cz/services/udpipe/api/process?tokenizer&tagger&parser&model=russian-syntagrus-ud-2.5-191206&data='+w)
            if r.status_code == 200:
                datum = r.json()
                res = datum["result"].split("\n")
                gram = res[4].split("\t")
                tag = gram[3]
                lem = gram[2]
                unit = f"{lem}_{tag}"
        else:
            unit = w
        # sim = model.similar_by_word(unit, topn=topn)  # gensim
        sim = models[model_id].most_similar(unit, topn = 10)
        print(sim)
        # resp = {"tag": tag, "lemma": lem, "unit": unit, "sim": sim}
        prepared = {s[0]:str(s[1]) for s in sim}
        resp = {model_id: {unit: prepared} }
            
    # cos  = model.similarity(word1+'_'+pos, word2+'_'+pos)
    # return make_response(str(int(round(cos*100, 0))))
    # return make_response(reply)
    return jsonify(resp)
    
    
@app.route('/test', methods=['GET', 'POST'])
def test():
    # form = { "w1": "хлеб", "w2": "мясо", "pos": 'noun' }   
    # r = requests.post('http://0.0.0.0:5000/ruvec', form)
    # print("here")
    # # repl = r.content.decode('utf-8') if r.content else 'wow'
    # repl = r.text
    return make_response("ok")

        
# @app.route('/page')
# def show_user_profile():    
    # return 'User'
	
if __name__ == '__main__':
    app.run(host = "0.0.0.0", debug=True)
    # app.run(debug=True, port=5000)
    # must be restarted manually!!!
