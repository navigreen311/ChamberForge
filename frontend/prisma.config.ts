// Prisma configuration. Pinned to prisma 6.12.0 by P-00: 6.19.x pulls a
// vulnerable @prisma/config -> deepmerge-ts chain (GHSA stack exhaustion).
// The datasource URL comes from DATABASE_URL in the environment, which
// dotenv/config loads here so CLI commands see the same value the app does.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Required by prisma 6.12's config API.
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
