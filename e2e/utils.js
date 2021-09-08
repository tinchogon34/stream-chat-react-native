const { promisify } = require('util');
const { exec: execSync } = require('child_process');

const exec = promisify(execSync);

const disableNetwork = async () => {
  await exec(
    `sudo ${__dirname}/../node_modules/hostile/bin/cmd.js load ${__dirname}/ignored-hosts`,
  );
};

const enableNetwork = async () => {
  await exec(
    `sudo ${__dirname}/../node_modules/hostile/bin/cmd.js unload ${__dirname}/ignored-hosts`,
  );
};

module.exports = {
  disableNetwork,
  enableNetwork,
};
