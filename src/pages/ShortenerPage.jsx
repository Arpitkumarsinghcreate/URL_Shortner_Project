import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Snackbar
} from '@mui/material';
import { ContentCopy, Link, CheckCircle } from '@mui/icons-material';
import shortenUrl from '../services/shortenUrl';
import logEvent from '../middleware/logger';

function ShortenerPage() {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!longUrl || !longUrl.startsWith('http')) {
      setError('Please enter a valid URL (starting with http or https)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await shortenUrl(longUrl, customCode);
      setShortUrl(result.shortUrl);
      // Make logging non-blocking
      setTimeout(() => {
        logEvent('SUCCESS', 'URL shortened successfully', result);
      }, 0);
    } catch (error) {
      console.error(error);
      setError(error.message || 'Something went wrong. Please try again.');
      // Make logging non-blocking
      setTimeout(() => {
        logEvent('ERROR', 'Failed to shorten URL', { error: error.message });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleShorten();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          borderRadius: 3
        }}
      >
        <Box textAlign="center" mb={4}>
          <Link sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            URL Shortener
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create short, memorable links for your long URLs
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Enter your long URL"
          fullWidth
          margin="normal"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="https://example.com/very-long-url"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Link />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Custom code (optional)"
          fullWidth
          margin="normal"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="my-custom-link"
          helperText="Leave empty for auto-generated code"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleShorten}
          disabled={loading || !longUrl}
          fullWidth
          size="large"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </Button>

        {shortUrl && (
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mt: 3,
              backgroundColor: 'success.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Your shortened URL:
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body1"
                sx={{
                  flex: 1,
                  wordBreak: 'break-all',
                  color: 'white'
                }}
              >
                {shortUrl}
              </Typography>
              <IconButton
                onClick={handleCopy}
                sx={{ color: 'white' }}
              >
                {copied ? <CheckCircle /> : <ContentCopy />}
              </IconButton>
            </Box>
          </Paper>
        )}

        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message="URL copied to clipboard!"
        />
      </Paper>
    </Box>
  );
}

export default ShortenerPage;
