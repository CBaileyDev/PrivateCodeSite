import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    globals: true,
    // Deterministic secrets so signature/hash tests are reproducible. These are
    // read by lib/env.ts at import time.
    env: {
      LEMONSQUEEZY_WEBHOOK_SECRET: "test_webhook_secret",
      LICENSE_HASH_SECRET: "test_license_pepper",
    },
  },
  resolve: {
    alias: [
      // `server-only` throws outside the RSC bundler; stub it in tests.
      {
        find: "server-only",
        replacement: path.resolve(root, "test/server-only-stub.ts"),
      },
      // Mirror the tsconfig "@/*" path alias.
      { find: /^@\/(.*)$/, replacement: `${path.resolve(root, "src")}/$1` },
    ],
  },
});
