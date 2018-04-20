var del = require('del');
var gulp = require('gulp');
var imageResize = require('gulp-image-resize');
var os = require('os');
var parallel = require('concurrent-transform');
var rename = require('gulp-rename');
var log = require('fancy-log');
var runSequence = require('run-sequence');

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

gulp.task('default', (done) => {
    log(`Start deploying to ${dest}...`);
    
    if(!isProd())
        log.info(`In order to deploy to prod attach '--prod' param to build command.`);

    runSequence('clean', ['copy-html', 'copy-svg', 'copy-resized-imgs'], done);
});