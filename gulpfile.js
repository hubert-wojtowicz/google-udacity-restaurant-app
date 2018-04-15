const assign = require('lodash.assign'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    buffer = require('vinyl-buffer'),
    clean = require('gulp-clean'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    imageResize = require('gulp-image-resize'),
    mergeStream = require('merge-stream'),
    os = require('os'),
    parallel = require('concurrent-transform'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify');

gulp.task('clean-dev',() => {
    gulp.src('build/dev')
    .pipe(clean());
})

gulp.task('copy-dev', ['resize-img-dev'], () => {
    return mergeStream(
        gulp.src(['src/*.html']).pipe(gulp.dest('build/dev')),
        gulp.src(['src/img/*.svg']).pipe(gulp.dest('build/dev/img')),
        gulp.src(['src/*.js']).pipe(gulp.dest('build/dev')),
        gulp.src(['src/js/main.js', 'src/js/restaurant_info.js']).pipe(gulp.dest('build/dev/js')),
        gulp.src(['src/css/*.css']).pipe(gulp.dest('build/dev/css'))
    ); 
});

gulp.task('resize-img-dev', () => {
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
          imageResize({ width : imgDesc.size }),
          os.cpus().length
        ))
        .pipe(rename(function (path) { path.basename += imgDesc.suffix; }))
        .pipe(gulp.dest("build/dev/img"));
    })  
});

var customOpts = {
    entries: ['./src/js/dbhelper.js'],
    debug: true,
    transform: [babelify.configure({
        presets: ["es2015"]})]
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('js', boundle);
b.on('update', boundle);
b.on('log', gutil.log);

function boundle() {
    return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('./src/js/dbhelper.js'))
    .pipe(buffer())
    // optional, remove if you don't need to buffer file content
    .pipe(sourcemaps.init({loadMaps: true})) //load map from browserify file
    // add transformation task to the pipeline here
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(rename({
        dirname: ''
    }))
    .pipe(sourcemaps.write('./build/dev/js'))
    .pipe(gulp.dest('./build/dev/js'))
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop());
}

gulp.task('default',  ['copy-dev', 'js'], () => {
    
});