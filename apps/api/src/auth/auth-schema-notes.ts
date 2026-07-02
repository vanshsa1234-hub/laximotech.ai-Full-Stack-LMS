// ── schema.prisma patch ──────────────────────────────────────
// The VerificationToken model needs a compound unique on identifier only
// for the forgot-password upsert to work. This comment documents the
// required change — already in the main schema.prisma:
//
// model VerificationToken {
//   identifier String
//   token      String   @unique
//   expires    DateTime
//   @@unique([identifier, token])   ← this is Auth.js requirement
//   @@map("verification_tokens")
// }
//
// The prisma.verificationToken.upsert uses { where: { identifier: email } }
// which requires a unique index on identifier alone.
// Add this to schema.prisma if not present:
//
// @@unique([identifier])   ← add this line

// This file is informational. The actual schema is in prisma/schema.prisma.
// Run: npm run db:push  to apply any schema changes.

export {};
