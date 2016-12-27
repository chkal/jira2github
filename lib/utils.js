var fs = require( "fs" );

const utils = {};

utils.writeFile = ( name, content ) => {
  return new Promise( ( resolve, reject ) => {
    fs.writeFile( name, content, ( err ) => {
      if( err ) {
        reject( err );
      }
      else {
        resolve();
      }
    } );
  } );
};

utils.runSequentially = ( promises ) => {
  let seq = Promise.resolve();
  let results = [];
  for( let p of promises ) {
    seq = seq.then( () => p ).then( result => {
      results.push( result );
      return result;
    } );
  }
  return seq.then( () => results );
};

module.exports = utils;

