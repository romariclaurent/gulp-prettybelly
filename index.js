var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var reduce = require("through2-reduce")
var map = require("through2-map")
var filter = require("through2-filter")


const PLUGIN_NAME = 'gulp-prettybelly';


// exporting the plugin main function
module.exports = {
	load: require("./load"),
	synctemplates: require("./synctemplates"),
	write: require("./write"),
	clean: require("./clean"),
	debug: require("./debug")
}