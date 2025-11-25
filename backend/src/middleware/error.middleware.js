const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Combine validation errors into a single string
  if (err.data && Array.isArray(err.data)) {
    message = err.data.map(e => e.msg).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    details: err.data,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;