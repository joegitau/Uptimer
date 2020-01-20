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
                else res(201, { message: 'User created' });
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
        _data.read('users', phone, (err, user) => {
          if (!err && user) {
            delete user.hashedPassword;
            res(200, user);
          } else {
            res(404, { error: 'User not found' }); // page not found
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

    delete(data, res) {
      // validate if user exists
      const phone =
        typeof data.payload.phone === 'string' &&
        data.payload.phone.trim().length > 0
          ? data.payload.phone.trim()
          : false;
      if (phone) {
        _data.delete('users', phone, err => {
          if (!err) res(500, { error: 'User not deleted!' });
          else res(200, { message: 'User deleted!' });
        });
      } else {
        res(400, { error: 'Missing required field' });
      }
    }
  }
};

module.exports = routes;
