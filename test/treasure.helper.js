'use strict';

window.treasureHelper = {
  TIMEOUT: 300,
  database: 'test_db_1',
  writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
  protocol: 'http',
  host: 'in-staging.treasuredata.com',
  // jsonphost: 'localhost:9999',
  jsonphost: 'in-staging.treasuredata.com',
  table: 'test_tb_1',
  properties: { username: 'treasure', color: 'blue' },
  responses: {
    success: '{\"created\": true }',
    error: '{\"error\": true }'
  }
};
