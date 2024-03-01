const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();

app.use(cors());
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
mongoose.connect('mongodb+srv://gauravyadav:BcWiKdADGtaPUbd2@cluster0.4f7fobr.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Database connected successfully');
});

// Event listener for connection error
db.on('error', (err) => {
  console.error(`Database connection error: ${err}`);
});

db.on('disconnected', () => {
  console.log('Database disconnected');
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed due to application termination');
    process.exit(0);
  });
});


const dataSchema = new mongoose.Schema({
  name: String,
  mobileNumber: String,
  emailId: String,
  dob: String,
});

const Data = mongoose.model('Data', dataSchema);



// Create
app.post('/add-phone-book', async (req, res) => {
    try {
      const newData = new Data(req.body);
      const savedData = await newData.save();
      res.status(201).send(savedData);
    } catch (err) {
      res.status(500).send(err);
    }
  });
// Read all
app.get('/fetch-phone-book', (req, res) => {
  Data.find({}, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
app.get('/get-all-entries', async (req, res) => {
    try {
      const allEntries = await Data.find();
      res.status(200).send(allEntries);
    } catch (err) {
      res.status(500).send(err);
    }
  });

app.put('/update-phone-book/:id', async (req, res) => {
    try {
      console.log('Updating document with ID:', req.params.id);
      
      const updatedData = req.body;
  
      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).send('Invalid data provided for update.');
      }
  
      console.log('Updating with data:', updatedData);
  
      const updatedDocument = await Data.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
  
      if (!updatedDocument) {
        return res.status(404).send('Document not found with the provided ID.');
      }
      res.status(200).send(updatedDocument);
    } catch (err) {
      console.error('Error updating document:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  

app.delete('/delete-phone-book/:id', (req, res) => {
  Data.findByIdAndDelete(req.params.id)
    .then(data => {
      if (!data) {
        return res.status(404).send({ message: "Data not found" });
      }
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
