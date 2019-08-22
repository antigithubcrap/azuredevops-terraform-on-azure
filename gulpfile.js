const { parallel } = require('gulp');

var gulp = require('gulp');
var grename = require('gulp-rename');
var gimageresize = require('gulp-image-resize');

var paths = {
    scripts: {
        srcApply: 'scripts/terraform-apply/*.js',
        destApply: 'tasks/terraform-apply',
        srcDestroy: 'scripts/terraform-destroy/*.js',
        destDestroy: 'tasks/terraform-destroy',
        srcTools: 'scripts/terraform-tools/*.js',
        destTools: 'tasks/terraform-tools'
    },
    icon: {
        src: 'images/extension-icon.png',
        destApply: 'tasks/terraform-apply',
        destDestroy: 'tasks/terraform-destroy',
        destTools: 'tasks/terraform-tools'
    }
};

// function copyApplyScripts () {
//     return gulp.src(paths.scripts.srcApply)
//         .pipe(gulp.dest(paths.scripts.destApply));
        
// };

// function copyDestroyScripts () {
//     return gulp.src(paths.scripts.srcDestroy)
//         .pipe(gulp.dest(paths.scripts.destDestroy));
// };

function copyToolsScripts () {
    return gulp.src(paths.scripts.srcTools)
        .pipe(gulp.dest(paths.scripts.destTools));
};

function copyIcon () {
    return gulp.src(paths.icon.src)
        .pipe(gimageresize({
            width: 32,
            height: 32
        }))
        .pipe(grename('icon.png'))
        // .pipe(gulp.dest(paths.icon.destApply))
        // .pipe(gulp.dest(paths.icon.destDestroy))
        .pipe(gulp.dest(paths.icon.destTools));
};

exports.default = parallel(/*copyApplyScripts, copyDestroyScripts,*/ copyToolsScripts, copyIcon);