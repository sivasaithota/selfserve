// jshint ignore: start
var gulp = require('gulp'),
  watch = require('gulp-watch'),
  gulpif = require('gulp-if'),
  stripDebug = require('gulp-strip-debug'),
  removeLogs = require('gulp-removelogs'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-terser'),
  concat = require('gulp-concat'),
  concatCss = require('gulp-concat-css'),
  plumber = require('gulp-plumber'),
  cleanCSS = require('gulp-clean-css'),
  minifyHtml = require('gulp-minify-html'),
  templateCache = require('gulp-angular-templatecache'),
  runSequence = require('run-sequence'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  KarmaServer = require('karma').Server,
  footer = require('gulp-footer');

// Copy logo from one file to another
var gridWidget = require('config').get('jqGridWidget'),
  keycloakConfig = require('config').get('keycloakFrontendClient');

var clientFiles = ['./public/angular/{,**/*/}*.js', '!./public/angular/app.js'],
  scssFiles = ['./public/scss/styles.scss'],
  watchScss = ['./public/scss/{,**/*/}*.scss'],
  includePaths = ['./public/scss'],
  htmlFiles = ['./public/views/{,**/*/}*.ejs', './public/angular/{,**/*/}*.ejs'];

var vendorCss = [
    './public/bower_components/bootstrap/dist/css/bootstrap.min.css',
    './public/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
    './public/bower_components/angular-material/angular-material.min.css',
    './public/bower_components/angular-toastr/dist/angular-toastr.min.css',
    './public/bower_components/font-awesome/css/font-awesome.min.css',
    './public/bower_components/angular-dragula/dist/dragula.css',
    './public/bower_components/angular-color-picker/dist/angularjs-color-picker.min.css',
    './public/bower_components/angular-color-picker/dist/themes/angularjs-color-picker-bootstrap.min.css',
    './public/bower_components/perfect-scrollbar/css/perfect-scrollbar.min.css',
    './public/bower_components/select2/dist/css/select2.min.css',
    './public/bower_components/angularjs-slider/dist/rzslider.css',
    './public/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css',
    './public/bower_components/ngprogress/ngProgress.css'
    ],

  vendorJs = [
    './public/bower_components/moment/moment.js',
    './public/bower_components/jquery/dist/jquery.min.js',
    './public/bower_components/bootstrap/dist/js/bootstrap.min.js',
    './public/bower_components/angular/angular.min.js',
    './public/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    './public/bower_components/angular-animate/angular-animate.min.js',
    './public/bower_components/angular-sanitize/angular-sanitize.min.js',
    './public/bower_components/angular-cookies/angular-cookies.min.js',
    './public/bower_components/angular-aria/angular-aria.min.js',
    './public/bower_components/angular-material/angular-material.min.js',
    './public/bower_components/angular-toastr/dist/angular-toastr.tpls.min.js',
    './public/bower_components/lodash/lodash.min.js',
    './public/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
    './public/bower_components/angular-password/angular-password.min.js',
    './public/bower_components/bluebird/js/browser/bluebird.min.js',
    './public/bower_components/nsPopover/src/nsPopover.js',
    './public/bower_components/js-xlsx/dist/xlsx.core.min.js',
    './public/bower_components/js-xlsx/dist/cpexcel.js',
    './public/bower_components/js-xlsx/dist/ods.js',
    './public/bower_components/js-xlsx/dist/jszip.js',
    './public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    './public/bower_components/async/lib/async.js',
    './public/bower_components/file-saver/FileSaver.js',
    './public/bower_components/free-jqgrid/js/jquery.jqgrid.min.js',
    './public/bower_components/free-jqgrid/js/i18n/grid.locale-en.js',
    './public/bower_components/angular-file-saver/dist/angular-file-saver.bundle.js',
    './public/bower_components/spin.js/spin.js',
    './public/bower_components/angular-dragula/dist/angular-dragula.js',
    './public/bower_components/angular-clipboard/angular-clipboard.js',
    './public/bower_components/tinycolor/dist/tinycolor-min.js',
    './public/bower_components/angular-color-picker/dist/angularjs-color-picker.min.js',
    './public/bower_components/ng-file-upload/ng-file-upload-shim.js',
    './public/bower_components/msl-angular-uploads/dist/angular-uploads.js',
    './public/bower_components/ng-file-upload/ng-file-upload.js',
    './public/bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js',
    './public/bower_components/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js',
    './public/bower_components/jquery.actual/jquery.actual.js',
    './public/bower_components/select2/dist/js/select2.js',
    './public/bower_components/mustache.js/mustache.js',
    './public/bower_components/d3/d3.js',
    './public/bower_components/angularjs-slider/dist/rzslider.js',
    './public/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
    './public/bower_components/ng-scrollbars/dist/scrollbars.min.js',
    './node_modules/socket.io-client/dist/socket.io.js',
    './public/bower_components/angular-socket-io/socket.js',
    './public/bower_components/angular-local-storage/dist/angular-local-storage.min.js',
    './public/bower_components/powerbi-client/dist/powerbi.js',
    './node_modules/keycloak-js/dist/keycloak.js',
    './public/bower_components/ngprogress/build/ngprogress.min.js',
    './public/src/js/tableau-2.0.0.min.js',
  ];

// Set enviroment
gulp.task('set-dev', function () {
  env = 'dev';
});

gulp.task('set-prod', function () {
  env = 'prod';
});

// Concat css files from bower components
gulp.task('vendorcss', function () {
  return gulp.src(vendorCss)
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('./public/build/src/vendor'));
});

// Concat js files from bower components
gulp.task('vendorjs', function () {
  return gulp.src(vendorJs)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('./public/build/src/vendor'));
});

// Concat js client files, strip console and debugger statements from JavaScript code,
// add angularjs dependency injection annotations with ng-annotate,
// minify files
gulp.task('js', function () {
  return gulp.src(clientFiles)
    .pipe(gulpif(env === 'prod', removeLogs()))
    .pipe(plumber())
    .pipe(concat('index.js'))
    .pipe(gulpif(env === 'prod', stripDebug()))
    .pipe(gulpif(env === 'prod', ngAnnotate()))
    .pipe(gulp.dest('./public/build/src/js'))
    .pipe(gulpif(env === 'prod', uglify({
      mangle: false
    })))
    .pipe(gulpif(env === 'prod', gulp.dest('./public/build/src/js')));
});

// Sass plugin for Gulp
gulp.task('scss', function () {
  return gulp.src(scssFiles)
    .pipe(sass({
      includePaths: includePaths,
      errLogToConsole: true
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'iOS 6'],
      cascade: false
    }))
    .pipe(gulpif(env === 'prod', cleanCSS({
      compatibility: 'ie8'
    })))
    .pipe(gulp.dest('./public/build/src/css'));
});

gulp.task('copyFonts', function () {
  gulp.src('./public/src/fonts/{,**/*/}*.{ttf,woff,woff2,eof,svg}')
    .pipe(gulp.dest('./public/build/src/fonts'));
});

gulp.task('copyImages', function () {
  gulp.src('./public/src/images/{,**/*/}*.{jpg,png,svg}')
    .pipe(gulp.dest('./public/build/src/images'));
});

gulp.task('copyStyles', function () {
  gulp.src('./public/src/styles/{,**/*/}*.css')
    .pipe(gulp.dest('./public/build/src/styles'));
});

// Concatenates and registers AngularJS templates in the $templateCache
gulp.task('template', function () {
  return cacheTemplates(htmlFiles, 'app.template.js');

  function cacheTemplates(input, output) {
    return gulp.src(input)
      .pipe(minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe(templateCache(output, {
        module: 'commonApp'
      }))
      .pipe(gulp.dest('./public/build/src/templates/'));
  }
});

// View changes to files and run current tasks
gulp.task('watch', function () {
  gulp.watch(clientFiles, ['js']);
  gulp.watch(watchScss, ['scss']);
  gulp.watch(htmlFiles, ['template']);
});

function get_karma_server() {
  return new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  });
}

gulp.task('test', function () {
  return get_karma_server().start();
});

gulp.task('add-module', function () {
  return gulp.src('./public/angular/app.js')
    .pipe(footer('angular.module(\'commonApp\').requires.push(\'' + (gridWidget ? 'jqGridWidget' : 'jqGridMain') + '\');'))
    .pipe(gulpif(
      env === 'dev',
      footer('angular.module(\'commonApp\').constant(\'USER_MANAGEMENT_PATH\', \'/user-management/api/\');')
    ))
    .pipe(gulpif(
      env === 'debug',
      footer('angular.module(\'commonApp\').constant(\'USER_MANAGEMENT_PATH\', \'/user-management/api/\');')
    ))
    .pipe(gulpif(
      env === 'prod',
      footer('angular.module(\'commonApp\').constant(\'USER_MANAGEMENT_PATH\', \'/user-management/api/\');')
    ))
    .pipe(footer('angular.module(\'commonApp\').constant(\'KEYCLOAK_CONFIG\', '+JSON.stringify(keycloakConfig)+');')
    )
    .pipe(gulp.dest('./public/build/src/js/'));
});

gulp.task('dev', function () {
  runSequence(
    'set-dev', [
      'add-module',
      'vendorcss',
      'vendorjs',
      'js',
      'copyFonts',
      'copyImages',
      'copyStyles',
      'scss',
      'template',
      'watch'
    ]
  );
});

gulp.task('debug', function () {
  runSequence(
    'set-dev', [
      'add-module',
      'vendorcss',
      'vendorjs',
      'js',
      'copyFonts',
      'copyImages',
      'copyStyles',
      'scss',
      'template'
    ]
  );
});

gulp.task('prod', function (callback) {
  runSequence(
    'set-prod', [
      'add-module',
      'copyFonts',
      'copyImages',
      'copyStyles',
      'vendorcss',
      'vendorjs',
      'js',
      'scss',
      'template'
    ],
    callback
  );
});
