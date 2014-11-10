var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require("path");
var utils = require("./utils");
var recursive = require('recursive-readdir');


/**
 * 
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function debug(options) {
	
	function process(metadata, encoding, cb){
		gutil.log(metadata.files);
		this.push(metadata);
		cb();
	}

	return through.obj(process);
}

module.exports = debug;