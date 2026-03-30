if (process.argv[1]?.includes("release-it.js")) {
  // eslint-disable-next-line no-console
  console.warn(
    "\x1b[33m%s\x1b[0m",
    `If this is your first release, you might want to take a look at .release-it.js
This command will fail if you are not on main, if you want to change the branch,
change the requireBranch value in .release-it.js or turn off the requireBranch option.
Happy releasing 🚀!`,
  );
}

// https://github.com/release-it/release-it/blob/main/docs/configuration.md
module.exports = {
  plugins: {
    // https://github.com/release-it/conventional-changelog?tab=readme-ov-file
    "@release-it/conventional-changelog": {
      ignoreRecommendedBump: true,
      infile: "CHANGELOG.md",
      preset: {
        name: "conventionalcommits",
      },
    },
  },
  git: {
    // eslint-disable-next-line no-template-curly-in-string
    commitMessage: "chore: :bookmark: release v${version}",
    // eslint-disable-next-line no-template-curly-in-string
    tagName: "v${version}",
    requireCommits: true,
    push: false,
    /**
     * It is recommended to require a branch to be checked out before releasing.
     * This is to prevent releasing from a detached HEAD.
     */
    requireBranch: "main",
  },
  /**
   * Additonally, you can also automate the creation of GitHub or GitLab releases.
   * github: {
   *  release: true,
   * },
   * gitlab: {
   *  release: true,
   * },
   */
};
