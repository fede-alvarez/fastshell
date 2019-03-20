'use strict'

import {src, dest, watch, parallel, series} from 'gulp';

import gutil from 'gulp-util';
import sass from 'gulp-sass';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import jshint from 'gulp-jshint';
import header from 'gulp-header';
import rename from 'gulp-rename';
import cssnano from 'gulp-cssnano';
import sourcemaps from 'gulp-sourcemaps';

// Initializing browserSync instance
const server = browserSync.create();

// Info to Packages
const packageJSON = require('./package.json');
const banner = [
  '/*!\n' +
  ' * <%= packageJSON.name %>\n' +
  ' * <%= packageJSON.title %>\n' +
  ' * <%= packageJSON.url %>\n' +
  ' * @author <%= packageJSON.author %>\n' +
  ' * @version <%= packageJSON.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= packageJSON.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

// Build Directories
const dirs = {
  src  : 'src',
  dest : 'app',

  css_dest : 'app/assets/css',
  js_dest : 'app/assets/js'
};

const sources = {
  styles  : `${dirs.src}/scss/*.scss`,
  scripts : `${dirs.src}/**/*.js`,

  stylesFile : `${dirs.src}/scss/style.scss`,
  scriptsFile : `${dirs.src}/js/scripts.js`
};

// Main Tasks
// ----

// Styles
export const buildStyles = () => src(sources.stylesFile)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer('last 4 version'))
  .pipe(dest(dirs.css_dest))
  .pipe(cssnano())
  .pipe(rename({ suffix: '.min' }))
  .pipe(header(banner, { packageJSON : packageJSON }))
  .pipe(sourcemaps.write())
  .pipe(dest(dirs.css_dest));

// Scripts
export const buildScripts = () => src(sources.scriptsFile)
  .pipe(sourcemaps.init())
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(header(banner, { packageJSON : packageJSON }))
  .pipe(dest(dirs.js_dest))
  .pipe(uglify())
  .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
  .pipe(header(banner, { packageJSON : packageJSON }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(sourcemaps.write())
  .pipe(dest(dirs.js_dest));

// BrowserSync
export const serve = ( done ) => {
  server.init(null, {
      server: {
          baseDir: "app"
      }
  });

  if (done != null)
    done();
}

export const liveReload = (done) => {
  server.reload();
  if (done != null)
    done();
}

// Watchers
export const devWatch = () =>
{
  watch(sources.styles, series(buildStyles, liveReload));
  watch(sources.scripts, series(buildScripts, liveReload));
};

export const dev = series(buildStyles, buildScripts, serve, devWatch);

export default dev;
