const { bigquery, DATASET_ID, tableRef } = require('../config/bigquery');
const BaseService = require('./base.service');
const { v4: uuidv4 } = require('uuid');

/**
 * EmailService — extends BaseService for MainEmailTable.
 *
 * Overrides `update` to handle the Attachments ARRAY<STRUCT> column
 * using BigQuery's JSON functions so it remains fully parameterized
 * (no string interpolation of user values).
 */
class EmailService extends BaseService {
  constructor() {
    super('MainEmailTable', 'ItemId', 'STRING', true);
  }

  // ── CREATE ─────────────────────────────────────────────────────────────
  // Inherited from BaseService (streaming insert handles ARRAY<STRUCT>).
  // Override only to ensure a UUID is generated when ItemId is absent.
  async create(data) {
    if (!data.ItemId) data.ItemId = uuidv4();
    return super.create(data);
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────
  // Scalar fields are updated via standard DML named params.
  // Attachments (ARRAY<STRUCT>) are passed as a JSON string and
  // re-hydrated inside BigQuery using JSON functions — fully safe.
  async update(id, data) {
    const { Attachments, ...scalarData } = data;

    delete scalarData.ItemId;
    scalarData.UpdatedAt = new Date();

    const setClauses = [];
    const params     = { id };

    for (const [key, value] of Object.entries(scalarData)) {
      const col = this._safeCol(key);
      if (col) {
        setClauses.push(`${col} = @${col}`);
        params[col] = value;
      }
    }

    // Attachments: pass as JSON string, re-parse inside BigQuery
    if (Attachments !== undefined) {
      setClauses.push(`Attachments = ARRAY(
        SELECT AS STRUCT
          JSON_VALUE(a, '$.FileName')                      AS FileName,
          CAST(JSON_VALUE(a, '$.FileSize') AS INT64)       AS FileSize,
          JSON_VALUE(a, '$.ContentType')                   AS ContentType,
          JSON_VALUE(a, '$.AttachmentId')                  AS AttachmentId
        FROM UNNEST(JSON_QUERY_ARRAY(@attachments_json)) AS a
      )`);
      params.attachments_json = JSON.stringify(Attachments);
    }

    if (!setClauses.length) throw new Error('No valid fields provided for update.');

    const query = `UPDATE ${this.tableRef} SET ${setClauses.join(', ')} WHERE ItemId = @id`;
    await bigquery.query({ query, params });

    return { ItemId: id, ...scalarData, ...(Attachments !== undefined ? { Attachments } : {}) };
  }

  // ── GET ALL with email-specific filters ────────────────────────────────
  async getAll(queryParams = {}) {
    const {
      page      = 1,
      limit     = 50,
      StatusId,
      CategoryId,
      AssignedToId,
      AssignmentId,
      EmailFrom,
      ...rest
    } = queryParams;

    const conditions = [];
    const params     = {};

    const addFilter = (col, val) => {
      if (val !== undefined && val !== '') {
        conditions.push(`${col} = @${col}`);
        params[col] = val;
      }
    };

    addFilter('StatusId',     StatusId);
    addFilter('CategoryId',   CategoryId);
    addFilter('AssignedToId', AssignedToId);
    addFilter('AssignmentId', AssignmentId);
    addFilter('EmailFrom',    EmailFrom);

    // Any remaining safe filters
    for (const [key, value] of Object.entries(rest)) {
      const col = this._safeCol(key);
      if (col && value !== undefined && value !== '') {
        conditions.push(`${col} = @${col}`);
        params[col] = value;
      }
    }

    let query = `SELECT * FROM ${this.tableRef}`;
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY EmailReceivedOn DESC`;
    query += ` LIMIT ${Math.max(1, parseInt(limit, 10))}`;
    query += ` OFFSET ${Math.max(0, (parseInt(page, 10) - 1) * parseInt(limit, 10))}`;

    const [rows] = await bigquery.query({ query, params });
    return rows;
  }
}

module.exports = EmailService;
