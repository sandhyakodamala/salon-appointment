const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// In-memory storage (replace with database in production)
let bookings = [];

// API endpoint for booking
app.post('/api/book', (req, res) => {
    const { name, email, phone, serviceId, stylistId, date, time, notes } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !serviceId || !stylistId || !date || !time) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields' 
        });
    }
    
    const booking = {
        id: bookings.length + 1,
        name,
        email,
        phone,
        serviceId: parseInt(serviceId),
        stylistId: parseInt(stylistId),
        date,
        time,
        notes: notes || '',
        bookingDate: new Date().toISOString()
    };
    
    bookings.push(booking);
    
    // Log booking to console (visible in docker logs)
    console.log(`New booking: ${name} - ${date} at ${time}`);
    
    res.json({ 
        success: true, 
        message: 'Booking confirmed!',
        bookingId: booking.id
    });
});

// Get all bookings (admin endpoint)
app.get('/api/bookings', (req, res) => {
    res.json({ success: true, bookings });
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Salon booking app running on http://localhost:${PORT}`);
    console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
