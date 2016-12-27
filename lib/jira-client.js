const fetch = require( "node-fetch" );
const querystring = require( "querystring" );

class JiraClient {

  constructor( baseUrl ) {

    if( !baseUrl ) {
      throw new Error( "Base URL is required" );
    }

    this.baseUrl = baseUrl.trim();
    if( !this.baseUrl.endsWith( "/" ) ) {
      this.baseUrl += "/";
    }

  }

  getServerInfo() {

    const url = this.baseUrl + "rest/api/2/serverInfo";

    return fetch( url ).then( ( response ) => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } )
    .then( info => {
      return `${info.serverTitle} - JIRA ${info.version}`;
    } );

  }

  getIssueList( project ) {

    const query = querystring.stringify( {
      jql: "project = " + project + " order by key",
      startAt: 0,
      maxResults: 9999
    } );

    const url = this.baseUrl + "rest/api/2/search?" + query;

    return fetch( url ).then( response => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } )
    .then( result => {
      return Promise.resolve(
        result.issues.map( issue => issue.key )
      );
    } );

  }

  getIssueDetails( issue ) {

    const url = this.baseUrl + "rest/api/2/issue/" + issue;

    return fetch( url ).then( response => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } );

  }

  verifyResponseSuccessful( response ) {
    if( response.status !== 200 ) {
      throw new Error( "Unexpected status code: " + response.status );
    }
  }

}

module.exports = JiraClient;