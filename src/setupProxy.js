const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(createProxyMiddleware('/adamant/api/create_experiment', { target: 'http://localhost:5000', changeOrigin: true }));
    app.use(createProxyMiddleware('/adamant/api/check_mode', { target: 'http://localhost:5000', changeOrigin: true }));
    app.use(createProxyMiddleware('/adamant/api/get_tags', { target: 'http://localhost:5000', changeOrigin: true }));
    app.use(createProxyMiddleware('/adamant/api/get_schemas', { target: 'http://localhost:5000', changeOrigin: true }));
}