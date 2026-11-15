// Use explicitly for publisher-signed builds. The default config remains a preview.
const base = structuredClone(require('./package.json').build);
delete base.mac.identity;

function requireSigning(context) {
  const env = process.env;
  if (context.electronPlatformName === 'darwin') {
    if (env.CSC_IDENTITY_AUTO_DISCOVERY === 'false') {
      throw new Error('Signed Mac builds require signing identity discovery.');
    }
    if (env.CSC_NAME === '-') {
      throw new Error('An ad-hoc identity cannot be used for a signed release.');
    }
    const appleId = env.APPLE_ID && env.APPLE_APP_SPECIFIC_PASSWORD && env.APPLE_TEAM_ID;
    const apiKey = env.APPLE_API_KEY && env.APPLE_API_KEY_ID && env.APPLE_API_ISSUER;
    const keychain = env.APPLE_KEYCHAIN_PROFILE;
    if (!appleId && !apiKey && !keychain) {
      throw new Error('Mac release blocked: provide complete Apple notarization credentials. See SIGNING.md.');
    }
  }
}

module.exports = {
  ...base,
  extends: null,
  forceCodeSigning: true,
  beforePack: requireSigning,
  win: {
    ...base.win,
    artifactName: 'PMSV-${version}-Windows-${arch}.${ext}',
    ...(process.env.PMSV_WINDOWS_CERTIFICATE_SUBJECT ? {
      signtoolOptions: { certificateSubjectName: process.env.PMSV_WINDOWS_CERTIFICATE_SUBJECT },
    } : {}),
  },
  mac: {
    ...base.mac,
    notarize: true,
    artifactName: 'PMSV-${version}-Mac-${arch}.${ext}',
  },
  dmg: { ...base.dmg, title: 'PMSV 2.2.0' },
};
