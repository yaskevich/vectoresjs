#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# ololo
import requests, sys, os
from pymagnitude import *
# pip3 install hurry.filesize

import resource
import os
import gensim, numpy
from hurry.filesize import size
from time import sleep
from concurrent.futures import ThreadPoolExecutor

# import fasttext

print(gensim.__version__)
print(numpy.__version__)

# from gensim.models.fasttext import FastText, load_facebook_vectors
# model = load_facebook_vectors("cc.id.300.bin.gz")

# model = gensim.models.fasttext.load_facebook_model("models/ruscorpora_none_fasttextskipgram_300_2_2019/model.model")
# pth = "models/ruscorpora_none_fasttextskipgram_300_2_2019/model.model"
pth = "181/model.model"
# model = fasttext.load_model(pth)

# from gensim.models.wrappers import FastText
# model = FastText.load_fasttext_format(pth)


# model  = gensim.models.fasttext.load_facebook_model(pth)
# model = gensim.models.fasttext.load_facebook_vectors(pth)
model  = gensim.models.keyedvectors.FastTextKeyedVectors.load(pth)
# model = fasttext.load_model(pth)

sim = model.similar_by_word("кот", topn = 10) 
# sim = model.most_similar("кот_NOUN", topn = 10) # magnitude
print(sim)

sys.exit(0)
# https://medium.com/survata-engineering-blog/monitoring-memory-usage-of-a-running-python-program-49f027e3d1ba
import tracemalloc

mod_dirs = [file for subdir, dirs, files in os.walk("models") for file in dirs]
for dir in mod_dirs:
    # print(dir)
    mod_path = os.path.abspath(os.path.join("models", dir, "model.bin"))
    if (os.path.isfile(mod_path)):
        # models[dir] = gensim.models.KeyedVectors.load_word2vec_format(mod_path, binary=True)
        # print("ok")
        pass
    else:
        print("error", mod_path)

sys.exit(0)

tracemalloc.start()
# model = Magnitude("ruscorpora_upos_skipgram_300_5_2018.magnitude")
model = gensim.models.KeyedVectors.load_word2vec_format("models/ruwikiruscorpora-func_upos_skipgram_300_5_2019/model.bin", binary=True)
current, peak = tracemalloc.get_traced_memory()
print(f"Current memory usage is {current / 10**6}MB; Peak was {peak / 10**6}MB")
tracemalloc.stop()
sim = model.similar_by_word("кот_NOUN", topn = 10) # magnitude
print(sim)
sys.exit(0)


def doit():
    # vecs = Magnitude('http://magnitude.plasticity.ai/word2vec/heavy/GoogleNews-vectors-negative300.magnitude', stream=True) # full url
    # vecs = Magnitude('word2vec/heavy/GoogleNews-vectors-negative300', stream=True) # or, use the shorthand for the url
    model = Magnitude("ruscorpora_upos_skipgram_300_5_2018.magnitude")
    # vecs.query("king") # Returns: the vector for "king" quickly, even with no local model file downloaded        
    sim = model.most_similar("кот_NOUN", topn = 10) # magnitude
    print(sim)
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss



    print(size(usage))
    pass

class MemoryMonitor:
    def __init__(self):
        self.keep_measuring = True

    def measure_usage(self):
        max_usage = 0
        while self.keep_measuring:
            max_usage = max(
                max_usage,
                resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
            )
            sleep(0.1)

        return max_usage



with ThreadPoolExecutor() as executor:
    monitor = MemoryMonitor()
    mem_thread = executor.submit(monitor.measure_usage)
    try:
        fn_thread = executor.submit(doit)
        result = fn_thread.result()
    finally:
        monitor.keep_measuring = False
        max_usage = size(mem_thread.result())
        
    print(f"Peak memory usage: {max_usage}")
    



# txt = input("Type something to test this out: ")
# print("Is this what you just said? ", txt)


sys.exit(0)
ke = [file for subdir, dirs, files in os.walk("models") for file in dirs]
# print(ke)
import hashlib

for k in ke:
    # print(os.path.abspath("models/"+ke))
    # print(os.path.abspath(os.path.join("models", k, "model.bin")))
    
    h = int(hashlib.md5(k.encode('utf-8')).hexdigest()[:8], 16)
    print(k, h)

sys.exit(0)
token = "иду"
r = requests.get('http://lindat.mff.cuni.cz/services/udpipe/api/process?tokenizer&tagger&parser&model=russian-syntagrus-ud-2.5-191206&data='+token)
if r.status_code == 200:
    datum = r.json()
    res = datum["result"].split("\n")
    print(res)
    gram = res[4].split("\t")
    print(f"{gram[2]}_{gram[3]}")

