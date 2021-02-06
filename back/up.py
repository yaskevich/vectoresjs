import os
from os.path import basename
from pymagnitude import *
import sys
# import fasttext.util
# fasttext.util.download_model('ru', if_exists='ignore')  # English
# import gensim


all = [file for subdir, dirs, files in os.walk(os.path.join(os.getcwd(), "mgnmodels")) for file in files if file.endswith(".magnitude")]


models = {}

tests = {
"tayga-func_upos_skipgram_300_5_2019": "кот_NOUN",
"ruwikiruscorpora-func_upos_skipgram_300_5_2019": "кот_NOUN",
"news_upos_skipgram_300_5_2019": "кот_NOUN",
"ruscorpora_upos_skipgram_300_5_2018": "кот_NOUN",
"ruwikiruscorpora_upos_skipgram_300_2_2019": "кот_NOUN",
"tayga_upos_skipgram_300_2_2019": "кот_NOUN",
"ruscorpora_upos_cbow_300_20_2019": "кот_NOUN",
"fiction.lowercased.lemmatized.word2vec.300d": "кіт",
"GoogleNews-vectors-negative300": "cat"
}

# print(all)
models = { a.rsplit('.', 1)[0] : Magnitude(os.path.join(os.getcwd(),"mgnmodels", a), temp_dir=os.path.join(os.getcwd(), "sqlite")) for a in all }
# print(models)
# sys.exit(0)
    
for t in tests:
    tok = tests[t]
    print(tok, t)
    sim = models[t].most_similar(tok, topn = 10)
    print(sim)