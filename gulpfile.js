var del = require('del');
var gulp = require('gulp');
var imageResize = require('gulp-image-resize');
var os = require('os');
var parallel = require('concurrent-transform');
var rename = require('gulp-rename');
var log = require('fancy-log');
var runSequence = require('run-sequence');
var mergeStream = require('merge-stream');
var assign = require('lodash.assign');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var plugins = require('gulp-load-plugins')();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

const isProd = () => {
    var args = process.argv.find(x => x.includes('--prod'));
    return args ? true : false;
};
const dest = isProd() ? 'prod' : 'dev';

gulp.task('clean', () => {
    return del(['build']);
})

gulp.task('copy-html', () => {
    return gulp.src(['src/*.html'])
    .pipe(gulp.dest(`build/`));
});

gulp.task('copy-svg', () => {
    return gulp.src(['src/img/*.svg'])
    .pipe(gulp.dest(`build/img`));
});

gulp.task('copy-resized-imgs', (done) => {
    const imgDescs = [
        {
            size: 270,
            suffix: '-270min1x'
        },        
        {
            size: 540,
            suffix: '-540min2x'
        },        
        {
            size: 800,
            suffix: '-800'
        }
    ];
        
    imgDescs.forEach((imgDesc)=>{
        gulp.src("src/img/*.{jpg,png}")
        .pipe(parallel(
            imageResize({ width : imgDesc.size }),
            os.cpus().length
        ))
        .pipe(rename(function (path) { path.basename += imgDesc.suffix; }))
        .pipe(gulp.dest("build/img"));
    });
    done();    
});

const createBoundle = (src) => {
    if (!src.push) {
        src = [src];
    }

    var customOpts = {
        entries: src,
        debug: true
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    b.transform(babelify);

    return b;
};

const bundle = (b, outputPath) => {
  var splitPath = outputPath.split('/');
  var outputFile = splitPath[splitPath.length - 1];
  var outputDir = splitPath.slice(0, -1).join('/');

  return b.bundle()
    // log errors if they happen
    .on('error', log.bind(plugins.util, 'Browserify Error'))
      .pipe(source(outputFile))
      // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(plugins.sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(plugins.sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest(outputDir));
};

var jsBundles = {
    './build/index.js' : createBoundle('./src/js/index.js'),
    './build/sw.js' : createBoundle('./src/js/sw.js'),
    './build/js/dbhelper.js' : createBoundle('./src/js/dbhelper.js'),
    './build/js/main.js' : createBoundle('./src/js/main.js'),
    './build/js/restaurant_info.js' : createBoundle('./src/js/restaurant_info.js')
};

gulp.task('js', function () {
    return mergeStream.apply(null,
        Object.keys(jsBundles).map(function(key) {
            return bundle(jsBundles[key], key);
        })
    );
});

gulp.task('default', (done) => {
    log(`Start deploying to ${dest}...`);

    if(!isProd())
        log.info(`In order to deploy to prod attach '--prod' param to build command.`);

    runSequence('clean', ['copy-html', 'copy-svg', 'copy-resized-imgs', 'js'], done);
});