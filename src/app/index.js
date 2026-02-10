import '../configs/dotenv.js';
import express from 'express';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import appRoot from 'app-root-path';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';

// Import application middleware 
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
import AdminRoutes from '../routes/admin.routes.js'
import FeedbackRoutes from '../routes/feedback.routes.js'

// Initialize express app
const app = express();

// HTTP request logger middleware
if (process.env.APP_NODE_ENV !== 'production') {
    app.use(morganLogger());
    app.use(morgan('tiny'));
}

// 🚀 ROBUST CORS HANDLER WITH DIAGNOSTICS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isTalentSwype = origin && (
        origin.includes('talentswype.com') || 
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
    );

    if (isTalentSwype) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache for 24h
    }

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        if (isTalentSwype) {
            return res.status(200).end();
        }
        // Even if not trusted, we must return a clean response for preflight to see the failure
        return res.status(204).end();
    }
    
    // Log for debugging (Only for TalentSwype domains to avoid noise)
    if (isTalentSwype) {
        console.log(`[CORS DEBUG] ${req.method} from ${origin} - Allowed: ${isTalentSwype}`);
    }
    
    next();
});

// Secure HTTP headers setting middleware
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

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
    const currentOrigin = req.headers.origin || "No Origin Provided";
    
    res.status(200).send({
        success: true,
        message: "Talentswype Backend Diagnostic Active",
        origin_detected: currentOrigin,
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
app.use('/api/v1', AdminRoutes);
app.use('/api/v1', FeedbackRoutes);

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
    // Ensure CORS headers are present even in error responses
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);

    if (res.headersSent) {
        return next(err);
    }
    
    console.error("❌ Backend Error:", err);
    
    const status = err.status || 500;
    return res.status(status).json({
        success: false,
        time: currentDateTime(),
        message: err.message || "Internal Server Error",
        error: process.env.APP_NODE_ENV === 'production' ? "Server Error" : err.message
    });
});

export default app;
