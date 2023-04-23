const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./utils/db");
const logger = morgan("tiny");
const request = require('request');
const http = require('./utils/http');
const configs = require('./configs').config;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

/** session */
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(cookieParser());
app.use(cookieParser('sessiontest'));
app.use(session({
    secret: 'sessiontest',//与cookieParser中的一致
    resave: false,
    saveUninitialized:true,
    cookie:{
        maxAge: configs.session.time // default session expiration is set to 1 hour
    }
}));

//http 发送数据
function test007SendMsg() {
  var testInfo = {
    a:"a1",
    b:"b2",
    show_env:"1"
  }
  //http://httpbin.org 3.230.204.70
  http.get('3.230.204.70',null,"/ip", testInfo, function (ret, data) {
    if (ret) {
      console.log("test007SendMsg suc ", data);//data.origin
    }
    else {
        console.log("test007SendMsg fail ", ret);//data.errcode, data.errmsg)
    }
  });
}

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    var openid = req.headers["x-wx-openid"]
    // var sessionKey = req.params.sessionKey;
    req.session.openid = openid;
    res.send(openid);
    console.log("wx_openid",openid);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
    test007SendMsg();
  });
}

bootstrap();


