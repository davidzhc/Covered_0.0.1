var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({key: String, message: [], data: []}/*,{ collection: 'Mongodata' }*/);
var Mongodata = mongoose.model('Mongodata', schema);

//var Message = mongoose.model('Message',{msg: String});
var S = require('string');


var indico = require('indico.io');
indico.apiKey = 'c09283ee4a890e9edbd18f7486c6fa72';

var response = function(res) {

	console.log(res);
	//var messageToStore = new Message(String(res));
	//messageToStore.save();

}

var logError = function(err) { console.log(err); }



//var database;


app.use(bodyParser.json());
app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Content-Type, Authorization");
	next();
})

app.post('/api/analysis',function(req,res){

	var messageKey = req.body.msg;
	var analysis = customParser(messageKey);

	Mongodata.findOne({'message':analysis}).exec(function (err, positivity) {
		if (err) return handleError(err);
		console.log(positivity.data);
		console.log(positivity.message);
		res.send({values:positivity.data, msg:positivity.message});
	 });

});

app.post('/api/delete', function(req,res) {
  var deletedMessage = JSON.stringify(req.body.DeleteMsg);
  var del = customParser(deletedMessage);
  console.log(del);

  var key = req.body.key;
  console.log(key);

  Mongodata.findOneAndRemove({'key': key, 'message' : del}, function() {
    //console.log("yaaaaay removed");
  });
})

app.post('/api/edit', function(req,res) {
  var editedMessage = req.body.EditMsg;
  var edit = customParser(editedMessage);

  var oldMessage = req.body.oldmsg;
  var old = customParser(oldMessage);

  var key = req.body.key;

	var response = function(res){

  	Mongodata.findOneAndUpdate({'key': key, 'message' : old}, {$set: {'message': edit, 'data': res}}, {new: true}, function() {
    	console.log("yaaaaay updated");
  	});
	}

	var positivityValues = indico.sentimentHQ(edit)
  	.then(response)
  	.catch(logError);
  //Mongodata.find({'key': key}).remove();

})

app.post('/api/message', function(req,res){

	var passedDocument = req.body.msg;
  var userKey = req.body.key;

  var treatedString = customParser(passedDocument);

  var response = function(res) {
    console.log(res);

    var backendResponse = new Mongodata({key: userKey, message: treatedString, data: res});
    backendResponse.save();

    console.log(userKey);
    console.log(treatedString);
    Mongodata.find({}).exec(function(err, result){
    console.log(result);
    });
  }

  var positivityValues = indico.sentimentHQ(treatedString)
  	.then(response)
  	.catch(logError);

  res.status(200);
})

mongoose.connect('mongodb://127.0.0.1:27017', function(err,db){
	if(!err){

		console.log("We is connected son!");
	}
})
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("h");
});

function GetMessages(req,res){

	mongodata.find({}).exec(function(err,result){

		res.send(result);
	})

}


var server = app.listen(5000, function(){
    console.log('listening on port ', server.address().port)
})

function customParser(passedDocument) {
  var newString = S(JSON.parse(passedDocument)).replaceAll('\\','').s;

    newString = newString.match(/[^.!?\s][^.!?]*(?:[.!?](?!['")]?\s|$)[^.!?]*)*[.!?]?[')"]?(?=\s|$)/g);

    for (var i = 0; i < newString.length; i++){
      newString[i] = S(newString[i]).replaceAll('\\\'','\'').s;
    }
    return newString;
}
