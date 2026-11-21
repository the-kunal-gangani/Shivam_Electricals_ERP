import bcrypt from 'bcryptjs';
import { User } from '../../models/user.js';
import { RefreshToken } from '../../models/refresh-token.js';
import { writeAuditLog } from '../../middleware/audit.js';
import { env } from '../../config/env.js';
import { parseIdentifier } from '../../utils/identifier.js';
import {
  createAccessToken,
  createRefreshToken,
  hashToken
} from '../../utils/tokens.js';
import { serializeUser } from '../../utils/serializers.js';

const REFRESH_REUSE_GRACE_MS = 30 * 1000;

async function findUser(identifier) {
  const parsed = parseIdentifier(identifier);
  if (!parsed) return null;
  return User.findOne(parsed.kind === 'email' ? { email: parsed.value } : { phone: parsed.value })
    .select('+passwordHash');
}

async function persistRefreshToken(userId, token) {
  await RefreshToken.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + parseRefreshTtl(env.REFRESH_TOKEN_TTL))
  });
}

function parseRefreshTtl(value) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * units[match[2]];
}

export async function revokeAllForUser(userId) {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

export async function login({ identifier, password }) {
  const user = await findUser(identifier);
  const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.9bJ4qJ6Y6Yw7g9kP8o3dW9eB2V4M6e';
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
  if (!user || !passwordOk) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }
  if (!user.isActive) {
    const error = new Error('This account has been disabled. Please contact the owner.');
    error.statusCode = 403;
    throw error;
  }

  const accessToken = createAccessToken(user);
  const refresh = createRefreshToken(user);
  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  await persistRefreshToken(user._id, refresh.token);
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
  const now = new Date();
  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    expiresAt: { $gt: now }
  });
  if (!stored) {
    const error = new Error('Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  if (stored.revokedAt) {
    const withinGrace = now.getTime() - stored.revokedAt.getTime() <= REFRESH_REUSE_GRACE_MS;
    if (!withinGrace) {
      await revokeAllForUser(stored.userId);
      const error = new Error('Invalid refresh token.');
      error.statusCode = 401;
      throw error;
    }
  } else {
    stored.revokedAt = now;
    await stored.save();
  }

  const user = await User.findOne({ _id: stored.userId, isActive: true });
  if (!user) {
    const error = new Error('Invalid refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = createAccessToken(user);
  const replacement = createRefreshToken(user);
  await persistRefreshToken(user._id, replacement.token);
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
