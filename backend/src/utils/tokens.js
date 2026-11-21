import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function createAccessToken(user) {
  return jwt.sign(
    { role: user.role, storeIds: user.storeIds.map((store) => store.toString()) },
    env.JWT_ACCESS_SECRET,
    { subject: user._id.toString(), expiresIn: env.ACCESS_TOKEN_TTL }
  );
}

export function createRefreshToken(user) {
  return { token: crypto.randomBytes(48).toString('base64url') };
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
