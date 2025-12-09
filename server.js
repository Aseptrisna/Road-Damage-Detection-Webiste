require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // Agar HTML bisa akses data
app.use(express.json());


const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Terkoneksi...'))
    .catch(err => console.error('Gagal Konek:', err));

// SKEMA DATA (Sesuai data Anda)

// 1. Schema Road Issues
const RoadIssueSchema = new mongoose.Schema({
    type: String,
    image_url: String,
    detected_class: String,
    latitude: Number,
    longitude: Number,
    timestamp: Date
}, { collection: 'roadissues' }); // Paksa nama collection

const RoadIssue = mongoose.model('RoadIssue', RoadIssueSchema);

// 2. Schema Sensor Data
const SensorDataSchema = new mongoose.Schema({
    type: String,
    x: Number,
    y: Number,
    z: Number,
    timestamp: Date
}, { collection: 'sensordatas' });

const SensorData = mongoose.model('SensorData', SensorDataSchema);

// API ENDPOINTS

// Ambil data kerusakan jalan
app.get('/api/road-issues', async (req, res) => {
    try {
        const data = await RoadIssue.find().sort({ timestamp: -1 }).limit(20);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ambil data sensor akselerometer
app.get('/api/sensors', async (req, res) => {
    try {
        const data = await SensorData.find().sort({ timestamp: -1 }).limit(50);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));