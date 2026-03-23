const getCorsOptions = () => {
  // For development - allow all origins
  if (process.env.NODE_ENV === "development") {
    return {
      origin: "*", // Allow all origins in development
      credentials: false,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 200,
    };
  }

  // For production - strict CORS
  const trustedOrigins = [
    "https://apiv1.tech",
  ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (!origin || trustedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  };
};

module.exports = { getCorsOptions };