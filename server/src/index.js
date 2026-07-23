import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';

dotenv.config();

const port = process.env.PORT || 5000;

async function bootstrap() {
  configureCloudinary();
  await connectDatabase();

  app.listen(port, () => {
    console.log(`TalentOS AI API running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
