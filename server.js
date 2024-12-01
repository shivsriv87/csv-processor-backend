// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const csvRoutes = require('./routes/csvRoutes');
// require('dotenv').configure
// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/csv-processor', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error(err));

// // Routes
// app.use('/api/csv', csvRoutes);


// app.get('/',(req,res) => {
//   res.send('server running')
// })

// // Start server
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const csvRoutes = require('./routes/csvRoutes');

// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Use the environment variables for MongoDB URI and port
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from .env file
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/csv', csvRoutes);

app.get('/', (req, res) => {
  res.send('Server running');
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
