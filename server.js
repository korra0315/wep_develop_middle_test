const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

const LOG_FILE = '/home/korra0315/test2/log.txt';

// Helper function for logging
const logEvent = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
};

// Initialize log file
fs.writeFileSync(LOG_FILE, '');
logEvent('Server started');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});