const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// MailboxMappingTable — PK: AssignmentId (INT64)
module.exports = createRouter(new BaseService('MailboxMappingTable', 'AssignmentId'));
