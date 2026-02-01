const corsOptions = {
	origin: (origin, callback) => {
		const dynamicAllowedOrigins = [
			'http://localhost:3000',
			'http://localhost:3001',
			process.env.CLIENT_BASE_URL,
			process.env.HR_CLIENT_BASE_URL,
			'https://portal.talentswype.com',
			'https://employer.talentswype.com',
			'https://www.slanster.com',
			'https://slanster-dashboard.vercel.app',
			'https://slanster-admin.vercel.app',
			'https://talentswype.com',
		].filter(Boolean);

		// Trust any TalentSwype subdomain as a fail-safe
		const isTalentSwype = origin && (
			origin.endsWith('.talentswype.com') || 
			origin === 'https://talentswype.com'
		);

		if (dynamicAllowedOrigins.indexOf(origin) !== -1 || !origin || isTalentSwype) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS origin'));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200
};

export default corsOptions;
