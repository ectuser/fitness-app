import fs from 'node:fs';
import path from 'node:path';

import { expect, test as base } from '@playwright/test';
import coverage from 'istanbul-lib-coverage';

type CoverageMapData = Record<string, unknown>;
const { createCoverageMap } = coverage;

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export const test = base.extend({
  context: async ({ context }, runContext, testInfo) => {
    await runContext(context);

    if (process.env.E2E_COVERAGE !== 'true') {
      return;
    }

    const coverageMap = createCoverageMap({});

    for (const page of context.pages()) {
      try {
        const pageCoverage = await page.evaluate(() => {
          const globalValue = globalThis as { __coverage__?: CoverageMapData };
          return globalValue.__coverage__;
        });

        if (pageCoverage) {
          coverageMap.merge(pageCoverage);
        }
      } catch {
        // Ignore pages where evaluation fails (e.g. cross-origin, closed pages).
      }
    }

    if (coverageMap.files().length === 0) {
      return;
    }

    fs.mkdirSync('.nyc_output', { recursive: true });
    const fileName = `${sanitizeSegment(testInfo.title)}-${process.pid}-${Date.now()}.json`;
    const targetPath = path.join('.nyc_output', fileName);

    fs.writeFileSync(targetPath, JSON.stringify(coverageMap.toJSON()));
  },
});

export { expect };
