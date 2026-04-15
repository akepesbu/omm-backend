const { BigQuery } = require('@google-cloud/bigquery');

// Application Default Credentials are picked up automatically.
// Before running locally, authenticate with:
//   gcloud auth application-default login
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'activity-list-493220';
const DATASET_ID = process.env.BQ_DATASET_ID  || 'AdminDataModel';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

// Helper: returns the fully-qualified backtick-quoted table reference
const tableRef = (tableName) =>
  `\`${PROJECT_ID}.${DATASET_ID}.${tableName}\``;

module.exports = { bigquery, PROJECT_ID, DATASET_ID, tableRef };
