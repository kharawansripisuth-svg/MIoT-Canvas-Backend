require('dotenv').config({path: './.env'});
const express = require('express');
const cors = require('cors');
const app = express();
const DeviceRoutes = require('./route/DeviceRoute');
const TopicRoutes = require('./route/TopicRoute');
const ServiceRoutes = require('./route/ServiceRoute');
const MeasurementRoutes = require('./route/MeasurementRoute');
const CustomerRoutes = require('./route/CustomerRoute');
const MemberRoutes = require('./route/MemberRoute');
const roleRoute = require('./route/RoleRoute');
const PermissionRoute = require('./route/PermissionRoute');

//for frontend use before route
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // กำหนด Origin ที่อนุญาต
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // กำหนด HTTP methods ที่อนุญาต
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // ถ้าต้องส่ง cookie หรือ header auth
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/member', MemberRoutes);
app.use('/api/device', DeviceRoutes);
app.use('/api/topic', TopicRoutes);
app.use('/api/service', ServiceRoutes); 
app.use('/api/measurement', MeasurementRoutes);
app.use('/api/customer', CustomerRoutes);
app.use('/api/management', roleRoute);
app.use('/api/management', PermissionRoute);

module.exports = app;