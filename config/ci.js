module.exports = {
  googleClientID:
    '964808011168-29vqsooppd769hk90kjbjm5gld0glssb.apps.googleusercontent.com',
  googleClientSecret: 'KnH-rZC23z4fr2CN4ISK4srN',
  mongoURI: 'mongodb://127.0.0.1:27017/blog_ci', // :27017 is default mongo port, travis will look for blog_ci and create one if not found...
  cookieKey: '123123123',
  redisUrl: 'redis://127.0.0.1:6379' // default port for redis
};
