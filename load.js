var through = require('through2');
var async = require('async');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var utils = require("./utils");
var _ = require("underscore");
var recursive = require('recursive-readdir');

/**
 * 
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function load(options) {
	
	// force type to array
	options.type = _.flatten([ options.type ]);

	var metadata = { 
		project: options.project,		
	};

	function addFile(storeDir, encoding, cb){

		metadata.base = path.relative("." , storeDir.path)

		recursive(metadata.base + "/content" , ["node_modules", ".git"], function(err, files){
			if (err) return cb(err);

			var tasks = files
				// filter out non targeted files
				.filter(function(file){ return utils.isFileForTypes(file, options.type) })
				
				// return a list of task to load all files
				.map(function(file){
					
					return function(cb){
						fs.readFile(file, function(err, content){
							if (err) return cb(err);

							var json = JSON.parse(content);

							if (_.contains(options.type, json.type)){
								
								cb(null, { path: file,  content: json });
							}
						});

						
					};
				});

			// execute all tasks in parralel
			async.series(tasks, function(err, results){
				if (err) return cb(err);
				metadata.files = results;
				cb(null, metadata);
			});

			


		});
		
		 
		
		
	}

	function end(cb){
		// this.push(metadata);
		cb()
	}
	
	return through.obj(addFile, end);
}



module.exports = load;