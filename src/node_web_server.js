/* HTTP, Filesystem and Websocket imports */
var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");

var INDEX_PAGE_URL = "./www/arc_design.html";

/* HTTP server process */
var server = http.createServer(function(req, res) {
	serveFiles(req, res);
});

function serveFiles(req, res){
	var filePath = "." + req.url;
    if (filePath == "./"){
        filePath = INDEX_PAGE_URL;
	}
    var extname = path.extname(filePath);
	var contentType = "text/html";
	
	switch(extname){
		case ".js":
			contentType = "text/javascript";
			break;
			
		case ".css":
			contentType = "text/css";
			break;

		case ".json":
			contentType = "application/json";
			break;
		
		case ".jpg":
		case ".gif":
			contentType = "img";
			break;
	}
	
	fs.exists(filePath, function(exists){
		if(exists){
			fs.readFile(filePath, function(err, data){
				res.writeHead(200, {'Content-Type' : contentType});
				res.write(data);
				res.end();
			});
		}
	});
}

server.listen(7596);