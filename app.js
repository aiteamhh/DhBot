var restify = require('restify');
var builder = require('botbuilder');

var knowledgebaseID = "01b6a3f1-0071-4e25-8c65-ff304a5b0136"; 
var qnaSubscriptionKey = "6c374f8c7eea4405afa0cd80e496c6e2";

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Setup Restify Server
var server = restify.createServer();

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//selectionList
var go = 'I have another question';
var end = 'No, thanks';
var Options = [go, end];
var listStyle = { listStyle: builder.ListStyle.button };

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

server.post('/api/messages', connector.listen()); // Listen for messages from users 

// =========== CONFIG END ================

var bot = new builder.UniversalBot(connector);


bot.dialog('/', [
	function (session, args){
		builder.Prompts.text(session, 'Hello... What\'s your name?');
	},
	function (session, results) {
		session.userData.name = results.response;	
		session.beginDialog('/maindialog');
	},
	function (session, results) {
		session.send("Goodbye!");
		session.endConversation();
	}
]);

bot.dialog('/maindialog', [
    function (session, args, next) {   
		if (args && args.repromt) {
			builder.Prompts.text(session, 'Okay! what else do you want to know,'+ session.userData.name + '?');
		}
		else {
			builder.Prompts.text(session, 'Hello '+ session.userData.name + ', what question do you have?');
		}
    },
    function (session, results, next) {
		session.send("Okay let me think...");
		sendTextToQnA(session.message.text, session);
		next();	
	},
	function (session, results, next) {
		builder.Prompts.choice(session, 'Do you want to ask something else?', Options, listStyle);
	},
	function (session, results, netxt) {
        session.userData.choice = results.response.entity;
		
		switch (session.userData.choice){
			case go:
				session.replaceDialog('/maindialog', {repromt: true});
				//next();
			break;
			
			case end:
				session.send('Okay %s... Always glad to help!', session.userData.name);
				session.endDialog();
				break;
		}
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

	if (score < 60 && score > 30)
	answer += "\nBut i'm not sure i got the question right!";
	if (score <= 30)
	answer = "Unfortunately i have no answer to this";

	if (answer.indexOf("Data not available") > -1) {
		answer = "Sorry, there is no data available for this question";
	}

	session.send("%s (%s)", answer, score);
}