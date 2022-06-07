/* eslint-disable no-restricted-globals */
const lib = (exports.lib = require('./lib.js'));
const core = require('@actions/core');
const github = require('@actions/github');

const main = async function () {
  const repo = github.context.repo;
  const argv = {
    token: core.getInput('token'),
    owner: repo.owner,
    expireIn: core.getInput('expire-in'),
    onlyPrefix: core.getInput('only-prefix', { required: false }),
    exceptPrefix: core.getInput('except-prefix', { required: false }),
  };
  const deletedArtifacts = await lib.purgeArtifacts(
    argv.token,
    argv.owner,
    argv.expireIn,
    argv.onlyPrefix,
    argv.exceptPrefix,
  );
  core.setOutput('deleted-artifacts', JSON.stringify(deletedArtifacts));
};

if (process.env.GITHUB_ACTION) {
  main().catch((error) => {
    console.error(error);
    core.setFailed(error.message);
  });
}
