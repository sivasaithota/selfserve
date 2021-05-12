module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    // frameworks to use
    frameworks: ['jasmine'],
    // start these browsers
    browsers: ['PhantomJS'],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-jasmine'
    ],
    // list of files / patterns to load in the browser
    files: [
      './public/bower_components/jquery/dist/jquery.js',
      './public/bower_components/bootstrap/dist/js/bootstrap.min.js',
      './public/bower_components/angular/angular.js',
      './public/bower_components/angular-mocks/angular-mocks.js',
      './public/bower_components/angular-ui-router/release/angular-ui-router.min.js',
      './public/bower_components/angular-animate/angular-animate.min.js',
      './public/bower_components/angular-aria/angular-aria.min.js',
      './public/bower_components/angular-material/angular-material.min.js',
      './public/bower_components/angular-toastr/dist/angular-toastr.tpls.min.js',
      './public/bower_components/lodash/lodash.min.js',
      './public/bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
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
      './public/bower_components/ngstorage/ngStorage.min.js',
      './public/bower_components/free-jqgrid/js/jquery.jqgrid.min.js',
      './public/bower_components/free-jqgrid/js/i18n/grid.locale-en.js',
      './public/bower_components/angular-file-saver/dist/angular-file-saver.bundle.js',
      './public/bower_components/spin.js/spin.js',
      './public/bower_components/angular-spinner/angular-spinner.js',
      './public/bower_components/angular-dragula/dist/angular-dragula.js',
      './public/bower_components/angular-clipboard/angular-clipboard.js',
      './public/bower_components/tinycolor/dist/tinycolor-min.js',
      './public/bower_components/angular-color-picker/dist/angularjs-color-picker.min.js',
      './public/bower_components/ng-file-upload/ng-file-upload-shim.js',
      './public/bower_components/ng-file-upload/ng-file-upload.js',
      './public/bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js',
      './public/bower_components/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js',
      './public/angular/app.js',
      './public/angular/controllers/{,**/*/}*.js',
      './public/angular/directives/{,**/*/}*.js',
      './public/angular/services/{,**/*/}*.js',
      './public/angular/filters/{,**/*/}*.js',
      './specs/unit-tests/public/{,**/*/}*.js',
      'https://online.tableau.com/javascripts/api/tableau-2.0.0.min.js'
    ]
  });
};
