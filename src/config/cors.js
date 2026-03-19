
const getCorsOptions = () => {
  const frontendUrls = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(url => url.trim())
    : ["http://localhost:3000"];

  // Additional trusted origins 
  const trustedOrigins = [
    ...frontendUrls,
    "https://yourdomain.com",
    "https://api.yourdomain.com",
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      
      if (trustedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  };

  return corsOptions;
};

module.exports = { getCorsOptions };