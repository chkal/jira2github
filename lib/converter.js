// @flow

const j2m = require( "j2m" );

class IssueConverter {

  /*:: config: any */

  constructor( config /*: any */ ) {
    this.config = config;
  }

  convert( jiraIssue /*: any */ ) /*: any */ {

    // BODY
    let body = "";
    body += `**Original issue ${jiraIssue.key} created by ${jiraIssue.fields.creator.displayName}:**`;
    body += "\n\n";
    body += j2m.toM( jiraIssue.fields.description || "" );

    // STATUS
    const jiraStatus = jiraIssue.fields.status.name;
    const closed = jiraStatus === "Resolved" || jiraStatus === "Closed";
    const closedAt = closed ? jiraIssue.fields.resolutiondate : null;

    // ASSIGNEE
    let assignee = null;
    if( jiraIssue.fields.assignee ) {
      assignee = this.getGithubUser( jiraIssue.fields.assignee.name );
    }

    // MILESTONE
    let milestone = null;
    if( jiraIssue.fields.fixVersions.length > 0 ) {
      const fixVersion = jiraIssue.fields.fixVersions[0];
      milestone = {
        title: fixVersion.name,
        state: fixVersion.released ? "closed" : "open",
        description: fixVersion.description,
        due_on: fixVersion.releaseDate + "T00:00:00Z"
      };
    }

    // COMMENTS
    if( jiraIssue.fields.comment.total != jiraIssue.fields.comment.maxResults ) {
      throw new Error( "There are more comments than included in the issue. Not supported yet." );
    }
    const comments = jiraIssue.fields.comment.comments.map( jiraComment => {

      let body = "";
      body += `**Comment by ${jiraComment.author.displayName}:**\n\n`;
      body += j2m.toM( jiraComment.body );

      return {
        created_at: this.convertDate( jiraComment.created ),
        body: body
      };

    } );

    const labels = [];
    const issueType = this.getGithubLabel( jiraIssue.fields.issuetype.name );
    if( issueType ) {
      labels.push( issueType );
    }
    if( this.config.migration.copyLabels ) {
      for( let jiraLabel of jiraIssue.fields.labels ) {
        const ghLabel = this.getGithubLabel( jiraLabel );
        labels.push( ghLabel || jiraLabel );
      }
    }

    const ghIssue = {
      issue: {
        title: jiraIssue.fields.summary,
        body: body,
        created_at: this.convertDate( jiraIssue.fields.created ),
        closed_at: this.convertDate( closedAt ),
        updated_at: this.convertDate( jiraIssue.fields.updated ),
        assignee: assignee,
        milestone: milestone,
        closed: closed,
        labels: labels
      },
      comments: comments
    };

    // setting this to null doesn't work, so we remove it completely
    if( ghIssue.issue.closed_at === null ) {
      delete ghIssue.issue.closed_at;
    }

    return ghIssue;

  }

  getGithubUser( jiraUser /*: string */ ) /*: string */ {
    return this.config.mapping.users[jiraUser];
  }

  getGithubLabel( label /*: string */ ) /*: string */ {
    return this.config.mapping.labels[label];
  }

  convertDate( input /*: string|null */ ) /*: string|null */ {
    if( input ) {
      return input.replace( /\.[0-9]{3}\+0000$/, "Z" );
    }
    return null;
  }

}

module.exports = IssueConverter;