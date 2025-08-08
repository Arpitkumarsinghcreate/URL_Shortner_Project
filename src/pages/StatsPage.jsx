import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { ContentCopy, Visibility, Link } from '@mui/icons-material';

function StatsPage() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          maxWidth: 1200, 
          width: '100%',
          margin: '0 auto',
          borderRadius: 3
        }}
      >
        <Box textAlign="center" mb={4}>
          <Link sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            URL Statistics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your shortened URLs and their performance
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {urls.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No URLs have been shortened yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by creating your first shortened URL!
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Short Code</strong></TableCell>
                  <TableCell><strong>Original URL</strong></TableCell>
                  <TableCell><strong>Clicks</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url.id} hover>
                    <TableCell>
                      <Chip 
                        label={url.short_code} 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 300, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {url.long_url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Visibility fontSize="small" />
                        <Typography variant="body2">
                          {url.clicks}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(url.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleCopy(`${window.location.origin}/${url.short_code}`)}
                        size="small"
                      >
                        <ContentCopy />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default StatsPage;
