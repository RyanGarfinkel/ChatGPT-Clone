const express = require('express');
const app = express();

app.use(require('cookie-parser')());
app.use(express.json());

require('dotenv').config();

// Configure Routes
const authRoutes = require('./Routes/AuthRoutes');
app.use('/api/', authRoutes);

// Connect to MongoDB
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server};