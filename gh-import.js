#!/usr/bin/env node

const argv = require( "yargs" ).argv;
const utils = require( "./lib/utils" );
const GhClient = require( "./lib/gh-client" );
const GhImporter = require( "./lib/gh-importer" );

let config = null;
if( argv.config ) {
  config = require( "./" + argv.config );
}
if( !config ) {
  throw new Error( "Cannot open config" );
}

let issues = null;
if( argv.input ) {
  issues = require( "./" + argv.input );
}
if( !issues ) {
  throw new Error( "Cannot open input file" );
}

const apiKey = process.env.GITHUB_API_TOKEN;
if( !apiKey ) {
  throw new Error( "Please set GITHUB_API_TOKEN env variable" );
}
const client = new GhClient( apiKey );
const importer = new GhImporter( client, config.github.repo );

console.log( "Checking GitHub API access..." );
client.getMyself().then( user => {
  console.log( `Hello ${user.name}, let's get started....` );
} )
.then( () => {
  console.log( `Reading ${config.github.repo} metadata...` );
  return importer.initialize();
} )
.then( () => {
  console.log( `Starting to import ${issues.length} issues...` );
  const factories = issues.map( issue => {
    return () => {
      return importer.importIssue( issue );
    };
  } );
  return utils.runSequentially( factories );
} )
.then( results => {
  const statusUrls = results.map( r => r.url );
  return utils.writeFile( "work/status.json", JSON.stringify( statusUrls, null, 2 ) );
} )
.then( () => {
  console.log( "DONE!" );
} )
.catch( error => {
  console.log( "FAILED: " + error );
} );
