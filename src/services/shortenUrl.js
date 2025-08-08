const shortenUrl = async (longUrl, customCode = '') => {
  console.log('Attempting to shorten URL:', { longUrl, customCode });
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('/api/shorten', {
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
