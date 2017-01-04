# JIRA-2-GitHub Migration

This repository contains some scripts for migrating JIRA issues to GitHub issues.

## Usage

First create a configuration file just like the one named `config-mvc-spec.json` for
the migration. The format is self explaining.

Now you can use `jira-export.js` to export the JIRA issues to a JSON file:

    ./jira-export.js --config config.json --output issues.json

This process should finish without any errors. Now examine the JSON file and
check if it looks OK.

Next you will have to set an environment variable containing you GitHub API key:

    export GITHUB_API_TOKEN=<your-github-api-token>

Now you can run the import script like this:

    ./gh-import.js --config config.json --input issues.json 

This process may take some time. The GitHub issue import API is async. The script 
currently doesn't know for sure whether the import process for each issue was
successful or not. So you will have to verify the overall issue count in the
target repository for now.

Pull requests for improvements welcome. :)
