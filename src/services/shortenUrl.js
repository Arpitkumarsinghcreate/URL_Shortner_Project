const shortenUrl = async (longUrl, customCode = '') => {
  console.log('Attempting to shorten URL:', { longUrl, customCode });
  
  try {
    // Check if we're in production (GitHub Pages) and backend is not available
    if (import.meta.env.PROD) {
      // For demo purposes, create a simple short URL using the current domain
      const shortCode = customCode || Math.random().toString(36).substring(2, 10);
      const shortUrl = `${window.location.origin}/${shortCode}`;
      
      // Store in localStorage for demo purposes
      const urls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
      urls.push({
        shortCode,
        longUrl,
        shortUrl,
        createdAt: new Date().toISOString(),
        clicks: 0
      });
      localStorage.setItem('shortenedUrls', JSON.stringify(urls));
      
      return { shortUrl, shortCode, longUrl };
    }
    
    // Use deployed backend URL or fallback to localhost for development
    const baseUrl = import.meta.env.PROD 
      ? 'https://your-backend-url.vercel.app' // Replace with your actual deployed backend URL
      : 'http://localhost:3001';
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl, customCode }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.error || 'Failed to shorten URL');
    }
    
    const result = await response.json();
    console.log('Shorten result:', result);
    return result;
  } catch (error) {
    console.error('Error in shortenUrl service:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

export default shortenUrl;
