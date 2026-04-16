const { bigquery, PROJECT_ID, DATASET_ID, tableRef } = require('../config/bigquery');
const { v4: uuidv4 } = require('uuid');

/**
 * BaseService — generic BigQuery CRUD for a single table.
 *
 * @param {string}  tableName    - BigQuery table name (without project/dataset prefix)
 * @param {string}  primaryKey   - Name of the primary key column
 * @param {string}  pkType       - 'INT64' | 'STRING' (used for auto-ID generation)
 * @param {boolean} hasUpdatedAt - Whether the table has an UpdatedAt column (default: true)
 */
class BaseService {
  constructor(tableName, primaryKey, pkType = 'INT64', hasUpdatedAt = true) {
    this.tableName   = tableName;
    this.primaryKey  = primaryKey;
    this.pkType      = pkType;
    this.hasUpdatedAt = hasUpdatedAt;
    this.tableRef    = tableRef(tableName);
    this.bqTable     = bigquery.dataset(DATASET_ID).table(tableName);
  }

  // ── ID generation ──────────────────────────────────────────────────────
  _generateId() {
    if (this.pkType === 'STRING') return uuidv4();
    // Use current timestamp (milliseconds) as a unique integer ID.
    // Safe for low-concurrency admin tools.
    return Date.now();
  }

  // ── Column name sanitizer (prevents injection in dynamic WHERE clauses) ──
  _safeCol(name) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) ? name : null;
  }

  // ── GET ALL (with optional equality filters + pagination) ──────────────
  async getAll(queryParams = {}) {
    const { page = 1, limit = 50, ...rawFilters } = queryParams;

    const conditions = [];
    const params     = {};

    for (const [key, value] of Object.entries(rawFilters)) {
      const col = this._safeCol(key);
      if (col && value !== undefined && value !== '') {
        conditions.push(`${col} = @${col}`);
        params[col] = value;
      }
    }

    let query = `SELECT * FROM ${this.tableRef}`;
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY CreatedAt DESC`;
    query += ` LIMIT ${Math.max(1, parseInt(limit, 10))}`;
    query += ` OFFSET ${Math.max(0, (parseInt(page, 10) - 1) * parseInt(limit, 10))}`;

    const [rows] = await bigquery.query({ query, params });
    return rows;
  }

  // ── GET BY ID ──────────────────────────────────────────────────────────
  async getById(id) {
    const query  = `SELECT * FROM ${this.tableRef} WHERE ${this.primaryKey} = @id LIMIT 1`;
    const [rows] = await bigquery.query({ query, params: { id } });
    return rows[0] || null;
  }

  // ── CREATE (DML INSERT — rows immediately available for UPDATE/DELETE) ──
  async create(data) {
    const now = new Date();

    if (data[this.primaryKey] === undefined || data[this.primaryKey] === null) {
      data[this.primaryKey] = this._generateId();
    }

    data.CreatedAt = now;
    if (this.hasUpdatedAt) data.UpdatedAt = now;

    const cols   = Object.keys(data).filter(k => this._safeCol(k));
    const query  = `INSERT INTO ${this.tableRef} (${cols.join(', ')}) VALUES (${cols.map(c => `@${c}`).join(', ')})`;
    const params = Object.fromEntries(cols.map(c => [c, data[c]]));

    await bigquery.query({ query, params });
    return data;
  }

  // ── UPDATE (DML) ───────────────────────────────────────────────────────
  async update(id, data) {
    const updates = { ...data };
    delete updates[this.primaryKey]; // never update the PK

    if (this.hasUpdatedAt) updates.UpdatedAt = new Date();

    const setClauses = [];
    const params     = { id };

    for (const [key, value] of Object.entries(updates)) {
      const col = this._safeCol(key);
      if (col) {
        setClauses.push(`${col} = @${col}`);
        params[col] = value;
      }
    }

    if (!setClauses.length) throw new Error('No valid fields provided for update.');

    const query = `UPDATE ${this.tableRef} SET ${setClauses.join(', ')} WHERE ${this.primaryKey} = @id`;
    await bigquery.query({ query, params });

    return { [this.primaryKey]: id, ...updates };
  }

  // ── DELETE (DML) ───────────────────────────────────────────────────────
  async delete(id) {
    const query = `DELETE FROM ${this.tableRef} WHERE ${this.primaryKey} = @id`;
    await bigquery.query({ query, params: { id } });
    return { message: `Record with ${this.primaryKey}=${id} deleted successfully.` };
  }
}

module.exports = BaseService;
