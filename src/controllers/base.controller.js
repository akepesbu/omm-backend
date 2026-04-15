/**
 * createController — factory that wraps any BaseService instance into
 * Express route handlers (getAll, getById, create, update, delete).
 */
const createController = (service) => ({

  getAll: async (req, res) => {
    try {
      const data = await service.getAll(req.query);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      console.error(`[${service.tableName}] getAll error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const record = await service.getById(req.params.id);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Record not found.' });
      }
      res.json({ success: true, data: record });
    } catch (err) {
      console.error(`[${service.tableName}] getById error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const record = await service.create(req.body);
      res.status(201).json({ success: true, data: record });
    } catch (err) {
      console.error(`[${service.tableName}] create error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const record = await service.update(req.params.id, req.body);
      res.json({ success: true, data: record });
    } catch (err) {
      console.error(`[${service.tableName}] update error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await service.delete(req.params.id);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error(`[${service.tableName}] delete error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  },

});

module.exports = createController;
