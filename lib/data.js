const fs = require('fs');
const path = require('path');

// write data to the lib files
const lib = {
  baseDir: path.join(__dirname, '../.data/'), // path to main directory

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
              if (!err) callback(false);
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
  }
};

module.exports = lib;
