const express = require('express');
const { handleProxy } = require('./proxyHandler');
const app = express();
const PORT = 3000;

app.use(express.static('.'));

app.get('/proxy', handleProxy);

app.listen(PORT, () => {
  console.log(`SUB Recoded V2 running at http://localhost:${PORT}`);
});
