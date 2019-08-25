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
        destTools: 'tasks/terraform-tools',
        srcInstall: 'scripts/terraform-install/*.js',
        destInstall: 'tasks/terraform-install'
    },
    icon: {
        src: 'images/extension-icon.png',
        destApply: 'tasks/terraform-apply',
        destDestroy: 'tasks/terraform-destroy',
        destTools: 'tasks/terraform-tools',
        destInstall: 'tasks/terraform-install'
    }
};

function copyApplyScripts () {
    return gulp.src(paths.scripts.srcApply)
        .pipe(gulp.dest(paths.scripts.destApply));
};

// function copyDestroyScripts () {
//     return gulp.src(paths.scripts.srcDestroy)
//         .pipe(gulp.dest(paths.scripts.destDestroy));
// };

function copyToolsScripts () {
    return gulp.src(paths.scripts.srcTools)
        .pipe(gulp.dest(paths.scripts.destTools));
};

function copyInstallScripts () {
    return gulp.src(paths.scripts.srcInstall)
        .pipe(gulp.dest(paths.scripts.destInstall));
};

function copyIcon () {
    return gulp.src(paths.icon.src)
        .pipe(gimageresize({
            width: 32,
            height: 32
        }))
        .pipe(grename('icon.png'))
        .pipe(gulp.dest(paths.icon.destApply))
        .pipe(gulp.dest(paths.icon.destTools))
        .pipe(gulp.dest(paths.icon.destInstall));
};

exports.default = parallel(copyApplyScripts, copyToolsScripts, copyInstallScripts, copyIcon);