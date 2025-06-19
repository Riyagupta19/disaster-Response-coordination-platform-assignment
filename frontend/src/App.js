import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    TextField,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Chip,
    Alert,
    Snackbar,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { io } from 'socket.io-client';
import axios from 'axios';
import ImageVerification from './components/ImageVerification';
import LocationExtraction from './components/LocationExtraction';
import EnhancedDisasterForm from './components/EnhancedDisasterForm';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    const [tab, setTab] = useState(0);
    const [disasters, setDisasters] = useState([]);
    const [resources, setResources] = useState([]);
    const [socialMedia, setSocialMedia] = useState([]);
    const [newDisaster, setNewDisaster] = useState({
        title: '',
        location_name: '',
        description: '',
        tags: ''
    });
    const [newResource, setNewResource] = useState({
        name: '',
        location_name: '',
        type: '',
        lat: '',
        lon: ''
    });
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [disasterFormMode, setDisasterFormMode] = useState('simple');

    // Connect to WebSocket
    useEffect(() => {
        const socket = io(API_URL);

        socket.on('disaster_updated', (data) => {
            fetchDisasters();
        });

        socket.on('resources_updated', (data) => {
            fetchResources();
        });

        socket.on('social_media_updated', (data) => {
            fetchSocialMedia();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchDisasters();
        fetchResources();
        fetchSocialMedia();
    }, []);

    const fetchDisasters = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/disasters`);
            setDisasters(response.data);
        } catch (error) {
            showAlert('Error fetching disasters', 'error');
        }
    };

    const fetchResources = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/resources`);
            setResources(response.data);
        } catch (error) {
            showAlert('Error fetching resources', 'error');
        }
    };

    const fetchSocialMedia = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/social-media`);
            setSocialMedia(response.data);
        } catch (error) {
            showAlert('Error fetching social media', 'error');
        }
    };

    const handleCreateDisaster = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/disasters`, {
                ...newDisaster,
                tags: newDisaster.tags.split(',').map(tag => tag.trim()),
                owner_id: 'test_user' // In a real app, this would come from authentication
            });
            setNewDisaster({ title: '', location_name: '', description: '', tags: '' });
            showAlert('Disaster created successfully', 'success');
        } catch (error) {
            showAlert('Error creating disaster', 'error');
        }
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/resources`, {
                ...newResource,
                disaster_id: disasters[0]?.id // In a real app, this would be selected by the user
            });
            setNewResource({ name: '', location_name: '', type: '', lat: '', lon: '' });
            showAlert('Resource created successfully', 'success');
        } catch (error) {
            showAlert('Error creating resource', 'error');
        }
    };

    const handleEnhancedDisasterCreated = (disaster) => {
        showAlert('Enhanced disaster report created successfully', 'success');
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Disaster Response Platform
                </Typography>

                <Paper sx={{ mb: 2 }}>
                    <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
                        <Tab label="Disasters" />
                        <Tab label="Resources" />
                        <Tab label="Social Media" />
                        <Tab label="Image Verification" />
                        <Tab label="Location Extraction" />
                    </Tabs>
                </Paper>

                {tab === 0 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Create New Disaster
                            </Typography>
                            <ToggleButtonGroup
                                value={disasterFormMode}
                                exclusive
                                onChange={(e, newMode) => newMode && setDisasterFormMode(newMode)}
                                size="small"
                            >
                                <ToggleButton value="simple">Simple Form</ToggleButton>
                                <ToggleButton value="enhanced">AI-Enhanced Form</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {disasterFormMode === 'simple' ? (
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Simple Disaster Form
                                </Typography>
                                <form onSubmit={handleCreateDisaster}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Title"
                                                value={newDisaster.title}
                                                onChange={(e) => setNewDisaster({ ...newDisaster, title: e.target.value })}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                value={newDisaster.location_name}
                                                onChange={(e) => setNewDisaster({ ...newDisaster, location_name: e.target.value })}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Description"
                                                multiline
                                                rows={4}
                                                value={newDisaster.description}
                                                onChange={(e) => setNewDisaster({ ...newDisaster, description: e.target.value })}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Tags (comma-separated)"
                                                value={newDisaster.tags}
                                                onChange={(e) => setNewDisaster({ ...newDisaster, tags: e.target.value })}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button type="submit" variant="contained" color="primary">
                                                Create Disaster
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        ) : (
                            <EnhancedDisasterForm onDisasterCreated={handleEnhancedDisasterCreated} />
                        )}

                        <Typography variant="h6" gutterBottom>
                            Active Disasters
                        </Typography>
                        <Grid container spacing={2}>
                            {disasters.map((disaster) => (
                                <Grid item xs={12} sm={6} md={4} key={disaster.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">{disaster.title}</Typography>
                                            <Typography color="textSecondary">{disaster.location_name}</Typography>
                                            <Typography variant="body2">{disaster.description}</Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {disaster.tags.map((tag) => (
                                                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Add New Resource
                            </Typography>
                            <form onSubmit={handleCreateResource}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            value={newResource.name}
                                            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Location"
                                            value={newResource.location_name}
                                            onChange={(e) => setNewResource({ ...newResource, location_name: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Type"
                                            value={newResource.type}
                                            onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Latitude"
                                            type="number"
                                            value={newResource.lat}
                                            onChange={(e) => setNewResource({ ...newResource, lat: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Longitude"
                                            type="number"
                                            value={newResource.lon}
                                            onChange={(e) => setNewResource({ ...newResource, lon: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button type="submit" variant="contained" color="primary">
                                            Add Resource
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>

                        <Typography variant="h6" gutterBottom>
                            Available Resources
                        </Typography>
                        <List>
                            {resources.map((resource) => (
                                <ListItem key={resource.id}>
                                    <ListItemText
                                        primary={resource.name}
                                        secondary={`${resource.location_name} - ${resource.type}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {tab === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Social Media Reports
                        </Typography>
                        <List>
                            {socialMedia.map((report) => (
                                <ListItem key={report.id}>
                                    <ListItemText
                                        primary={report.post}
                                        secondary={`Posted by ${report.user} at ${new Date(report.timestamp).toLocaleString()}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {tab === 3 && (
                    <ImageVerification />
                )}

                {tab === 4 && (
                    <LocationExtraction />
                )}

                <Snackbar
                    open={alert.open}
                    autoHideDuration={6000}
                    onClose={handleCloseAlert}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseAlert} severity={alert.severity}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
}

export default App; 