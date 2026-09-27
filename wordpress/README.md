# WordPress migration preview — original PMSV application

**Do not deploy as the live replacement yet.** See TEST-STATUS.md for incomplete release gates.

Build from the repository root with `node wordpress/build.mjs` after installing the existing locked dependencies. The WordPress ZIP consists only of `wordpress/plugin/`, with a top-level folder named `pmsv-original-app-preview`. The active WordPress theme is not rendered: this plugin supplies its own document, original React bundle, original CSS and assets at `/pmsv-app-review/`. PHP is used only for WordPress serving, database storage, updater authorization and push service operations. No Node, AI service, OpenAI key or Work session is required on the WordPress server.

The build imports the original React components. A narrow build adapter prefixes original root-relative URLs with the isolated test path, excludes the optional browser modelContext registration, and changes the privacy hosting description to WordPress. It does not redraw cards, alter navigation, or replace business logic. Original source files remain unchanged and can still build with their original toolchain.

External runtime dependencies: WordPress hosting/database; existing GitHub Actions collector and GitHub OIDC public keys; existing regulator/media/blog sources; original external logo hosts; browser push providers. Collector destination must be parameterized/tested before cutover; it is not changed by this preview.

No audit, inspection, hygiene-rating, saved-audit, NC or audit-report code is included.

The 605-row seed is a read-only real archive export as of 27 September 2026. It is only the initial import; `/api/updater` supports future signed batches and durable append-only history. A preview is not proof that the existing production workflow has been switched.

Notification private keys are generated on the host and stored in non-autoloaded WordPress options. Existing production keys/device registrations need separate secure migration before cutover, to preserve existing subscriptions. No private keys or subscription endpoints belong in the distributable plugin.
