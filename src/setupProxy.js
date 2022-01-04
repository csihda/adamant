const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(createProxyMiddleware('/pbb/api/onto2schema', { target: 'http://localhost:5000' }));
}