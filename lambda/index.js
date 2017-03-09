'use strict';

const moment = require('moment');

const Alexa = require('alexa-sdk');

const convertArrayToString = require('./helpers/convertArrayToString.js');

const OpearloAnalytics = require('opearlo-analytics');

const artists = require('./data/artists.js');

const APP_ID = 'amzn1.ask.skill.3600fb56-c8f3-4239-9cad-86e3ecbf15b6';

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.dynamoDBTableName = 'ArtFacts';

  if(event.session.new) {
    OpearloAnalytics.initializeAnalytics('kJnUOYznWOZmmLEv4aUesaMrOg63', 'art-facts', event.session);
  }
  if(event.request.type === 'IntentRequest') {
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'IntentRequest', event.request.intent);
  }
  if(event.request.type === 'LaunchRequest') {
    OpearloAnalytics.registerVoiceEvent(event.session.user.userId, 'LaunchRequest');
  }

  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {

  'NewSession': function() {
    const userName = this.attributes['userName'];
    if(userName) {
      let lastFactDate = this.attributes['lastFactDate'];
      if (lastFactDate === moment().format('DD-MM-YYYY')) {
        this.emit(':ask', `Welcome back ${userName}! Ask me about an artist by saying: tell me about, and then the name of the artist.`, 'Ask me about an artist by saying: tell me about, and then the name of the artist.');
      } else {
        this.attributes['lastFactDate'] = moment().format('DD-MM-YYYY');
        lastFactDate = this.attributes['lastFactDate'];
        let myHeardFacts = this.attributes['myHeardFacts'];
        if (!myHeardFacts) {
          this.attributes['myHeardFacts'] = [];
          myHeardFacts = this.attributes['myHeardFacts'];
        }
        let chosenArtist = false;
        while (chosenArtist === false) {
          const randomArtist = artists[Math.floor(Math.random()*artists.length)];
          if (myHeardFacts.length === artists.length) {
            this.attributes['myHeardFacts'] = [];
            myHeardFacts = this.attributes['myHeardFacts'];
          }
          if(myHeardFacts.indexOf(randomArtist.id) === -1) {
            chosenArtist = randomArtist;
          }
        }
        if (chosenArtist) {
          myHeardFacts.push(chosenArtist.id);
          this.emit(':ask', `Welcome back ${userName}! Here's your random art fact of the day. ${chosenArtist.name} ${chosenArtist.alive} ${chosenArtist.nationality}, and some of ${chosenArtist.gender} famous works include: ${convertArrayToString(chosenArtist.famous_works)} Would you like to hear about another artist?`, ' Would you like to hear about another artist?');
        } else {
          this.emit(':ask', 'Sorry, there was a problem with art facts. Please try again.', 'Please try again.');
        }
      }
    } else {
      this.emit(':ask', 'Welcome to Art Facts. This app can tell you useful facts about famous visual artists, but to start, first I\'d like to know your name. Tell me your name by saying, my name is, followed by your name.', 'Tell me your name by saying, my name is, followed by your name.');
    }
  },

  'LaunchRequest': function() {
    this.emit(':ask', 'Ask me about an artist by saying, tell me about, and then the name of the artist, or ask for a random art fact by saying, art check.', 'Ask me about an artist by saying, tell me about, and then the name of the artist, or ask for a random art fact by saying, art check.');
  },

  'NameCapture': function() {
    const USFirstNameSlot = this.event.request.intent.slots.USFirstName.value;
    const UKFirstNameSlot = this.event.request.intent.slots.UKFirstName.value;
    let name = null;
    if(USFirstNameSlot) {
      name = USFirstNameSlot;
    } else if (UKFirstNameSlot) {
      name = UKFirstNameSlot;
    }
    if (name) {
      this.attributes['userName'] = name;
      this.emit(':ask', `Hi ${name}, ask me about an artist by saying, tell me about, and then the name of the artist, or ask for a random art fact by saying, art check.`, 'Ask me about an artist by saying, tell me about, and then the name of the artist, or ask for a random art fact by saying, art check.');
    } else {
      OpearloAnalytics.registerVoiceEvent(this.event.session.user.userId, 'Custom', 'Bad Name Capture', {
        'Bad Name Capture': name
      });
      this.emit(':ask', 'Sorry, I didn\'t get your name. Tell me your name by saying, my name is, and then your name.', 'Tell me your name by saying, my name is, and then your name.');
    }
  },

  'ArtistCheck': function() {
    var requestArtist = this.event.request.intent.slots.Artist.value;
    let artist = false;
    for (var i = 0; i < artists.length; i ++) {
      if (artists[i].name.toLowerCase() === requestArtist.toLowerCase()) {
        OpearloAnalytics.registerVoiceEvent(this.event.session.user.userId, 'Custom', 'Full Name Artist Match', {
          'Full Name Artist Match': requestArtist
        });
        artist = artists[i];
      }
      if(artists[i].surname.toLowerCase() === requestArtist.toLowerCase()) {
        OpearloAnalytics.registerVoiceEvent(this.event.session.user.userId, 'Custom', 'Surname Artist Match', {
          'Surname Artist Match': requestArtist
        });
        artist = artists[i];
      }
    }
    if(artist) {
      this.emit(':ask', `${artist.name} ${artist.alive} ${artist.nationality}, and some of ${artist.gender} famous works include: ${convertArrayToString(artist.famous_works)} Would you like to hear about another artist?`, 'Would you like to hear about another artist?');
    } else {
      OpearloAnalytics.registerVoiceEvent(this.event.session.user.userId, 'Custom', 'No Artist Match', {
        'No Artist Match': requestArtist
      });
      this.emit(':ask', 'Sorry, I don\'t know that artist. Ask for another artist by saying tell me about, and then the name of the artist.', 'Ask for another artist by saying tell me about, and then the name of the artist.');
    }
  },

  'RandomArtFact': function() {
    let lastFactDate = this.attributes['lastFactDate'];
    if (lastFactDate === moment().format('DD-MM-YYYY')) {
      this.emit(':ask', 'Sorry, you have already heard your random fact for today. Come back for another art fact tomorrow!', 'Ask me about an artist by saying: tell me about, and then the name of the artist');
    } else {
      this.attributes['lastFactDate'] = moment().format('DD-MM-YYYY');
      lastFactDate = this.attributes['lastFactDate'];
      let myHeardFacts = this.attributes['myHeardFacts'];
      if (!myHeardFacts) {
        this.attributes['myHeardFacts'] = [];
        myHeardFacts = this.attributes['myHeardFacts'];
      }
      let chosenArtist = false;
      while (chosenArtist === false) {
        const randomArtist = artists[Math.floor(Math.random()*artists.length)];
        if (myHeardFacts.length === artists.length) {
          this.attributes['myHeardFacts'] = [];
          myHeardFacts = this.attributes['myHeardFacts'];
        }
        if(myHeardFacts.indexOf(randomArtist.id) === -1) {
          chosenArtist = randomArtist;
        }
      }
      if (chosenArtist) {
        myHeardFacts.push(chosenArtist.id);
        this.emit(':ask', `Here's your art fact of the day. ${chosenArtist.name} was ${chosenArtist.nationality}, and some of their famous works include ${convertArrayToString(chosenArtist.famous_works)} Would you like to hear about another artist?`, ' Would you like to hear about another artist?');
      } else {
        this.emit(':ask', 'Sorry, there was a problem with art facts. Please try again.', 'Please try again.');
      }
    }
  },



  'AMAZON.HelpIntent': function() {
    this.emit(':ask', 'Ask me about an artist by saying, tell me about, and then the name of the artist, or say, art check, for a random art fact.', 'Ask me about an artist by saying, tell me about, and then the name of the artist, or say, art check, for a random art fact.');
  },

  'Unhandled': function() {
    this.emitWithState('AMAZON.HelpIntent');
  },

  'AMAZON.StopIntent': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, 'RrTGUvJLyz3w5yR8zaC5p5V7Q83VCnfv6M8fnrCE',
    (result)=> {
      this.emit(':tell', 'Thank you for using art facts. Goodbye!');
    });
  },

  'AMAZON.CancelIntent': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, 'RrTGUvJLyz3w5yR8zaC5p5V7Q83VCnfv6M8fnrCE',
    (result)=> {
      this.emit(':tell', 'Thank you for using art facts. Goodbye!');
    });
  },

  'AMAZON.YesIntent': function() {
    this.emitWithState('LaunchRequest');
  },

  'AMAZON.NoIntent': function() {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, 'RrTGUvJLyz3w5yR8zaC5p5V7Q83VCnfv6M8fnrCE',
    (result)=> {
      this.emit(':tell', 'Thank you for using art facts. Goodbye!');
    });
  },


  //
  'SessionEndedRequest': function () {
    OpearloAnalytics.recordAnalytics(this.event.session.user.userId, 'RrTGUvJLyz3w5yR8zaC5p5V7Q83VCnfv6M8fnrCE',
    (result)=> {
      this.emit(':tell', 'Thank you for using art facts. Goodbye!');
    });
    //  // Force State Save When User Times Out        //   this.emit(':saveState', true);
  }
};
