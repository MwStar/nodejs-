var cheerio = require("cheerio");
var http = require('http');
var request = require('request');
var fs=require('fs');
var url="http://www.dysfz.cc/tag/%E5%8A%A8%E4%BD%9C/";

fetchPages(url);

function fetchPages(url) {
	http.get(url,function(res) {
		var html='';
		res.setEncoding('utf-8');//防止中文乱码
		res.on('data',function(chunk){//数据块传输过程函数
			html+=chunk;
		});
		res.on('end',function(){
			var $=cheerio.load(html);
			//var a=$('.pageturn div').find('.next').prev().text();//找到总的的页数
			var a=$('.pageturn div .last').eq(0).text()//找到总的的页数，
			console.log(a);
			for (var i = 0; i < a-150; i++) {//测试时a的为165,请求的url过多，这里减少了请求
		   	var urls=url+i+'?o=2';//每一页的url地址
			pageGet(urls);
			}
		});
	})	
}

function pageGet(url){
	http.get(url,function(res){
		var html='';
		//var arr=[];
		res.setEncoding('utf-8');//防止中文乱码
		res.on('data',function(chunk){//数据块传输过程函数
			html+=chunk;
		});

		res.on('end',function(){//请求到html之后执行函数
			var $=cheerio.load(html);//采用cheerio模块解析html
			var movies=[];
			$('.movie-list li').each(function(){
				var movie={};
				movie.title=$(this).find('h2').text();//标题
				movie.datail=$(this).find('.des div').contents().filter(function(){
					return this.nodeType==3
				}).text();//详情
				//console.log(movie.datail);
				movie.upDate=$(this).find('.des div p span').eq(0).text();//更新日期
				movie.tag=$(this).find('.des div p a').text();//标签
				//console.log(movie.tag);
				movies.push(movie);
			});
			
		//文件存储
		//var title=$('.movie-list li h2').text().trim();//.trim()去除多余的空格
		savedContent($);
		savaeImg($);
				
			
		})
		.on('error',function(err){
			console.log(err);
			})
	})
}

//本地储存文件txt存储详情
//var reg=new RegExp("/|?|:|<|>",'g');
var reg1=new RegExp('/','g');
//var reg2=new RegExp('|','g');
//var reg3=new RegExp('\ ','g');
//var reg4=new RegExp(':','g');
//var reg5=new RegExp(' ?','g');
 function savedContent($){
 	$('.movie-list li').each(function(index,item){
				var details=$(this).find('.des div').contents().filter(function(){
				return this.nodeType==3
			}).text();
				var fileTitle=$(this).find('h2').text();//文件名字
				fileTitle=fileTitle.replace(reg1,'-');//进行正则replace处理，因为命名不能包含/
				//fileTitle=fileTitle.replace(reg3,'');
				//fileTitle=fileTitle.replace(reg4,'');
				//fileTitle=fileTitle.replace(reg5,'');

				console.log(fileTitle);
				fs.appendFile('./data/'+fileTitle+'.txt', details, function(err){
					if(err){
						console.log(err);
					}
				});
			})
 }

 //本地存储扒到的图像资源
 function savaeImg($){
 	$('.des a img').each(function(index,item){
 		var img_title=$(this).attr('alt');
 		var img_fileName=(img_title+'.jpg');
 		//img_fileName=img_fileName.replace(reg,'-');
 		img_fileName=img_fileName.replace(reg1,'');
 		//img_fileName=img_fileName.replace(reg3,'');
 		//img_fileName=img_fileName.replace(reg4,'');
 		//img_fileName=img_fileName.replace(reg5,'');
 		//console.log(img_fileName);
 		var img_src=$(this).attr('src');

 		if (img_title.length>50||img_title=='') {
 			img_title='null';
 		}
//console.log(img_fileName); 		console.log(img_src);

 		//console.log(typeof(img_fileName));
		
 		var options={
 			url:img_src,
 			headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
  					}
 		};
 		//console.log(options);
//采用request模块，向服务器发起一次请求，获取图片资源
       
       
 		request.head(img_src,function(err,res,body){
            if(err){
                console.log(err);
            } 
		var write=fs.createWriteStream('./image/'+img_fileName);
        request(img_src) 
         .on('error',function(err){
         	console.log(err);
         	//console.log(111111);
         })
         .pipe(write);    
         //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
         //Unhandled stream error in pipe.错误：在管道中有未处理的流？？？？？
          
        });//文件存储结束

 	});//遍历each结束

//实验爬取百度图片到本地存储--成功
	var urll = 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1564909352,2801480363&fm=5';
// request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'));
	request(urll).pipe(fs.createWriteStream('doodle.png'));
         
 }


