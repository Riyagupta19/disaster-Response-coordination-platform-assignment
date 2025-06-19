const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Get all resources
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resources near a location
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon, radius = 10000 } = req.query; // radius in meters, default 10km

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const { data, error } = await supabase
            .rpc('get_nearby_resources', {
                p_lat: parseFloat(lat),
                p_lon: parseFloat(lon),
                p_radius: parseInt(radius)
            });

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('resources_updated', {
            type: 'nearby',
            data: { lat, lon, radius, resources: data }
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new resource
router.post('/', async (req, res) => {
    try {
        const { name, location_name, type, lat, lon, disaster_id } = req.body;

        const { data, error } = await supabase
            .from('resources')
            .insert([{
                name,
                location_name,
                type,
                location: `POINT(${lon} ${lat})`,
                disaster_id
            }])
            .select();

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('resources_updated', {
            type: 'create',
            data: data[0]
        });

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get resources for a specific disaster
router.get('/disaster/:disasterId', async (req, res) => {
    try {
        const { disasterId } = req.params;

        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .eq('disaster_id', disasterId);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a resource
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location_name, type, lat, lon } = req.body;

        const { data, error } = await supabase
            .from('resources')
            .update({
                name,
                location_name,
                type,
                location: `POINT(${lon} ${lat})`
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('resources_updated', {
            type: 'update',
            data: data[0]
        });

        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 