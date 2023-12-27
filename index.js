require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

app.use(cors());
app.use(express.json());

// link to front end code
app.use(express.static('dist'));

// add logger middleware using morgan
morgan.token('data', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    if (persons) {
      res.json(persons);
    } else {
      res.status(404).end();
    }
  });
});

app.get('/info', (req, res) => {
  Person.find({}).then((persons) => {
    res.send(
      `<p>Phonebook has info for ${persons.length} people<br/>
      ${new Date().toString()}</p>`
    );
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).json({ error: 'not found' });
      }
    })
    .catch((err) => next(err));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => res.status(204).end())
    .catch((err) => next(err));
});

app.post('/api/persons', async (req, res) => {
  if (!req.body.name || !req.body.number) {
    return res.status(400).json({ error: 'name or number missing' });
  }

  // prevent adding duplicated name
  const persons = await Person.find({});
  if (persons.find((e) => e.name === req.body.name)) {
    return res.status(400).json({ error: 'bad request' });
  }

  const newPerson = new Person({
    name: req.body.name,
    number: req.body.number,
  });
  newPerson.save().then((savedPerson) => res.json(savedPerson));
});

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((err) => next(err));
});

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'CastError') {
    return res.status(400).send({ err: 'malformatted id' });
  }
  next(err);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
