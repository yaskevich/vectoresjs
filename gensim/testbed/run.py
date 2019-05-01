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
    "-n", "--nbr", help="amount of neighbors to show. Default is 10", default=10
)
parser.add_argument(
    "-e",
    "--edge",
    help="width of an edge (link) between nodes. Default is 1",
    default=1,
)
parser.add_argument(
    "-d",
    "--depth",
    help="recursion depth to build graphs also of neighbors of target word. Default is 0",
    default=0,
)
parser.add_argument(
    "-m",
    "--model",
    help="path to vector model file. If ommited, first model with extension bin.gz (as binary) "
    + "or .vec.gz (as non-binary) in directory is loaded",
    default="",
)
parser.add_argument(
    "-o",
    "--output",
    help="path to ouptut directory where to store files of visualization. If ommited, in "
    + "current directory new one will be made, with a name based on a timestamp",
    default="",
)
args = parser.parse_args()

if not args.output:
    dt = str(datetime.now().strftime("%Y-%m-%d_%H-%M-%S"))
    new_dir = os.path.join(dir, dt)
    aa = pathlib.Path(new_dir).mkdir(parents=True, exist_ok=True)
    args.output = new_dir

if not args.model:
    first = glob.glob(os.path.join(dir, "*.[vecbin]*.gz"))[0]
    args.model = first

model = gensim.models.KeyedVectors.load_word2vec_format(
    args.model, binary=args.model.endswith(".bin.gz")
)
model.init_sims(replace=True)
token = args.token if args.token else random.choice(model.index2entity)
visualize_dir(args.output, model, token, args.depth, args.nbr, args.edge)
