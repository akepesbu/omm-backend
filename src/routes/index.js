const express = require('express');
const router  = express.Router();

// ── Lookup / Reference tables ─────────────────────────────────────────────
router.use('/status',           require('./status.routes'));
router.use('/categories',       require('./category.routes'));
router.use('/event-types',      require('./eventTypes.routes'));
router.use('/countries',        require('./country.routes'));
router.use('/lob',              require('./lob.routes'));
router.use('/mailboxes',        require('./mailbox.routes'));
router.use('/users',            require('./user.routes'));

// ── Mapping table ─────────────────────────────────────────────────────────
router.use('/mailbox-mappings', require('./mailboxMapping.routes'));

// ── Main tables ───────────────────────────────────────────────────────────
router.use('/emails',           require('./email.routes'));
router.use('/events',           require('./events.routes'));

module.exports = router;
