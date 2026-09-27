# PMSV source export

Source of the live PMSV Food Safety Updates app at https://pmsvgroup.com.

Exported from Sites version 40, source commit `47362a75fc32b8e8a94f0dd2836d129dc3c95b38`.

- Includes application code, assets, source configuration, dependency lockfile, database schema and migrations.
- Daily collection runs separately: https://github.com/pragashramadoss/pmsv-updater
- Live database contents, push registrations, secrets, signing keys, dependencies and generated builds are not included.
- The Android and documentation drafts are not part of this production snapshot.
- Copying this repository does not deploy a site or copy its live database. GitHub edits are not automatically deployed to pmsvgroup.com.

## Development

Use Node.js 22.13 or newer. Run `npm ci`, then `npm run dev`. Run `npm run build` for the Worker build. See README.md for runtime and local D1 migration instructions. Configure the DB binding and apply migrations for database-backed features. `.env.example` contains names only; supply secrets through your hosting provider, never commit them.

The `.openai/hosting.json` file identifies the existing Sites project. Moving to different hosting needs separate Cloudflare Worker/D1 configuration and updater authentication setup; this is not a WordPress plugin.
