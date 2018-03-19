const { clearHash } = require('../services/cache');
module.exports = async (req, res, next) => {
  // after route handler is complete and everything goes ok come back here
  // if error then it doesnt come here to clear cache.. because other middleware handles that
  await next(); // how to use middleware after all other middle ware is ran
  clearHash(req.user.id);
};
