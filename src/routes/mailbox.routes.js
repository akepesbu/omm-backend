const createRouter  = require('./factory.routes');
const BaseService   = require('../services/base.service');

// MailboxTable — PK: MailboxId (INT64)
module.exports = createRouter(new BaseService('MailboxTable', 'MailboxId'));
