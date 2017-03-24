'use strict';

var Alexa = require('alexa-sdk');

var constants = require('./constants/constants.js');

var onboardingStateHandlers = require('./handlers/onboardingStateHandlers.js');

var mainStateHandlers = require('./handlers/mainStateHandlers.js');

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);

  alexa.appId = constants.APP_ID;

  alexa.dynamoDBTableName = constants.dynamoDBTableName;
  alexa.registerHandlers(
    onboardingStateHandlers,
    mainStateHandlers
  );
  alexa.execute();
};
