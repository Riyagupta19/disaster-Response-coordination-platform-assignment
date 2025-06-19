const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract location from text using Gemini AI
async function extractLocation(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Extract the location name from the following text. Return only the location name, nothing else: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const location = response.text().trim();

        return location;
    } catch (error) {
        console.error('Error extracting location with Gemini API:', error);

        // Fallback: Use simple regex pattern to extract common location patterns
        const locationPatterns = [
            /(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2,3})/g,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:City|Town|Village|County|State)/g
        ];

        for (const pattern of locationPatterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                // Clean up the extracted location
                let location = matches[0].replace(/(?:in|at|near|around)\s+/i, '').trim();
                if (location.endsWith(',')) {
                    location = location.slice(0, -1);
                }
                return location;
            }
        }

        // If no pattern matches, return a default location
        return "Unknown Location";
    }
}

// Convert location name to coordinates using Google Maps Geocoding API
async function geocodeLocation(locationName) {
    try {
        // Check cache first
        const { data: cachedData, error: cacheError } = await supabase
            .from('cache')
            .select('value')
            .eq('key', `geocode_${locationName}`)
            .single();

        if (cachedData && !cacheError) {
            return cachedData.value;
        }

        // If no cache, fetch from Google Maps API
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.status !== 'OK') {
            console.error(`Geocoding failed for "${locationName}": ${response.data.status}`);

            // Fallback: Return default coordinates for common locations
            const fallbackCoordinates = {
                'manhattan': { lat: 40.7589, lng: -73.9851 },
                'new york': { lat: 40.7128, lng: -74.0060 },
                'nyc': { lat: 40.7128, lng: -74.0060 },
                'los angeles': { lat: 34.0522, lng: -118.2437 },
                'chicago': { lat: 41.8781, lng: -87.6298 },
                'houston': { lat: 29.7604, lng: -95.3698 },
                'phoenix': { lat: 33.4484, lng: -112.0740 },
                'philadelphia': { lat: 39.9526, lng: -75.1652 },
                'san antonio': { lat: 29.4241, lng: -98.4936 },
                'san diego': { lat: 32.7157, lng: -117.1611 },
                'dallas': { lat: 32.7767, lng: -96.7970 },
                'san jose': { lat: 37.3382, lng: -121.8863 },
                'austin': { lat: 30.2672, lng: -97.7431 },
                'jacksonville': { lat: 30.3322, lng: -81.6557 },
                'fort worth': { lat: 32.7555, lng: -97.3308 },
                'columbus': { lat: 39.9612, lng: -82.9988 },
                'charlotte': { lat: 35.2271, lng: -80.8431 },
                'san francisco': { lat: 37.7749, lng: -122.4194 },
                'indianapolis': { lat: 39.7684, lng: -86.1581 },
                'seattle': { lat: 47.6062, lng: -122.3321 }
            };

            const locationKey = locationName.toLowerCase().replace(/[^a-z\s]/g, '').trim();

            for (const [key, coords] of Object.entries(fallbackCoordinates)) {
                if (locationKey.includes(key)) {
                    console.log(`Using fallback coordinates for "${locationName}": ${coords.lat}, ${coords.lng}`);
                    return coords;
                }
            }

            // If no fallback found, return default coordinates (New York City)
            console.log(`No fallback coordinates found for "${locationName}", using default coordinates`);
            return { lat: 40.7128, lng: -74.0060 };
        }

        const { lat, lng } = response.data.results[0].geometry.location;

        // Cache the results
        await supabase
            .from('cache')
            .insert({
                key: `geocode_${locationName}`,
                value: { lat, lng },
                expires_at: new Date(Date.now() + 3600000) // 1 hour TTL
            });

        return { lat, lng };
    } catch (error) {
        console.error('Error geocoding location:', error);

        // Return default coordinates if all else fails
        return { lat: 40.7128, lng: -74.0060 };
    }
}

// Process text to extract location and get coordinates
async function processLocation(text) {
    try {
        const locationName = await extractLocation(text);
        const coordinates = await geocodeLocation(locationName);

        return {
            location_name: locationName,
            coordinates
        };
    } catch (error) {
        console.error('Error processing location:', error);
        throw error;
    }
}

module.exports = {
    extractLocation,
    geocodeLocation,
    processLocation
}; 