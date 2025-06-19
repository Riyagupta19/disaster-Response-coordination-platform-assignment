import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    Chip,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import { LocationOn, CloudUpload, Add } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EnhancedDisasterForm = ({ onDisasterCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: ''
    });
    const [locationData, setLocationData] = useState({
        location_name: '',
        lat: '',
        lon: ''
    });
    const [imageUrl, setImageUrl] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLocationExtraction = async () => {
        if (!formData.description.trim()) {
            setError('Please enter a description first to extract location');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/geocode`, {
                text: formData.description
            });

            setLocationData({
                location_name: response.data.location_name,
                lat: response.data.coordinates.lat,
                lon: response.data.coordinates.lng
            });
        } catch (error) {
            setError('Failed to extract location from description');
        } finally {
            setLoading(false);
        }
    };

    const handleImageVerification = async () => {
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/verify-image`, {
                imageUrl: imageUrl.trim(),
                disasterContext: formData.description
            });

            setVerificationResult(response.data);
        } catch (error) {
            setError('Failed to verify image');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!locationData.location_name) {
            setError('Please extract location from description or enter location manually');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const disasterData = {
                ...formData,
                location_name: locationData.location_name,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                owner_id: 'test_user',
                image_url: imageUrl || null,
                verification_status: verificationResult ? (verificationResult.isAuthentic ? 'verified' : 'suspicious') : 'pending'
            };

            const response = await axios.post(`${API_URL}/api/disasters`, disasterData);

            // Reset form
            setFormData({ title: '', description: '', tags: '' });
            setLocationData({ location_name: '', lat: '', lon: '' });
            setImageUrl('');
            setVerificationResult(null);

            if (onDisasterCreated) {
                onDisasterCreated(response.data);
            }
        } catch (error) {
            setError('Failed to create disaster');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Create Enhanced Disaster Report
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Use AI-powered features to automatically extract location and verify images
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Basic Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Disaster Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Tags (comma-separated)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="flood, emergency, evacuation"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={4}
                            required
                            placeholder="Describe the disaster situation in detail..."
                        />
                    </Grid>

                    {/* Location Extraction */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>
                            Location Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Location Name"
                            value={locationData.location_name}
                            onChange={(e) => setLocationData({ ...locationData, location_name: e.target.value })}
                            required
                            placeholder="Location will be extracted from description"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LocationOn />}
                            onClick={handleLocationExtraction}
                            disabled={loading || !formData.description.trim()}
                            sx={{ height: '56px' }}
                        >
                            Extract Location
                        </Button>
                    </Grid>

                    {locationData.lat && locationData.lon && (
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent sx={{ py: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn color="primary" />
                                        <Typography variant="body2">
                                            Coordinates: {locationData.lat}, {locationData.lon}
                                        </Typography>
                                        <Button
                                            size="small"
                                            href={`https://www.google.com/maps?q=${locationData.lat},${locationData.lon}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Map
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Image Verification */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>
                            Image Verification (Optional)
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/disaster-image.jpg"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            onClick={handleImageVerification}
                            disabled={loading || !imageUrl.trim()}
                            sx={{ height: '56px' }}
                        >
                            Verify Image
                        </Button>
                    </Grid>

                    {verificationResult && (
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="subtitle2">Verification Result:</Typography>
                                        <Chip
                                            label={verificationResult.isAuthentic ? 'Authentic' : 'Suspicious'}
                                            color={verificationResult.isAuthentic ? 'success' : 'warning'}
                                            size="small"
                                        />
                                        <Chip
                                            label={`${verificationResult.confidenceScore}/100`}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        {verificationResult.analysis.substring(0, 200)}...
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                            disabled={loading}
                            size="large"
                            fullWidth
                        >
                            {loading ? 'Creating...' : 'Create Disaster Report'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Paper>
    );
};

export default EnhancedDisasterForm; 