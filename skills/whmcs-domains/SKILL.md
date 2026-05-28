---
name: whmcs-domains
description: Register, search, and manage domains on WHMCS-based hosting panels (e.g. Lugo Internet extranet.lugointernet.com). Use when asked to check domain availability, register a domain, or manage DNS on a WHMCS panel. Credentials and panel URL are in memory/credentials_lugointernet.md and keychain.
---

# WHMCS Domain Manager

## Overview

Automates domain search and registration on WHMCS panels using browser automation. Lugo Internet config is in `references/lugo-internet.md`.

## Workflow

### 1. Setup

Read panel credentials:
- URL and user: `memory/credentials_lugointernet.md`
- Password: `security find-internet-password -s "lugointernet.com" -a "garciamartinezruben@hotmail.es" -w`

Check browser state and tabs before opening anything:

```json
{ "action": "tabs" }
```

Reuse the Lugo Internet tab if open (look for `extranet.lugointernet.com`). Otherwise:

```json
{ "action": "open", "url": "https://extranet.lugointernet.com/clientarea.php", "label": "lugo" }
```

### 2. Login (if not already logged in)

Snapshot and check if logged in:

```json
{ "action": "snapshot", "targetId": "lugo" }
```

If login form is visible, fill credentials:

```json
{ "action": "fill", "targetId": "lugo", "fields": { "username": "<email>", "password": "<password>" } }
```

Then submit. After submission, snapshot again to confirm login.

### 3. Search for domain availability

Navigate to domain registration page:

```json
{ "action": "navigate", "targetId": "lugo", "url": "https://extranet.lugointernet.com/cart.php?a=add&domain=register" }
```

Snapshot, find the domain search input, fill it, and submit. Check the results for availability status.

### 4. Register / add to cart

If available, click "Add to Cart" or equivalent button from the snapshot ref.
Proceed to checkout. Stop before payment and confirm with user.

## Key Rules

- Always confirm with user before completing any purchase.
- If CAPTCHA or 2FA appears, stop and ask the user to complete it manually.
- Use `snapshotFormat="aria"` for stable refs when available.
- After each navigation or form submit, snapshot again before next action.

## Resources

- Panel config and WHMCS URL patterns: `references/lugo-internet.md`
