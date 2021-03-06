const utils = require( "./utils" );

class GhImporter {

  constructor( client, repo ) {

    this.client = client;
    this.repo = repo;
    if( !this.client || !this.repo ) {
      throw new Error( "Please set client and repo" );
    }

    this.milestoneNumberByNameMap = new Map();
    this.labelsSet = new Set();

  }

  initialize() {
    return this.initializeMilestones().then( () => this.initializeLabels() );
  }

  initializeMilestones() {

    return this.client.getMilestones( this.repo ).then( ( milestones ) => {

      console.log( `Found ${milestones.length} milestones: ` +
        milestones.map( m => m.title ).join( ", " ) );

      milestones.forEach( milestone => this.registerMilestone( milestone ) );

    } );

  }

  registerMilestone( milestone ) {
    if( !milestone || !milestone.title || !milestone.number ) {
      throw new Error( "Not a milestone!?!" );
    }
    this.milestoneNumberByNameMap.set( milestone.title, milestone.number );
  }

  initializeLabels() {

    return this.client.getLabels( this.repo ).then( ( labels ) => {

      console.log( `Found ${labels.length} labels: ` + labels.map( l => l.name ).join( ", " ) );

      labels.forEach( label => this.registerLabel( label ) );

    } );

  }

  registerLabel( label ) {
    if( !label || !label.name ) {
      throw new Error( "Not a label!?!" );
    }
    this.labelsSet.add( label.name );
  }

  importIssue( issue ) {

    console.log( "Processing issue: " + issue.issue.title );
    return this.getOrCreateMilestoneNumber( issue.issue.milestone ).then( number => {

      // replace the milestone object with the actual milestone number or null
      issue.issue.milestone = number;

      // ensure all the labels are available
      const labelPromiseFactories = issue.issue.labels.map( label => {
        return () => {
          return this.createLabelIfRequired( label );
        };
      } );

      return utils.runSequentially( labelPromiseFactories ).then( () => {
        return this.client.importIssue( this.repo, issue );
      } );

    } );

  }

  createLabelIfRequired( label ) {

    if( !this.labelsSet.has( label ) ) {

      console.log( "Creating label: " + label );
      return this.client.createLabel( this.repo, label ).then( newLabel => {
        this.registerLabel( newLabel );
      } );

    }
    return Promise.resolve();

  }

  getOrCreateMilestoneNumber( milestone ) {

    if( milestone ) {

      const number = this.milestoneNumberByNameMap.get( milestone.title );
      if( number ) {
        return Promise.resolve( number );
      }

      console.log( "Creating milestone: " + milestone.title );
      return this.client.createMilestone( this.repo, milestone ).then( newMilestone => {
        this.registerMilestone( newMilestone );
        return newMilestone.number;
      } );

    }
    return Promise.resolve( null );

  }

}

module.exports = GhImporter;