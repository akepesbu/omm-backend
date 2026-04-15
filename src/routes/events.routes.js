const express        = require('express');
const createController = require('../controllers/base.controller');
const BaseService    = require('../services/base.service');

const router = express.Router();

// EventsTable — PK: EventRecordId (INT64), no UpdatedAt column
const service    = new BaseService('EventsTable', 'EventRecordId', 'INT64', false);
const controller = createController(service);

// Events are append-only by nature; PUT is intentionally omitted.
router.get   ('/',    controller.getAll);

// Must be defined before /:id to avoid param collision
router.get('/by-item/:itemId', async (req, res) => {
  try {
    const data = await service.getAll({ ItemId: req.params.itemId, ...req.query });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('[EventsTable] by-item error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get   ('/:id', controller.getById);
router.post  ('/',    controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
