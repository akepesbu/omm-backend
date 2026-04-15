const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// CategoryTable — PK: CategoryId (INT64)
module.exports = createRouter(new BaseService('CategoryTable', 'CategoryId'));
