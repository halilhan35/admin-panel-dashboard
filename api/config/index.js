module.exports = {
  "PORT": process.env.PORT || "3000",

  "LOG_LEVEL": process.env.LOG_LEVEL || "debug",

  "CONNECTION_STRING": process.env.CONNECTION_STRING || "mongodb://localhost:27017/admin-panel-dashboard",
  
  "JWT_SECRET": process.env.JWT_SECRET || "123456",

  "JWT": {
    "EXPIRE_TIME": !isNaN(parseInt(process.env.JWT_EXPIRE_TIME)) 
      ? parseInt(process.env.JWT_EXPIRE_TIME) * 24 * 60 * 60 
      : 24 * 60 * 60 
  }
};