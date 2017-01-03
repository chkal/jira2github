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

utils.runSequentially = ( factories ) => {
  let seq = Promise.resolve();
  let results = [];
  for( let factory of factories ) {
    seq = seq.then( () => {
      return factory.call( null );
    } ).then( result => {
      results.push( result );
      return result;
    } );
  }
  return seq.then( () => results );
};

module.exports = utils;

