/*******************************************************
 *      Server Starts From Here                        *
 *******************************************************/
'use strict';

require('dotenv').config();
const http = require('http');
const app = require('./app');
const port = process.env.PORT || 8000;
const env = process.env.ENV || 'Development';
const app_name = process.env.APP_NAME || 'Agri CRM';
const server = http.createServer(app);

app.set('PORT_NUMBER', port);



server.listen(port, () => {
  const data = new Date();
  console.log('|--------------------------------------------');
  console.log('| Server       : ' + app_name);
  console.log('| Environment  : ' + env);
  console.log('| Port         : ' + port);
  console.log(
    '| Date         : ' +
      data
        .toJSON()
        .split('T')
        .join(' '),
  );
  console.log('|--------------------------------------------');
  console.log('| Waiting For Database Connection ');
});

// scheduleTasks(server); 

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server;
