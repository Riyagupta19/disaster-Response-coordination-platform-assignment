import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { LocationOn, MyLocation, Search } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LocationExtraction = () => {
    const [text, setText] = useState('');
    const [extractionResult, setExtractionResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleExtractLocation = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Please enter some text');
            return;
        }

        setLoading(true);
        setError('');
        setExtractionResult(null);

        try {
            const response = await axios.post(`${API_URL}/api/geocode`, {
                text: text.trim()
            });

            setExtractionResult(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to extract location');
        } finally {
            setLoading(false);
        }
    };

    const handleUseLocation = (locationData) => {
        // This function can be used to populate other forms or components
        console.log('Using location:', locationData);
        // You can emit an event or use a callback to pass this data to parent components
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Location Extraction & Geocoding
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Extract location names from text and convert them to coordinates using AI
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <form onSubmit={handleExtractLocation}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Text Input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="e.g., There's a flood in Manhattan, NYC near Central Park"
                                multiline
                                rows={4}
                                required
                                helperText="Enter text containing location information"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                                disabled={loading}
                                size="large"
                            >
                                {loading ? 'Extracting...' : 'Extract Location'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {extractionResult && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Extraction Results
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Extracted Location
                                    </Typography>
                                    <Chip
                                        icon={<LocationOn />}
                                        label={extractionResult.location_name}
                                        color="primary"
                                        variant="outlined"
                                        size="large"
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Coordinates
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <MyLocation />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`Latitude: ${extractionResult.coordinates.lat}`}
                                                secondary="Latitude coordinate"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <MyLocation />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`Longitude: ${extractionResult.coordinates.lng}`}
                                                secondary="Longitude coordinate"
                                            />
                                        </ListItem>
                                    </List>
                                </Box>

                                <Button
                                    variant="outlined"
                                    startIcon={<LocationOn />}
                                    onClick={() => handleUseLocation(extractionResult)}
                                    fullWidth
                                >
                                    Use This Location
                                </Button>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Google Maps Link
                                    </Typography>
                                    <Button
                                        variant="text"
                                        href={`https://www.google.com/maps?q=${extractionResult.coordinates.lat},${extractionResult.coordinates.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        startIcon={<LocationOn />}
                                        fullWidth
                                    >
                                        View on Google Maps
                                    </Button>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Copy Coordinates
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={`${extractionResult.coordinates.lat}, ${extractionResult.coordinates.lng}`}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        onClick={(e) => e.target.select()}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                            Extracted at: {new Date().toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default LocationExtraction; 