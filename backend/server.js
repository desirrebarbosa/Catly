require('dotenv').config();

const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// start server
const startServer = async () => {
  // connect to database
  await connectDatabase();
  
  // start listening
  app.listen(PORT, () => {
    console.log(`Catly API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Auth routes: http://localhost:${PORT}/api/auth`);
  });
};

startServer().catch(console.error);