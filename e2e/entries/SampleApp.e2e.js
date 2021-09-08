const { promisify } = require('util');
const { commonChannelListTests } = require('../common/channel-list.e2e');
const { disableNetwork, enableNetwork } = require('../utils');

if (process.getuid() != process.env.SUDO_UID) {
  console.warn(
    'Offline tests need sudo in order to execute changes in etc/hosts. Otherwise theyre skipped',
  );
}

describe('SampleApp', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  describe('Authentication flow', () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      await waitFor(element(by.id('user-selector-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should render user list', async () => {
      await expect(element(by.id('user-selector-button')).atIndex(0)).toBeVisible();
    });

    it('should redirect to channel list when user is selected', async () => {
      await expect(element(by.id('user-selector-button')).atIndex(0)).toBeVisible();
      await element(by.id('user-selector-button')).atIndex(0).tap();
      await waitFor(element(by.id('user-selector-screen'))).toBeVisible();
    });
  });

  describe('Online', () => {
    commonChannelListTests();
  });

  if (process.getuid() == process.env.SUDO_UID) {
    describe('Offline', () => {
      beforeAll(async () => {
        await device.sendToHome();

        await device.terminateApp();

        await disableNetwork();

        await device.launchApp({
          // disable synchronization in offline mode in order to avoid problems with
          // failing requests retrying
          launchArgs: { detoxEnableSynchronization: 0 },
        });
        await waitFor(element(by.id('network-down-indicator')))
          .toBeVisible()
          .withTimeout(10000);
        await expect(element(by.id('network-down-indicator'))).toBeVisible();
      });

      afterAll(async () => {
        await enableNetwork();
        await device.enableSynchronization();
        await waitFor(element(by.id('network-down-indicator')))
          .not.toBeVisible()
          .withTimeout(10000);
        await expect(element(by.id('network-down-indicator'))).not.toBeVisible();
      });

      commonChannelListTests();
    });
  }
});
