const env = {
  development: {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'development'
  },
  production: {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production'
  }
};

// determine current env passed as cmd argument
const _ENV = process.env.NODE_ENV;
const currEnv = typeof _ENV === 'string' ? _ENV.toLowerCase() : '';

// create a default env if none is specified
const environment =
  typeof env[currEnv] === 'object' ? env[currEnv] : env.development;

module.exports = environment;
