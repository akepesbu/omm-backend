const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// LoBTable — PK: LoBId (INT64)
module.exports = createRouter(new BaseService('LoBTable', 'LoBId'));
