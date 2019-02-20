var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const db = require('./config/db');
const userDao = require('./dao/userSqlMapping');

var app = express();
const connection = mysql.createConnection(db.mysql);
const pool = mysql.createPool(db.mysql);
connection.connect();
// view engine setup
//设置模板引擎启动
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//@test 创建一个简单的中间件
var requestTime = function (req, res, next) {
  req.requestTime = Date.now();
  next();
};
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestTime);//使用中间件
/*
*
* 中间件函数可以执行以下任务：

    执行任何代码。
    对请求和响应对象进行更改。
    结束请求/响应循环。
    调用堆栈中的下一个中间件函数。
    如果当前中间件函数没有结束请求/响应循环，那么它必须调用 next()，以将控制权传递给下一个中间件函数。否则，请求将保持挂起状态。
*
* */

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
  if(typeof ret === 'undefined') {
    res.json({
      code:'1',
      msg: '操作失败'
    });
  } else {
    res.json(ret);
  }
};

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test', usersRouter);

app.all('/secret', function (req, res, next) {
  console.log('Accessing the secret section ...');
  next(); // 向下传递控制权
});


app.get('/query', function(req, res){
  pool.getConnection(function (err, connection) {
    connection.query(userDao.query, function(err, rows, fields) {
      if (err) throw err;
      console.log('The solution is: ', rows[0]);
      res.send(rows[0]);
      connection.release();
    });
  })
});

app.get('/user/add', function(req, res, next){
  pool.getConnection(function (err, connection) {
    // 获取前台页面传过来的参数
    var params = req.query || req.params;
    connection.query(userDao.query, [params.name], function(err, rows, fields) {
      if (err) throw err;
      if(rows[0]){
        connection.query(userDao.update, [params.gender, params.name], function (err2, result) {
          jsonWrite(res, {
            code: 200,
            msg: '已存在该用户，更新性别成功'
          });
          connection.release();
        })
      }else{
        connection.query(userDao.insert, [params.name, params.gender], function(err, result) {
          if (err) throw err;
          jsonWrite(res, {
            code: 200,
            msg: '新增成功'
          });
          connection.release();
        });
      }
    });

  })
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
