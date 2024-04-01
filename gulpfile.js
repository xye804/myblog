const { src, dest, series, parallel, watch } = require("gulp");
const csso = require("gulp-csso");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const sass = require("gulp-sass")(require("sass"));
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const cp = require("child_process");
const browserSync = require("browser-sync");

const jekyllCommand = /^win/.test(process.platform) ? "jekyll.bat" : "bundle";

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
function jekyllBuildTask(done) {
  return cp
    .spawn(jekyllCommand, ["exec", "jekyll", "build"], { stdio: "inherit" })
    .on("close", done);
}

/*
 * Rebuild Jekyll & reload browserSync
 */
function jekyllRebuildTask(done) {
  series(jekyllBuildTask, function () {
    browserSync.reload();
    done();
  })();
}

/*
 * Build the jekyll site and launch browser-sync
 */
function browserSyncTask(done) {
  series(jekyllBuildTask, function () {
    browserSync({
      server: {
        baseDir: "_site",
      },
    });
    done();
  })();
}

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

function watchTask() {
  watch("src/styles/**/*.scss", series(sassTask, jekyllRebuildTask));
  watch("src/js/**/*.js", series(jsTask, jekyllRebuildTask));
  watch(
    "src/fonts/**/*.{tff,woff,woff2}",
    series(fontsTask, jekyllRebuildTask)
  );
  watch("src/img/**/*.{jpg,png,gif}", series(imageminTask, jekyllRebuildTask));
  watch(["*html", "_includes/*html", "_layouts/*.html"], jekyllRebuildTask);
}

exports.default = parallel(
  jsTask,
  sassTask,
  fontsTask,
  browserSyncTask,
  watchTask
);
