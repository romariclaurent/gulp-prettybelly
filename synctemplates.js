var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require("path");
var utils = require("./utils");
var recursive = require('recursive-readdir');
var _ = require('underscore');


/**
 * 
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function synctemplates(options) {
	
	function process(metadata, encoding, cb){
		
		var base = path.resolve(metadata.base);
		
		recursive(metadata.base + "/" + options.path, function(err, files){
				
			var templates = files.filter(function(file){ return [".html", ".xml" ].indexOf(utils.extname(file)) != -1  });
			
			// build new metadata for new files
			_.chain(templates)
				
				// files without metadata
				.filter(function(file){ return !utils.hasMetadataForFile(file, metadata, base); })
				
				// create metadate json
				.map(function(file){
					return utils.createTemplateMetadata(file, base, metadata.project);
				})
				
				// mark toSave and push in item list
				.each(function(item){
					item.toSave = true;
					metadata.files.push(item);
				})				

			// find deadlinked metadata
			metadata.files
				
				// only template metadata
				.filter(function(item){	return item.content.type == "template" })
				
				// where target file is missing
				.filter(function(item){	return !utils.hasFileForMetadata(item, templates, metadata.base); })
				
				// mark as toDelete 
				.forEach(function(item){ 
					item.toDelete = true; 
				});


			this.push(metadata);
			
			cb();

		}.bind(this));

	}

	return through.obj(process);
}

module.exports = synctemplates;