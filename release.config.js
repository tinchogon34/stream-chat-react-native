const mergeRegx = /^Merge pull request #(.+) from (.*)\n\n/;
const commitRegx = /^(\w*)(?:\((.*)\))?: (.*)$/;
module.exports = Promise.resolve()
  .then(() => require('conventional-changelog-angular'))
  .then((preset) => {
    // const currentPackage = process.cwd().split('/').pop();
    // const isSDK = currentPackage === 'package';

    const plugins = [
      [
        '@semantic-release/commit-analyzer',
        {
          preset: 'angular',
          releaseRules: [{ breaking: true, release: 'minor' }],
          parserOpts: {
            mergePattern: /^Merge pull request #(.+) from (.*)/,
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
          },
        },
      ],
      [
        '@semantic-release/release-notes-generator',
        {
          preset: 'angular',
          parserOpts: {
            mergePattern: mergeRegx,
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
          },
          writerOpts: {
            transform: (commit, context) => {
              if (!mergeRegx.test(commit.message)) {
                return false;
              }

              const [header, type, scope, subject] = commit.body.match(commitRegx) || [];

              if (!header) return false;

              return preset.writerOpts.transform(
                {
                  ...commit,
                  header,
                  type,
                  scope,
                  subject,
                },
                context,
              );
            },
          },
        },
      ],
      [
        '@semantic-release/changelog',
        {
          changelogTitle: '# Change Log',
          changelogFile: `${process.cwd()}/CHANGELOG.md`,
        },
      ],
    ];

    if (process.env.GIT_BRANCH === 'master') {
      plugins.concat([
        [
          '@semantic-release/npm',
          {
            npmPublish: false,
            // npmPublish: isSDK,
          },
        ],
        [
          '@semantic-release/git',
          {
            assets: [
              `${process.cwd()}/package.json`,
              `${process.cwd()}/yarn.lock.json`,
              '`${process.cwd()}/CHANGELOG.md`',
            ],
            message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
        '@semantic-release/github',
      ]);
    }
    console.log(process.env.TAG_FORMAT);
    return {
      tagFormat: process.env.TAG_FORMAT,
      branches: [
        'master',
        // { name: 'staging', channel: 'rc', prerelease: 'rc' },
        { name: 'workspaces', channel: 'next', prerelease: 'next' },
      ],
      plugins,
    };
  });
