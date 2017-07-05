var express = require('express');
var router = express.Router();
var COMMON = require('../modules/common');     // 基本工具库对象


/* GET home page. */
router.get('/', function(req, res) {
    res.redirect('/demo');
});
router.get('/demo', function(req, res, next) {
    res.render('demo-test/index', {});
});

module.exports = router;
