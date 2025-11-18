import { defineConfig } from '@checkly/cli/constructs';

export default defineConfig({
  projectName: 'Project Read AI',
  logicalId: 'project-read-ai',
  repoUrl: 'https://github.com/your-username/project-read-ai',
  checks: {
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['production'],
    runtimeId: '2024.02',
    checkMatch: '**/tests/e2e/**/*.check.e2e.ts',
    browserChecks: {
      frequency: 10,
      testMatch: '**/tests/e2e/**/*.spec.ts',
    },
  },
  cli: {
    runLocation: 'us-east-1',
  },
});
