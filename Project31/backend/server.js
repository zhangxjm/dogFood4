require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const albumRoutes = require('./routes/albums');
const photoRoutes = require('./routes/photos');

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');

fs.ensureDirSync(UPLOAD_DIR);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/api/albums', albumRoutes);
app.use('/api/photos', photoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Photo Album API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
