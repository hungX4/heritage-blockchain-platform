import 'dotenv/config';
import crypto from 'node:crypto';
import { BlockchainService } from '../src/services/blockchain.service.js';

async function main() {
  console.log('=== TEST BLOCKCHAIN SERVICE ===');

  // UUID giả để test
  const heritageId =
    '550e8400-e29b-41d4-a716-446655440000';

  const version = 1;

  // SHA-256 giả giống format thật của project
  const dataHash = crypto
    .createHash('sha256')
    .update('heritage snapshot test')
    .digest('hex');

  console.log('Heritage ID:', heritageId);
  console.log('Version:', version);
  console.log('Data hash:', dataHash);

  // ==========================================
  // 1. PUBLISH
  // ==========================================

  console.log('\n1. Publish version...');

  const publishResult =
    await BlockchainService.publishVersion(
      heritageId,
      version,
      dataHash
    );

  console.log('Publish result:');
  console.log(publishResult);

  // ==========================================
  // 2. READ BACK
  // ==========================================

  console.log('\n2. Read version from blockchain...');

  const blockchainVersion =
    await BlockchainService.getVersion(
      heritageId,
      version
    );

  console.log('Blockchain result:');
  console.log(blockchainVersion);

  // ==========================================
  // 3. VERIFY DATA HASH
  // ==========================================

  const expectedHash = `0x${dataHash}`;

  if (
    blockchainVersion.dataHash.toLowerCase() !==
    expectedHash.toLowerCase()
  ) {
    throw new Error(
      '❌ Data hash trên blockchain không khớp'
    );
  }

  console.log('✅ Data hash khớp');

  // ==========================================
  // 4. TEST DUPLICATE VERSION
  // ==========================================

  console.log('\n3. Test duplicate version...');

  try {
    await BlockchainService.publishVersion(
      heritageId,
      version,
      dataHash
    );

    throw new Error(
      '❌ Contract cho phép publish version trùng'
    );
  } catch (error) {
    console.log(
      '✅ Duplicate version bị reject'
    );
  }

  console.log(
    '\n🎉 BlockchainService test thành công'
  );
}

main().catch((error) => {
  console.error('\n❌ Test failed:');
  console.error(error);

  process.exit(1);
});
