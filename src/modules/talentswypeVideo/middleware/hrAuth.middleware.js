import jwt from 'jsonwebtoken';

export function hrAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing Bearer token' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.HR_JWT_SECRET);
    if (!decoded || decoded.role !== 'HR') {
      return res.status(403).json({ success: false, message: 'HR role required' });
    }

    req.hrUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
