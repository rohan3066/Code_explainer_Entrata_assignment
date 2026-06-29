const ipRequestCounts = new Map();

// Standard simple in-memory rate limiter middleware
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins default
  const max = options.max || 100; // 100 reqs default

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!ipRequestCounts.has(ip)) {
      ipRequestCounts.set(ip, []);
    }

    const timestamps = ipRequestCounts.get(ip);
    // Filter timestamps older than the window
    const activeTimestamps = timestamps.filter(time => now - time < windowMs);
    activeTimestamps.push(now);
    ipRequestCounts.set(ip, activeTimestamps);

    if (activeTimestamps.length > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
      });
    }

    next();
  };
};

module.exports = rateLimiter;
