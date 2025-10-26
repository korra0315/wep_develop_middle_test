const express = require('express');
const cors = require('cors');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const LOG_FILE = '/home/korra0315/test2/log.txt';
const USER_INFO_FILE = '/home/korra0315/test2/userinfo.json';
const USER_DATA_FILE = '/home/korra0315/test2/userdata.json';

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Load user data from file
let users = [];
if (fs.existsSync(USER_INFO_FILE)) {
  const data = fs.readFileSync(USER_INFO_FILE);
  users = JSON.parse(data);
}

// Load schedule data from file
let scheduleData = { schedules: {} };
if (fs.existsSync(USER_DATA_FILE)) {
    const data = fs.readFileSync(USER_DATA_FILE);
    scheduleData = JSON.parse(data);
}

// Helper function to save user data
const saveUsers = () => {
  fs.writeFileSync(USER_INFO_FILE, JSON.stringify(users, null, 2));
};

// Helper function to save schedule data
const saveSchedules = () => {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(scheduleData, null, 2));
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

app.post('/login', (req, res) => {
    const { emailId, password } = req.body;
    const user = users.find(u => (u.id === emailId || u.email === emailId) && u.password === password);

    if (user) {
        req.session.user = user;
        logEvent(`User login successful: ${user.id}`);
        res.json({ message: 'Login successful' });
    } else {
        logEvent(`User login failed: ${emailId}`);
        const existingUser = users.find(u => u.id === emailId || u.email === emailId);
        if (!existingUser) {
            res.status(401).json({ field: 'email-id', message: 'ID or Email does not exist' });
        } else {
            res.status(401).json({ field: 'password', message: 'Password does not match' });
        }
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

app.get('/account-info', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/account-info.html');
    }
    else {
        res.redirect('/login.html');
    }
});

app.get('/my-schedule', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/my-schedule.html');
    }
    else {
        res.redirect('/login.html');
    }
});

app.get('/api/schedules/:userId', (req, res) => {
    const { userId } = req.params;
    const userSchedules = scheduleData.schedules[userId] || [];
    res.json(userSchedules);
});

app.post('/api/schedules/:userId', (req, res) => {
    const { userId } = req.params;
    const newSchedule = req.body;
    if (!scheduleData.schedules[userId]) {
        scheduleData.schedules[userId] = [];
    }

    const index = scheduleData.schedules[userId].findIndex(s => s.id === newSchedule.id);
    if (index !== -1) {
        scheduleData.schedules[userId][index] = newSchedule;
        logEvent(`Schedule updated: ${newSchedule.title}`);
    } else {
        scheduleData.schedules[userId].push(newSchedule);
        logEvent(`Schedule created: ${newSchedule.title}`);
    }

    saveSchedules();
    res.status(201).json(newSchedule);
});

app.delete('/api/schedules/:userId/:scheduleId', (req, res) => {
    const { userId, scheduleId } = req.params;
    if (scheduleData.schedules[userId]) {
        const index = scheduleData.schedules[userId].findIndex(s => s.id === scheduleId);
        if (index !== -1) {
            const deletedSchedule = scheduleData.schedules[userId].splice(index, 1);
            logEvent(`Schedule deleted: ${deletedSchedule[0].title}`);
            saveSchedules();
            return res.status(204).send();
        }
    }
    res.status(404).json({ error: 'Schedule not found' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});