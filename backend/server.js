const express = require('express');
const cors = require('cors');
const chatRouter = require('./routes/chat');
const tripsRouter = require('./routes/trips');
const routingRouter = require('./routes/routing');
const similarityRouter = require('./routes/similarity');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRouter);
app.use('/api/routing', routingRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/similarity', similarityRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});