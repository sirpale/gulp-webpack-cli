var path = require('path'),
	fs = require('fs'),
	webpack = require('webpack');


var SRC_DIR = path.resolve(process.cwd(),'src');


function getEntry() {
	var jsPath = path.resolve(SRC_DIR,'js'),
		dirs = fs.readdirSync(jsPath),
		matchs = [],
		files = {};

	dirs.forEach(function (item){
		matchs = item.match(/(.+)\.js$/);
		console.log(matchs);
		if(matchs) files[matchs[1]] = path.resolve(SRC_DIR,'js',item);
	});

	console.log(JSON.stringify(files));
	return files;
}

var config = {
	devtool : '#source-map',
	entry : getEntry(),
	output : {
		path : path.join(__dirname,'dist/js'),
		publicPath : 'dist/js',
		filename : '[name].js',
		chunkFilename : '[chunkhash].js'
	},
	resolve : {
		alias : {
			jquery:SRC_DIR + '/js/lib/jquery.min.js',
			core : SRC_DIR + '/js/core',
			ui : SRC_DIR + '/js/ui'
		}
	},
	plugins : [
		new webpack.optimize.CommonsChunkPlugin('common'),
		new webpack.optimize.UglifyJsPlugin({
			compress : {
				warnings:false
			}
		})
	]
};







module.exports = config;
