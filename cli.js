/* eslint-disable no-restricted-globals */
const { boolean } = require('yargs');
const lib = require('./lib.js');
const core = require('@actions/core');

const argv = require('yargs/yargs')(process.argv.slice(2))
  .option('token', { description: 'token', type: 'string' })
  .option('owner', { description: 'owner', type: 'string' })
  .help().argv;

const owner = 'kungfu-trader';
const repo = 'action-check-format';
const pullRequestNumber = 6;
//const token = core.getInput('token');
const token = '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';

lib.addPullRequestComment(token, owner, repo, pullRequestNumber);
lib.checkFormat(argv).catch(console.error);
