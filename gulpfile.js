const { src, dest, series } = require("gulp");
const csso = require("gulp-csso");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const sass = require("gulp-sass")(require("sass"));
const plumber = require("gulp-plumber");
const imagemin = import("gulp-imagemin");

/*
 * Compile and minify sass
 */
function sassTask() {
  return src("src/styles/**/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(csso())
    .pipe(dest("assets/css/"));
}

/*
 * Compile fonts
 */
function fontsTask() {
  return src("src/fonts/**/*.{ttf,woff,woff2}")
    .pipe(plumber())
    .pipe(dest("assets/fonts/"));
}

// /*
//  * Minify images
//  */
function imageminTask() {
  return src("src/img/**/*.{jpg,png,gif}")
    .pipe(plumber())
    .pipe(
      imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })
    )
    .pipe(dest("assets/img/"));
}

/**
 * Compile and minify js
 */
function jsTask() {
  return src("src/js/**/*.js")
    .pipe(plumber())
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(dest("assets/js/"));
}

exports.default = series(sassTask, fontsTask, jsTask);
