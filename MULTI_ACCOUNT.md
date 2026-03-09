# Multi-Account Support

## What Changed and Why

Previously, `auth.json` stored one credential per provider ID. Logging in with a second account for the same provider would silently overwrite the first. This change introduces an **alias system** that lets users store multiple credentials per provider using keys like `openai/work` alongside the default `openai`.

## How to Use

### Login with an alias

```sh
opencode auth login
# Select provider, e.g. "OpenAI"
# ◆ Account alias (optional, press enter to skip)
# > work
# Enter your API key: sk-...
```

This stores the credential under the key `openai/work` in `auth.json`.

### Login without an alias (default)

```sh
opencode auth login
# Select provider, e.g. "OpenAI"
# ◆ Account alias (optional, press enter to skip)
# > (press enter)
# Enter your API key: sk-...
```

This stores the credential under the key `openai`, as before.

### List credentials

```sh
opencode auth list
```

Output example:
```
OpenAI  (api)
OpenAI  work  (api)
Anthropic  personal  (api)
```

### Logout a specific account

```sh
opencode auth logout
# ◆ Select provider
#   OpenAI (api)
#   OpenAI / work (api)
#   Anthropic / personal (api)
```

## Backward Compatibility

Existing `auth.json` files without aliases continue to work unchanged. The key `openai` is still valid and is used as the default (no-alias) credential. No migration is required.

## File-by-File Summary

| File | Change |
|---|---|
| `packages/opencode/src/auth/index.ts` | Added `listByProvider(providerID)` — returns all credentials for a provider including aliases. Added `resolveKey(providerID, alias?)` — builds the storage key, validates alias format. |
| `packages/opencode/src/auth/index.test.ts` | New unit tests for `resolveKey` and `listByProvider` logic. |
| `packages/opencode/src/provider/provider.ts` | Updated the `hasKey` check for the `opencode` provider to use `listByProvider` so any aliased account is recognized. |
| `packages/opencode/src/provider/auth.ts` | Added optional `alias` field to `api` and `callback` functions. Storage key is now computed with `Auth.resolveKey`. |
| `packages/opencode/src/cli/cmd/auth.ts` | `auth login` prompts for an optional alias before storing credentials. `auth list` displays alias and type per entry. `auth logout` shows all credentials including aliased ones with clear labels. |
| `packages/opencode/src/server/server.ts` | Changed `PUT /auth/:providerID` and `DELETE /auth/:providerID` to wildcard routes (`/auth/*`) so aliased keys containing a slash are routed correctly. |
