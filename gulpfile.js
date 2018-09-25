/**
 * Created by Administrator on 2016/12/26.
 */
var gulp = require('gulp');
var sass=require("gulp-sass");


gulp.task('sass', function () {
	return gulp.src('./public/static/css/*.scss')
		.pipe(sass({
			           outputStyle: 'compressed'  
		           }))
		.pipe(gulp.dest('./public/static/css/'))
});

//gulp.watch("./public/static/css/*.scss", ["sass"]);