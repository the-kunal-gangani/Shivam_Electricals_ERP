import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { normalizePhone } from '../utils/identifier.js';
import { Roles } from '../common/permissions.js';
import { Store } from '../models/store.js';
import { User } from '../models/user.js';

async function run() {
  await connectDatabase();

  let store = await Store.findOne({ code: 'MAIN' });
  if (!store) {
    store = await Store.create({ name: env.SEED_STORE_NAME, code: 'MAIN' });
    console.log(`Created store "${store.name}".`);
  }

  if (await User.exists({ role: Roles.ADMIN })) {
    console.log('An admin already exists, nothing to do.');
    return;
  }

  const email = env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || undefined;
  const phone = env.SEED_ADMIN_PHONE ? normalizePhone(env.SEED_ADMIN_PHONE) : undefined;
  if (!env.SEED_ADMIN_PASSWORD || env.SEED_ADMIN_PASSWORD.length < 8) {
    throw new Error('Set SEED_ADMIN_PASSWORD (at least 8 characters) in .env.');
  }
  if (!email && !phone) {
    throw new Error('Set SEED_ADMIN_EMAIL or a valid SEED_ADMIN_PHONE in .env.');
  }

  await User.create({
    name: env.SEED_ADMIN_NAME,
    email,
    phone: phone || undefined,
    passwordHash: await bcrypt.hash(env.SEED_ADMIN_PASSWORD, env.BCRYPT_ROUNDS),
    role: Roles.ADMIN,
    permissions: [],
    storeIds: [store._id]
  });
  console.log(`Created admin ${email ?? phone}.`);
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
