const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Download image from URL and convert to base64
async function getImageBase64(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        return Buffer.from(response.data).toString('base64');
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}

// Verify image authenticity using Gemini AI
async function verifyImage(imageUrl, disasterContext) {
    try {
        // Check cache first
        const { data: cachedData, error: cacheError } = await supabase
            .from('cache')
            .select('value')
            .eq('key', `verify_${imageUrl}`)
            .single();

        if (cachedData && !cacheError) {
            return cachedData.value;
        }

        // Get image as base64
        const imageBase64 = await getImageBase64(imageUrl);

        // Initialize Gemini Pro Vision model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create prompt for image verification
        const prompt = `Analyze this image in the context of a disaster response situation. 
    Please verify:
    1. If the image appears to be authentic and not manipulated
    2. If the image matches the described disaster context: ${disasterContext}
    3. If there are any signs of image manipulation or inconsistencies
    4. The overall credibility of the image for disaster response purposes
    
    Provide a detailed analysis and a confidence score (0-100) for the image's authenticity.`;

        // Generate content with image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            }
        ]);

        const response = await result.response;
        const analysis = response.text();

        // Parse the response to extract confidence score
        const confidenceMatch = analysis.match(/confidence score:?\s*(\d+)/i);
        const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

        const verificationResult = {
            analysis,
            confidenceScore,
            isAuthentic: confidenceScore >= 70,
            timestamp: new Date().toISOString()
        };

        // Cache the results
        await supabase
            .from('cache')
            .insert({
                key: `verify_${imageUrl}`,
                value: verificationResult,
                expires_at: new Date(Date.now() + 3600000) // 1 hour TTL
            });

        return verificationResult;
    } catch (error) {
        console.error('Error verifying image with Gemini API:', error);

        // Fallback: Return a basic verification result
        const fallbackResult = {
            analysis: "Image verification service is currently unavailable. Please verify the image manually.",
            confidenceScore: 50,
            isAuthentic: false,
            timestamp: new Date().toISOString(),
            fallback: true
        };

        return fallbackResult;
    }
}

module.exports = {
    verifyImage
}; 