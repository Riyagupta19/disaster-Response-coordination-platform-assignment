import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    const [disasters, setDisasters] = useState([]);
    const [resources, setResources] = useState([]);
    const [activeTab, setActiveTab] = useState('disasters');
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
    const [message, setMessage] = useState('');
    const [geocodeText, setGeocodeText] = useState('');
    const [geocodeResult, setGeocodeResult] = useState(null);

    // Connect to WebSocket
    useEffect(() => {
        const socket = io(API_URL);

        socket.on('disaster_updated', (data) => {
            fetchDisasters();
        });

        socket.on('resources_updated', (data) => {
            fetchResources();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchDisasters();
        fetchResources();
    }, []);

    const fetchDisasters = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/disasters`);
            setDisasters(response.data);
        } catch (error) {
            showMessage('Error fetching disasters', 'error');
        }
    };

    const fetchResources = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/resources`);
            setResources(response.data);
        } catch (error) {
            showMessage('Error fetching resources', 'error');
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
            showMessage('Disaster created successfully', 'success');
        } catch (error) {
            showMessage('Error creating disaster', 'error');
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
            showMessage('Resource created successfully', 'success');
        } catch (error) {
            showMessage('Error creating resource', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(''), 3000);
    };

    const handleGeocode = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/geocode`, { text: geocodeText });
            setGeocodeResult(response.data);
        } catch (error) {
            showMessage('Error geocoding location', 'error');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Disaster Response Platform</h1>
            </header>

            <nav className="nav-tabs">
                <button
                    className={activeTab === 'disasters' ? 'active' : ''}
                    onClick={() => setActiveTab('disasters')}
                >
                    Disasters
                </button>
                <button
                    className={activeTab === 'resources' ? 'active' : ''}
                    onClick={() => setActiveTab('resources')}
                >
                    Resources
                </button>
            </nav>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <main className="main-content">
                {activeTab === 'disasters' && (
                    <div className="tab-content">
                        <div className="form-section">
                            <h2>Create New Disaster</h2>
                            <form onSubmit={handleCreateDisaster} className="form">
                                <div className="form-group">
                                    <label>Title:</label>
                                    <input
                                        type="text"
                                        value={newDisaster.title}
                                        onChange={(e) => setNewDisaster({ ...newDisaster, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location:</label>
                                    <input
                                        type="text"
                                        value={newDisaster.location_name}
                                        onChange={(e) => setNewDisaster({ ...newDisaster, location_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea
                                        value={newDisaster.description}
                                        onChange={(e) => setNewDisaster({ ...newDisaster, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tags (comma-separated):</label>
                                    <input
                                        type="text"
                                        value={newDisaster.tags}
                                        onChange={(e) => setNewDisaster({ ...newDisaster, tags: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Create Disaster
                                </button>
                            </form>
                        </div>

                        <div className="list-section">
                            <h2>Active Disasters</h2>
                            <div className="disasters-grid">
                                {disasters.map((disaster) => (
                                    <div key={disaster.id} className="disaster-card">
                                        <h3>{disaster.title}</h3>
                                        <p className="location">{disaster.location_name}</p>
                                        <p className="description">{disaster.description}</p>
                                        <div className="tags">
                                            {disaster.tags && disaster.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="tab-content">
                        <div className="form-section">
                            <h2>Add New Resource</h2>
                            <form onSubmit={handleCreateResource} className="form">
                                <div className="form-group">
                                    <label>Name:</label>
                                    <input
                                        type="text"
                                        value={newResource.name}
                                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location:</label>
                                    <input
                                        type="text"
                                        value={newResource.location_name}
                                        onChange={(e) => setNewResource({ ...newResource, location_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type:</label>
                                    <input
                                        type="text"
                                        value={newResource.type}
                                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Latitude:</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={newResource.lat}
                                            onChange={(e) => setNewResource({ ...newResource, lat: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Longitude:</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={newResource.lon}
                                            onChange={(e) => setNewResource({ ...newResource, lon: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Add Resource
                                </button>
                            </form>
                        </div>

                        <div className="list-section">
                            <h2>Available Resources</h2>
                            <div className="resources-list">
                                {resources.map((resource) => (
                                    <div key={resource.id} className="resource-item">
                                        <h3>{resource.name}</h3>
                                        <p className="location">{resource.location_name}</p>
                                        <p className="type">Type: {resource.type}</p>
                                        <p className="coordinates">
                                            Coordinates: {resource.lat}, {resource.lon}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className="form-section">
                    <h2>Geocode</h2>
                    <form onSubmit={handleGeocode} className="form">
                        <div className="form-group">
                            <label>Location:</label>
                            <input
                                type="text"
                                value={geocodeText}
                                onChange={(e) => setGeocodeText(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Geocode
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default App; 