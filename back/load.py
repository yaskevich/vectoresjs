
import os
from os.path import basename
from pymagnitude import *
# import fasttext.util
# fasttext.util.download_model('ru', if_exists='ignore')  # English
import gensim

# model = gensim.models.KeyedVectors.load_word2vec_format("fiction.lowercased.lemmatized.word2vec.300d", binary=False)

# sim = model.similar_by_word("кіт", topn = 10) # magnitude


# model = Magnitude("uk_fiction.magnitude")
# sim = model.most_similar("кіт", topn = 10) # magnitude
    
# print(sim)


all = [file for subdir, dirs, files in os.walk("models") for file in dirs if "upos" in file]
for a in all:
    p = os.path.abspath(os.path.join("models", a, "model.txt"))

    if os.path.exists(p):
        newname = basename(os.path.dirname(p)) + ".magnitude"
        # p -m pymagnitude.converter -i fiction.lowercased.lemmatized.word2vec.300d.txt -o uk_fiction.magnitude
        cmd  = f"python3 -m pymagnitude.converter -i {p} -o {newname}"
        print(cmd)
        os.system(cmd)
        
    