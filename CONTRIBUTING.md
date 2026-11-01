# Contributing to NerdyStore

This guide covers adding a **Nexploy app** and adding a **Nexterm script or snippet**. It follows the packages already in this repository. Copy a nearby entry and keep the same files and fields.

Themes use the same catalogue build. A short note is at the end.

## Before you open a pull request

1. Fork the repository and branch from `main`.
2. Pick a real package to copy:
   - App with the usual files: [`nexploy/u/uptime-kuma/`](nexploy/u/uptime-kuma/)
   - App that also has install questions and hooks: [`nexploy/n/nexterm/`](nexploy/n/nexterm/)
   - Script in a category folder: [`nexterm/scripts/Monitoring/Check - Disk Space.sh`](nexterm/scripts/Monitoring/Check%20-%20Disk%20Space.sh)
   - Snippet: [`nexterm/snippets/System-Uptime.snippet`](nexterm/snippets/System-Uptime.snippet)
3. Leave the generated indexes alone. See [Indexes](#indexes) below.

## Add a Nexploy app

An app is one directory:

```text
nexploy/<letter>/<id>/
  manifest.yml
  docker-compose.yml
  logo.png
```

`<id>` is the folder name: lowercase letters, digits, and hyphens, matching ids such as `uptime-kuma`, `pi-hole`, and `n8n`. `<letter>` is the first character of that id, so `uptime-kuma` is `nexploy/u/uptime-kuma/`. Create the letter directory if it does not exist yet.

`scripts/build_store.js` indexes a directory only when `manifest.yml` is present.

### manifest.yml

Every manifest in the repository starts with these single-line fields. [`nexploy/u/uptime-kuma/manifest.yml`](nexploy/u/uptime-kuma/manifest.yml) is a complete example:

```yaml
type: docker
name: Uptime Kuma
version: 2.2.1
description: Uptime Kuma is an easy-to-use self-hosted monitoring tool
category: Monitoring
mainService: uptime-kuma
```

| Field | What to put |
| --- | --- |
| `type` | `docker`. Every app in this repository uses that value. |
| `name` | Name shown in the store. |
| `version` | Version shown on the card. When the Compose image is pinned, use that same tag (`2.2.1` for Uptime Kuma, `1.2.0` for Nexterm). Otherwise `latest` is the usual value, including in Compose. |
| `description` | One line. Keep quotation marks out of this line. The catalogue builder reads `key: value` and stops a value at the first `'` or `"`. |
| `category` | Store group. Reuse an existing name when it fits: Ad Blockers, Cloud, Container Management, Dashboard, Development, Home Automation, Inventory, Media, Media Servers, Monitoring, Networking, Productivity, Security, Utilities, Web Tools. A new string becomes a new category. |
| `mainService` | Primary service key inside `docker-compose.yml`. For Uptime Kuma that key is `uptime-kuma`. |

Keep each of those fields on its own line. The store index reads those lines. Nested blocks below are copied with the package for Nexploy; the index builder does not parse them.

### docker-compose.yml

A normal Compose file. The service key must be the `mainService` value. Pin the image tag to the same version you wrote in the manifest when you are not using `latest`.

Uptime Kuma again, from [`nexploy/u/uptime-kuma/docker-compose.yml`](nexploy/u/uptime-kuma/docker-compose.yml):

```yaml
services:
  uptime-kuma:
    image: louislam/uptime-kuma:2.2.1
    restart: always
    ports:
      - 3001:3001
    volumes:
      - ./data:/app/data
```

CI runs `docker compose config` on every Compose file in the pull request. The file has to be valid Compose on its own. If you reference `env_file`, that file needs to exist for the check. CI already creates an empty `.env` for `nexploy/n/nexterm`, because that Compose file lists `env_file: .env`.

### Logo

Commit a PNG in both of these places, which is what the other apps do:

- `nexploy/<letter>/<id>/logo.png`
- `gui/public/logos/<id>.png`

Cards use `gui/public/logos/<id>.png`. During the catalogue build, `scripts/fetch_logos.js` tries the [selfh.st icons](https://cdn.jsdelivr.net/gh/selfhst/icons@main/png/) CDN when that file is missing (the filename is the app id), then copies the PNG into the app directory. Two ids are fetched under a different CDN name: `hassio-supervisor` as `home-assistant`, and `filebrowser` as `file-browser`. If the CDN has no icon for your id, commit both PNGs yourself.

### Optional gallery

Some apps ship screenshots. List paths relative to the app directory, and commit the files. Uptime Kuma:

```yaml
gallery:
  - gallery/main.jpg
```

That file is `nexploy/u/uptime-kuma/gallery/main.jpg`. Nexterm uses several images under `nexploy/n/nexterm/gallery/`.

### Optional inputs and hooks

Only [`nexploy/n/nexterm/manifest.yml`](nexploy/n/nexterm/manifest.yml) uses these blocks. Add them when the app needs questions at install time, or a script after install or when the configuration changes.

```yaml
inputs:
  - id: encryption_key
    label: Encryption Key
    description: A 64-character hex string used for encrypting credentials. Leave blank to auto-generate.
    type: text
    placeholder: e.g. e0ddadbecd3f64937ce7b879cf26d66ae62fdd1b4d...
    required: false
  - id: port
    label: Web Port
    description: Port to access the Nexterm web interface.
    type: number
    default: "6989"
    required: true
hooks:
  postInstall: postInstall.js
  onConfigure: onConfigure.js
```

The input keys used there are `id`, `label`, `description`, `type` (`text` or `number`), `placeholder`, `default`, and `required`. The hook values are filenames. The files themselves sit in `hooks/` next to the manifest (`nexploy/n/nexterm/hooks/postInstall.js` and `onConfigure.js`).

Those scripts are plain JavaScript. They can call the helpers described in [`runner.d.ts`](runner.d.ts) (`context`, `env`, `fs`, `docker`, `compose`, and the others declared there). The Nexterm post-install hook reads `context.config.encryption_key` and writes an `.env` value with `env.set`.

## Add a Nexterm script

Scripts are `*.sh` files under `nexterm/scripts/`. A file in a subfolder is listed under that folder in the store. `nexterm/scripts/Monitoring/Check - Disk Space.sh` shows the subcategory `Monitoring`. Deeper paths keep the directory prefix, so `nexterm/scripts/Security/Access/Audit - Sudo Users.sh` shows `Security/Access`.

Folders already in the tree:

- `Audit`
- `Collector-Tasks`
- `Crontab`
- `Maintenance`
- `Monitoring`
- `Network`
- `Security` (and `Security/Access`, `Security/Audit`, `Security/UFW`)
- `Software-Management`

A new folder is fine. It becomes a new subcategory filter. Files placed directly in `nexterm/scripts/` have no subcategory.

### Header

Start with a shebang. `#!/usr/bin/env bash` and `#!/bin/bash` are the two forms used most often. Then the five comment lines that every script in this repository carries. From `Check - Disk Space.sh`:

```bash
#!/bin/bash

# @name:Check - Disk Space
# @description:Check available disk space
# @Category:Monitoring
# @Language:Bash
# @OS:Linux
```

`@name` and `@description` are the title and summary in the store. Write them in lowercase like that. If `@name` is missing, the store uses the filename.

`@Category`, `@Language`, and `@OS` are part of the same header (capital C, L, and O, as in the files already here). The store lists the file under Scripts, and the subcategory filter is the folder. `@Category` does not set that folder.

### Body

The rest of the file is shell. A short script can stop there, as [`nexterm/scripts/Collector-Tasks/Check - Docker Service.sh`](nexterm/scripts/Collector-Tasks/Check%20-%20Docker%20Service.sh) does.

Scripts and snippets that need prompts or a progress log use `@NEXTERM:` markers. These are the markers already present in the tree:

| Marker | Example in the repository |
| --- | --- |
| `STEP` | `@NEXTERM:STEP "Check system uptime"` |
| `INFO` | `@NEXTERM:INFO "Uptime displayed above"` |
| `SUCCESS` | `@NEXTERM:SUCCESS "Update and upgrade completed"` |
| `WARN` | `@NEXTERM:WARN "Found $RESTARTING containers restarting"` |
| `ERROR` | `@NEXTERM:ERROR "Docker is not installed"` |
| `CONFIRM` | `@NEXTERM:CONFIRM "Remove all stopped containers?"` |
| `SELECT` | `@NEXTERM:SELECT CHOICE "Select protocol" "tcp" "udp" "both"` then `PROTOCOL=$NEXTERM_CHOICE` |
| `INPUT` | `@NEXTERM:INPUT "Enter external port" "8080"` then `EXT_PORT=$NEXTERM_INPUT` |
| `SUMMARY` | `@NEXTERM:SUMMARY "Cleanup Results" "Before" "$BEFORE_SIZE" "After" "$AFTER_SIZE" "Operation" "$CHOICE"` |
| `MSGBOX` | `@NEXTERM:MSGBOX "Auth Log Tail" "$LOGTAIL"` |
| `TABLE` | Printed from [`nexterm/snippets/CPU-Top-Table.snippet`](nexterm/snippets/CPU-Top-Table.snippet): `echo '@NEXTERM:TABLE "CPU Top 5" "PID,Cmd,%CPU,%MEM"'` followed by CSV rows |

`SELECT` in the current files always uses the name `CHOICE`, and the chosen text is `$NEXTERM_CHOICE`. `INPUT` leaves the answer in `$NEXTERM_INPUT`. See [`nexterm/scripts/Quick-Port-Forward.sh`](nexterm/scripts/Quick-Port-Forward.sh) and [`nexterm/snippets/System-Uptime.snippet`](nexterm/snippets/System-Uptime.snippet).

### ShellCheck

CI runs `shellcheck --severity=error` on `*.sh` files. Check a new script the same way before you push:

```sh
shellcheck --severity=error "nexterm/scripts/Monitoring/Check - Disk Space.sh"
```

## Add a Nexterm snippet

Snippets are `*.snippet` files, all directly inside `nexterm/snippets/`. They do not use a shebang. They start with the same five `# @…` lines as scripts.

[`nexterm/snippets/System-Uptime.snippet`](nexterm/snippets/System-Uptime.snippet):

```bash
# @name:System Uptime
# @description:Check system uptime
# @Category:System
# @Language:Bash
# @OS:Linux

@NEXTERM:STEP "Check system uptime"
uptime -p
@NEXTERM:INFO "Uptime displayed above"
```

Name the file `Prefix-Rest-Of-Name.snippet`. The store uses the text before the first hyphen as the subcategory. `System-Uptime.snippet` is filed under `System`, and `Firewall-UFW-Status.snippet` under `Firewall`. Every snippet in the repository has that hyphen.

The `@NEXTERM:` markers in the script section work the same way here. Snippets are not part of the ShellCheck CI job.

## Add a Nexterm theme

Themes are optional for most contributions. To add one, create `nexterm/themes/<name>.theme.css`. The extension the catalogue looks for is `.theme.css`.

Every theme starts with these comments, then CSS variables. From [`nexterm/themes/coffee.theme.css`](nexterm/themes/coffee.theme.css):

```css
/* @name: Coffee */
/* @description: Rich espresso darks with warm cream highlights */
```

Include a `:root[data-theme="dark"]` block. The storefront preview reads `--background`, `--terminal`, `--primary`, `--text`, and `--subtext` from that block. Copy `coffee.theme.css` for the rest of the variables the current themes set, including the `oled` block.

## Indexes

You do not register a package by editing an index file.

- **Apps.** `scripts/build_store.js` finds every `nexploy/<letter>/<id>/manifest.yml` and writes a full `NPINDEX` under `nexploy/dist/`. The committed [`nexploy/NPINDEX`](nexploy/NPINDEX) only supplies the source name on its first line (`#!NPINDEX1 NerdyStore`). Leave that file as it is.
- **Scripts, snippets, and themes.** Leave [`nexterm/NTINDEX`](nexterm/NTINDEX) as it is. After your change reaches `main`, the Generate NTINDEX workflow rewrites it. Each line is the path plus an md5, grouped under `# Scripts`, `# Snippets`, and `# Themes`.
- **Storefront JSON.** `gui/public/NPINDEX`, `categories.json`, and `nexterm.json` are produced by the build. CI replaces them. A new package does not need a hand-written JSON file.

## Pull request

Describe what you added and which existing package you copied. Include the logo PNG when the app is new.

CI must pass:

- Compose: `docker compose config` for each Compose file
- ShellCheck at error severity for `*.sh`
- `node scripts/build_store.js`, then the storefront build

Merged changes on `main` are published by the GitHub Pages workflow to [store.nerdytech.dev](https://store.nerdytech.dev/).
