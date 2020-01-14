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
    res(404, { title: 'Page Not Found' });
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
        typeof fname === 'string' && fname.trim().length > 0 ? fname : false;
      const lastname =
        typeof lname === 'string' && lname.trim().length > 0 ? lname : false;
      const phone =
        typeof telephone === 'string' && telephone.trim().length === 12
          ? telephone
          : false;
      const password =
        typeof pass === 'string' && pass.trim().length > 0 ? pass : false;
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
                if (!err) res(200, { message: 'User created!' });
                else res(500, { error: 'User not created!' }); // 500 - internal server error
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

    get(data, res) {},

    update(data, res) {},

    delete(data, res) {}
  }
};

module.exports = routes;
