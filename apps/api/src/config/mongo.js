const mongoose = require("mongoose");
const env = require("./env");

let connectionPromise = null;

function isMongoConfigured() {
  return Boolean(env.mongodbUri && !env.mongodbUri.includes("<db_password>"));
}

async function connectMongo() {
  if (!isMongoConfigured()) {
    return { configured: false, connected: false };
  }

  if (!connectionPromise) {
    mongoose.set("strictQuery", true);
    connectionPromise = mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 8000
    });
  }

  await connectionPromise;
  return {
    configured: true,
    connected: mongoose.connection.readyState === 1,
    database: mongoose.connection.name || null
  };
}

function getMongoStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  return {
    configured: isMongoConfigured(),
    state: states[mongoose.connection.readyState] || "unknown",
    database: mongoose.connection.name || null
  };
}

module.exports = {
  connectMongo,
  getMongoStatus,
  isMongoConfigured
};
