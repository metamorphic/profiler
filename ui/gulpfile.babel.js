var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var path = require('path');
var babelify = require("babelify");
//var babel = require("gulp-babel");
// var browserSync = require('browser-sync');

var publicPath = '../../fileui/public/';
var publicCSS = publicPath + 'css';
var publicJS = publicPath + 'js';
var publicFonts = publicPath + 'fonts';

// outputs changes to files to the console
function reportChange(event){
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('browserify', function () {
  gulp.src('src/js/main.js')
    //.pipe(babel())
    .pipe(browserify({transform: [babelify.configure({ignore: /bower_components/, stage: 0}), 'reactify']}))
    //.pipe(browserify({transform: ['reactify']}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(publicJS));
});

gulp.task('less', function () {
  gulp.src('./src/css/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(publicCSS));
});

gulp.task('copy', function () {
  gulp.src('src/index.html')
    .pipe(gulp.dest(publicPath));
  gulp.src('src/assets/**/*.*')
    .pipe(gulp.dest(publicPath + 'assets'));
  gulp.src('node_modules/react-select/dist/default.css')
    .pipe(gulp.dest(publicCSS));
  gulp.src('bower_components/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest(publicCSS));
  gulp.src('bower_components/bootstrap/dist/fonts/*')
    .pipe(gulp.dest(publicFonts));
  gulp.src('bower_components/fuelux/dist/css/fuelux.min.css')
    .pipe(gulp.dest(publicCSS));
  gulp.src('bower_components/fuelux/dist/fonts/*')
    .pipe(gulp.dest(publicFonts));
  gulp.src('node_modules/dropzone/dist/min/dropzone.min.css')
    .pipe(gulp.dest(publicCSS));
  gulp.src('src/js/offline.min.js')
    .pipe(gulp.dest(publicJS));
  gulp.src('src/css/offline-theme-slide-indicator.css')
    .pipe(gulp.dest(publicCSS));
  gulp.src('src/css/offline-language-english-indicator.css')
    .pipe(gulp.dest(publicCSS));
  gulp.src('src/css/font-awesome.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/fonts/**/*.*')
    .pipe((gulp.dest(publicFonts)));
  gulp.src('node_modules/d3/d3.js')
    .pipe((gulp.dest(publicJS)));
  gulp.src('src/css/demo.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/icons.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/component.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/checkbox-list.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/js/modernizr.custom.js')
    .pipe((gulp.dest(publicJS)));
  gulp.src('src/js/classie.js')
    .pipe((gulp.dest(publicJS)));
  gulp.src('src/js/mlpushmenu.js')
    .pipe((gulp.dest(publicJS)));
  gulp.src('vendor/**/*.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('node_modules/vis/dist/vis.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('bower_components/underscore/underscore-min.js')
    .pipe(gulp.dest(publicJS));
  gulp.src('bower_components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest(publicJS));
  gulp.src('vendor/jquery.event.drag-2.2.js')
    .pipe(gulp.dest(publicJS));
  gulp.src('node_modules/mprogress/mprogress.min.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('node_modules/mprogress/mprogress.min.js')
    .pipe((gulp.dest(publicJS)));
  gulp.src('vendor/**/*.js')
    .pipe((gulp.dest(publicJS)));
  gulp.src('node_modules/react-ladda/node_modules/ladda/dist/ladda.min.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/slick-default-theme.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/slick.grid.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/smoothness/**/*.*')
    .pipe((gulp.dest(publicCSS + '/smoothness')));
  gulp.src('src/css/slick/examples.css')
    .pipe((gulp.dest(publicCSS + '/slick')));
  gulp.src('src/css/images/*.*')
    .pipe((gulp.dest(publicCSS + '/images')));
  gulp.src('src/css/AdminLTE.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/css/skins/skin-blue.css')
    .pipe((gulp.dest(publicCSS)));
  gulp.src('src/js/app.js')
    .pipe((gulp.dest(publicJS)));
});

gulp.task('default', ['browserify', 'less', 'copy']);

// gulp.task('watch', function () {
//   gulp.watch('src/**/*.*', ['default', browserSync.reload]).on('change', reportChange);
// });
gulp.task('watch', function () {
  gulp.watch('src/**/*.*', ['default']);
});
