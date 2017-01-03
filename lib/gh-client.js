// @flow
const fetch = require( "node-fetch" );

class GhClient {

  /*:: apiKey: string */

  constructor( apiKey /*: string */ ) {

    this.apiKey = apiKey;
    if( !this.apiKey ) {
      throw new Error( "API Key is required" );
    }

  }

  getMyself() /*: Promise<any> */ {
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

  getMilestones( repo /*: string */ ) /*: Promise<any> */ {
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

  getLabels( repo /*: string */ ) {
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

  createMilestone( repo /*: string */, milestone /*: any */ ) /*: Promise<any> */ {
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

  createLabel( repo /*: string */, label /*: string */ ) /*: Promise<any> */ {
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

  importIssue( repo /*: string */, issue /*: string */ ) /*: Promise<any> */ {

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

  verifyResponseSuccessful( response /*: any */ ) /*: void */ {
    if( response.status !== 200 ) {
      throw new Error( "Unexpected status code: " + response.status );
    }
  }

}

module.exports = GhClient;