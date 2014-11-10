var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require("path");
var async = require("async");
var utils = require("./utils");
var recursive = require('recursive-readdir');

function clean(options) {
	function process(metadata, encoding, cb){
		
		async.parallel([
			
			function(cb){ flagToDeleteStaticAssetsMetatada(metadata, cb); }

		], function(err){
			cb(null, metadata);
		});
		

	}

	return through.obj(process);
}

function flagToDeleteStaticAssetsMetatada(metadata, cb){
	
	// flag to remove metadata referencing static assets 
	metadata.files
		// only assets
		.filter(function(item){ return item.content.type == "asset" })
		// starting with /<projectname>/**
		.filter(function(item){ return item.content.src.indexOf(metadata.project) == 0; })
		// set to remove on write
		.forEach(function(item){ item.toDelete = true; });

	cb();

}

module.exports = clean;