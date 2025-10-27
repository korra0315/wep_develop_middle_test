const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

const LOG_FILE = '/home/korra0315/test2/log.txt';
const CHECKLISTS_FILE = '/home/korra0315/test2/checklists.json';

// Helper function for logging
const logEvent = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
};

// Helper functions for checklists
const readChecklists = () => {
    try {
        const data = fs.readFileSync(CHECKLISTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logEvent('Error reading checklists file: ' + error.message);
        return { checklists: {} };
    }
};

const writeChecklists = (data) => {
    try {
        fs.writeFileSync(CHECKLISTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        logEvent('Error writing checklists file: ' + error.message);
    }
};

// Initialize log file
fs.writeFileSync(LOG_FILE, '');
logEvent('Server started');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Checklist API Endpoints
app.get('/api/checklists/:userId', (req, res) => {
    const { userId } = req.params;
    const allChecklists = readChecklists();
    const userChecklists = allChecklists.checklists[userId] || [];
    res.json(userChecklists);
});

app.post('/api/checklists/:userId', (req, res) => {
    const { userId } = req.params;
    const newChecklist = req.body;
    const allChecklists = readChecklists();
    if (!allChecklists.checklists[userId]) {
        allChecklists.checklists[userId] = [];
    }
    allChecklists.checklists[userId].push(newChecklist);
    writeChecklists(allChecklists);
    res.status(201).json(newChecklist);
});

app.put('/api/checklists/:userId/:checklistId', (req, res) => {
    const { userId, checklistId } = req.params;
    const updatedChecklist = req.body;
    const allChecklists = readChecklists();
    if (allChecklists.checklists[userId]) {
        const index = allChecklists.checklists[userId].findIndex(c => c.id === checklistId);
        if (index !== -1) {
            allChecklists.checklists[userId][index] = updatedChecklist;
            writeChecklists(allChecklists);
            res.json(updatedChecklist);
        } else {
            res.status(404).send('Checklist not found');
        }
    } else {
        res.status(404).send('User not found');
    }
});

app.delete('/api/checklists/:userId/:checklistId', (req, res) => {

    const { userId, checklistId } = req.params;

    const allChecklists = readChecklists();

    if (allChecklists.checklists[userId]) {

        const initialLength = allChecklists.checklists[userId].length;

        allChecklists.checklists[userId] = allChecklists.checklists[userId].filter(c => c.id !== checklistId);

        if (allChecklists.checklists[userId].length < initialLength) {

            writeChecklists(allChecklists);

            res.status(204).send();

        } else {

            res.status(404).send('Checklist not found');

        }

    } else {

        res.status(404).send('User not found');

    }

});



// Schedule API Endpoints

const SCHEDULES_FILE = '/home/korra0315/test2/schedules.json';



const readSchedules = () => {

    try {

        const data = fs.readFileSync(SCHEDULES_FILE, 'utf8');

        return JSON.parse(data);

    } catch (error) {

        logEvent('Error reading schedules file: ' + error.message);

        return { schedules: {} };

    }

};



const writeSchedules = (data) => {

    try {

        fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(data, null, 2));

    } catch (error) {

        logEvent('Error writing schedules file: ' + error.message);

    }

};



app.get('/api/schedules/:userId', (req, res) => {

    const { userId } = req.params;

    const allSchedules = readSchedules();

    const userSchedules = allSchedules.schedules[userId] || [];

    res.json(userSchedules);

});



app.post('/api/schedules/:userId', (req, res) => {

    const { userId } = req.params;

    const newSchedule = req.body;

    const allSchedules = readSchedules();

    if (!allSchedules.schedules[userId]) {

        allSchedules.schedules[userId] = [];

    }

    allSchedules.schedules[userId].push(newSchedule);

    writeSchedules(allSchedules);

    res.status(201).json(newSchedule);

});



app.put('/api/schedules/:userId/:scheduleId', (req, res) => {

    const { userId, scheduleId } = req.params;

    const updatedSchedule = req.body;

    const allSchedules = readSchedules();

    if (allSchedules.schedules[userId]) {

        const index = allSchedules.schedules[userId].findIndex(s => s.id === scheduleId);

        if (index !== -1) {

            allSchedules.schedules[userId][index] = updatedSchedule;

            writeSchedules(allSchedules);

            res.json(updatedSchedule);

        } else {

            res.status(404).send('Schedule not found');

        }

    } else {

        res.status(404).send('User not found');

    }

});



app.delete('/api/schedules/:userId/:scheduleId', (req, res) => {

    const { userId, scheduleId } = req.params;

    const allSchedules = readSchedules();

    if (allSchedules.schedules[userId]) {

        const initialLength = allSchedules.schedules[userId].length;

        allSchedules.schedules[userId] = allSchedules.schedules[userId].filter(s => s.id !== scheduleId);

        if (allSchedules.schedules[userId].length < initialLength) {

            writeSchedules(allSchedules);

            res.status(204).send();

        } else {

            res.status(404).send('Schedule not found');

        }

    } else {

        res.status(404).send('User not found');

    }

});



app.listen(port, () => {

  console.log(`Server listening at http://localhost:${port}`);

});
