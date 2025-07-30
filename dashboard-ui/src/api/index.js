// /dashboard-ui/api/index.js
import serverless from 'serverless-http';
import app from './app.js';

// Export for Vercel
export default serverless(app);
