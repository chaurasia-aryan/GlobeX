import { createHash } from "node:crypto";

/** SHA-256 hex digest of the exact bytes given — never an altered representation. */
export function hashInvoiceData(fileBuffer: Buffer): string {
  return createHash("sha256").update(fileBuffer).digest("hex");
}
