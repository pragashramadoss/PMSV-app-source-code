# WordPress migration preview — original PMSV application

**Do not deploy as the live replacement yet.** See TEST-STATUS.md for incomplete release gates.

Build from the repository root with `node wordpress/build.mjs` after installing the existing locked dependencies. The WordPress ZIP consists only of `wordpress/plugin/`, with a top-level folder named `pmsv-original-app-preview`. The active WordPress theme is not rendered: this plugin supplies its own document, original React bundle, original CSS and assets at `/pmsv-app-review/`. PHP is used only for WordPress serving, database storage, updater authorization and push service operations. No Node, AI service, OpenAI key or Work session is required on the WordPress server.

The WordPress build imports the PMSV React components and prefixes app routes for the isolated preview path. Packaged local images are served from the plugin directory. The WordPress migration source contains no browser modelContext registration or OpenAI runtime dependency.

External runtime dependencies: WordPress hosting/database; the GitHub Actions collector and GitHub OIDC public keys; existing regulator/media/blog sources; original external logo hosts; and browser push providers. The separate PMSV audit repository is imported during the build, so the deployed audit pages run from WordPress rather than depending on GitHub Pages at runtime.

The build imports the separate `pragashramadoss/pmsv-fssai-audit` repository into `public/audits`. The WordPress app therefore serves the FSSAI Schedule IV Inspection and Hygiene Rating tools itself, including Saved Audits, NC Management/NC Follow-up and reports. Audit source and scoring logic remain maintained in the separate GitHub repository.

The 605-row seed is a read-only real archive export as of 27 September 2026. It is only the initial import; `/api/updater` supports future signed batches and durable append-only history. A preview is not proof that the existing production workflow has been switched.

Notification private keys are generated on the host and stored in non-autoloaded WordPress options. Existing production keys/device registrations need separate secure migration before cutover, to preserve existing subscriptions. No private keys or subscription endpoints belong in the distributable plugin.
