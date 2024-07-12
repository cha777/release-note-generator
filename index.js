require('dotenv').config();

const simpleGit = require('simple-git');
const path = require('path');

const repoDirectory = path.resolve('/Volumes/Macintosh HD 2/DirectFN/Pro11/gbl_x_ua_e2');

const prevCommitId = process.env.PREV_GIT_COMMIT;
const currentCommitId = process.env.CURR_GIT_COMMIT;

const git = simpleGit(repoDirectory);

git.log({ from: prevCommitId, to: currentCommitId, '--no-merges': true }, (err, log) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  const commitMessages = log.all
    .filter((commit) => {
      const components = commit.message.split('|');

      if (components.length < 3) {
        return false;
      }

      const [type, jira] = components;

      if (!jira.startsWith(process.env.PROJECT_ID)) {
        return false;
      }

      return type === 'CHG' || type === 'BUG' || type === 'NEW';
    })
    .map((commit) => {
      const [type, jira, message] = commit.message.split('|');
      return {
        type,
        jira,
        message,
      };
    });

  const changelog = {
    BUG: new Map(),
    CHG: new Map(),
    NEW: new Map(),
  };

  commitMessages.forEach((commit) => {
    if (changelog[commit.type]) {
      changelog[commit.type].set(commit.jira, commit.message);
    }
  });

  console.log(changelog);
});
