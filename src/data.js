const fs = require('fs');
const path = require('path');

const utils = require('./utils');

// create folders within .data dir & write to individual files within created folders
const lib = {
  baseDir: path.join(__dirname, './../.data'), // path to base directory

  // method to create new files in .data directory if not already exists
  create(dir, file, data, callback) {
    fs.open(`${this.baseDir}/${dir}/${file}.json`, 'wx', (err, fd) => {
      if (!err && fd) {
        // convert data into json string
        const strData = JSON.stringify(data);

        // write to file and then close the file
        fs.writeFile(fd, strData, err => {
          if (!err) {
            fs.close(fd, err => {
              if (!err) callback('File Created!');
              else callback('Error closing new file');
            });
          } else {
            callback('Error writing to new file');
          }
        });
      } else {
        callback('Error creating New File, it may already Exist!');
      }
    });
  },

  // method to read data from the files
  read(dir, file, callback) {
    fs.readFile(`${this.baseDir}/${dir}/${file}.json`, 'utf8', (err, data) => {
      // parse data recieved into json obj
      if (!err && data) {
        const parsedData = utils.parseJsonToObj(data);
        callback(false, parsedData);
      }
      callback(err, data);
    });
  },

  // update data inside the files
  update(dir, file, data, callback) {
    fs.open(`${this.baseDir}/${dir}/${file}.json`, 'r+', (err, fd) => {
      if (!err && fd) {
        const strData = JSON.stringify(data);

        fs.ftruncate(fd, err => {
          if (!err) {
            fs.writeFile(fd, strData, err => {
              if (!err) {
                fs.close(fd, err => {
                  if (!err) callback('File Updated!');
                  else callback('Error closing existing file');
                });
              } else {
                callback('Error writing to exisiting file');
              }
            });
          } else {
            callback('Error opening existing file');
          }
        });
      } else {
        callback('Error updating existing file');
      }
    });
  },

  // delete an existing file
  delete(dir, file, callback) {
    fs.unlink(`${this.baseDir}/${dir}/${file}.json`, err => {
      if (!err) callback('File Deleted!');
      else callback('Error deleting file. Does it exist?');
    });
  }
};

module.exports = lib;
