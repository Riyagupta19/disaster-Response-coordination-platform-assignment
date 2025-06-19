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
    Grid
} from '@mui/material';
import { CloudUpload, Verified, Warning } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ImageVerification = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [disasterContext, setDisasterContext] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyImage = async (e) => {
        e.preventDefault();
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }

        setLoading(true);
        setError('');
        setVerificationResult(null);

        try {
            const response = await axios.post(`${API_URL}/api/verify-image`, {
                imageUrl: imageUrl.trim(),
                disasterContext: disasterContext.trim()
            });

            setVerificationResult(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to verify image');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const getConfidenceLabel = (score) => {
        if (score >= 80) return 'High Confidence';
        if (score >= 60) return 'Medium Confidence';
        return 'Low Confidence';
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Image Verification
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Upload disaster images to verify their authenticity using AI analysis
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <form onSubmit={handleVerifyImage}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/disaster-image.jpg"
                                required
                                helperText="Enter the URL of the image you want to verify"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Disaster Context (Optional)"
                                value={disasterContext}
                                onChange={(e) => setDisasterContext(e.target.value)}
                                placeholder="e.g., Flood in Manhattan, NYC on June 15, 2024"
                                multiline
                                rows={3}
                                helperText="Provide context about the disaster to improve verification accuracy"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                                disabled={loading}
                                size="large"
                            >
                                {loading ? 'Verifying...' : 'Verify Image'}
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

            {verificationResult && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                Verification Results
                            </Typography>
                            <Chip
                                icon={verificationResult.isAuthentic ? <Verified /> : <Warning />}
                                label={verificationResult.isAuthentic ? 'Authentic' : 'Suspicious'}
                                color={verificationResult.isAuthentic ? 'success' : 'warning'}
                                variant="outlined"
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Confidence Score
                            </Typography>
                            <Chip
                                label={`${verificationResult.confidenceScore}/100 - ${getConfidenceLabel(verificationResult.confidenceScore)}`}
                                color={getConfidenceColor(verificationResult.confidenceScore)}
                                variant="filled"
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                AI Analysis
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {verificationResult.analysis}
                                </Typography>
                            </Paper>
                        </Box>

                        <Typography variant="caption" color="textSecondary">
                            Verified at: {new Date(verificationResult.timestamp).toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default ImageVerification; 