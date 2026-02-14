const STATIC_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://portal.talentswype.com',
    'https://employer.talentswype.com',
    'https://talentswype.com',
    'https://www.talentswype.com',
    'https://slanster.com',
    'https://www.slanster.com',
    'https://slanster-dashboard.vercel.app',
    'https://slanster-admin.vercel.app',
];

const corsOptions = {
    origin: (origin, callback) => {
        const dynamicAllowedOrigins = [
            process.env.CLIENT_BASE_URL,
            process.env.HR_CLIENT_BASE_URL,
            ...STATIC_ALLOWED_ORIGINS,
        ].filter(Boolean);

        if (!origin) {
            callback(null, true);
            return;
        }

        const isExplicitlyAllowed = dynamicAllowedOrigins.includes(origin);

        let isTalentSwypeSubdomain = false;
        try {
            const { hostname } = new URL(origin);
            isTalentSwypeSubdomain = hostname.endsWith('.talentswype.com');
        } catch (_error) {
            isTalentSwypeSubdomain = false;
        }

        if (isExplicitlyAllowed || isTalentSwypeSubdomain) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS origin'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

export default corsOptions;
