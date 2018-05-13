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
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

var isPr = null;
const isProduction = () => {
    if(isPr != null) return isPr;
    process.argv.find(x => x.includes('--prod')) ? isPr = true: isPr = false;
    return isPr;
};
const dest = isProduction() ? 'prod' : 'dev';

gulp.task('clean', () => {
    return del(['build']);
})

gulp.task('copy-html', () => {
    return gulp.src(['src/*.html'])
    .pipe(gulp.dest(`build/`));
});

gulp.task('styles',() => {
    const sassArgs =  isProduction() ? {outputStyle: 'compressed'} : undefined;
    
    return gulp.src('src/sass/**/*.scss')
    .pipe(!isProduction() ? plugins.sourcemaps.init({loadMaps: true}) : gutil.noop())
    .pipe(sass(sassArgs).on('error', sass.logError))
    .pipe(!isProduction() ? plugins.sourcemaps.write() : gutil.noop())
    .pipe(gulp.dest(`build/css/`));
})

gulp.task('copy-svg', () => {
    return gulp.src(['src/img/*.svg'])
    .pipe(gulp.dest(`build/img`));
});

gulp.task('copy-configuration', () => {
    return gulp.src(['./src/site.webmanifest', './src/browserconfig.xml', './src/web.config'])
    .pipe(gulp.dest(`build/`));
});

gulp.task('copy-ico', () => {
    return gulp.src(['./src/ico/*.*'])
    .pipe(gulp.dest(`build/ico/`));
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
    
    imgDescs.forEach((imgDesc) => {
        gulp.src("src/img/*.{jpg,png}")
        .pipe(parallel(
            imageResize({ 
                width: imgDesc.size,
                quality: 0.5
            }),
            os.cpus().length
        ))
        .pipe(rename(function (path) { path.basename += imgDesc.suffix; }))
        .pipe(gulp.dest("build/img"));
    });
    done();    
});

var createBundle = (src) => {
    if (!src.push) {
        src = [src];
    }
    
    var customOpts = {
        entries: src,
        debug: !isProduction()
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));
    
    b.transform(babelify.configure({presets: ['env']}));

    return b;
}

var jsBundles = {
    './build/index.js': createBundle('./src/js/index.js'),
    './build/sw.js': createBundle('./src/js/sw.js')
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
    // uglify js files
    .pipe(isProduction() ? uglify() : gutil.noop())
    // optional, remove if you dont want sourcemaps
    .pipe(!isProduction() ? plugins.sourcemaps.init({loadMaps: true}) : gutil.noop()) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(!isProduction() ? plugins.sourcemaps.write('./') : gutil.noop()) // writes .map file
    .pipe(gulp.dest(outputDir));
}

gulp.task('js', () => {
    return mergeStream.apply(null,
        Object.keys(jsBundles).map(function(key) {
            return bundle(jsBundles[key], key);
        })
    );
});

gulp.task('watch', () => {
    gulp.watch(['src/**/*.js'], ['js']);
    gulp.watch(['src/**/*.html'], ['copy-html']);
    gulp.watch(['src/**/*.json'], ['copy-configuration']);

    Object.keys(jsBundles).forEach((key) => {
        var b = jsBundles[key];
        b.on('update', () => bundle(b, key));
    });
});

gulp.task('default', (done) => {
    log(`Start deploying to ${dest}...`);

    if(!isProduction())
        log.info(`In order to deploy to prod attach '--prod' param to build command.`);

    runSequence('clean', ['copy-configuration', 'copy-ico', 'copy-html', 'styles', 'copy-svg', 'copy-resized-imgs', 'js'], 'watch', done);
});