const { promisify } = require('util');
const child_process = require('child_process');
const { commonChannelListTests } = require('../common/channel-list.e2e');

const exec = promisify(child_process.exec);

describe('SampleApp', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  describe('Authentication', () => {
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

  describe('Offline', () => {
    beforeAll(async () => {
      await device.sendToHome();

      await device.terminateApp();

      await exec(
        '(networksetup -setnetworkserviceenabled wi-fi off || true) && (networksetup -setnetworkserviceenabled ethernet off || true)',
      );

      await device.launchApp();
    });

    afterAll(async () => {
      await exec(
        '(networksetup -setnetworkserviceenabled wi-fi on || true) && (networksetup -setnetworkserviceenabled ethernet on || true)',
      );
    });
    commonChannelListTests();
  });
});
