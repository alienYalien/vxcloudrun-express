const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./utils/db");
const logger = morgan("tiny");
const request = require('request');
const http = require('./utils/http');
const config = require('./configs').config;

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// //根据文件名自动整体配置 routes 文件夹  ps:文件命名规则要规范
// var fs = require('fs');
// var routesPath = path.join(__dirname,'routes');
// var files = fs.readdirSync(routesPath);
// files.forEach(function(item) {
//     var file = item.toString();
//     var fileName = file.substr(0, file.indexOf("."));
//     console.log("add Routes:"+fileName);
//     var routes = require('./routes/'+fileName);
//     app.use('/', routes);
// });

function test007SendMsg() {
  var testInfo = {
    a:"a1",
    b:"b2",
    show_env:"1"
  }
  http.get('http://json.parser.online.fr',null,"/beta", testInfo, function (ret, data) {
    if (ret) {
      console.log("test007SendMsg suc ", data);
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
    res.send(req.headers["x-wx-openid"]);
    console.log("wx_openid",req.headers["x-wx-openid"]);
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


