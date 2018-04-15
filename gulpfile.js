var clean = require('gulp-clean');
var gulp = require('gulp');
var imageResize = require('gulp-image-resize');
var os = require('os');
var parallel = require('concurrent-transform');
var rename = require('gulp-rename');

gulp.task('clean-dev',()=>{
    gulp.src('build/dev')
    .pipe(clean());
})

gulp.task('copy-html-dev', ()=>{
    gulp.src(['src/*.html'])
    .pipe(gulp.dest('build/dev'));
});

gulp.task('copy-svg-dev', ()=>{
    gulp.src(['src/img/*.svg'])
    .pipe(gulp.dest('build/dev/img'));
});

gulp.task('copy-js-dev', ()=>{
    gulp.src(['src/*.js'])
    .pipe(gulp.dest('build/dev'));

    gulp.src(['src/js/*.js'])
    .pipe(gulp.dest('build/dev/js'));
});

gulp.task('copy-css-dev', ()=>{
    gulp.src(['src/css/*.css'])
    .pipe(gulp.dest('build/dev/css'));
});

gulp.task('resize-img-dev', ()=>{

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
        .pipe(gulp.dest("build/dev/img"));
    })
      
  });

gulp.task('default',  ['copy-html-dev', 'copy-svg-dev', 'resize-img-dev', 'copy-js-dev', 'copy-css-dev']);