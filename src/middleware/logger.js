const logEvent = (type, message, data = {}) => {
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, message, data }),
  }).catch(error => {
    console.error('Failed to log event:', error);
  });
};

export default logEvent;
