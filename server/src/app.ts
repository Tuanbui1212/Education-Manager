// import express, { Application, Request, Response } from 'express';
// import dotenv from 'dotenv';
// import morgan from 'morgan';
// import cors from 'cors';
// import connectDB from './config/db';
// import router from './routes/index.routes';
// import http from 'http';
// import { initSocket } from './lib/socket';
// import { runSeed } from './seed/index';

// import { CronService } from './services/cron.service';

// dotenv.config();
// const app: Application = express();

// connectDB();
// runSeed();

// app.use(
//   cors({
//     origin: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//   }),
// );
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(morgan('dev'));

// router(app);

// const PORT = process.env.PORT || 5000;
// const server = http.createServer(app);

// initSocket(server);

// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   const cronService = new CronService();
//   cronService.init();
// });

import express, { Application } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';

import connectDB from './config/db';
import router from './routes/index.routes';
import { initSocket } from './lib/socket';
import { runSeed } from './seed';
import { CronService } from './services/cron.service';

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

router(app);

const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    console.log('🌱 Running seed...');
    await runSeed();
    console.log('✅ Seed completed');

    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);

      const cronService = new CronService();
      cronService.init();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
