'use strict';

var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Onboarding Handlers
var onboardingStateHandlers = Alexa.CreateStateHandler(constants.states.ONBOARDING, {

  'NewSession': function () {
    // Check for User Data in Session Attributes
    var userName = this.attributes['userName'];
    if (userName) {
      // Change State to Main
      this.handler.state = constants.states.MAIN;
      this.emitWithState('LaunchRequest');
    } else {
            // Change State to MAIN
      this.handler.state = constants.states.MAIN;

            // Welcome User for the First Time
      this.emit(':ask', 'Welcome to Art Facts. This app can tell you useful facts about famous visual artists, but to start, first I\'d like to know your name. Tell me your name by saying, my name is, followed by your name.', 'Tell me your name by saying, my name is, followed by your name.');
    }
  },


  'AMAZON.StopIntent': function () {
    // State Automatically Saved with :tell
    this.emit(':tell', 'Goodbye!');
  },

  'AMAZON.CancelIntent': function () {
    // State Automatically Saved with :tell
    this.emit(':tell', 'Goodbye!');
  },

  'SessionEndedRequest': function () {
    // Force State to Save when the user times out
    this.emit(':saveState', true);
  },

  'AMAZON.HelpIntent': function () {
    this.emit(':ask', 'Ask me about an artist by saying, tell me about, and then the name of the artist, or say, art check, for a random art fact.', 'Ask me about an artist by saying, tell me about, and then the name of the artist, or say, art check, for a random art fact.');
  },

  'Unhandled': function () {
    this.emitWithState('AMAZON.HelpIntent');
  }

});

module.exports = onboardingStateHandlers;
