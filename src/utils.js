const crypto = require('crypto');
const config = require('../config/config');

const utils = {
  // hash passwords
  hash(str) {
    if (typeof str === 'string' && str.length > 0) {
      const hash = crypto
        .createHmac('sha256', config._PASS_SECRET)
        .update(str)
        .digest('hex');
      return hash;
    } else {
      return false;
    }
  },

  // parse objects into strings and prevent from throwing errors - instead throw an empty obj
  parseJsonToObj(str) {
    try {
      let obj = JSON.parse(str);
      return obj;
    } catch (err) {
      return {};
    }
  },

  // create randomm strings
  createRandomString(len) {
    const str = Math.random(len);
    return str;
  }
};

module.exports = utils;
