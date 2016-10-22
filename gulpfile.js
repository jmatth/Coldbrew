var gulp = require('gulp');
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var concat = require('gulp-concat');

// Browerify and what we need to use it.
var browserify = require('browserify');
var tap = require('gulp-tap');
var buffer = require('gulp-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');

var resourceDir = 'build/resources/main/public/'


gulp.task('bowerInstall', function() {
  return bower();
});

gulp.task('bowerJs', ['bowerInstall'], function() {
  return gulp.src(['bower_components/*/dist/**/*.min.js'])
    .pipe(concat('thirdParty.js'))
    .pipe(gulp.dest(resourceDir + 'javascript'));
})

gulp.task('bowerCss', ['bowerInstall', 'bowerBootstrapFonts'], function() {
  return gulp.src(['bower_components/*/dist/**/*.min.css'])
    .pipe(concat('thirdParty.css'))
    .pipe(gulp.dest(resourceDir + 'stylesheets'));
})

gulp.task('bowerBootstrapFonts', function() {
  return gulp.src(['bower_components/bootstrap/dist/fonts/*'])
    .pipe(gulp.dest(resourceDir + 'fonts'));
});

gulp.task('bower', ['bowerJs', 'bowerCss']);

gulp.task('sass', ['bowerCss'], function() {
  return gulp.src('src/main/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(resourceDir + 'stylesheets'));
})

gulp.task('lint', function() {

  return gulp.src('src/main/javascript/*.js')

    // Style check our javascript.
    .pipe(eslint())
    .pipe(eslint.format())

});

gulp.task('js', ['lint'], function() {

  return gulp.src('src/main/javascript/*.js', { read: false }) // no need of reading file because browserify does.

    // transform file objects using gulp-tap plugin
    .pipe(tap(function (file) {

      // replace file contents with browserify's bundle stream
      file.contents = browserify(file.path, {debug: true}).bundle();

    }))

    // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
    .pipe(buffer())

    // load and init sourcemaps
    .pipe(sourcemaps.init({loadMaps: true}))

    .pipe(uglify())

    // write sourcemaps
    .pipe(sourcemaps.write('./'))

    .pipe(gulp.dest(resourceDir + 'javascript'));

});

gulp.task('default', ['bower', 'js', 'sass'])
