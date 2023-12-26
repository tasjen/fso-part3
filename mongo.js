const mongoose = require('mongoose');

const argv = process.argv;

if (argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0.tn4liuj.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
});
const Person = mongoose.model('Person', personSchema);

if (argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach(e => console.log(`${e.name} ${e.number}`));
    mongoose.connection.close();
  });
} else if (argv.length === 5) {
  const newPerson = new Person({
    id: Math.round(Math.random() * 999999),
    name: argv[3],
    number: argv[4],
  });
  newPerson.save().then((result) => {
    console.log(
      `added ${newPerson.name} number ${newPerson.number} to phonebook`
    );
    mongoose.connection.close();
  });
}
