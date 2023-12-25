const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'))


morgan.token('data', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);

const generateId = () => {
  return Math.round(Math.random() * 1000000000000);
};

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people<br/>
    ${new Date().toString()}</p>`
  );
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  if (persons.find((e) => e.id === id)) {
    res.status(200).json(persons[req.params.id - 1]);
  } else {
    res.status(404).json({ message: 'id Not found' });
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const deletedPerson = persons.find((e) => e.id === id);
  if (deletedPerson) {
    persons = persons.filter((e) => e !== deletedPerson);
    res.status(204).json(deletedPerson);
  } else {
    res.status(404).json({ message: 'id Not found' });
  }
});

app.post('/api/persons', (req, res) => {
  if (!req.body.name || !req.body.number) {
    return res.status(400).json({ error: 'name or number missing' });
  } else if (persons.find((e) => e.name === req.body.name)) {
    return res
      .status(400)
      .json({ error: 'name already exists in the phonebook' });
  } else {
    const newPerson = {
      id: generateId(),
      name: req.body.name,
      number: req.body.number,
    };
    persons = [...persons, newPerson];
    res.json(newPerson);
  }
});

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
