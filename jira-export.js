#!/usr/bin/env node

const argv = require( "yargs" ).argv;
const JiraClient = require( "./lib/jira-client" );
const IssueConverter = require( "./lib/converter" );
const utils = require( "./lib/utils" );

let config = null;
if( argv.config ) {
  config = require( "./" + argv.config );
}
if( !config ) {
  throw new Error( "Cannot open config" );
}

let output = argv.output;
if( !output ) {
  throw new Error( "You must specify an output file with --output" );
}

const converter = new IssueConverter( config );
const client = new JiraClient( config.jira.url );

console.log( "Validating JIRA API URL..." );

client.getServerInfo().then( serverInfo => {

  console.log( `Connected to: ${serverInfo}` );
  return client.getIssueList( config.jira.project );

} )
.then( issues => {

  console.log( `Found ${issues.length} issues for project ${config.jira.project}` );

  const factories = issues.map( issue => {
    return () => {
      console.log( "Fetching details of: " + issue );
      return client.getIssueDetails( issue ).then( details => {
        return converter.convert( details );
      } )
    };
  } );

  return utils.runSequentially( factories );

} )
.then( issues => {
  const content = JSON.stringify( issues, null, 2 );
  return utils.writeFile( output, content );
} )
.then( () => {
  console.log( "DONE!" );
} )
.catch( error => {
  console.log( error );
} );
