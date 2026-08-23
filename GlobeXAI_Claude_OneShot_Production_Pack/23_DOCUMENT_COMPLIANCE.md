# Document Compliance Layer

## Extraction

OCR extracts fields.

## Verification

Compare extracted values against:
- contract;
- trade intent;
- HS6;
- compliance requirements;
- shipping records.

## Important distinction

A valid SHA-256 hash proves file identity/integrity.
It does not prove:
- authenticity of the issuer;
- legality;
- correctness of the contents.

## Mismatch examples

- invoice quantity != contract quantity;
- B/L weight != invoice;
- HS6 conflict;
- origin conflict;
- party mismatch;
- expired certificate.

Material mismatch:
`REVIEW`.

Verified prohibited document/use:
`BLOCKED`.
