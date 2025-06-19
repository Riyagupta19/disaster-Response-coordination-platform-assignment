require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Import routes
const disastersRouter = require('./routes/disasters');
const socialMediaRouter = require('./routes/social-media');
const resourcesRouter = require('./routes/resources');

// Import services
const { processLocation } = require('./services/geocoding');
const { verifyImage } = require('./services/image-verification');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Make io available to routes
app.set('io', io);

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Initialize logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect routes
app.use('/api/disasters', disastersRouter);
app.use('/api/social-media', socialMediaRouter);
app.use('/api/resources', resourcesRouter);

// Geocoding route
app.post('/api/geocode', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await processLocation(text);
        res.json(result);
    } catch (error) {
        logger.error('Geocoding error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Image verification route
app.post('/api/verify-image', async (req, res) => {
    try {
        const { imageUrl, disasterContext } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const result = await verifyImage(imageUrl, disasterContext || '');
        res.json(result);
    } catch (error) {
        logger.error('Image verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
}); 