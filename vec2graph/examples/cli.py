#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
import sys, os, glob, gensim, logging, pathlib, random, argparse
from datetime import datetime

dir = sys.path[0]
sys.path.insert(0, os.path.dirname(dir))

from genviz import *

logging.basicConfig(
    format="%(asctime)s : %(levelname)s : %(message)s", level=logging.INFO
)

parser = argparse.ArgumentParser()
parser.add_argument(
    "-t", "--token", help="token to query. If omitted, random token is used", default=""
)
parser.add_argument(
    "-n",
    "--nbr",
    help="amount of neighbors to show. Default is 10",
    default=10,
    type=int,
)
parser.add_argument(
    "-e",
    "--edge",
    help="width of an edge (link) between nodes. Default is 1",
    default=1,
    type=int,
)
parser.add_argument(
    "-d",
    "--depth",
    help="recursion depth to build graphs also of neighbors of target word."
    " Default is 0 (no neighbors)",
    default=0,
    type=int,
)
parser.add_argument(
    "-l",
    "--lim",
    help="limit (threshold) of similarity which should be surpassed by neighbors to be rendered as connected."
    " Scale is either more than 0 and less than 1 (as real range for similarities), or from 1 to 100 as percents"
    " Default is 0 (minimally close items are linked)",
    default=0,
    type=float,
)
parser.add_argument(
    "-m",
    "--model",
    help="path to vector model file. If ommited, first model with extension bin.gz (as binary) "
    "or .vec.gz (as non-binary) in directory is loaded",
    default="",
)
parser.add_argument(
    "-o",
    "--output",
    help="path to ouptut directory where to store files of visualization. If ommited, in "
    "current directory new one will be made, with a name based on a timestamp",
    default="",
)

parser.add_argument(
    "-js",
    "--javascript",
    help="path to D3.js library, can be 'web' (link to version at the D3.js site) or 'local'"
    " (file in the directory with generated HTML, if not present, it is downloaded from web)."
    " Default is 'web'",
    default="web",
)
args = parser.parse_args()

if not args.output:
    dt = str(datetime.now().strftime("%Y-%m-%d_%H-%M-%S"))
    new_dir = os.path.join(dir, dt)
    pathlib.Path(new_dir).mkdir(parents=True, exist_ok=True)
    args.output = new_dir

if not args.model:
    first = glob.glob(os.path.join(dir, "*.[vecbin]*.gz"))[0]
    args.model = first

model = gensim.models.KeyedVectors.load_word2vec_format(
    args.model, binary=args.model.endswith(".bin.gz")
)

model.init_sims(replace=True)
token = args.token if args.token else random.choice(model.index2entity)

vec2graph(
    args.output,
    model,
    token,
    depth=args.depth,
    topn=args.nbr,
    threshold=args.lim,
    edge=args.edge,
    library=args.javascript,
)
