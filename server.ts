import express from 'express';
import cors from 'cors';
import { createRequestHandler } from '@remix-run/express';
import * as build from '@remix-run/dev/server-build';

const app = express();

// Configure CORS
const corsOptions = {
    origin: ['https://schedule.devintripp.com', 'https://peakgrowthdigital.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

// ... rest of your server setup

app.all(
    '*',
    createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
    })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});