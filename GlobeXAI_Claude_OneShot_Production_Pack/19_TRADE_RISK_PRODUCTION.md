# Trade Risk Production Layer

## Purpose

Estimate behavioural/corridor risk signals.

## Inputs

Potential signals:
- volatility;
- transaction count;
- share changes;
- trade growth;
- historical stability;
- counterparty history;
- model anomaly outputs.

Verify exact features from the existing implementation.

## Output

Keep:
- behavioural score;
- counterparty score;
- anomaly score;
- sanctions status;
- compliance status

separate.

## Prohibition

The model must not label an organization as criminal or a transaction as illegal.

It produces a risk signal requiring interpretation.
