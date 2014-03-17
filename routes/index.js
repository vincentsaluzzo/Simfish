var crypto = require('crypto');
var fs = require('fs');
var Datastore = require('nedb');
var db = new Datastore({ filename: __dirname + "/../db", autoload: true });
var path = require('path');

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Simfish |><>' });
};

exports.upload = function(req, res) {
	
	var file = req.files.file;
	//console.log(JSON.stringify(file, null, '\t'));
	var filename = file.originalFilename;
	var timestamp = new Date().toISOString();
	var toHash = filename + timestamp;
	
	var shasum = crypto.createHash('sha1');
	
	shasum.update(toHash);
	var filenameHashed = shasum.digest('hex');
	var saveFolder = __dirname + "/../uploads/";
	
	fs.mkdir(saveFolder, function(err) {
		//console.log(JSON.stringify(err));
		if(err && err.code != "EEXIST") throw err;
		else {
			var savePath = path.normalize(saveFolder + filenameHashed);
			
			fs.readFile(file.path, function (err, data) {
		
		
				fs.writeFile(savePath, data, function(err) {
					if(err) throw err;
					else {
						
						var doc = {
							originalFilename: file.originalFilename,
							headers: file.headers,
							size: file.size,
							name: file.name,
							type: file.type,
							fileHash: filenameHashed,
							filePath: savePath
						};
						
						db.insert(doc, function(err, newDoc) {
							if(err) {
								res.send(500);
							} else {
								var id = newDoc._id;
								res.send(200, id);
							}
						});
					}
				});
			});
		}
	});
};

exports.download = function(req, res) {
	var id = req.params.id;
	db.findOne({_id : id}, function(err, doc) {
		if(err) {
			res.send(500);
			return;
		}
		if(doc === null) {
			res.send(404);
			return;
		}
		res.download(doc.filePath, doc.name);
	});
};

exports.view = function(req, res) {
	var id = req.params.id;
	db.findOne({_id : id}, function(err, doc) {
		if(err) {
			res.send(500);
			return;
		}
		if(doc === null) {
			res.send(404);
			return;
		}
		//console.log(JSON.stringify(doc, null, '\t'));
		var fileurl = "/download/"+id;
		
		if(doc.type.startsWith("video")) {
			console.log("video");
			res.render('video', { title: doc.name, fileurl: fileurl, filetype: doc.type});
		} else if(doc.type.startsWith("image")) {
			console.log("image " + JSON.stringify({ title: doc.name, fileurl: fileurl}));
			res.render('image', { title: doc.name, fileurl: fileurl, filetype: doc.type});
		} else {
			console.log("other");
			res.send(300);
		}
	});
};

exports.debug = function(req, res) {
	db.find({}, function(err, docs) {
		var id = new Array();
		for( var index = 0; index < docs.length; index++) {
			id.push(docs[index]._id);
		}
		
		//console.log(JSON.stringify(docs, null, '\t'));
		res.render('debug', {ids : id});
	});
};