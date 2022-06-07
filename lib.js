/* eslint-disable no-restricted-globals */
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

exports.checkFormat = async function (token, owner, expireIn, onlyPrefix, exceptPrefix) {
  const octokit = getOctokit(token);
  const deletedArtifacts = [];
  const repositoriesQuery = await octokit.graphql(`
    query {
      organization(login: "${owner}") {
        id
        repositories(first: 100) {
          nodes {
            id,
            name,
            diskUsage
          }
        }
      }
    }`);
  for (const repository of repositoriesQuery.organization.repositories.nodes) {
    const repoDiskUsageKB = repository.diskUsage;
    const repoDiskUsageMB = repository.diskUsage / 2 ** 10;
    const repoDiskUsageGB = repository.diskUsage / 2 ** 20;
    const unit = repoDiskUsageGB > 1 ? 'GB' : repoDiskUsageMB > 1 ? 'MB' : 'KB';
    const repoDiskUsage =
      repoDiskUsageGB > 1 ? repoDiskUsageGB : repoDiskUsageMB > 1 ? repoDiskUsageMB : repoDiskUsageKB;
    console.log(`> purging for repository ${repository.name} (${repoDiskUsage.toFixed(0)} ${unit})`);

    for await (const artifact of eachArtifact(octokit, owner, repository.name)) {
      console.log(`Checking artifact: ${artifact.name}`);
      if (shouldDelete(artifact, expireIn, onlyPrefix, exceptPrefix)) {
        console.log(`Deleting artifact:\n${JSON.stringify(artifact, null, 2)}`);
        if (!purgeOpts.dry) {
          await octokit.rest.actions.deleteArtifact({
            owner: owner,
            repo: repository.name,
            artifact_id: artifact.id,
          });
          deletedArtifacts.push(artifact);
          console.log(`Deleted artifact:  ${artifact.name}`);
        }
      }
    }
  }
  return deletedArtifacts;
};
