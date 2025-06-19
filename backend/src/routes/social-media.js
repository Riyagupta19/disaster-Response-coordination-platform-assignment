const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Mock social media data for testing
const mockSocialMediaData = [
    {
        id: 1,
        post: "#floodrelief Need food and water in Lower East Side",
        user: "citizen1",
        timestamp: new Date().toISOString(),
        location: "Lower East Side, NYC"
    },
    {
        id: 2,
        post: "URGENT: Medical supplies needed at Red Cross Shelter",
        user: "reliefWorker1",
        timestamp: new Date().toISOString(),
        location: "Manhattan, NYC"
    }
];

// Get all social media reports
router.get('/', async (req, res) => {
    try {
        // For now, return mock data. In a real app, this would fetch from the reports table
        res.json(mockSocialMediaData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get social media reports for a disaster
router.get('/:disasterId', async (req, res) => {
    try {
        const { disasterId } = req.params;

        // Check cache first
        const { data: cachedData, error: cacheError } = await supabase
            .from('cache')
            .select('value')
            .eq('key', `social_media_${disasterId}`)
            .single();

        if (cachedData && !cacheError) {
            return res.json(cachedData.value);
        }

        // If no cache, fetch from social media API or use mock data
        let socialMediaData;

        if (process.env.TWITTER_API_KEY) {
            // TODO: Implement real Twitter API integration
            socialMediaData = mockSocialMediaData;
        } else {
            socialMediaData = mockSocialMediaData;
        }

        // Cache the results
        await supabase
            .from('cache')
            .insert({
                key: `social_media_${disasterId}`,
                value: socialMediaData,
                expires_at: new Date(Date.now() + 3600000) // 1 hour TTL
            });

        // Emit socket event for real-time updates
        req.app.get('io').emit('social_media_updated', {
            disasterId,
            data: socialMediaData
        });

        res.json(socialMediaData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new social media report
router.post('/:disasterId', async (req, res) => {
    try {
        const { disasterId } = req.params;
        const { post, user, location } = req.body;

        const report = {
            disaster_id: disasterId,
            post,
            user,
            location,
            timestamp: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('reports')
            .insert([report])
            .select();

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('social_media_updated', {
            disasterId,
            data: data[0]
        });

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 