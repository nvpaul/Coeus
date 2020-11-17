/* *
 * BACKGROUND
 * Digital assistants are most commonly used for streaming music, chekcing weather, and general questions.
 *
 * THIS SKILL
 * Using this method of gamified education, Coeus' Health Quiz will ask the user a series of 3 questions relating to health tips or myths (ideally pulled randomly without replacement from a database).
 * The user will select what they believe to be the correct answer, after which the skill will either confirm or provide the correct answer.
 *
 * DEVELOPMENT
 * Skill developed by Naomi Paul, Fall 2020
 * */
 
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

let currentScore = 0;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        //Welcome the user to the skill and provide all options
        const speakOutput = `Welcome to Coeus's Health Quiz! You can ask me to explain the rules or start the game.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HasPlayedLaunchRequestHandler = {
    canHandle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        
        const played = sessionAttributes.hasOwnProperty('played') ? sessionAttributes.played : 0;
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
            && played;
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        
        const played = sessionAttributes.hasOwnProperty('played') ? sessionAttributes.played : 0;
        // const prevScore = sessionAttributes.hasOwnProperty('prevScore') ? sessionAttributes.prevScore : 0;
        
        if (played) {
            const speakOutput = `Welcome Back to Coeus' Health Quiz! You can ask me to start the game or remind you of the rules. What would you like to do?`
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
        else if (!played) {
            const speakOutput = `Welcome to Coeus' Health Quiz! You can ask me to explain the rules or start the game. What would you like to do?`
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
        else {
            const speakOutput = `Hmmm, it looks like something went wrong. Please try coming back later since I'm always ready to play! Have a great day!`
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt(repromptText)
                //End the voice skill as there is nothing left to do
                .withShouldEndSession(true)
                .getResponse();
        }
        
    }
};

const ResetPlayedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResetPlayedIntent';
    },
    async handle(handlerInput) {
        
        //Save a variable, played before, to false
        const played = false;
        const prevScore = false;
        const attributesManager = handlerInput.attributesManager;
        const quizAttributes = {
            "played" : played,
            "prevScore" : prevScore
        };
        attributesManager.setPersistentAttributes(quizAttributes);
        await attributesManager.savePersistentAttributes();
        
        const speakOutput = `Alright, my memory has been reset so next time you play I won't remember any of your past attempts. I hope I get to meet you again soon! Have a great day!`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            // .reprompt(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
        
    }
};

const GameRulesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GameRulesIntent';
    },
    handle(handlerInput) {
        //Provide the user with all the rules required to play
        //After explaining the rules, give the user the option to begin playing the game
        let speakRules = `Here's how it works. I'm going to ask you three questions. For each, I will give you 3 possible answers, 1, 2, and 3. All you have to do is guess which you think is correct. Simple right?`;
        let speakReady = `Are you ready to play?`;
        
        const speakOutput = speakRules + ' ' + speakReady;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            //Listen for the users response and move on to the first question
            .addElicitSlotDirective('confirmBegin', {
                name: 'QuestionOneIntent',
                confirmationStatus: 'NONE',
                slots: {}
                })
            .getResponse();
    }
};

const QuestionOneIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuestionOneIntent';
    },
    handle(handlerInput) {
        
        let userResponse = handlerInput.requestEnvelope.request.intent.slots.confirmBegin.value;
        
        if (userResponse === 'Yes' || userResponse === 'yes'){
            //If the user is ready to begin playing, ask the first question
            //Listen for the users guess, then move on to the results intent for question 1
            let speakQuestion = `What happens to your body after months in isolation?`;
            let speakA = `1) Your sleep improves.`;
            let speakB = `2) Your brain slows.`;
            let speakC = `3) Your heart and lungs strengthen.`;
            let speakInstructions = `What do you think the answer is? 1, 2, or 3?`;
        
            const speakOutput = speakQuestion + ` ` + speakA + ` ` + speakB + ` ` + speakC + ` ` + speakInstructions;
            
            const repromptText = speakInstructions;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptText)
                .withSimpleCard(
                    "Question 1", 
                    "What happens to your body after months in isolation?\r\n1) Your sleep improves\r\n2) Your brain slows\r\n3) Your heart and lungs strengthen\r\n\r\nWhat do you think the answer is?")
                .addElicitSlotDirective('GuessOne', {
                    name: 'ResultsOneIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                })
                .getResponse();
            
        }
        else if (userResponse === 'No' || userResponse === 'no'){
            //If the user is not ready to begin encourage them to play later
            const speakOutput = `If you ever feel like playing, don't hesitate to visit, I'm always ready to play! Have a great day!`;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt(repromptText)
                //End the voice skill as there is nothing left to do
                .withShouldEndSession(true)
                .getResponse();
        }

    }
};

const ResultsOneIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResultsOneIntent';
    },
    handle(handlerInput) {
        //Compare the users guess to the correct answer and provide the results 
        //Then give the user some more facts before asking if they are ready to move on to question 2
        
        let speakResult;
        
        let userGuess = handlerInput.requestEnvelope.request.intent.slots.GuessOne.value;
        
        let speakDetails = `When your not exercising, certain chemicals in your brain that are used to break down toxins in the blood aren't produced. When these toxins then travel to the brain, they can kill brain cells, slowing down your brain. Just remember that even though we're stuck at home, it's important to prioritize your mental and physical health.`;
                            
        let speakContinue = `Are you ready for the next question?`;
        

        if (userGuess === '1' || userGuess === '3') {
                speakResult = `Shoot, that wasn't it. The correct answer was 2) Your brain slows.`;
                
                const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
                const repromptText = `Are you ready for the second question?`;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(repromptText)
                    .addElicitSlotDirective('confirmContinue', {
                            name: 'QuestionTwoIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                    .getResponse();
            }
        else if (userGuess === '2') {
                currentScore += 1;
                speakResult = `Great job! You got it right!`;
                
                const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
                const repromptText = `Are you ready for the second question?`;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(repromptText)
                    .addElicitSlotDirective('confirmContinue', {
                            name: 'QuestionTwoIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                    .getResponse();
        }
        else {
                speakResult = `I'm sorry, something went wrong. I hope you'll try playing again later. Your guess was: ` + userGuess;
                const speakOutput = speakResult;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    //.reprompt(repromptText)
                    //End the voice skill as there is nothing left to do
                    .withShouldEndSession(true)
                    .getResponse();
        }
        
        // if (userGuess === 'A' || userGuess === 'a' || userGuess.includes('B') || userGuess.includes('b')) {
        //         speakResult = `Shoot, that wasn't it. The correct answer was B) Your brain slows.`;
                
        //         const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
        //         return handlerInput.responseBuilder
        //             .speak(speakOutput)
        //             // .reprompt(speakOutput)
        //             // .addElicitSlotDirective('GuessOne', {
        //             //         name: 'ResultsOneIntent',
        //             //         confirmationStatus: 'NONE',
        //             //         slots: {}
        //             //     })
        //             .getResponse();
        //     }
        // else if (userGuess === 'C' || userGuess === 'c') {
        //         speakResult = `Great job! You got it right!`;
                
        //         const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
        //         return handlerInput.responseBuilder
        //             .speak(speakOutput)
        //             // .reprompt(speakOutput)
        //             // .addElicitSlotDirective('GuessOne', {
        //             //         name: 'ResultsOneIntent',
        //             //         confirmationStatus: 'NONE',
        //             //         slots: {}
        //             //     })
        //             .getResponse();
        // }
        // else {
        //         speakResult = `I'm sorry, something went wrong. I hope you'll try playing again later. Your guess was: ` + userGuess;
        //         const speakOutput = speakResult;
                
        //         return handlerInput.responseBuilder
        //             .speak(speakOutput)
        //             //.reprompt(repromptText)
        //             //End the voice skill as there is nothing left to do
        //             .withShouldEndSession(true)
        //             .getResponse();
        // }
        
    }
};

const QuestionTwoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuestionTwoIntent';
    },
    handle(handlerInput) {
        
        let userResponse = handlerInput.requestEnvelope.request.intent.slots.confirmContinue.value;
        
        if (userResponse === 'Yes' || userResponse === 'yes'){
            //If the user is ready, ask the second question
            //Listen for the users guess, then move on to the results intent for question 1
            let speakQuestion = `How much of your plate at meals should you aim to fill with fruits and vegetables?`;
            let speakA = `1) Half your plate.`;
            let speakB = `2) One third of your plate.`;
            let speakC = `3) One quarter of your plate.`;
            let speakInstructions = `What do you think the answer is? 1, 2, or 3?`;
        
            const speakOutput = speakQuestion + ` ` + speakA + ` ` + speakB + ` ` + speakC + ` ` + speakInstructions;
            
            const repromptText = speakInstructions;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptText)
                .withSimpleCard(
                    "Question 2", 
                    "How much of your plate at meals should you aim to fill with fruits and vegetables?\r\n1) Half your plate\r\n2) One third of your plate\r\n3) One quarter of your plate\r\n\r\nWhat do you think the answer is?")
                .addElicitSlotDirective('GuessTwo', {
                    name: 'ResultsTwoIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                })
                .getResponse();
            
        }
        else if (userResponse === 'No' || userResponse === 'no'){
            //If the user is not ready to begin encourage them to play later
            const speakOutput = `If you ever feel like playing, don't hesitate to visit, I'm always ready to play! Have a great day!`;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt(repromptText)
                //End the voice skill as there is nothing left to do
                .withShouldEndSession(true)
                .getResponse();
        }

    }
};

const ResultsTwoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResultsTwoIntent';
    },
    handle(handlerInput) {
        //Compare the users guess to the correct answer and provide the results 
        //Then give the user some more facts before asking if they are ready to move on to question 3
        
        let speakResult;
        
        let userGuess = handlerInput.requestEnvelope.request.intent.slots.GuessTwo.value;
        
        let speakDetails = `Vegetables are important for providing nutrients such as fibre, vitamins, and minerals. Eating a variety of vegetables and fruits may also help lower your risk of heart disease. So stay healthy and aim for half you plate filled with fruits and veggies at every meal!`;
                            
        let speakContinue = `Are you ready for the final question?`;
        

        if (userGuess === '2' || userGuess === '3') {
                speakResult = `Shoot, that wasn't it. The correct answer was 1) Half your plate.`;
                
                const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
                const repromptText = `Are you ready for the third question?`;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(repromptText)
                    .addElicitSlotDirective('confirmContinue', {
                            name: 'QuestionThreeIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                    .getResponse();
            }
        else if (userGuess === '1') {
                currentScore += 1;
                speakResult = `Great job! You got it right!`;
                
                const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
                const repromptText = `Are you ready for the third question?`;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(repromptText)
                    .addElicitSlotDirective('confirmContinue', {
                            name: 'QuestionThreeIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                    .getResponse();
        }
        else {
                speakResult = `I'm sorry, something went wrong. I hope you'll try playing again later. Your guess was: ` + userGuess;
                const speakOutput = speakResult;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    //.reprompt(repromptText)
                    //End the voice skill as there is nothing left to do
                    .withShouldEndSession(true)
                    .getResponse();
        }
        
    }
};

const QuestionThreeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuestionThreeIntent';
    },
    handle(handlerInput) {
        
        let userResponse = handlerInput.requestEnvelope.request.intent.slots.confirmContinue.value;
        
        if (userResponse === 'Yes' || userResponse === 'yes'){
            //If the user is ready, ask the second question
            //Listen for the users guess, then move on to the results intent for question 1
            let speakQuestion = `What percentage of Canadian adults do not meet the Canadian Physical Activity Guidelines?`;
            let speakA = `1) 70%.`;
            let speakB = `2) 80%.`;
            let speakC = `3) 90%.`;
            let speakInstructions = `What do you think the answer is? 1, 2, or 3?`;
        
            const speakOutput = speakQuestion + ` ` + speakA + ` ` + speakB + ` ` + speakC + ` ` + speakInstructions;
            
            const repromptText = speakInstructions;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptText)
                .withSimpleCard(
                    "Question 3", 
                    "What percentage of Canadian adults do not meet the Canadian Physical Activity Guidelines?\r\n1) 70%\r\n2) 80%\r\n3) 90%\r\n\r\nWhat do you think the answer is?")
                .addElicitSlotDirective('GuessThree', {
                    name: 'ResultsThreeIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                })
                .getResponse();
            
        }
        else if (userResponse === 'No' || userResponse === 'no'){
            //If the user is not ready to begin encourage them to play later
            const speakOutput = `If you ever feel like playing, don't hesitate to visit, I'm always ready to play! Have a great day!`;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                //.reprompt(repromptText)
                //End the voice skill as there is nothing left to do
                .withShouldEndSession(true)
                .getResponse();
        }

    }
};

const ResultsThreeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResultsThreeIntent';
    },
    async handle(handlerInput) {
        //Compare the users guess to the correct answer and provide the results 
        //Then give the user some more facts
        
        let speakResult;
        let userGuess = handlerInput.requestEnvelope.request.intent.slots.GuessThree.value;
        let speakDetails = `Physical inactivity is the fourth leading risk factor of global mortality linked to a number of chronic diseases according to the World Health Organization, and 77.8% of Canadian adults don't meet the recommended 150 minutes of moderate-to-vigorous physical activity each week. Take action and get moving, even if it's something as simple as a brisk walk!`;
        
        if (userGuess === '1' || userGuess === '3') {
            speakResult = `Shoot, that wasn't it. The correct answer was 2) 80%.`;
        }
        else if (userGuess === '2') {
            currentScore += 1;
            speakResult = `Great job! You got it right!`;
        }
        else {
                speakResult = `I'm sorry, something went wrong. I hope you'll try playing again later. Your guess was: ` + userGuess;
                const speakOutput = speakResult;
                
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    //.reprompt(repromptText)
                    //End the voice skill as there is nothing left to do
                    .withShouldEndSession(true)
                    .getResponse();
        }
        
        //Save a variable, played before, to true
        const played = true;
        const attributesManager = handlerInput.attributesManager;
        const quizAttributes = {
            "played" : played,
            "prevScore" : currentScore
        };
        attributesManager.setPersistentAttributes(quizAttributes);
        await attributesManager.savePersistentAttributes();

        let speakContinue = `Thanks for playing! You scored ` + currentScore + ` out of 3. I hope you play again soon! Have a great day!`;

        const speakOutput = speakResult + ` ` + speakDetails + ` ` + speakContinue;
                
        return handlerInput.responseBuilder
            .speak(speakOutput)
            // .reprompt(repromptText)
            // .addElicitSlotDirective('confirmContinue', {
            //         name: 'QuestionThreeIntent',
            //         confirmationStatus: 'NONE',
            //         slots: {}
            //     })
            .getResponse();

        
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoadQuizInterceptor = {
    async process(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
        
        const played = sessionAttributes.hasOwnProperty('played') ? sessionAttributes.played : 0;
        
        if (played) {
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})    
    )
    .addRequestHandlers(
        HasPlayedLaunchRequestHandler,
        LaunchRequestHandler,
        ResetPlayedIntentHandler,
        GameRulesIntentHandler,
        QuestionOneIntentHandler,
        ResultsOneIntentHandler,
        QuestionTwoIntentHandler,
        ResultsTwoIntentHandler,
        QuestionThreeIntentHandler,
        ResultsThreeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
    )
    .addRequestInterceptors(
        LoadQuizInterceptor    
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();