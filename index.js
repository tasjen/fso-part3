/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-else-return */
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

app.get('/api/persons', async (req, res, next) => {
  try {
    const persons = await Person.find({});
    if (persons) {
      res.json(persons);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

app.get('/info', async (req, res, next) => {
  try {
    const persons = await Person.find({});
    res.send(
      `<p>Phonebook has info for ${persons.length} people<br/>
      ${new Date().toString()}</p>`
    );
  } catch (err) {
    next(err);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (person) {
      res.json(person);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/api/persons', async (req, res, next) => {
  try {
    const { name, number } = req.body;
    const persons = await Person.find({});
    // prevent adding duplicated name
    if (persons.find((e) => e.name === name)) {
      res.status(400).json({ error: `${name} is already in the collection` });
    } else {
      const newPerson = new Person({ name, number });
      const savedPerson = await newPerson.save();
      res.json(savedPerson);
    }
  } catch (err) {
    next(err);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  try {
    const { name, number } = req.body;
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    );
    res.json(updatedPerson);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
