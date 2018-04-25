'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const del = require('del');

const FolderStructure = function(root, build) {

    this.root = root;
    this.build = build;
    
    this.styles = {
        dev: this.root + 'css/**/*.scss',
        build: this.build + 'css/'
    };

    this.html = {
        dev: this.root + '*.html',
        build: this.build,
    };

    this.images = {
        dev: this.root + 'images/**/*',
        build: this.build + 'images',
    };

    this.fonts = {
        dev: this.root + 'fonts/**/*',
        build: this.build + 'fonts'
    };
};

const folders = new FolderStructure('./src/', './build/');

//CSS
gulp.task('css', () => {
    let isProd = process.env.npm_lifecycle_event === 'build';

    if (isProd) {
        return gulp.src(folders.styles.dev)
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(postcss())
            .pipe(gulp.dest(folders.styles.build));
    } else {

        return gulp.src(folders.styles.dev)
            .pipe(sourcemaps.init())
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(postcss())
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(folders.styles.build));
    }
});


//HTML
gulp.task('html', () => {
    return gulp.src(folders.html.dev)
        .pipe(gulp.dest(folders.html.build));
});

//Images
gulp.task('build:images', () => {
    gulp.src( folders.images.dev )

        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))

        .pipe(gulp.dest(folders.images.build));
});

//Browser sync
gulp.task('browser-sync', () => {
    browserSync({
        server: { 
            baseDir: folders.build, 
            directory: true
        },
        notify: false
    });
});

//Watch
gulp.task('watch', ['build:all', 'browser-sync'], () => {
    gulp.watch(folders.styles.dev, ['css', browserSync.reload]);
    gulp.watch(folders.html.dev, ['html', browserSync.reload]);
});

//Clean
gulp.task('clean', () => {
    del.sync(folders.build);
    del.sync('src/images/sprite.png');
    del.sync('src/images/sprite.svg');
});

//Build
gulp.task('build:all', ['clean', 'html', 'css', 'build:images'], () => {
    gulp.src(folders.fonts.dev).pipe(gulp.dest(folders.fonts.build));
});