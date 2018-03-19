// factory is just a function that returns something to help with tests
const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys'); // secret key we created...
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {
  const sessionObject = {
    passport: {
      user: user._id.toString() // mongoose user._id is an object not string so convert
    }
  };
  // create session object string
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  // create session siginture -- this is for auth
  const sig = keygrip.sign('session=' + session);

  return { session, sig };
};
