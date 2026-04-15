const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// UserTable — PK: UserId (INT64)
module.exports = createRouter(new BaseService('UserTable', 'UserId'));
