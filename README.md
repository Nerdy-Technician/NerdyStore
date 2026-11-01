![NerdyStore Logo](/Icons/Logo.png)

[![Latest GitHub tag](https://img.shields.io/github/v/tag/Nerdy-Technician/NerdyStore?label=latest%20tag&sort=semver)](https://github.com/Nerdy-Technician/NerdyStore/tags)
[![Latest release](https://img.shields.io/github/v/release/Nerdy-Technician/NerdyStore?label=release&sort=semver)](https://github.com/Nerdy-Technician/NerdyStore/releases)
[![Last commit](https://img.shields.io/github/last-commit/Nerdy-Technician/NerdyStore)](https://github.com/Nerdy-Technician/NerdyStore/commits/main)
[![Stars](https://img.shields.io/github/stars/Nerdy-Technician/NerdyStore?style=flat)](https://github.com/Nerdy-Technician/NerdyStore/stargazers)
[![Forks](https://img.shields.io/github/forks/Nerdy-Technician/NerdyStore?style=flat)](https://github.com/Nerdy-Technician/NerdyStore/forks)
[![Issues](https://img.shields.io/github/issues/Nerdy-Technician/NerdyStore)](https://github.com/Nerdy-Technician/NerdyStore/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Nerdy-Technician/NerdyStore)](https://github.com/Nerdy-Technician/NerdyStore/pulls)
[![License](https://img.shields.io/github/license/Nerdy-Technician/NerdyStore)](https://github.com/Nerdy-Technician/NerdyStore/blob/main/LICENSE)

Storefront for Nexploy apps and Nexterm scripts, snippets, and themes.

Live site: **[store.nerdytech.dev](https://store.nerdytech.dev/)**

## What is NerdyStore?

**NerdyStore** is the catalogue for the **Nexterm** RMM and the **Nexploy** automation platform. This repository is the source of that catalogue. The storefront in `gui/` is what [store.nerdytech.dev](https://store.nerdytech.dev/) serves.

It publishes four kinds of package:

- **Nexploy apps**: a Docker Compose file and a `manifest.yml` for a self-hosted application
- **Nexterm scripts**: shell scripts in `nexterm/scripts/`
- **Nexterm snippets**: short shell snippets in `nexterm/snippets/`
- **Nexterm themes**: CSS themes in `nexterm/themes/`

From the storefront you can search, filter by category, and open an app on a Nexploy server you already run. The site asks for that server URL and opens `/apps/NerdyStore/<app-id>` on it.

## Repository layout

| Path | Contents |
| --- | --- |
| `nexploy/<letter>/<id>/` | One Nexploy app: `manifest.yml`, `docker-compose.yml`, and usually `logo.png`. The letter is the first character of the id (`uptime-kuma` lives in `nexploy/u/uptime-kuma/`). |
| `nexploy/NPINDEX` | Catalogue source name. The first line is `#!NPINDEX1 NerdyStore`. The published app list is generated at build time. |
| `nexterm/scripts/` | Nexterm scripts (`.sh`), some grouped in subfolders such as `Monitoring/` and `Network/`. |
| `nexterm/snippets/` | Nexterm snippets (`.snippet`), all in this one folder. |
| `nexterm/themes/` | Nexterm themes (`*.theme.css`). |
| `nexterm/NTINDEX` | Hash list of scripts, snippets, and themes. Rewritten on `main` by the Generate NTINDEX workflow. |
| `gui/` | Storefront (React and Vite). App icons shown on cards live in `gui/public/logos/`. |
| `Icons/` | README logo (`Icons/Logo.png`). |
| `scripts/` | `build_store.js` builds the catalogue. `fetch_logos.js` fills any missing card icons. |
| `runner.d.ts` | Helpers available to optional Nexploy hook scripts. |
| `.github/workflows/` | CI, GitHub Pages deploy, and the NTINDEX update. |

`scripts/build_store.js` walks `nexploy/` and `nexterm/`, then writes `nexploy/dist/` (gitignored). A push to `main` runs that build, compiles `gui/`, and deploys the result to GitHub Pages.

## Contributing

Contributions are welcome. **[CONTRIBUTING.md](CONTRIBUTING.md)** is the guide for adding a Nexploy app or a Nexterm script or snippet. Read that before opening a pull request.

1. Fork the repository.
2. Create a branch from `main`:

   ```sh
   git checkout -b feature/add-my-app
   ```

3. Add the package by following [CONTRIBUTING.md](CONTRIBUTING.md). Copy an existing entry and keep its layout.
4. Commit your changes.
5. Push the branch.
6. Open a pull request.

CI on a pull request runs three checks: `docker compose config` for every Compose file, ShellCheck (`--severity=error`) for `*.sh` scripts, and a full catalogue plus storefront build via `node scripts/build_store.js`.

## Useful links

- **Live store**: https://store.nerdytech.dev/
- **How to add a package**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Nexterm documentation**: https://docs.nexterm.dev
- **Discord**: https://dc.gnmyt.dev
- **Security reports**: [SECURITY.md](SECURITY.md)
- **GitHub tags**: https://github.com/Nerdy-Technician/NerdyStore/tags
