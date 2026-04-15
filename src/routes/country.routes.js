const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// CountryTable — PK: CountryId (INT64)
module.exports = createRouter(new BaseService('CountryTable', 'CountryId'));
