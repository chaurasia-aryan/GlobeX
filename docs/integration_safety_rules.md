# GlobeXAI Integration Safety Rules

## Absolute

1. Never delete existing project files.
2. Never use destructive Git reset/clean/restore operations.
3. Never overwrite the original n8n JSON.
4. Never overwrite an existing model artifact without backup.
5. Never expose credentials.
6. Never fabricate successful API responses.
7. Never create duplicate services without first searching for an existing implementation.
8. Never create duplicate database entities when an existing canonical entity represents the same business object.
9. Never retrain a working model merely because a training script is convenient.
10. Never change frontend fields unless integration actually requires it.

## Model Safety

Before retraining:
- inspect artifact;
- inspect metadata;
- inspect preprocessing;
- inspect feature list;
- test loading;
- compare with inference code.

## Database Safety

Before migration:
- inspect existing migrations;
- inspect current schema;
- compare ER diagram;
- identify existing equivalent table;
- document why a new table is necessary.

## n8n Safety

Before changing workflow:
- preserve original;
- validate JSON;
- validate node connections;
- validate expressions;
- validate SQL;
- validate endpoint contracts.

## Frontend Safety

Do not replace the existing UI wholesale.

Change only:
- API contracts;
- required fields;
- result sections;
- error/loading states;
- broken integration points.

## External Dependencies

If credentials/API access are unavailable:
- implement configuration;
- document the dependency;
- test everything else;
- report it as unavailable.

Do not fake the result.
