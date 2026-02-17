import '../configs/dotenv.js';
import express from 'express';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import appRoot from 'app-root-path';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import * as ServerStatus from '../services/serverInfo.service.js';
import currentDateTime from '../libs/current.date.time.js';

import morganLogger from '../middleware/morgan.logger.js';
import corsOptions from '../configs/cors.config.js';

import UserRoutes from '../routes/user.routes.js';
import JobsRoutes from '../routes/jobs.routes.js';
import PackageRoutes from '../routes/package.routes.js';
import UserFeedRoutes from '../routes/userFeed.routes.js';
import MentorRoutes from '../routes/mentor.routes.js';
import CoursesRoutes from '../routes/courses.routes.js';
import AssessmentRoutes from '../routes/assessment.routes.js';
import WebinarRoutes from '../routes/webinar.routes.js';
import AdminRoutes from '../routes/admin.routes.js';
import FeedbackRoutes from '../routes/feedback.routes.js';
import UploadRoutes from '../routes/upload.Routes.js';
import {
    talentswypeVideoRouter,
    talentswypeWebhookRouter,
} from '../modules/talentswypeVideo/routes/talentswypeVideo.routes.js';

const app = express();

if (process.env.APP_NODE_ENV !== 'production') {
    app.use(morganLogger());
    app.use(morgan('tiny'));
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cookieParser());

// Webhook route must read raw body for signature validation.
app.use(talentswypeWebhookRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.APP_NODE_ENV !== 'production') {
    app.use(favicon(`${appRoot}/public/favicon.ico`));
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', ServerStatus.getServerLoadInfo, (req, res) => {
    const uptime = ServerStatus.calculateUptime();
    const serverLoadInfo = req.serverLoadInfo;
    const currentOrigin = req.headers.origin || 'No Origin Provided';

    res.status(200).send({
        success: true,
        message: 'Talentswype Backend Diagnostic Active',
        origin_detected: currentOrigin,
        connectedClient: process.env.CLIENT_BASE_URL,
        systemStatus: {
            uptime: `${uptime}s`,
            cpuLoad: serverLoadInfo.cpuLoad,
            memoryUsage: serverLoadInfo.memoryUsage,
        },
    });
});

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
app.use('/api/v1', UploadRoutes);
app.use(talentswypeVideoRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        time: currentDateTime(),
        message: 'Route not found',
        error: 'Sorry! Your request url was not found.',
    });
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error('Backend Error:', err);

    const status = err.status || 500;
    return res.status(status).json({
        success: false,
        time: currentDateTime(),
        message: err.message || 'Internal Server Error',
        error: process.env.APP_NODE_ENV === 'production' ? 'Server Error' : err.message,
    });
});

export default app;
