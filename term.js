var express = require('express');
var path = require('path'); //系统路径
var fs = require('fs');
var bodyParser = require('body-parser'); //对post请求的请求体进行解析模块
var app = express();
app.use(bodyParser.urlencoded({ extended: false })); //bodyParser.urlencoded 用来解析request中body的 urlencoded字符，只支持utf-8的编码的字符，也支持自动的解析gzip和 zlib。返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
var hostName = '127.0.0.1'; //ip
var port = 3000; //端口
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var sess;

var total = [0, 0, 0];
var session = require("express-session");
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

//设置允许跨域请求
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); //访问控制允许报头 X-Requested-With: xhr请求
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('X-Powered-By', 'nodejs');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});


app.put('/isexist', (req, res) => {
    var theUsername = req.body.username;
    var thePwd = req.body.password;
    req.session.username = theUsername;
    sess = req.session;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("cs602");
        var whereStr = { "username": theUsername };  // 查询条件
        dbo.collection("user").find(whereStr).toArray(function (err, result) {
            if (err) throw err;

            console.log(result);
            res.send(result);
            db.close();
        });
    });
});

app.get('/seewish', (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("cs602");
        var whereStr = {$and:[{"username":sess.username},{"kind":1}]};  // 查询条件
        dbo.collection("wishList").find(whereStr).toArray(function (err, result) {
            if (err) throw err;

            console.log(result);
            res.send(result);
            db.close();
        });
    });
});

app.get('/beenthere', (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("cs602");
        var whereStr = {$and:[{"username":sess.username},{"kind":2}]};   
        dbo.collection("wishList").find(whereStr).toArray(function (err, result) {
            if (err) throw err;

            console.log(result);
            res.send(result);
            db.close();
        });
    });
});

app.put('/register', (req, res) => {
    var theUsername = req.body.username;
    var thePwd = req.body.password;
    req.session.username = theUsername;
    sess = req.session;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("cs602");

        var myObj = { username: theUsername, password: thePwd };
        dbo.collection("user").insertOne(myObj, function (err, result) {
            if (err) throw err;
            res.send("success");
            console.log("文档插入成功");
            db.close();
        });

    });
});


app.get('/iswish', (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;

        var dbo = db.db("cs602");
        var whereStr = { "username": sess.username };  // 查询条件

        dbo.collection("wishList").find(whereStr).toArray(function (err, result) {
            if (err) throw err;

            console.log(result);
            res.send(result);
            db.close();
        });
    });
});

app.put('/been', (req, res) => {
    var theShopId = req.body.shopid;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("cs602");

        var whereStr = {$and:[{"username":sess.username},{"business":theShopId}]};  
        var updateStr = { $set: { "kind": 2 } };
        dbo.collection("wishList").updateOne(whereStr, updateStr, function (err, result) {
            if (err) throw err;
            console.log("文档更新成功");
            res.send(result);
            db.close();
        });

    });
});

app.put('/delete', (req, res) => {
    var theShopId = req.body.shopid;

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("cs602");
        var whereStr = {$and:[{"username":sess.username},{"business":theShopId},{"kind":2}]};  // 查询条件
        dbo.collection("wishList").deleteOne(whereStr, function(err, obj) {
            if (err) throw err;
            console.log("文档删除成功");
            
            db.close();
        });
    });
    res.send("success");
});

app.put('/addtowish', (req, res) => {
    var theShopId = req.body.shopid;


    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("cs602");

        var myObj = { username: sess.username, business: theShopId, kind: 1 };
        dbo.collection("wishList").insertOne(myObj, function (err, result) {
            if (err) throw err;
            res.send(result);
            console.log("文档插入成功");
            db.close();
        });

    });
});


app.listen(port, hostName, function () {

    console.log(`Server is running at http://${hostName}:${port}`);

});
