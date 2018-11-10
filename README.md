[![Build Status](https://travis-ci.com/FloChehab/Game-of-news.svg?token=hZTHeNJUJ6Vdp9ym43T9&branch=master)](https://travis-ci.com/FloChehab/Game-of-news)

Game of news
===========

## Requirements
You only need <b>node.js</b> pre-installed and you’re good to go.

If you don’t want to work with lodash, just remove it from the node packages and the webpack config.


## Setup
Install dependencies
```sh
$ npm install
```

## Development

### Local GDELT API

To replicate part of the GDELT API for devlopment purpose. Run the `fetch_extacts.py` script in the `data/extracts/` folder.

```bash
cd ./data/extracts
python3 ./fetch_extracts.py
```

This will fetch approximetaly the first day of available data on the API.


### Running

Run the local webpack-dev-server with livereload and autocompile on [http://localhost:8080/](http://localhost:8080/)
```sh
$ npm run dev
```

## Deployment
Build the current application
```sh
$ npm run build
```
