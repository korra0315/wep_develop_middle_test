
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let trips = [];
let nextId = 1;

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
  res.status(201).json(newTrip);
});

app.delete('/api/trips/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = trips.findIndex(trip => trip.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  trips.splice(index, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
