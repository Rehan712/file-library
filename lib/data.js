const path = require("path");
const fs = require("fs");

var lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

lib.createFile = function(dir, file, data, callback) {
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, "wx", (err, fileDescripter) => {
    if (!err && fileDescripter) {
      const stringData = JSON.stringify(data);
      fs.writeFile(fileDescripter, stringData, err => {
        if (err) {
          callback("error in writing the file");
        } else {
          fs.close(fileDescripter, err => {
            if (err) {
              callback("error in closing the file");
            } else {
              callback(false);
            }
          });
        }
      });
    } else {
      callback("error in opening the file, or this file already exists");
    }
  });
};

lib.readFile = function(dir, file, callback) {
  fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, "utf-8", (err, data) => {
    if (!err && data) {
      callback(false, data);
    } else {
      callback("error comes in reading the file or file not found");
    }
  });
};

lib.updateFile = function(dir, file, data, callback) {
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, "r+", (err, fileDescripter) => {
    if (!err && fileDescripter) {
      fs.truncate(fileDescripter, err => {
        if (err) {
          callback("error comes as truncating the file");
        } else {
          const stringData = JSON.stringify(data);
          fs.writeFile(fileDescripter, stringData, err => {
            if (err) {
              callback("error comes in writing the file");
            } else {
              fs.close(fileDescripter, err => {
                if (err) {
                  callback("error comes in closing the file");
                } else {
                  callback(false);
                }
              });
            }
          });
        }
      });
    } else {
      callback("could not open the file, or it may not exists");
    }
  });
};

lib.deleteFile = function(dir, file, callback) {
  fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, err => {
    if (err) {
      callback("unable to delte the file, or it may not exists");
    } else {
      callback(false);
    }
  });
};

module.exports = lib;
