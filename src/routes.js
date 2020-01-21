const _data = require('./data');
const _utils = require('./utils');

// routes
const routes = {
  // 200: OK
  ping(data, res) {
    res(200, { title: 'OK' });
  },

  // Not found
  notFound(data, res) {
    res(404, { error: 'Page Not Found' });
  },

  // users
  users(data, res) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
      routes._users[data.method](data, res);
    } else {
      res(405, { error: 'Method Not Allowed!' });
    }
  },

  // users sub methods -> get, post, put, delete
  _users: {
    post(data, res) {
      // validation
      const {
        firstname: fname,
        lastname: lname,
        phone: telephone,
        password: pass,
        tosAgreement: agreement
      } = data.payload;
      const firstname =
        typeof fname === 'string' && fname.trim().length > 0
          ? fname.trim()
          : false;
      const lastname =
        typeof lname === 'string' && lname.trim().length > 0
          ? lname.trim()
          : false;
      const phone =
        typeof telephone === 'string' && telephone.trim().length === 10
          ? telephone.trim()
          : false;
      const password =
        typeof pass === 'string' && pass.trim().length > 0
          ? pass.trim()
          : false;
      const tosAgreement =
        typeof agreement === 'boolean' && agreement === true ? true : false;

      if (fname && lname && telephone && pass && agreement) {
        // verify if user exists
        _data.read('users', telephone, (err, data) => {
          if (err) {
            // hash the password
            const hashedPassword = _utils.hash(pass);

            if (hashedPassword) {
              // create user
              const user = {
                firstname: fname,
                lastname: lname,
                phone: telephone,
                hashedPassword,
                tosAgreement: true
              };

              // save user
              _data.create('users', telephone, user, err => {
                if (!err) res(500, { error: 'User not created!' });
                // 200 - created
                else res(201, user);
              });
            } else {
              res(500, { error: "Could not hash user's password!" }); // 500 - Internal server error
            }
          } else {
            res(400, {
              error: 'User with phone number provided already exists!'
            });
          }
        });
      } else {
        res(400, { error: 'Confirm that all fields are filled out' }); // 400 - Bad Request
      }
    },

    // get user
    get(data, res) {
      // validate phone number
      const phone =
        typeof data.qs.phone === 'string' && data.qs.phone.trim().length === 10
          ? data.qs.phone.trim()
          : false;

      if (phone) {
        // get the token from req header
        const token =
          typeof data.headers.token === 'string' ? data.headers.token : false;

        // verify given token against the phone number
        routes.verifyToken(token, phone, isValidToken => {
          if (isValidToken) {
            _data.read('users', phone, (err, user) => {
              if (!err && user) {
                delete user.hashedPassword;
                res(200, user);
              } else {
                res(404, { error: 'User not found' }); // page not found
              }
            });
          } else {
            res(403, {
              error: 'Token not found in headers or Token has expired'
            });
          }
        });
      } else {
        console.log(data.qs);
        res(400, { error: 'Missing required fields' });
      }
    },

    // update user
    put(data, res) {
      // validate if user exists - phone
      const phone =
        typeof data.payload.phone === 'string' &&
        data.payload.phone.trim().length === 10
          ? data.payload.phone.trim()
          : false;

      // optional fields
      let firstname =
        typeof data.payload.firstname === 'string' &&
        data.payload.firstname.trim().length > 0
          ? data.payload.firstname.trim()
          : false;
      let lastname =
        typeof data.payload.lastname === 'string' &&
        data.payload.lastname.trim().length > 0
          ? data.payload.lastname.trim()
          : false;
      let password =
        typeof data.payload.password === 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;
      if (phone) {
        // pre-validate optional fields
        if (firstname || lastname || password) {
          _data.read('users', phone, (err, user) => {
            if (!err && user) {
              if (firstname) user.firstname = firstname;
              if (lastname) user.lastname = lastname;
              if (password) user.hashedPassword = _utils.hash(password);

              // get the token from req header
              const token =
                typeof data.headers.token === 'string'
                  ? data.headers.token
                  : false;

              // verify given token against the phone number
              routes.verifyToken(token, phone, isValidToken => {
                if (isValidToken) {
                  // save updated user
                  _data.update('users', phone, user, err => {
                    if (!err) {
                      res(200, { message: 'User updated!' });
                    } else {
                      console.log(err);
                      res(500, { error: 'Could not update user' });
                    }
                  });
                } else {
                  res(403, {
                    error: 'Token not found in headers or Token has expired'
                  });
                }
              });
            } else {
              res(500, { error: "User does't exist" });
            }
          });
        } else {
          res(400, { error: 'Required fields missing' });
        }
      } else {
        res(400, { error: 'Required field (phone) missing' });
      }
    },

    // delete a user
    delete(data, res) {
      const phone =
        typeof data.qs.phone === 'string' && data.qs.phone.trim().length === 10
          ? data.qs.phone.trim()
          : false;
      if (phone) {
        // get the token from req header
        const token =
          typeof data.headers.token === 'string' ? data.headers.token : false;

        // verify given token against the phone number
        routes.verifyToken(token, phone, isValidToken => {
          if (isValidToken) {
            // save updated user
            _data.read('users', phone, (err, user) => {
              if (!err && user) {
                _data.delete('users', phone, err => {
                  if (!err) res(500, { error: 'Could not delete user' });
                  else res(200, { message: 'User deleted' });
                });
              } else {
                res(400, { error: 'Could not find specified user' }); // page not found
              }
            });
          } else {
            res(403, {
              error: 'Token not found in headers or Token has expired'
            });
          }
        });
      } else {
        console.log(data.qs);
        res(400, { error: 'Missing required fields' });
      }
    }
  },

  ///////////////////////////////////////////////////////////
  // tokens
  tokens(data, res) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
      routes._tokens[data.method](data, res);
    } else {
      res(405, { error: 'Method Not Allowed' });
    }
  },

  _tokens: {
    post(data, res) {
      const phone =
        typeof data.payload.phone === 'string' &&
        data.payload.phone.trim().length === 10
          ? data.payload.phone.trim()
          : false;
      const password =
        typeof data.payload.password === 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      if (phone && password) {
        _data.read('users', phone, (err, user) => {
          if (!err && user) {
            // hash password
            const hashedPassword = _utils.hash(password);
            if (hashedPassword === user.hashedPassword) {
              // compare passwords
              const tokenId = _utils.createRandomString(20);
              const expiry = Date.now() + 1000 * 60 * 60;
              const tokenObj = {
                id: tokenId,
                phone: phone,
                expiry: expiry
              };

              // save token
              _data.create('tokens', tokenId, tokenObj, err => {
                if (!err) res(500, { error: 'Token not created' });
                else res(201, tokenObj);
              });
            } else {
              res(400, 'Incorrect password or telephone');
            }
          } else {
            console.log(err);
            res(500, { error: 'Could not fetch user' });
          }
        });
      } else {
        res(400, { error: 'Required fields missing' });
      }
    },

    // get tokens
    get(data, res) {
      // validate token id
      const id =
        typeof data.qs.id === 'string' && data.qs.id.trim().length === 20
          ? data.qs.id.trim()
          : false;
      if (id) {
        _data.read('tokens', id, (err, token) => {
          if (!err && token) {
            res(200, token);
          } else {
            res(404, { error: 'Token not found' }); // page not found
          }
        });
      } else {
        console.log(data.qs);
        res(400, { error: 'Missing required fields' });
      }
    },

    // update tokens
    put(data, res) {
      // validate id and expiry
      const id =
        typeof data.payload.id === 'string' &&
        data.payload.id.trim().length === 20
          ? data.payload.id.trim()
          : false;
      const extend =
        typeof data.payload.extend === 'boolean' && data.payload.extend === true
          ? true
          : false;

      if (id && extend) {
        _data.read('tokens', id, (err, token) => {
          if ((!err, token)) {
            // validate if token is still active
            if (token.expiry > Date.now()) {
              token.expiry = Date.now() + 1000 * 60 * 60; // extend the token's expiry date

              _data.update('tokens', id, token, err => {
                if (!err) res(200, { message: 'Token updated' });
                else
                  res(500, {
                    error: "Token's expiration date could not be updated!"
                  });
              });
            } else {
              res(400, {
                error: 'Token has already expired, and cannot be extended'
              });
            }
          } else {
            res(500, { error: 'Token not found' });
          }
        });
      } else {
        res(400, { error: 'Missing required fields' });
      }
    },

    // delete tokens
    delete(data, res) {
      const id =
        typeof data.qs.id === 'string' && data.qs.id.trim().length === 20
          ? data.qs.id.trim()
          : false;
      if (id) {
        _data.read('users', id, (err, token) => {
          if (!err && token) {
            _data.delete('tokens', id, err => {
              if (!err) res(500, { error: 'Could not delete token' });
              else res(200, { message: 'Token deleted' });
            });
          } else {
            res(400, { error: 'Could not find specified token' }); // page not found
          }
        });
      } else {
        res(400, { error: 'Missing required fields' });
      }
    }
  },

  // verify if given token id is currently valid for a given user
  verifyToken(id, phone, res) {
    // lookup the token
    _data.read('tokens', id, (err, token) => {
      if (!err && token) {
        // verify that token belongs to specified user and that its valid
        if (token.phone === phone && token.id === id) res(true);
        else res(false);
      } else {
        res(false);
      }
    });
  }
};

module.exports = routes;
