const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// StatusTable — PK: StatusId (INT64)
module.exports = createRouter(new BaseService('StatusTable', 'StatusId'));
