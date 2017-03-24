var constants = Object.freeze({

  APP_ID: 'amzn1.ask.skill.3600fb56-c8f3-4239-9cad-86e3ecbf15b6',
  //  DynamoDB Table Name
  dynamoDBTableName: 'ArtFacts',

  // Skill States
  states: {
    ONBOARDING: '',
    MAIN: '_MAIN'
  }
});

module.exports = constants;
