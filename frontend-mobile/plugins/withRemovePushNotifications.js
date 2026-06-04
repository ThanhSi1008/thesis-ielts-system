const { withEntitlementsPlist } = require('@expo/config-plugins');

const withRemovePushNotifications = (config) => {
  return withEntitlementsPlist(config, (config) => {
    if (config.modResults['aps-environment']) {
      delete config.modResults['aps-environment'];
      console.log('Removed aps-environment entitlement for local build compatibility.');
    }
    return config;
  });
};

module.exports = withRemovePushNotifications;
