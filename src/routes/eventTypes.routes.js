const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// EventTypes — PK: EventId (INT64)
module.exports = createRouter(new BaseService('EventTypes', 'EventId'));
