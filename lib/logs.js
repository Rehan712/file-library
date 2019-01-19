var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var lib = {}

lib.baseDir = path.join(__dirname, "/../.logs/");

lib.append = (file,str,callback)=>{
	fs.open(lib.baseDir+file+'.log','a',(err,fileDescripter)=>{
		if(err){
			callback('could not open the file')
		}else{
			fs.appendFile(fileDescripter,str+'\n',(err)=>{
				if(err){
					callback('could not append the file')
				}else{
					callback(false)
				}
			})
		}
	})
}

lib.list = (uncompressedInclude,callback)=>{
	fs.readdir(lib.baseDir,(err,data)=>{
		if(!err && data && data.length){
			var trimmedFileNames = []
			data.forEach(fileName=>{
				if(fileName.indexOf('.log') > -1){
					trimmedFileNames.push(fileName.replace('.log',''))
				}

				if(fileName.indexOf('.gz.b64') > -1 && uncompressedInclude){
					trimmedFileNames.push(fileName.replace('.gz.b64',''))
				}
			})
			callback(false,trimmedFileNames)
		}else{
			callback('error in reading the logs directory')
		}
	})
}

lib.compress = (logId,newFileId,callback)=>{
	var sourceFile = logId + '.log';
	var destFile = newFileId + '.gz.b64';

	fs.readFile(lib.baseDir+sourceFile,'utf-8',(err,inputString)=>{
		if(err){
			callback('error comes in reading the source file')
		}else{
			zlib.gzip(inputString,(err,buffer)=>{
				if(err){
					callback('error comes in gziping the file')
				}else{
					fs.open(lib.baseDir+destFile,'wx',(err,fileDescripter)=>{
						if(err){
							callback('error comes in opening the source file')
						}else{
							fs.writeFile(fileDescripter,buffer.toString('base64'),err=>{
								if(err){
									callback('error comes in writing the dest file')
								}else{
									fs.close(fileDescripter,err=>{
										if(err){
											callback('error comes in closing the file')
										}else{
											callback(false)
										}
									})
								}
							})
						}
					})
				}
			})
		}
	})
}

lib.decompress = (file,callback)=>{
	var fileName = file+'.gz.base64';
	fs.readFile(lib.baseDir+file,'utf-8',(err,str)=>{
		if(err){
			callback('error comes in reading the gzip file')
		}else{
			var inputBuffer = Buffer.from(str,'base64')
			zlib.unzip(inputBuffer,(err,outputBuffer)=>{
				var outputString = outputBuffer.toString();
				callback(false,outputString)
			})
		}
	})
}

lib.truncate = (fileId,callback)=>{
	fs.truncate(lib.baseDir+fileId+'.log',0,(err)=>{
		if(err){
			callback('error comes in truncating the file')
		}else{
			callback(false)
		}
	})
}

module.exports = lib