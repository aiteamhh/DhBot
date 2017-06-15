var restify = require('restify');
var builder = require('botbuilder');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Setup Restify Server
var server = restify.createServer();

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());


// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
	sendTextToQnA(session.message.text, session);
    //session.send("You said: %s", session.message.text);
});


//var context = new AudioContext();
//var sKey = "f8ffd733-01ce-4abf-a32f-8a4a26de79f9"; //false account
var knowledgebaseID = "11a4bd05-95de-4e9d-9f53-558d0157d3d3"; 
var qnaSubscriptionKey = "0055fb6f6944458695b1b633d6f9ce44";
//var speechVoice = "de-DE, Hedda";


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

	session.send(">> %s", answer);

	
	
	
// function init(){       	               
	 
	// initiated = true;
	
	// client = Microsoft.CognitiveServices.SpeechRecognition.SpeechRecognitionServiceFactory.createMicrophoneClient(mode, language, sKey);
	//[{"lexical":"hallo","display":"Hallo.","inverseNormalization":null,"maskedInverseNormalization":null,"transcript":"Hallo.","confidence":0.9383745}]

	// client.onFinalResponseReceived = function (response) {
		// var str = JSON.stringify(response);            
		// str = str.replace("[","");
		// str = str.replace("]","");
		// var json = JSON.parse(str);        	
		// setText(json.display, false);
		
		// var questionText = "\""+json.display+"\"";
		
		// sendTextToQnA(questionText);
	// }
// }
				
			// setText("("+score+") " +answer, true);					
								
			// $.ajax({
				// type: "post",
				// url: "https://api.cognitive.microsoft.com/sts/v1.0/issueToken",
				// headers: {
					// "Ocp-Apim-Subscription-Key" : sKey,
					// },
				// success: function (token){

						"German - DE"; //English - GB/US  
						"Hedda"; //DE: Hedda/Stefan  US: Zira (HQ)/Benjamin (HQ) GB: Susan/George					     						  
					// var tsData = "<speak version='1.0' xml:lang='"+language+"'><voice xml:lang='"+language+"' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice ("+speechVoice+")'>"+answer+"</voice></speak>"
				
					// var ttsRequest = new XMLHttpRequest();
					// ttsRequest.open("POST","https://speech.platform.bing.com/synthesize",true);
					// ttsRequest.setRequestHeader("Authorization", "Bearer "+token);
					// ttsRequest.setRequestHeader("Content-Type", "application/ssml+xml");
					// ttsRequest.setRequestHeader("X-Microsoft-OutputFormat", "audio-16khz-32kbitrate-mono-mp3");
					// ttsRequest.responseType = 'arraybuffer';
												
					// window.AudioContext = window.AudioContext||window.webkitAudioContext;
					// var dataObj = new String(data);
					// var buf = null;
					// ttsRequest.onload = function(){
						// context.decodeAudioData(ttsRequest.response, 
							// function(buffer) {
								// var source = context.createBufferSource();
								// source.buffer = buffer;
								// source.connect(context.destination);
								// source.start(0);	
							// },
							// function (e){
								// alert("decoding buffer error");
							// }
						// );
					// }       						
					// ttsRequest.send(tsData);       						   		       						        													   
				// },
				// error: function (e){
					// alert("Authorization error");
				// }
			// });          		
}