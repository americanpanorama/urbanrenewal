var gulp           = require('gulp'),
  source           = require('vinyl-source-stream'),
  buffer           = require('vinyl-buffer'),
  browserify       = require('browserify'),
  watchify         = require('watchify'),
  parcelify        = require('parcelify'),
  babelify         = require('babelify'),
  rimraf           = require("rimraf"),
  gulpLoadPlugins  = require('gulp-load-plugins');
 
// Automatically load any gulp plugins in your package.json
var $ = gulpLoadPlugins();

var dev = false;

var htmlSources = './src/*.html',
  devdir = './build',
  proddur = './dist';

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
  'd3',
  'flux',
  'leaflet',
  'queue-async',
  'react',
  'react-dom',
  'react-addons-transition-group',
  'react-leaflet'
];

var WEB_SERVER_PORT = 8888;

gulp.task('html', function() {
  gulp.src(htmlSources)
    .pipe($.copy((dev) ? devdir : proddev, {
      "prefix":  1
    }));
});



function browserifyTask (options) {

  // Bundle the application with browserify
  var appBundler = browserify({
    entries: [options.src],     // Application entry point; browserify finds and bundles all dependencies from there
    transform: [babelify],      // Convert React .jsx -> vanilla .js and enable ES6
    debug: options.development,   // Gives us sourcemapping
    cache: {}, packageCache: {}, fullPaths: options.development // watchify requirements
  });

  // Use parcelify to pull in CSS from any node_module that specifies "style" and "transform" keys in package.json.
  // @panorama components specify these keys.
  parcelify(appBundler, {
    bundles: {
      style: './build/modules.css'
    }
  });

  // We set our dependencies as externals on our app bundler when developing.
  // You might consider doing this for production also and load two javascript
  // files (main.js and vendors.js), as vendors.js will probably not change and
  // takes full advantage of caching
  appBundler.external(options.development ? dependencies : []);

  // The bundling process
  function createBundle() {

    var start = Date.now();
    if (options.development) {
      lintTask(options);
      appBundler.bundle()
        .on('error', $.util.log)
        .pipe(source('main.js'))
        .pipe(gulp.dest(options.dest))
        .pipe($.livereload())
        .pipe($.notify({
          'onLast': true,
          'title': 'app bundle',
          'message': function () { return 'APP bundle built in ' + (Date.now() - start) + 'ms'; }
        }))
        .pipe($.connect.reload());
    } else {
      appBundler.bundle()
        .on('error', $.util.log)
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe($.uglify())
        .pipe(gulp.dest(options.dest))
        .pipe($.notify({
          'onLast': true,
          'message': function () { return 'APP bundle built in ' + (Date.now() - start) + 'ms'; }
        }));
    }

  };

  // Fire up Watchify when developing
  if (options.development) {
    appBundler = watchify(appBundler);
    appBundler.on('update', createBundle);
  }

  createBundle();

  // We create a separate bundle for our dependencies as they
  // should not rebundle on file changes. This only happens when
  // we develop. When deploying the dependencies will be included
  // in the application bundle
  if (options.development) {

    var vendorsBundler = browserify({
      debug: true,
      require: dependencies
    });

    // Run the vendor bundle
    var start = new Date();
    vendorsBundler.bundle()
      .on('error', $.util.log)
      .pipe(source('vendors.js'))
      .pipe(gulp.dest(options.dest))
      .pipe($.notify({
        'onLast': true,
        'title': 'vendors bundle',
        'message': function () { return 'built in ' + (Date.now() - start) + 'ms'; },
        'notifier': function () {}
      }));

  }

}

function cssTask(options) {
  if (options.development) {
    var run = function () {
      var start = new Date();
      gulp.src(options.src)
        .pipe($.sass())
        .pipe(gulp.dest(options.dest))
        .pipe($.notify({
          'onLast': true,
          'title': 'css bundle',
          'message': function () { return 'built in ' + (Date.now() - start) + 'ms'; },
          'notifier': function () {}
        }));
    };
    run();
    gulp.watch(options.watchfiles, run);
  } else {
    gulp.src(options.src)
      .pipe($.sass())
      .pipe($.cssmin())
      .pipe(gulp.dest(options.dest));
  }
}

function copyTask(options) {
  return gulp.src(options.src)
      .pipe($.copy(options.dest, {
        "prefix": options.pathDepth || 1
      }));
}



function lintTask(options) {
  return gulp.src(options.lintsrc)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())  // Exit on lint error with code (1).
    .pipe($.notify({
      'onLast': true,
      'title': 'Lint task',
      'message': function () { return 'Linted.'; },
      'notifier': function () {}
    }));
}

function webserverTask(options) {
  options = options || {};
  var port = options.port || WEB_SERVER_PORT;

  return $.connect.server({
    root: './build/',
    port: port,
    livereload: true
  });
}

function staticFolder() {
  return gulp.src("static/**")
  .pipe($.copy("build/"));
}

function staticDistFolder() {
  return gulp.src("static/**")
  .pipe($.copy("./dist"));
}

gulp.task('setAsDev', function() {
  dev = true;
});

gulp.task('dev', function() {
  dev = true;
  gulp.task('builddev', ['html']);
});

// Local development workflow:
// build component and test on local server (localhost:8888)
// with watcher to pick up changes and rebuild
gulp.task('default', function () {
  rimraf("./build/**", function() {
    // // copy html files to build
    copyTask({
      "src"               : "./src/*.html",
      "dest"              : devdir
    });

    browserifyTask({
      "development" : true,
      "lintsrc"     : 'src/**/*.js*',
      "src"         : './src/main.jsx',
      "dest"        : devdir
    });

    cssTask({
      "development" : true,
      "src"         : './scss/*.scss',
      "watchfiles"  : './scss/**/*.scss',
      "dest"        : devdir
    });

    webserverTask();

    staticFolder();

  });

});

gulp.task('dist', function () {

  rimraf("./dist/**", function() {

    copyTask({
      "src" : "./src/*.html",
      "dest" : "./dist"
    });

    browserifyTask({
      "development" : false,
      "src"       : './src/main.jsx',
      "dest"        : './dist'
    });

    cssTask({
      "development" : false,
      "src"       : './scss/*.scss',
      "dest"        : './dist'
    });

    staticDistFolder();

  });

});
