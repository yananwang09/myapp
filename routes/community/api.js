var express = require('express');
var router = express.Router();
var session = require('express-session');
var formidable = require('formidable'),
    fs = require('fs'),
    TITLE = 'formidable上传示例',
    AVATAR_UPLOAD_FOLDER = '/images/article/',
    domain = "http://localhost:3000";

var query = require('../../tools/community_server.js');

/* limin */
/* some api code */
// 使用 session 中间件
router.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
      maxAge : 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
    },
}));

// 一个中间件栈，显示任何指向 /user/:id 的 HTTP 请求的信息
router.use('/user/:id', function(req, res, next) {
  if (req.session.sessionId) {
    console.log('Request URL:', req.originalUrl);
    next();
  } else {
    console.log('没有登录');
    res.send({ code: 10008, msg: '未登录' });
  }
});

/**
 * 注册
 * @method /user/register
 */
router.post('/register', function (req, res) {
  var sql = 'INSERT INTO t_user(id, name, tel, pwd) VALUES (0, ?, ?, ?)';
  var data = req.body;
  var params = [];
  for(var k in data) {
    params.push(data[k]);
  }
  query(sql, params, function (error, results, fields) {

    if (error) {
      res.send({ code: 10002, msg: '注册失败', error: error.sqlMessage });
      // throw error;
    } else {
      if (results.serverStatus == 2) {
        res.send({ code: 10000, msg: '注册成功' });
      } else {
        res.send({ code: 10001, msg: '注册失败' });
      }
    }
  });
});


/**
 * 登录
 * @method /user/login
 */
router.post('/login', function (req, res) {
  var data = req.body;
  var sql = 'SELECT * FROM t_user where tel=' + data.tel;
  query(sql, null, function (error, results, fields) {
    // console.log('results00', results);
    if (results.length == 0) {
      res.send({ code: 10002, msg: '账号不存在'});
      // throw error;
    } else {
      var bool = results[0].pwd == data.pwd;
      if (bool) {
        req.session.sessionId = results[0].id; // 登录成功，设置 session
        console.log('req9999', req.session);
        res.send({ code: 10000, msg: '登录成功'});
      } else {
        res.send({ code: 10001, msg: '密码错误'});
      }
    }
  });
});


/**
 * 用户信息查询
 * @method /user/userInfo
 */
router.get('/user/userInfo/ssss', function (req, res) {
  // if (req.session.sessionId) {

    var data = req.query;
    var sql = 'SELECT * FROM t_user where id=' + data.id;
    query(sql, null, function (error, results, fields) {
      console.log('req.session.6666666', req.session);
      if (error) {
        throw error;
      } else {
        res.send({ code: 10000, msg: results });
      }
    });
  // } else {
  //   res.redirect('/community');
  // }
});

/**
 * 退出
 * @method /user/logout
 */
router.get('/logout', function (req, res) {
    req.session.sessionId = null; // 删除session
    res.redirect('/login');
});

/* zhangning */
/**
 * 获取用户信息（顶导）
 * @method /api/community/user/base
 */
router.get('/user/base', function (req, res) {
  var sid = req.session.sessionId;
  var sql = 'SELECT id, head_img FROM t_user WHERE id=' + sid;
  query(sql, null, function (error, results, fields) {
    if (error) throw error;
    res.send({ code: 10000, msg: results[0] });
  });
});

/**
 * 最近文章列表
 * @method /api/community/article/recent
 */
router.get('/article/recent', function (req, res) {
  console.log('article');
  var start = (req.query.page - 1) * 10;
  var end = req.query.page * 10;
  var sql = 'SELECT t_article.id, t_article.title, t_article.content, t_article.banner, t_article.create_time, t_user.name, t_user.head_img FROM t_article, t_user WHERE t_article.author_id=t_user.id ORDER BY create_time DESC limit ' + start + ',' + end;
  query(sql, null, function (error, results, fields) {
    if (error) throw error;
    res.send({ code: 10000, msg: results });
  });
});

/**
 * 热门文章列表
 * @method /api/community/article/hot
 */
router.get('/article/hot', function (req, res) {
  console.log('article');
  var sql = 'SELECT id, title, banner, create_time FROM t_article ORDER BY praise DESC limit 10';
  query(sql, null, function (error, results, fields) {
    if (error) throw error;
    res.send({ code: 10000, msg: results });
  });
});

/* lichaoqun */
/**
 * 上传文章banner
 * @method /api/community/article/image
 */
router.post('/article/image', function (req, res) {
  var form = new formidable.IncomingForm();   //创建上传表单
  form.encoding = 'utf-8';        //设置编辑
  form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;     //设置上传目录
  form.keepExtensions = true;     //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

  form.parse(req, function(err, fields, files) {

    if (err) {
      res.locals.error = err;
      res.render('index', { title: TITLE });
      return;
    }
    // console.log('files', files);

    var extName = '';  //后缀名
    switch (files.image.type) {
      case 'image/pjpeg':
        extName = 'jpg';
        break;
      case 'image/jpeg':
        extName = 'jpg';
        break;
      case 'image/png':
        extName = 'png';
        break;
      case 'image/x-png':
        extName = 'png';
        break;
    }

    if(extName.length == 0){
      res.locals.error = '只支持png和jpg格式图片';
      res.render('index', { title: TITLE });
      return;
    }

    var avatarName = Math.random() + '.' + extName;
    //图片写入地址；
    var newPath = form.uploadDir + avatarName;
    //显示地址；
    var showUrl = domain + AVATAR_UPLOAD_FOLDER + avatarName;
    // console.log("newPath",newPath);
    fs.renameSync(files.image.path, newPath);  //重命名
    res.json({
      "newPath":showUrl
    });
  });
});
/**
 *  add/edit article
 * @method /api/community/article/upload
 */
router.post('/article/upload', function(req, res) {

  // console.log('req => ', req.body.id)
  if (req.body.id == 0) {
    var sql = 'INSERT INTO t_article(id, title, author_id, content, banner) VALUES(0, ?, ?, ?, ?)';
    var data = req.body;
    var params = [];
    for(var k in data) {
      params.push(data[k]);
    };
    params.splice(0,1);
    // console.log('add => ', params)
    query(sql, params, function(error, results, fields) {
      if (error) {
        res.send({ code: 10002, msg: '发布失败', error: error.sqlMessage });
        // throw error;
      } else {
        if (results.serverStatus == 2) {
          res.send({ code: 10000, msg: '发布成功' });
        } else {
          res.send({ code: 10001, msg: '发布失败' });
        }
      }
    });
  } else {
    var article_id = req.body.id;
    var sql = 'UPDATE t_article SET title = ?, author_id = ?, content = ?, banner = ?, create_time = ? WHERE id = ?';
    var data = req.body;
    var params = [data.title, data.author_id, data.content, data.banner, data.create_time, article_id];
    // for(var k in data) {
    //   params.push(data[k]);
    // };
    // params.splice(0,1);
    // params.push(article_id);
    // console.log('edit => ', params)
    query(sql, params, function(error, results, fields) {
      if (error) {
        res.send({ code: 10002, msg: '发布失败', error: error.sqlMessage });
        // throw error;
      } else {
        if (results.serverStatus == 2) {
          res.send({ code: 10000, msg: '发布成功' });
        } else {
          res.send({ code: 10001, msg: '发布失败' });
        }
      }
    });
  }
});

/**
 * 读文章
 * @method /api/community/article/read
 */
router.post('/article/read', function(req, res) {
  var data = req.body;
  var sql = 'SELECT * FROM t_article WHERE id = ' + data.id;
  query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      res.send({ code: 10000, msg: results });
    }
  });
});

/**
 * 读like
 * @method /api/community/article/getlike
 */
router.post('/article/getlike', function(req, res) {
  var data = req.body;
  var sql = 'SELECT COUNT(*) AS count FROM t_like WHERE article_id = ' + data.id;
  query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      res.send({ code: 10000, like: results });
    }
  });
});

/**
 * add like
 * @method /api/community/article/like
 */
router.post('/article/like', function(req, res) {
  var sql = 'INSERT INTO t_like(id, article_id, user_id) VALUES(0, ?, ?)';
  var data = req.body;
  var params = [];
  for(var k in data) {
    params.push(data[k]);
  };
  console.log('add => ', params)
  query(sql, params, function(error, results, fields) {
    if (error) {
      res.send({ code: 10002, msg: '发布失败', error: error.sqlMessage });
      // throw error;
    } else {
      if (results.serverStatus == 2) {
        res.send({ code: 10000, msg: '发布成功' });
      } else {
        res.send({ code: 10001, msg: '发布失败' });
      }
    }
  });
});

/**
 * get authorInfo
 * @method /api/community/article/author
 */
router.post('/article/author', function(req, res) {
  var data = req.body;
  var sql = 'SELECT author_id FROM t_article WHERE id = ' + data.id;
  query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      var author_id = results[0].author_id;
      var sql = 'SELECT * FROM t_user WHERE id = ' + author_id;
      query(sql, function(error, results, fields) {
        if (error) {
          throw error;
        } else {
          res.send({ code: 10000, msg: results });
        }
      });
    }
  });
});

/**
 * 最近文章列表
 * @method /api/community/article/latest
 */
router.post('/article/latest', function (req, res) {
  var data = req.body;
  var sql = 'SELECT author_id FROM t_article WHERE id = ' + data.id;
  query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      var author_id = results[0].author_id;
      var sql = 'SELECT t_article.id,t_article.title,t_article.create_time FROM t_article WHERE t_article.author_id = ' + author_id + ' ORDER BY create_time DESC limit 1';
      query(sql, function(error, results, fields) {
        if (error) {
          throw error;
        } else {
          res.send({ code: 10000, msg: results });
        }
      });
    }
  });
});

module.exports = router;
