#!/usr/bin/env python
# -*- coding: utf-8 -*-
#

import os
import sys
import requests
import json
from flask import Flask, request, send_file, jsonify, make_response
import gensim, logging
from pymagnitude import *

app = Flask(__name__, static_url_path='')
menu_json_path = os.path.join(app.root_path, 'menu.json')  

with open(menu_json_path) as json_file: 
    menu_json = json.load(json_file)

# logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

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
    isClicked = request.args.get('click', '')
    print("model in ", model_id)
    
    if model_id not in models:
        model_id = "ruwikiruscorpora_upos_skipgram_300_2_2019"
    
    print("query", w, model_id)
    # pos = request.form.get('pos', '').upper()
    if w:
        print(w)
        if isClicked and "upos" in model_id:
            print("get PoS")
            # print(menu_json['descriptions'])
            # https://lindat.mff.cuni.cz/services/udpipe/api-reference.php
            r = requests.get('http://lindat.mff.cuni.cz/services/udpipe/api/process?tokenizer&tagger&parser&model=russian-syntagrus-ud-2.6-200830&data='+w)
            if r.status_code == 200:
                datum = r.json()                
                res = list(map(lambda x: x.strip(), datum["result"].split("# ")))
                # print("res")
                # print(res)
                gram = res[7].split("\t")
                tag = gram[3]
                lem = gram[2]
                unit = f"{lem}_{tag}"
        else:
            print("no PoS")
            unit = w
        print("querying model...")
        # sim = model.similar_by_word(unit, topn=topn)  # gensim
        sim = models[model_id].most_similar(unit, topn = 10)
        print("sim", sim)
        # resp = {"tag": tag, "lemma": lem, "unit": unit, "sim": sim}
        prepared = {s[0]:str(s[1]) for s in sim}
        resp = {model_id: {unit: prepared} }
            
    # cos  = model.similarity(word1+'_'+pos, word2+'_'+pos)
    # return make_response(str(int(round(cos*100, 0))))
    # return make_response(reply)
    return jsonify(resp)



@app.route('/menu', methods=['GET', 'POST'])
def menu():
    return send_file(menu_json_path)    
    
@app.route('/status', methods=['GET', 'POST'])
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
# export FLASK_ENV=development    
    
    