/**
 * @module Gulp Build Steps
 * All the build steps for both public and server files should go here.
 * For now, run node gulpfile to kick off and start the server
 * Once gulp can run with the --harmony flag, we can run gulp normally
 * (e.g.) gulp dev or NODE_ENV=production gulp default
 */

// When environment is not specified as dev, we assume production build

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
process.title = 'socket-base[' + process.env.NODE_ENV + ']';

var path = require('path'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    config = require('./src/lib/config'),
    server = require('./src/server'),
    port = config.get('env.port'),
    logger = require('./log'),
    exc = require('./exceptionhandler'),
    app;


console.info('argv:' + process.argv);
if (process.env.NODE_ENV !== 'dev') gulp.env.production = true;

/**
 * Gulp Task: Lint our js files
 */
gulp.task('lint', function() {
  gulp.src([__dirname + '/src/lib/**/*.js',
    '!' + __dirname + '/src/model/_*/*.jprocess.env.NODE_ENVs'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));;
});


/**
 * Gulp Task: Start Dev Build, which adds additional steps for monitoring
 * and live reloading
 */
gulp.task('server', function() {
  if(app) {
    app.server.close();
  }
  app = server.start(port);
  return;
});

/**
 * Gulp Task: Build all dependencies
 */
gulp.task('build', ['server'], function() {

  console.info(gutil.colors.cyan('++++++++++++++++++++++++++++++++'));
  console.info(gutil.colors.cyan('++++++++++++') 
    + gutil.colors.green('STARTED')
    + gutil.colors.cyan('+++++++++++++'));
  console.info(gutil.colors.cyan('++++++++++++++++++++++++++++++++'));
});

/**
 * Gulp Task: Builds the site, starts web server, and initiates livereload
 */
gulp.task('default', ['build'] ,function() {
  gulp.watch([
      './src/*.js'
    ], ['build']
  );

});



// This is a workaround until gulp can run node with --harmony
// (gulp.env.production) ? gulp.run('build') : gulp.run('dev');
gulp.run('default');
