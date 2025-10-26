
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

const LOG_FILE = '/home/korra0315/test2/log.txt';
const USER_INFO_FILE = '/home/korra0315/test2/userinfo.json';

// Helper function for logging
const logEvent = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}
`);
};

// Initialize log file
fs.writeFileSync(LOG_FILE, '');
logEvent('Server started');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let trips = [];
let nextId = 1;

// Load user data from file
let users = [];
if (fs.existsSync(USER_INFO_FILE)) {
  const data = fs.readFileSync(USER_INFO_FILE);
  users = JSON.parse(data);
}

// Helper function to save user data
const saveUsers = () => {
  fs.writeFileSync(USER_INFO_FILE, JSON.stringify(users, null, 2));
};

app.post('/api/signup', (req, res) => {
  const { firstName, lastName, id, password, phone, email } = req.body;

  if (!firstName || !lastName || !id || !password || !phone || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (users.find(user => user.id === id)) {
    return res.status(400).json({ error: 'User ID already exists' });
  }

  const newUser = { firstName, lastName, id, password, phone, email };
  users.push(newUser);
  saveUsers();
  logEvent(`New user created: ${id}`);
  res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const user = users.find(u => u.id === id && u.password === password);

  if (user) {
    logEvent(`User login successful: ${id}`);
    res.json({ message: 'Login successful' });
  } else {
    logEvent(`User login failed: ${id}`);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/trips', (req, res) => {
  res.json(trips);
});

app.post('/api/trips', (req, res) => {
  const { title, startDate, endDate } = req.body;
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'Title, startDate, and endDate are required' });
  }
  const newTrip = { id: nextId++, title, startDate, endDate };
  trips.push(newTrip);
  logEvent(`Trip created: ${title}`);
  res.status(201).json(newTrip);
});

app.delete('/api/trips/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = trips.findIndex(trip => trip.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  const deletedTrip = trips[index];
  trips.splice(index, 1);
  logEvent(`Trip deleted: ${deletedTrip.title}`);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
