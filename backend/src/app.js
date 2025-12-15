const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API Asegura2 funcionando' });
});

const playersRouter = require('./routes/players');
app.use('/players', playersRouter);

const eventsRouter = require('./routes/events');
app.use('/events', eventsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});