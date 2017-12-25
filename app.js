/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

'use strict';

// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

const  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      // Determine Senders Page scoped ID ......
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
      
      // Determine whether the event is a message or postback
      // And then call appropriate function ........
      if(webhook_event.message){
        handleMessage(sender_psid,webhook_event.message);
      }
      else if(webhook_event.postback){
        handlePostback(sender_psid,webhook_event.message);
      }
      
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "hello-this-is-gideon";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check 1766550c4b5b9dc2b1da9592e9a4403e the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

// This function handles messages events ......
function handleMessage(sender_psid, recieved_message){
 
  let response;
  
  if(recieved_message.text){
     
    // Create a plaload for a basic text message .....
    response = {
     'text' : 'You Messaged: ' + recieved_message.text 
    }
    
  }
  else if(recieved_message.attachments){
    
    // Get the URL of message attachments ........
    let attachment_url = recieved_message.attachments[0].payload.url;
    
  }
  
  callSendAPI(sender_psid, response);
  
}

// Handles messaging_postbacks events ........
function handlePostback(sender_psid, recieved_postback){
  
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response){
  
  // Construct the message body .......
  let request_body = {
    
    'recipient': {
      'id': sender_psid
    },
    'message' : response
    
  }
  
  request({
    
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': request_body
  
  }, (err, res, body) => {
    
    if(!err){
       
      console.log('message sent!');
      
    }
    else{
     
      console.error('Unable to send message: ' + err );
      
    }
    
  });
  
}