# UI Compliance Requirements

## Objective

Make compliance visible and actionable without overwhelming the trader.

The existing UI rules already emphasize visible risk, verification states, progressive storytelling, and actionable risk messages. Extend those rules.

## Required Labels

Use:
- `Verified`
- `Pending`
- `Review Required`
- `Blocked`
- `Stale`
- `Source Unavailable`

## Market Card

Every destination card should show:
- opportunity score;
- forecast;
- forecast uncertainty;
- compliance status;
- sanctions status;
- key restrictions;
- source freshness.

Do not display a country as simply "safe".

## Country Detail

Sections:

1. Commercial Forecast
2. Current Trade Facts
3. Tariff & RTA
4. Import Restrictions
5. Export Controls
6. Sanctions & Restricted Parties
7. Logistics
8. Required Documents
9. Risk
10. Sources

## Sanctions UI

Never show:
`Country X = sanctioned = illegal`.

Instead show:
- applicable regime;
- scope;
- whether the current transaction triggers it;
- source;
- status.

## Compliance Banner

Examples:

`CLEAR — Required checks passed`

`REVIEW REQUIRED — Potential restricted-party match`

`BLOCKED — Verified applicable prohibition`

`UNSUPPORTED — Current authoritative rule unavailable`

## Transaction Controls

If `BLOCKED`:
- disable Create Trade;
- disable Escrow;
- disable payment initiation.

If `REVIEW`:
- disable automated execution;
- show Review Case.

If `UNSUPPORTED`:
- disable automated execution.

Only `CLEAR` may enable the next automated compliance-dependent step.

## Evidence

Every legal/compliance statement must have a visible source reference.

## Demo/Mock Mode

Display:
`DEMO DATA — NOT LIVE COMPLIANCE`

Do not hide this in a tooltip.

## No False Claims

Never display:
- 100% compliant;
- guaranteed legal;
- risk-free;
- guaranteed buyer;
- sanctions-free;
- guaranteed profit.
