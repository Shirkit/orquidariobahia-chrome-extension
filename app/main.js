var port = null;

function sendMessage(method) {
  var message = {};

  message.action = 'pay';
  message.amount = document.querySelector('#modal-order_payment .topaytop .amount').innerText.toString();
  message.paymentMethod = method;

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
  if (port == null) {
    port = chrome.runtime.connect();
    port.onDisconnect.addListener(onDisconnect);
    port.onMessage.addListener(onMessage);
  }
}

document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#wc-pos-register-buttons .wc_pos_register_pay').addEventListener(
    'click', connect);

  document.getElementById('#modal-order_payment .payment_method_pos_chip_pin2 .pos_chip_pin_order_id div.pos_chip_pin_order_generate a').addEventListener(
    'click',
    function(e) {
      sendMessage('credit');
    });

  document.getElementById('#modal-order_payment .payment_method_pos_chip_pin2 .pos_chip_pin_order_id div.pos_chip_pin_order_generate a').addEventListener(
    'click',
    function(e) {
      sendMessage('debit');
    });
});

console.log('Content script loaded');
