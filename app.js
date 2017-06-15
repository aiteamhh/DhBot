var restify = require('restify');
var builder = require('botbuilder');

var knowledgebaseID = "11a4bd05-95de-4e9d-9f53-558d0157d3d3"; 
var qnaSubscriptionKey = "0055fb6f6944458695b1b633d6f9ce44";

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Setup Restify Server
var server = restify.createServer();

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.listen(process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

server.post('/api/messages', connector.listen()); // Listen for messages from users 

// =========== CONFIG END ================

var bot = new builder.UniversalBot(connector);


bot.dialog('/', [
	function (session, args){
		if (args && args.repromt){
			builder.Prompts.text(session, 'What else can i do for you?');
		}
		else{
			builder.Prompts.text(session, 'Hello... What\'s your name?');
		}
	},
	function (session, results) {
		session.userData.name = results.response;	
		session.beginDialog('/maindialog');
	},
	function (session, results) {
		if (results == 'end') {
			session.send("Bye!");
			session.endConversation();
		}
		else{
			session.replaceDialog('/', {repromt: true});
		}
	}
]);

bot.dialog('/maindialog', [
    function (session) {   
        builder.Prompts.choice(session, 'Hello '+ session.userData.name + ', how may I help you?', ['wifi', 'coffee', 'qna', 'end']);
    },
    function (session, results) {
        session.userData.choice = results.response.entity;
		
		switch (session.userData.choice){
			case 'wifi':
				session.send("The Wifi credentials are ... ");
			break;
			
			case 'qna':
				session.beginDialog("/maindialog/qna");
			break;
			
			case 'end':
				session.send('Okay %s... Always glad to help!', session.userData.name);
				session.endDialogWithResult({response: 'end'});
				break;
		}
    }
]);

bot.dialog('/maindialog/qna', [
	function (session){
		builder.Prompts.text(session, "Okay, what's your question?");
	},
	function (session, results) {
		session.send("Okay let me think...");
		sendTextToQnA(session.message.text, session);
		//session.endDialogWithResult(results);
		session.endDialog();
	}
]);

function sendTextToQnA(questionText, session) {

	var http = new XMLHttpRequest();
	var url = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/'+knowledgebaseID+'/generateAnswer';
	var params = {
		question : questionText, 
		top : 2               		
	};
		
	http.open('POST',url,false);
	http.setRequestHeader("Content-Type", "application/json");
	http.setRequestHeader("Ocp-Apim-Subscription-Key", qnaSubscriptionKey);
	
	http.send(JSON.stringify(params));
	
	//session.send(http.responseText);
	var response = JSON.parse(http.responseText); //{"answers":[{"answer":"Wilkommen beim Bewerbungs-FAQ von PwC :)","score":100}]}
	var answer = response.answers[0].answer;
	var score = response.answers[0].score;

	if (score < 50 && score > 10)
	answer = "Ich bin mir nicht sicher, ob ich die Frage verstanden habe!";
	if (score <= 10)
	answer = "Leider habe ich keine Antwort auf diese Frage. Sie können sich aber an Mitarbeiter des EC wenden.";

	session.send("%s (%s)", answer, score);
}