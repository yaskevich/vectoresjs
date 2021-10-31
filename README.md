# vectores.js

Dataviz toolkit for vector semantic models. Works with [gensim](https://github.com/RaRe-Technologies/gensim/) library.

[Web-version](https://vector.philology.by/) currently fetches API of RusVectores.org

Made with D3.js.

Icon by [icon8](https://icons8.com/license).

In [this branch](https://github.com/yaskevich/vectoresjs/tree/MVP+Python) one can find my Python code (along with JS for visualization) which was packed into Python module [vec2graph]( https://pypi.org/project/vec2graph/) by [Andrei Kutuzov](https://github.com/akutuzov).


### Project structure

- Front folder: JQuery-based client (JavaScript)
- Back folder: Python application that loads models in memory and provides api
- Mid folder: NodeJS application that proxies queries to internal and external API, as well as caches results for quicjk access
- Client folder: Vue3-based prototype of new client application
