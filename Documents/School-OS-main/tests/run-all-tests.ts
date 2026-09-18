import { runEncryptionTests } from './security/encryption.test';
import { runRateLimitTests } from './security/rate-limit.test';
import { runStorageValidationTests } from './security/storage-validation.test';
import { runRbacMatrixTests } from './security/rbac-matrix.test';
import { runButtonWorkflowTests } from './interaction/button-workflows.test';
import { runE2EUserFlowTests } from './interaction/e2e-user-flows.test';

async function main() {
  console.log('\n========================================');
  console.log(' SchoolOS Automated Security & QA Suite ');
  console.log('========================================\n');

  try {
    await runEncryptionTests();
    await runRateLimitTests();
    await runStorageValidationTests();
    await runRbacMatrixTests();
    await runButtonWorkflowTests();
    await runE2EUserFlowTests();

    console.log('\n========================================');
    console.log(' ✔ ALL SECURITY, RBAC, BUTTON & E2E TESTS PASSED (100%)');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n✖ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

main();

