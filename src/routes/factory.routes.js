const express         = require('express');
const createController = require('../controllers/base.controller');

/**
 * createRouter — wires a service instance into an Express Router
 * with standard CRUD endpoints.
 *
 * Routes produced:
 *   GET    /          — list all (supports ?page, ?limit, ?<field>=<value>)
 *   GET    /:id       — get one by primary key
 *   POST   /          — create
 *   PUT    /:id       — full update
 *   DELETE /:id       — delete
 */
const createRouter = (service) => {
  const router     = express.Router();
  const controller = createController(service);

  router.get   ('/',    controller.getAll);
  router.get   ('/:id', controller.getById);
  router.post  ('/',    controller.create);
  router.put   ('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
};

module.exports = createRouter;
