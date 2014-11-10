var path = require("path");
var _ = require("underscore");
var fs = require('fs');
var ignoreParser = require('gitignore-parser');
var async = require("async");


const METADATA_EXTENSIONS = {
	template: ".m",
	asset: ".m"
}

const CONTENT_TYPES = {
	".html": "text/html",
	".xml": "application/xml"
}

function extensionsForTypes(types){
	return types.map(function(type){ return METADATA_EXTENSIONS[type]; })
}

function isFileForTypes(file, types){
	return _.contains(extensionsForTypes(types), path.extname(file));		
}

function hasMetadataForFile(file, metadata, base){
	var relativePath = path.relative(base + "/assets", file)
	return _.find(metadata.files, function(item){ 
		return item.content.path == relativePath;
	});
}

function getPathToFile(item){
	var key = { "template": "path", "asset": "src" }[item.content.type];
	return item.content[key];
}

function hasFileForMetadata(item, files, base){
	var absolutePath = base + "/assets/" + getPathToFile(item);
	return files.indexOf(absolutePath) != -1;
}

var ignoreResolver;
function isIgnoredAsset(file, base){
	// cache resolver for performance
	ignoreResolver = ignoreResolver || ignoreParser.compile(fs.readFileSync(base + '/.belisarius_ignore', 'utf8'));
	return ignoreResolver.accepts(file);
}


function getUID(len){
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789',
          out = '';

    for(var i=0, clen=chars.length; i<len; i++){
       out += chars.substr(0|Math.random() * clen, 1);
    }
    
    return out;
}

function createTemplateMetadata(file, base, project){	
	var id = getUID(10);
	var content = {
		id: id,
		type: "template",
		defaultRef: path.basename(file, path.extname(file)),
		active: true,		
		created: new Date().toISOString(),
		ownedBy: project,
		lastModified: new Date().toISOString(),
		acl: { sharedHosts: [] },
		tags: [],
		contentType: CONTENT_TYPES[path.extname(file)],
		path: path.relative(base + "/assets", file),
	};

	return {
		path: base + "/content/" + getPathFromId(id, 'template'),
		content: content
	};
}


function getPathFromId(id, type){
	return [id.substr(0, 2), id.substr(2, 2), id.substr(4, 2), id.substr(6, 2)].join("/") + "/" + id + METADATA_EXTENSIONS[type];
}


module.exports = {
	isFileForTypes: isFileForTypes,
	hasMetadataForFile: hasMetadataForFile,
	hasFileForMetadata: hasFileForMetadata,
	isIgnoredAsset: isIgnoredAsset,
	createTemplateMetadata: createTemplateMetadata,
	getPathFromId: getPathFromId,
	getPathToFile: getPathToFile
}

