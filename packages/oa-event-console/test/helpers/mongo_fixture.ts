//
// Copyright (C) 2026, Open Answers Ltd http://www.openanswers.co.uk/
// All rights reserved.
// This file is subject to the terms and conditions defined in the Software License Agreement.
//

// Shared BSON fixture loader for the functest mongo dump.
// Used by the e2e harness (test/e2e/start-server.ts, test/e2e/global-setup.ts)
// and the integration harness (test/int/_helpers/console_app.ts).

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.resolve('test/fixture/mongo_test_data/functest');

function parseBsonFile(filePath: string): any[] {
  const buf = fs.readFileSync(filePath);
  const { deserialize } = require('bson');
  const docs: any[] = [];
  let offset = 0;
  while (offset < buf.length) {
    const size = buf.readInt32LE(offset);
    if (size <= 4 || offset + size > buf.length) break;
    docs.push(deserialize(buf.subarray(offset, offset + size)));
    offset += size;
  }
  return docs;
}

// Restore every .bson file in FIXTURE_DIR into the given db. Skips
// system.indexes.bson (mongorestore handles that separately, we can't).
// Returns a map of { collectionName: docCount } for logging.
async function restoreFixtures(db: any): Promise<Record<string, number>> {
  const inserted: Record<string, number> = {};
  for (const file of fs.readdirSync(FIXTURE_DIR)) {
    if (!file.endsWith('.bson') || file === 'system.indexes.bson') continue;
    const collName = file.replace('.bson', '');
    const docs = parseBsonFile(path.join(FIXTURE_DIR, file));
    if (docs.length > 0) {
      await db.collection(collName).insertMany(docs, { ordered: false });
      inserted[collName] = docs.length;
    }
  }
  return inserted;
}

// Reset login-throttling state on the users collection so repeated logins
// within a single test run don't hit passport-local-mongoose's account-lock
// (`TooManyAttemptsError`) or throttle (`AttemptTooSoonError`) branches:
//
//   * failure_count — the fixture sets this high enough to trip the lock
//     after a handful of attempts; reset to 0 per boot.
//   * last_login — passport rejects a second login within
//     config.login.interval of the previous one with AttemptTooSoonError,
//     responding with a 302 → /?account-locked-temporarily and NOT setting a
//     session cookie. Multiple int specs each do their own login, so the
//     throttle needs to be cleared.
async function resetUserFailureCount(db: any): Promise<void> {
  await db.collection('users').updateMany({}, { $set: { failure_count: 0, last_login: null } });
}

module.exports = {
  FIXTURE_DIR,
  parseBsonFile,
  restoreFixtures,
  resetUserFailureCount,
};
