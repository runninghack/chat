
/*
 * GET home page.
 */
var crypto = require('crypto'),
    redis = require('redis');
	
var //userinfo = {},//用来暂存用户信息
    redis_name = 110,
	hash_name = "hashname";//哈希集
	
var loginname ;

exports.index = function(req, res){
  console.log('index');  
  res.render('index');
};

exports.reg = function(req,res){
    console.log('get-reg');
	res.render('reg');
};
exports.doReg = function(req,res){
    //检验用户两次输入的口令是否一致
	console.log('doreg');
	var username = req.body['username'];//用username作为域
	console.log('username:',username);
	console.log('req.body.password:',req.body.password);
    if(req.body['password-repeat'] != req.body['password']){
        console.log('password:',req.body['password']);
		console.log('password-repeat:',req.body['password-repeat']);
		//req.flash('error','yizhiwenti');//
		console.log('koulingbuyizhi');
        res.redirect('/reg');
    }
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    //检查用户名是否已经存在
	var redisClient = redis.createClient();
	redisClient.on("error",function(err){
	    console.log("Error: ",err);		
	});
	
	    		
	redisClient.select(redis_name,function(){  
        console.log('redisstore');
		//console.log('userinfo:',userinfo);
		redisClient.hexists(hash_name,username,function(err,reply){//域username是否在哈希集hash_name中
		    if(reply == 1){//域username在哈希集hash_name中
			    console.log('此用户名已存在！');
				res.redirect('reg');
			}
			else {//将域username存入哈希集hash_name中
			    redisClient.hset(hash_name,username,password,redis.print);
				console.log('hset');
				res.redirect('/login');
			}
			//console.log('userinfo:',userinfo);
		});
		redisClient.hgetall(hash_name, function (err, obj) {
            console.dir(obj);
        });	
		
		/*console.log(redisClient.hsetnx(username, userinfo, password));
		redisClient.hsetnx(username, 'field', password,function(err){
		    console.log('err:',err);
		});
		 */                                     
    }); 
}

exports.login = function(req,res){
    console.log('login');
	res.render('login');
}

exports.dologin = function(req,res){
    loginname = req.body.username;
	console.log('dologin');
	console.log('dologin-username:',loginname);
	console.log('dologin-req.body.password:',req.body.password);
	//res.send('are you ok');
	res.redirect('/chat');
	//res.render('chat',{name:loginname});
}

exports.chat = function(req,res){
    console.log('get-chat');
	console.log('name:',loginname);
	res.render('chat',{
	    name:loginname
	});
}