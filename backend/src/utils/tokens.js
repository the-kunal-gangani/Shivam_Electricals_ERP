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
  const tokenId = crypto.randomUUID();
  const token = jwt.sign({ tokenId }, env.JWT_REFRESH_SECRET, {
    subject: user._id.toString(),
    expiresIn: env.REFRESH_TOKEN_TTL
  });
  return { token, tokenId };
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
