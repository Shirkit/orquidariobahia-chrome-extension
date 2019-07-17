const EXTENSION_ID = 'oohlefcejeepmkpmfdcielfihhcclphh';

var port = null;
var blocker = null;
var is_processing = false;

function sendPayMessage(method) {
  var message = {};

  message.action = 'pay';
  message.amount = document.querySelector('#modal-order_payment .topaytop .amount').innerText.toString();
  message.paymentMethod = method;

  port.postMessage(message);
}

function displayMessageToUser(message, level, permanent = false) {
  var opt = {};
  if (permanent) {
    opt.timeout = 0;
    opt.extendedTimeOut = 0
  }
  switch (level) {
    case 'error':
      toastr.error(message, null, opt);
      break;
    case 'warning':
      toastr.warning(message, null, opt);
      break;
    case 'info':
      toastr.info(message, null, opt);
      break;
    case 'success':
      toastr.success(message, null, opt);
      break;

  }
}

function onMessage(message) {

  if (message === null) {
    console.log('null message received');

  } else {
    switch (message.response) {
      case 'connect_busy':
        displayMessageToUser(message.message, 'error', true);
        break;

      case 'connect_ok':
        displayMessageToUser(message.message, 'info');
        break;

      case 'connect_error':
        displayMessageToUser(message.message, 'error', true);
        break;

      case 'pay_ok':
        is_processing = false;
        blocker.unblock();
        displayMessageToUser(message.message, 'success');
        window.postMessage({message : 'pay_ok', data : message.data});
        break;

      case 'pay_tryagain':
        is_processing = false;
        blocker.unblock();
        displayMessageToUser(message.message, 'warning', true);
        break;

      case 'pay_error':
        is_processing = false;
        blocker.unblock();
        displayMessageToUser(message.message, 'warning', true);
        break;

      case 'pay_fatal':
        is_processing = false;
        blocker.unblock();
        displayMessageToUser(message.message, 'error', true);
        break;

      default:
        console.log('unkown message received');
        console.log(message);
        break;
    }
  }
}

function onDisconnect() {
  if (is_processing) {

  } else {
    port = null;
    blocker = null;
  }
}

function connect() {
  if (port == null) {
    port = chrome.runtime.connect(EXTENSION_ID);
    port.onDisconnect.addListener(onDisconnect);
    port.onMessage.addListener(onMessage);
  }
}

function blockOrWaitBlock() {
  jQuery('body').on('click', '.cancel-pos-chip-pin', function(e) {
    blocker.unblock();
    is_processing = false;
  });

  if (blocker == null)
    blocker = jQuery('#modal-order_payment');

  var nTimer = setInterval(function() {
    if (blocker.data('blockUI.isBlocked') != 1) {
      if (is_processing)
        blocker.block({
          message: '<div class="wrapper-cancel-chip-pin">Terminar transação no Terminal.<button class="button cancel-pos-chip-pin">Cancelar</button></div>',
          overlayCSS: {
            background: '#666',
            opacity: 0.4
          },
          timeout: 0
        });
      clearInterval(nTimer);
    }
  }, 100);
}

function init() {

  var arr = document.querySelectorAll('.payment_method_pos_chip_pin .pos_chip_pin_order_id, .payment_method_pos_chip_pin2 .pos_chip_pin_order_id');
  for (var i = 0; i < arr.length; i++) {
    var el = arr[i];
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<input name="" type="button" class="try_again-chip-pin" value="Tentar novamente">';
    el.parentElement.insertBefore(wrapper.firstChild, null);
  }

  document.querySelector('.payment_method_pos_chip_pin .try_again-chip-pin').addEventListener('click', function(e) {
    if (document.querySelector("#pos_chip_pin #generate_order_id").style.display == 'none') {
      is_processing = true;
      sendPayMessage('credit');
      blockOrWaitBlock(this);
    } else
      APP.showNotice(pos_i18n[59], 'error');
  });

  document.querySelector('.payment_method_pos_chip_pin2 .try_again-chip-pin').addEventListener('click', function(e) {
    if (document.querySelector("#pos_chip_pin2 #generate_order_id").style.display == 'none') {
      is_processing = true;
      sendPayMessage('debit');
      blockOrWaitBlock(this);
    } else
      APP.showNotice(pos_i18n[59], 'error');
  });

  document.querySelector('#wc-pos-register-buttons .wc_pos_register_pay').addEventListener('click', connect);

  document.querySelector('#modal-order_payment .payment_method_pos_chip_pin .pos_chip_pin_order_id div.pos_chip_pin_order_generate a').addEventListener(
    'click',
    function(e) {
      is_processing = true;
      sendPayMessage('credit');
      blockOrWaitBlock(this);
    });

  document.querySelector('#modal-order_payment .payment_method_pos_chip_pin2 .pos_chip_pin_order_id div.pos_chip_pin_order_generate a').addEventListener(
    'click',
    function(e) {
      is_processing = true;
      sendPayMessage('debit');
      blockOrWaitBlock(this);
    });
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
  init();
} else
  document.addEventListener('DOMContentLoaded', function() {
    init();
  });

console.log('Content script loaded');
