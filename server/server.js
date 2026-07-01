const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const connectDB = require('./Database/connectDB');
const taskRoutes = require('./Routes/TaskRoutes');
const userRoutes = require('./Routes/UserRoutes');

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://tasktracker-6lr4-nuwvdzptl-abdullahs-projects-fee9960b.vercel.app',
  'https://tasktracker-vercel.vercel.app',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AuthToken');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;