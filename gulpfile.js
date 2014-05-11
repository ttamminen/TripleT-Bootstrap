// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');

// for the release
var htmlmin = require('gulp-htmlmin'); 
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('html', function () {
    return gulp.src('html/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('htmlmin', function () {
    return gulp.src('html/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('image', function () {
    return gulp.src('images/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('dist/images'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('html/*.html', ['html']);
    gulp.watch('images/**', ['image']);

    var server = livereload();
    gulp.watch('dist/**').on('change', function(file) {
        server.changed(file.path);
    });
});

gulp.task('server', function (next) {
    var url = require('url'),
        fileServer = require('ecstatic')({root: './', cache: 'no-cache', showDir: true}),
        port = 8000;
    require('http').createServer()
        .on('request', function (req, res) {
            // For non-existent files output the contents of /index.html page in order to make HTML5 routing work
            var urlPath = url.parse(req.url).pathname;
            if (urlPath === '/') {
                req.url = '/dist/index.html';
            } else if (
                ['css', 'html', 'ico', 'less', 'js', 'png', 'txt', 'xml'].indexOf(urlPath.split('.').pop()) == -1 &&
                ['bower_components', 'fonts', 'images', 'src', 'vendor', 'views'].indexOf(urlPath.split('/')[1]) == -1) {
                req.url = '/dist/index.html';
            } else if (['src', 'bower_components'].indexOf(urlPath.split('/')[1]) == -1) {
                req.url = '/dist' + req.url;
            }
            fileServer(req, res);
        })
        .listen(port, function () {
            gutil.log('Server is listening on ' + gutil.colors.magenta('http://localhost:' + port + '/'));
            next();
        });
});

gulp.task('base', ['lint', 'sass', 'scripts'])

// Default Task
gulp.task('default', ['base', 'html', 'watch', 'server' ]);

gulp.task('build', ['base', 'htmlmin', 'image'])