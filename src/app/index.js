import express from 'express';
import favicon from 'serve-favicon';
import crossOrigin from 'cors';
import cookieParser from 'cookie-parser';
import appRoot from 'app-root-path';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Import application middleware 
import corsOptions from '../configs/cors.config.js';
import * as ServerStatus from '../services/serverInfo.service.js'
import currentDateTime from '../libs/current.date.time.js';

// Import Logger
import morganLogger from '../middleware/morgan.logger.js';

// Routes
import UserRoutes from '../routes/user.routes.js'
import JobsRoutes from '../routes/jobs.routes.js'
import PackageRoutes from '../routes/package.routes.js'
import UserFeedRoutes from '../routes/userFeed.routes.js'
import MentorRoutes from '../routes/mentor.routes.js'
import CoursesRoutes from '../routes/courses.routes.js'
import AssessmentRoutes from '../routes/assessment.routes.js'
import WebinarRoutes from '../routes/webinar.routes.js'

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// HTTP request logger middleware
if (process.env.APP_NODE_ENV !== 'production') {
    app.use(morganLogger());
    app.use(morgan('tiny'));
}

// Secure HTTP headers setting middleware
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Allow cross-origin resource sharing
app.use(crossOrigin(corsOptions));

// Parse cookies from requests
app.use(cookieParser());

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set favicon in API routes
if (process.env.APP_NODE_ENV !== 'production') {
    app.use(favicon(`${appRoot}/public/favicon.ico`));
}

// Set static folder
app.use(express.static('public'));

// Parse requests of content-type ~ application/json
app.use(express.json());

// Parse requests of content-type ~ application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Response default (welcome) route
app.get("/", ServerStatus.getServerLoadInfo, (req, res) => {
    const uptime = ServerStatus.calculateUptime();
    const serverLoadInfo = req.serverLoadInfo;
    res.status(200).send({
        success: true,
        message: "Slanster Backend!",
        dateTime: new Date().toLocaleString(),
        connectedClient: process.env.CLIENT_BASE_URL,
        systemStatus: {
            uptime: `${uptime}s`,
            cpuLoad: serverLoadInfo.cpuLoad,
            memoryUsage: serverLoadInfo.memoryUsage,
        },
    });
});

// Set application API routes
app.use('/api/v1', UserRoutes);
app.use('/api/v1', JobsRoutes);
app.use('/api/v1', UserFeedRoutes);
app.use('/api/v1', PackageRoutes);
app.use('/api/v1', MentorRoutes);
app.use('/api/v1', CoursesRoutes);
app.use('/api/v1', AssessmentRoutes);
app.use('/api/v1', WebinarRoutes);

// 404 ~ not found error handler
app.use((req, res, _next) => {
    res.status(404).json({
        success: false,
        time: currentDateTime(),
        message: "Route not found",
        error: "Sorry! Your request url was not found."
    });
});


// 500 ~ internal server error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next('Something went wrong. App server error.');
    }
    if (err.message) {
        console.log(err);
        return res.status(500).json({
            success: false,
            time: currentDateTime(),
            message: "Internal Server Error",
            error: err.message,
        });
    } else {
        return res.status(500).json({
            success: false,
            time: currentDateTime(),
            message: "Internal Server Error",
            error: "Something went wrong. App server error."
        });
    }
});

export default app;