---
name: Orval index.ts duplicate export conflict
description: Orval regenerates lib/api-zod/src/index.ts on every codegen run, re-adding a ./generated/types export that conflicts with ./generated/api when both export the same schema names.
---

## The rule
After `orval` runs in the `zod` output mode with `schemas: { path: "generated/types" }`, it writes a barrel `lib/api-zod/src/index.ts` that exports both `./generated/api` (Zod schemas) and `./generated/types` (TypeScript interfaces). When any schema name appears in both, `tsc --build` fails with TS2308 "has already exported a member".

**Why:** Orval generates TypeScript type files into `generated/types/` and Zod validator files into `generated/api.ts`. Both use the same export names (e.g. `AdminLoginBody`). TS2308 fires when both are re-exported from the same barrel.

**How to apply:** The fix is two-part:
1. Remove `schemas: { path: "generated/types", type: "typescript" }` from the orval zod output config in `lib/api-spec/orval.config.ts` — this stops generating the types directory.
2. Patch the codegen script in `lib/api-spec/package.json` to overwrite `lib/api-zod/src/index.ts` after orval runs: `printf 'export * from "./generated/api";\n' > ../api-zod/src/index.ts`

The `indexFiles: false` option does NOT prevent this — orval still writes the barrel outside the generated folder.
