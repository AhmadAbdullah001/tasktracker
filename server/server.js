const dotenv = require('dotenv');
const cors=require('cors')
dotenv.config();

const express = require('express');
const connectDB = require('./Database/connectDB');
const taskRoutes = require('./Routes/TaskRoutes');
const userRoutes = require('./Routes/UserRoutes');

connectDB();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://tasktracker-6lr4-klpgvf9gx-abdullahs-projects-fee9960b.vercel.app',
    'https://tasktracker-6lr4-nuwvdzptl-abdullahs-projects-fee9960b.vercel.app',
    'https://tasktracker-6lr4-ktj8q9l5m-abdullahs-projects-fee9960b.vercel.app',
    'https://tasktracker-vercel.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'AuthToken'],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
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

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

module.exports = app;