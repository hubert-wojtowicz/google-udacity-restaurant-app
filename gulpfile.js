var gulp = require('gulp');
var clean = require('gulp-clean');

gulp.task('clean-dev',()=>{
    gulp.src('build/dev')
    .pipe(clean());
})

gulp.task('copy-html-dev', ['clean-dev'], ()=>{
    gulp.src(['src/*.html'])
    .pipe(gulp.dest('build/dev'));
});
