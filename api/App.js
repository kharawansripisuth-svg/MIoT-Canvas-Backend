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
// --- แก้ไขส่วนนี้ใน app.js ---
app.use('/api/member', MemberRoutes);      // ย้าย member ไปไว้ที่ /api/member
app.use('/api/device', DeviceRoutes);      // ย้าย device ไปไว้ที่ /api/device
app.use('/api/topic', TopicRoutes);
app.use('/api/service', ServiceRoutes); 
app.use('/api/measurement', MeasurementRoutes);
app.use('/api/customer', CustomerRoutes);

module.exports = app;