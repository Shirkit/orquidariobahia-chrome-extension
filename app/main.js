var editorExtensionId = "knldjmfmopnpolahpmmgbagdohdnhkik";
var port = null;

function sendMessage() {
  var message = {};

  message.action = 'pay';
  message.amount = document.getElementById('input-text').value;
  message.paymentMethod = 'credit';

  port.postMessage(message);
}

function onMessage(message) {
  if (message === null) {
    console.log('null message received');
  } else if (message.response === 'connect_busy') {
    console.error('Busy');
  } else if (message.response === 'connect_ok') {
    console.log(message);
  } else if (message.response === 'connect_error') {
    console.error('Connection error: ' + message.message);
  } else if (message.response === 'pay_ok') {
    console.log(message.message);
    console.log(message.data);
    console.log(JSON.stringify(message));
  } else if (message.response === 'pay_tryagain') {
    console.log(message.message);
  } else if (message.response === 'pay_error') {
    console.log(message.message);
  } else if (message.response === 'pay_fatal') {
    console.error('Fatal error: ' + message.message);
  } else if (message.response === 'unkown_error') {
    console.error('Unkown error: ' + message.message);
  } else {
    console.log('unkown message received');
    console.log(message);
  }
}

function onDisconnect() {
  console.log('Disconnected');
}

function connect() {
  port = chrome.runtime.connect(editorExtensionId);
  port.onDisconnect.addListener(onDisconnect);
  port.onMessage.addListener(onMessage);
}

document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('connect-button').addEventListener(
    'click', connect);

  document.getElementById('send-message-button').addEventListener(
    'click', sendMessage);
});

console.log('Content script loaded');
