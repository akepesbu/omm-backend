const { BigQuery } = require('@google-cloud/bigquery');

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'activity-list-493220';
const DATASET_ID = process.env.BQ_DATASET_ID  || 'AdminDataModel';

const bqOptions = { projectId: PROJECT_ID };
if (process.env.GCP_KEY_FILE) bqOptions.keyFilename = process.env.GCP_KEY_FILE;

const bigquery = new BigQuery(bqOptions);

// Helper: returns the fully-qualified backtick-quoted table reference
const tableRef = (tableName) =>
  `\`${PROJECT_ID}.${DATASET_ID}.${tableName}\``;

module.exports = { bigquery, PROJECT_ID, DATASET_ID, tableRef };
