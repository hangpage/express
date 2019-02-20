var express = require('express');
var router = express.Router();
const path = require('path');

/* GET users listing. */
/*
* 此处get('/')表示为 /users之后的路径，由app.get('/users')进入此页面，在此页面再次监听二级路由
*
* */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '../views/test2.html'));
});

module.exports = router;
