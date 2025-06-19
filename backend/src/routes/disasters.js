const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Create a new disaster
router.post('/', async (req, res) => {
    try {
        const { title, location_name, description, tags, owner_id } = req.body;

        const { data, error } = await supabase
            .from('disasters')
            .insert([
                {
                    title,
                    location_name,
                    description,
                    tags,
                    owner_id,
                    audit_trail: [{
                        action: 'create',
                        user_id: owner_id,
                        timestamp: new Date().toISOString()
                    }]
                }
            ])
            .select();

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('disaster_updated', {
            type: 'create',
            data: data[0]
        });

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all disasters with optional tag filter
router.get('/', async (req, res) => {
    try {
        const { tag } = req.query;
        let query = supabase.from('disasters').select('*');

        if (tag) {
            query = query.contains('tags', [tag]);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a disaster
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, location_name, description, tags, owner_id } = req.body;

        const { data, error } = await supabase
            .from('disasters')
            .update({
                title,
                location_name,
                description,
                tags,
                audit_trail: supabase.raw(`audit_trail || '{"action": "update", "user_id": "${owner_id}", "timestamp": "${new Date().toISOString()}"}'::jsonb`)
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('disaster_updated', {
            type: 'update',
            data: data[0]
        });

        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a disaster
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { owner_id } = req.body;

        const { error } = await supabase
            .from('disasters')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Emit socket event for real-time updates
        req.app.get('io').emit('disaster_updated', {
            type: 'delete',
            data: { id }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 