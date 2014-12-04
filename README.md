prettybelly
-----------

Goal: provide a very fast set of gulp tasks to keep metadata in sync and clean without manual work. 
Has to be fast enough to be used with gulp watch.

Warning: still experimental and limited.

Getting Started
---------------
	
	npm install gulp-prettybelly --save-dev
	
	var pb = require("gulp-prettybelly");

	gulp.task('pb-template', function(){
		return gulp.src('../../')
			.pipe(pb.load({  // load metadata
				type: ["template"], // type of metadata to load asset and/or templates
				project: '<projectname>',  // name of project specified in /assets/
				base: "../../", // relative path to root of project
			}))
			.pipe(pb.synctemplates({ path: 'assets/kalthailand/src' })) // sync templates (html/xml) found in assets/kalthailand/src
			.pipe(pb.write()); // write result  (create/delete metadata)
	});	

	
	// plugin with gulp watch to trigger taks when html file changes
	gulp.task('default', ['pb-template'], function () {
	    gulp.watch("src/**/*.html", ['pb-template']);
	});


TODO
----

- does not index/remove metadata from elasticsearch. 

	



