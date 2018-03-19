const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');
const redisUrl = keys.redisUrl; // local redisURL
const client = redis.createClient(redisUrl);
// if a function requires a cb as last arg such as client.get
// we can convert to a promise using below structure.
client.hget = util.promisify(client.hget);

// orignal exec function from mongoose
// went to mongoose github and followed function
// exec gets called whenever you make a query using mongoose
// so before we make a query we want check redis
const exec = mongoose.Query.prototype.exec;

// use function(){} so this refers to query instance (query.prototype)
// create method on mongoose find .cache() to toggle if query should use chache
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key) || 'default'; // key to be used as primary key in redis can be anything or set default

  return this; // makes chainable .cache().limit(10).sort()
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments); // call mongoose exec
  }

  // need to copy object and then add on new key value prop
  // { _user: '5aaaae5164fa1e27a8650ab1', collection: 'blogs' }
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for 'key' in redis
  // top level hash key followed by mongoose query and collection key
  const cacheValue = await client.hget(this.hashKey, key);

  // if we do, return that
  if (cacheValue) {
    console.log('USE CACHE');
    // app expect mongoose model instance
    // redis is stored as json so we convert json -> object -> mongoose model
    // same as new Blog({title:'', contennt:''}) but will apply to any collection
    const doc = JSON.parse(cacheValue);
    // if doc is Array
    // then we need to convert each object into mongoose model (hydrate) (find)
    // else just convert the onject to the model (findOne)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  // otherwise, issue the query and store the results in redis
  const result = await exec.apply(this, arguments); // call mongoose exec

  // save cache in redis
  // {'userID': '{query, collection}': [results]}
  // this key setup + clear cache for user each time they update something is only good if other users do not rely on your data

  client.hset(this.hashKey, key, JSON.stringify(result)); // convert mongoose document to JSON
  // client.set('test', 'weeznog', 'EX', 10); // will expire after 10 secs -- cannot get anymore...
  // client.hset('drew', 'a', 'weeznog', 'EX', 10); // will not automatically expire -- does not work have to use client.del('drew')
  return result;
};

// export method that will clear a hashCache given its parent key
// such as when we create a new blog...
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
