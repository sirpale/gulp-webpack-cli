var gulp = require('gulp'),
	os = require('os'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	gopen = require('gulp-open'),
	uglify = require('gulp-uglify'),
	cssmin = require('gulp-cssmin'),
	md5 = require('gulp-md5-plus'),
	fileinclude = require('gulp-file-include'),
	clean = require('gulp-clean'),
	spriter = require('gulp-css-spriter'),
	base64 = require('gulp-css-base64'),
	connect = require('gulp-connect'),
	livereload = require('gulp-livereload'),
	inject = require('gulp-inject'),
	del = require('del');


var webpack = require('webpack'),
	webpackConfig = require('./webpack.config');


var host = {
	path : 'dist/',
	port : 3000,
	html : 'index.html'
};


// mac chrome : "Google chrome"
var browser = os.platform() === 'linux' ? 'Google chrome' : (
  os.platform() === 'darwin' ? 'Google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));
var pkg = require('./package.json');



/*

	1.html合并生成
	2.css/images 打包合并压缩
	3.js 打包
	4.html引入css js
	5.md5加密css js
*/





// 1.图片
gulp.task('copy:images',function(done){
	gulp.src(['src/images/**/*'])
		.pipe(gulp.dest('dist/images'))
		.on('end',done);
});


// 2.css
gulp.task('sassmin',['copy:images'],function(done){
	gulp.src(['src/**/*.scss','src/**/*.css'])
		.pipe(sass())
		.pipe(concat('style.min.css'))
		.pipe(gulp.dest('dist/css'))
		.on('end',done);
});

// 3.雪碧图
gulp.task('sprite',['sassmin'],function(done){
	var timestamp = +new Date();
    gulp.src('dist/css/style.min.css')
        .pipe(spriter({
            spriteSheet: 'dist/images/spritesheet' + timestamp + '.png',
            pathToSpriteSheetFromCSS: '../images/spritesheet' + timestamp + '.png',
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(base64())
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'))
        .on('end', done);
});

// 4.webpack配置
var myDevConfig = Object.create(webpackConfig),
	devCompiler = webpack(myDevConfig);

// 引用webpack对js操作
gulp.task('build-js',['sprite'],function(callback){
	devCompiler.run(function(err,stats){
		if(err) throw new gutil.PluginError('webpack:build-js',err);
		gutil.log('[webpack:build-js]',stats.toString({
			colors : true
		}));
		callback();
	});
});

// 5.html合并
gulp.task('fileinclude',['build-js'],function(done){
	gulp.src(['src/app/*.html'])
		.pipe(fileinclude({
			prefix:'@@',
			basepath : '@file'
		}))
		.pipe(gulp.dest('dist/app'))
		.on('end',done);
});


// 6.引入css/js
gulp.task('inject',['fileinclude'],function(done){
	var sources = gulp.src([
		'dist/**/*.js',
		'dist/**/*.css'
		// '!dist/**/common.js'
		],{read:false}),
		common = gulp.src('dist/**/common.js',{read:false});
	gulp.src(['dist/**/*.html'])
		// .pipe(inject(common,{relative:true,starttag:'<!-- inject:common:{{ext}} -->'}))
		.pipe(inject(sources,{relative:true}))
		.pipe(gulp.dest('dist'))
		.on('end',done);
});

// 7.css-js-md5
gulp.task('md',['inject'],function(done){
	gulp.src(['dist/**/*.css','dist/**/*.js'])
	.pipe(md5(10,'dist/**/*.html'))
	.pipe(gulp.dest('dist'))
	.on('end',done);
});



// 监听
gulp.task('watch',function(done){
	
	var watcher = gulp.watch('src/**/*.*',['sassmin']);

	livereload.listen();

	watcher.on('change',function(event){
		livereload.changed(event.path);
	});
});

// 本地服务器
gulp.task('connect',function(){
	console.log('连接服务器...');
	connect.server({
		root:host.path,
		port:host.port,
		livereload : true
	});
});

// 打开浏览器
gulp.task('open',function(done){
	// gulp.src('')
	// 	.pipe(gopen({
	// 		app : browser,
	// 		uri : 'http://localhost:3000/app'
	// 	}))
	// 	.on('end',done);
});

// 清空
gulp.task('clean',function(done){
	gulp.src('dist',{read:false})
		.pipe(clean()).on('end',done);
});


// 发布
gulp.task('default',function(){
	gulp.start('clean','md');
});

// 开发
gulp.task('dev',function(){
	gulp.start('inject','connect','watch','open');
});
















