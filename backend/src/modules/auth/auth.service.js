import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user.js';
import { RefreshToken } from '../../models/refresh-token.js';
import { writeAuditLog } from '../../middleware/audit.js';
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken
} from '../../utils/tokens.js';
import { serializeUser } from '../../utils/serializers.js';

async function findUser(identifier) {
  const normalized = identifier.trim().toLowerCase();
  return User.findOne({
    isActive: true,
    $or: [{ email: normalized }, { phone: identifier.trim() }]
  }).select('+passwordHash');
}

async function persistRefreshToken(userId, token, tokenId) {
  const payload = jwt.decode(token);
  await RefreshToken.create({
    tokenId,
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(payload.exp * 1000)
  });
}

export async function login({ identifier, password }) {
  const user = await findUser(identifier);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = createAccessToken(user);
  const refresh = createRefreshToken(user);
  await persistRefreshToken(user._id, refresh.token, refresh.tokenId);
  await writeAuditLog({
    actorId: user._id,
    action: 'login',
    entity: 'user',
    entityId: user._id.toString()
  });

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken: refresh.token
  };
}

export async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error('Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const stored = await RefreshToken.findOne({
    tokenId: payload.tokenId,
    tokenHash: hashToken(refreshToken),
    revokedAt: null
  });
  if (!stored) {
    const error = new Error('Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findOne({ _id: payload.sub, isActive: true });
  if (!user) {
    const error = new Error('Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  stored.revokedAt = new Date();
  await stored.save();
  const accessToken = createAccessToken(user);
  const replacement = createRefreshToken(user);
  await persistRefreshToken(user._id, replacement.token, replacement.tokenId);
  await writeAuditLog({
    actorId: user._id,
    action: 'refresh_token_rotated',
    entity: 'user',
    entityId: user._id.toString()
  });

  return { accessToken, refreshToken: replacement.token };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
