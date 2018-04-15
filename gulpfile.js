const browserify = require('browserify'),
    clean = require('gulp-clean'),
    gulp = require('gulp'),
    imageResize = require('gulp-image-resize'),
    mergeStream = require('merge-stream'),
    os = require('os'),
    parallel = require('concurrent-transform'),
    rename = require('gulp-rename');

gulp.task('clean-dev',() => {
    gulp.src('build/dev')
    .pipe(clean());
})

gulp.task('copy-dev', ['resize-img-dev'], () => {
    return mergeStream(
        gulp.src(['src/*.html']).pipe(gulp.dest('build/dev')),
        gulp.src(['src/img/*.svg']).pipe(gulp.dest('build/dev/img')),
        gulp.src(['src/*.js']).pipe(gulp.dest('build/dev')),
        gulp.src(['src/js/*.js']).pipe(gulp.dest('build/dev/js')),
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

function createBundle(src) {
    if (!src.push) {
        src = [src];
    }

    var customOpts = {
        entries: src,
        debug: true
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    b.transform(babelify.configure({
        stage: 1
    }));

    b.transform(hbsfy);
    b.on('log', plugins.util.log);
    return b;
}
  
  
const jsBundles = {
    'js/app.js' : createBundle();
};


gulp.task('default',  ['copy-dev'], () => {
    
});