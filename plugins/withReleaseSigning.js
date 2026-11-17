const { withAppBuildGradle } = require('expo/config-plugins');

// Generate signing configuration; never commit a keystore or put secrets in Gradle files.
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, config => {
    const marker = '// Keydeck release signing';
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents += `
${marker}
def keydeckUnsigned = System.getenv('KEYDECK_UNSIGNED_BUILD') == 'true'
def keydeckKeystore = System.getenv('KEYDECK_KEYSTORE')
if (keydeckUnsigned) {
    android.buildTypes.release.signingConfig = null
} else if (keydeckKeystore) {
    android.signingConfigs.create('keydeckRelease') {
        storeFile file(keydeckKeystore)
        storePassword System.getenv('KEYDECK_STORE_PASSWORD')
        keyAlias System.getenv('KEYDECK_KEY_ALIAS')
        keyPassword System.getenv('KEYDECK_KEY_PASSWORD')
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.keydeckRelease
} else if (System.getenv('EAS_BUILD') != 'true') {
    tasks.configureEach { task ->
        if (task.name == 'assembleRelease' || task.name == 'bundleRelease') {
            task.doFirst { throw new GradleException('Configure Keydeck release signing. See docs/RELEASING.md. Never distribute a debug-signed release.') }
        }
    }
}
`;
    }
    return config;
  });
};
