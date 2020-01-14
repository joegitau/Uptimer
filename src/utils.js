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
  }
};

module.exports = utils;
