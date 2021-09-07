const { commonChannelListTests } = require('../common/channel-list.e2e');

describe('NativeMessaging', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  commonChannelListTests();
});
