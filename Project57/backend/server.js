const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/movie_ticket', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

const movieRoutes = require('./routes/movies');
const scheduleRoutes = require('./routes/schedules');
const seatRoutes = require('./routes/seats');
const orderRoutes = require('./routes/orders');
const statsRoutes = require('./routes/stats');

app.use('/api/movies', movieRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Movie Ticket Booking System API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
