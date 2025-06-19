require('dotenv').config();
const axios = require('axios');
const { processLocation } = require('./src/services/geocoding');
const { verifyImage } = require('./src/services/image-verification');

async function testAPIs() {
    console.log('🧪 Testing Disaster Response Platform APIs...\n');

    // Test 1: Environment Variables
    console.log('1. Checking Environment Variables...');
    const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'GEMINI_API_KEY',
        'GOOGLE_MAPS_API_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
        console.log('Please check your .env file and the SETUP_GUIDE.md');
        return;
    } else {
        console.log('✅ All required environment variables are set');
    }

    // Test 2: Supabase Connection
    console.log('\n2. Testing Supabase Connection...');
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase.from('disasters').select('count').limit(1);

        if (error) {
            console.log(`❌ Supabase connection failed: ${error.message}`);
        } else {
            console.log('✅ Supabase connection successful');
        }
    } catch (error) {
        console.log(`❌ Supabase connection failed: ${error.message}`);
    }

    // Test 3: Location Extraction
    console.log('\n3. Testing Location Extraction...');
    try {
        const testText = "There is a flood in Manhattan, NYC near Central Park";
        const result = await processLocation(testText);

        console.log(`✅ Location extracted: ${result.location_name}`);
        console.log(`✅ Coordinates: ${result.coordinates.lat}, ${result.coordinates.lng}`);
    } catch (error) {
        console.log(`❌ Location extraction failed: ${error.message}`);
    }

    // Test 4: Image Verification (with a test image)
    console.log('\n4. Testing Image Verification...');
    try {
        // Using a sample image URL (you can replace with a real disaster image)
        const testImageUrl = "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400";
        const testContext = "Flood in Manhattan, NYC";

        const result = await verifyImage(testImageUrl, testContext);

        console.log(`✅ Image verification completed`);
        console.log(`✅ Authentic: ${result.isAuthentic}`);
        console.log(`✅ Confidence Score: ${result.confidenceScore}/100`);

        if (result.fallback) {
            console.log('⚠️  Using fallback verification (API may be unavailable)');
        }
    } catch (error) {
        console.log(`❌ Image verification failed: ${error.message}`);
    }

    // Test 5: Google Maps API
    console.log('\n5. Testing Google Maps API...');
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=Manhattan,NYC&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.status === 'OK') {
            console.log('✅ Google Maps API is working');
        } else {
            console.log(`⚠️  Google Maps API returned: ${response.data.status}`);
            console.log('This is normal if using fallback coordinates');
        }
    } catch (error) {
        console.log(`❌ Google Maps API test failed: ${error.message}`);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: cd frontend && npm start');
    console.log('3. Open http://localhost:3000 in your browser');
}

// Run the tests
testAPIs().catch(console.error); 