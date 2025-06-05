import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    handler: (req, res, /*next*/) => {
        res.status(429).json({
            status: 429,
            message: 'Too many login attempts from this IP, please try again after 15 minutes.'
        });
    },
});