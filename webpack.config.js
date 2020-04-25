const path = require('path');

module.exports = {
	watchOptions: {
		aggregateTimeout: 300,
		ignored: ['node_modules']
	},	
	
	entry: './web/js/app.js',
	output: {
		path: path.resolve(__dirname, ''),
		filename: './web/js/app.min.js'
	}
};
