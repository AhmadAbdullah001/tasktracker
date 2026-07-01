const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const memoryStore = new Map();
let redisClient = null;
let redisReady = false;

const connectRedis = async () => {
  if (redisClient) return redisClient;

  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err.message);
  });

  try {
    await redisClient.connect();
    redisReady = true;
    console.log('Redis client connected successfully');
  } catch (err) {
    redisReady = false;
    console.warn('Redis unavailable, using in-memory OTP fallback:', err.message);
  }

  return redisClient;
};

connectRedis();

const getOtp = async (key) => {
  if (redisReady && redisClient) {
    return redisClient.get(key);
  }
  return memoryStore.get(key) || null;
};

const setOtp = async (key, ttlSeconds, value) => {
  const stringValue = String(value);

  if (redisReady && redisClient) {
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
    return;
  }

  memoryStore.set(key, stringValue);
  if (ttlSeconds) {
    setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
  }
};

const deleteOtp = async (key) => {
  if (redisReady && redisClient) {
    await redisClient.del(key);
    return;
  }
  memoryStore.delete(key);
};

module.exports = {
  get: getOtp,
  setEx: setOtp,
  del: deleteOtp,
};