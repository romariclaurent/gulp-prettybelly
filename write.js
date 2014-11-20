var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require("path");
var utils = require("./utils");
var recursive = require('recursive-readdir');
var _ = require("underscore");
var async = require('async');
var mkpath = require('mkpath');
var dir = require("node-dir");

/**
 * 
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function write(options) {
	
	function process(metadata, encoding, cb){
		async.series([
			function(cb){ deleteMetadataFiles(metadata, cb); },
			function(cb){ saveMetadataFiles(metadata, cb); },
			function(cb){ removeEmptyDirectories(metadata, cb); }
		], cb);
	}

	return through.obj(process);
}

function deleteMetadataFiles(metadata, cb){
	var tasks = _.chain(metadata.files)
		
		// only items to delete
		.filter(function(item){ return item.toDelete; })
		
		// prepare delete task
		.map(function(item){  
			return function(cb){ 
				gutil.log("Deleting metadata file " + item.path + " for missing (or static) asset: " + utils.getPathToFile(item));
				fs.unlink(item.path, cb) 
			}  
		})
		.value();

	// execute all tasks 
	tasks.length && gutil.log("Deleting " + tasks.length + " metadata files");
	async.series(tasks, cb);

}

function saveMetadataFiles(metadata, cb){
	
	var tasks = _.chain(metadata.files)
		
		// only items to save
		.filter(function(item){ return item.toSave; })
		
		// prepare save tasks
		.map(function(item){
			
			return function(cb){ 				
				// create missing directories
				mkpath(path.dirname(item.path), function(err){
					if(err) return cb(err);
						
					gutil.log("Creating metadata file " + item.path + " for asset:" + utils.getPathToFile(item));
					
					fs.writeFile(item.path, JSON.stringify(item.content, undefined, 2), cb); 
				
				});
			}  

		})
		.value();


	// execute all tasks
	tasks.length && gutil.log("Creating " + tasks.length + " metadata files");	
	async.series(tasks, cb);
}

function removeEmptyDirectories(metadata, cb){
	var folder = metadata.base + "/content";
	
	dir.paths(folder, function(err, paths){
		if (err) return cb(err);

		var files = paths.files.map(function(file){ return path.relative(folder, file) });
		var dirs = paths.dirs.map(function(file){ return path.relative(folder, file) });
		
		var tasks = _.chain(dirs)
			
			// find empty directories
			.filter(function isEmptyDir(folder){ 
				return !_.find(files, function(file){ return file.indexOf(folder) == 0; }); 
			})

			// sort to get lower level directories first
			.sortBy(function(file){ return -file.length; })

			// make relative path
			.map(function(file){ return folder + "/" + file })
			
			// return async task to delete dir
			.map(function(file){ 
				return function(next){ 
					gutil.log("Removing empty directory: " + file);
					fs.rmdir(file, next); 
				}
			})
			
			.value();

		tasks.length && gutil.log("Deleting " + tasks.length + " empty directories");
		async.series(tasks, cb);

	});
}


module.exports = write;