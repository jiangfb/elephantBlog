const path = require('path');
const routes = require('require-all')({ dirname: path.resolve(__dirname, '../routes') });

module.exports = (router) => {
	console.log('init router');
	Object.keys(routes).forEach(key => {
		routes[key](router)
	})
};