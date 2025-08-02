import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import campaignRoutes from './routes/campaignRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use('/api', campaignRoutes);

// Start server **after** DB connects
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1); // Exit on failure
  }
};

startServer();




// s0uQZB9Wr2WtGXbt
// aryanraj24032002
// XDN3UC8W2K4P19T2G525XHM9
// API key : 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
