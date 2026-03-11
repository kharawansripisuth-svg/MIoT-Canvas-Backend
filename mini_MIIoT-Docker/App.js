const express = require('express');
const cors = require('cors');
const app = express();

// Route imports
const cudeviceRoutes = require('./route/cudeviceRoute');
const deviceRoutes = require('./route/deviceRoute');
const measurementRoutes = require('./route/measurementRoute');
const influxRoutes = require('./route/influxRoute');
const websocketRoutes = require('./route/websocketRoute');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', cudeviceRoutes);
app.use('/api', deviceRoutes);
app.use('/api', measurementRoutes);
app.use('/api', influxRoutes);
app.use('/api', websocketRoutes);

module.exports = app;