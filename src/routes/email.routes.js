const express        = require('express');
const createController = require('../controllers/base.controller');
const EmailService   = require('../services/email.service');

const router     = express.Router();
const controller = createController(new EmailService());

// Standard CRUD
router.get   ('/',    controller.getAll);
router.get   ('/:id', controller.getById);
router.post  ('/',    controller.create);
router.put   ('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
