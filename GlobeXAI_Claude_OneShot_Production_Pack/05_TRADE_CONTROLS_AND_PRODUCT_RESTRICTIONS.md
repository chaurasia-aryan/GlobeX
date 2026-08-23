# Trade Controls and Product Restrictions

## Objective

Determine whether the product and transaction require:
- no authorization;
- a license/permit;
- special documentation;
- a designated trading channel;
- human review;
- or blocking.

## India Export Controls

Use current DGFT ITC(HS), Foreign Trade Policy, notifications and SCOMET.

DGFT materials distinguish Free, Restricted, Prohibited and State Trading Enterprise categories and note that "Free" does not remove other legal conditions. citeturn0search33

SCOMET must be screened for controlled dual-use/strategic items.

Existing GlobeXAI RAG collection instructions already require the current consolidated SCOMET list and material current amendments. Preserve that pipeline.

## India Import Controls

Screen:
- ITC(HS) import policy;
- prohibited goods;
- restricted goods;
- STE requirements;
- licensing;
- product-specific NOCs;
- customs restrictions.

DGFT policy documentation states that specific goods can be subject to restrictions, NOCs or product-specific compliance under other statutes. citeturn1search36

## Destination Import Controls

For each destination, retrieve current official:
- import prohibition;
- import restriction;
- import licensing;
- quotas;
- SPS;
- TBT;
- labeling;
- product registration;
- inspection;
- certification;
- customs requirements.

Use UNCTAD TRAINS for NTM context, but use destination-country official rules for final legal determination.

## Export Controls Beyond India

If transaction has a jurisdictional nexus to another export-control regime, screen applicable rules.

For US/EAR nexus, consider:
- scope of EAR;
- ECCN/CCL;
- EAR99;
- country controls;
- end-use controls;
- end-user controls;
- reexport/transfer controls.

BIS explicitly requires consideration of destination, end-user and end-use and includes embargo and denied-party prohibitions. citeturn1search6

## End-Use / End-User

Ask/derive:
- ultimate destination;
- ultimate end user;
- intended end use;
- intermediary;
- reexport intent where relevant.

If prohibited/controlled:
- `BLOCKED` or `REVIEW` depending on the legal rule.

## Product-Control Sources

Where applicable support:
- SCOMET;
- dual-use controls;
- weapons/arms;
- chemicals;
- biological materials;
- nuclear-related items;
- military goods;
- wildlife/CITES;
- narcotics/psychotropics;
- controlled agricultural/plant/animal products;
- food safety;
- pharmaceuticals/medical products;
- waste/environmental controls;
- counterfeit/IP restrictions;
- hazardous materials.

Do not invent a restriction because a category sounds sensitive.

## Required Rule Record

```json
{
  "hs6": "...",
  "control_type": "...",
  "jurisdiction": "...",
  "destination": "...",
  "condition": "...",
  "license_required": true,
  "prohibited": false,
  "source": "...",
  "effective_from": "...",
  "effective_to": "...",
  "status": "VERIFIED"
}
```

## Gate

Unknown classification or unresolved product-control applicability:
`REVIEW`.

Explicit prohibition:
`BLOCKED`.
