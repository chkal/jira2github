const fetch = require( "node-fetch" );

class GhClient {

  constructor( apiKey ) {

    this.apiKey = apiKey;
    if( !this.apiKey ) {
      throw new Error( "API Key is required" );
    }

  }

  getMyself() {
    return fetch( "https://api.github.com/user", {
      headers: new fetch.Headers( {
        "Authorization": `token ${this.apiKey}`
      } )
    } )
    .then( ( response ) => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } );
  }

  getMilestones( repo ) {
    return fetch( `https://api.github.com/repos/${repo}/milestones?state=all`, {
      headers: new fetch.Headers( {
        "Authorization": `token ${this.apiKey}`
      } )
    } )
    .then( ( response ) => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } );
  }

  getLabels( repo ) {
    return fetch( `https://api.github.com/repos/${repo}/labels`, {
      headers: new fetch.Headers( {
        "Authorization": `token ${this.apiKey}`
      } )
    } )
    .then( ( response ) => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } );
  }

  createMilestone( repo, milestone ) {
    return fetch( `https://api.github.com/repos/${repo}/milestones`, {
      method: "POST",
      headers: new fetch.Headers( {
        "Authorization": `token ${this.apiKey}`,
        "Content-Type": "application/json"
      } ),
      body: JSON.stringify( {
        title: milestone.title,
        state: milestone.state,
        description: milestone.description,
        due_on: milestone.due_on
      } )
    } )
    .then( ( response ) => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } );
  }

  createLabel( repo, label ) {
    return fetch( `https://api.github.com/repos/${repo}/labels`, {
      method: "POST",
      headers: new fetch.Headers( {
        "Authorization": `token ${this.apiKey}`,
        "Content-Type": "application/json"
      } ),
      body: JSON.stringify( {
        name: label,
        color: "#6da5ff"
      } )
    } )
    .then( ( response ) => {
      this.verifyResponseSuccessful( response );
      return response.json();
    } );
  }

  importIssue( repo, issue ) {

    return fetch( `https://api.github.com/repos/${repo}/import/issues`, {
      method: "POST",
      headers: new fetch.Headers( {
        "Authorization": `token ${this.apiKey}`,
        "Accept": "application/vnd.github.golden-comet-preview",
        "Content-Type": "application/json"
      } ),
      body: JSON.stringify( issue )
    } )
    .then( ( response ) => {
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

module.exports = GhClient;