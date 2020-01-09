const EXTENSION_ID = 'blejmlgjkiefemelbggaackbadlajdhg';

var port = null;
var blocker = null;
var is_processing = false;
var print_queue = [];
var currently_printing = [];
var notas = [];

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
        window.postMessage({
          message: 'pay_ok',
          data: message.data
        });
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

  var wrapper = document.querySelector('#modal-order_payment #payment_switch_wrap');
  var nfce = document.createElement('input');
  wrapper.insertBefore(nfce, null);
  nfce.outerHTML = `<input type="checkbox" class="payment_switch" value="yes" name="payment_emit_nfce" id="payment_emit_nfce" data-animate="true" data-label-text="<span class='payment_switch_label_terms'>Emitir;;</span>" data-on-text="Yes" data-off-text="No" checked="true"'>`;

  var pp = document.createElement('input');
  wrapper.insertBefore(pp, null);
  pp.outerHTML = `<input type="checkbox" class="payment_switch" value="yes" name="payment_print_nfce" id="payment_print_nfce" data-animate="true" data-label-text="<span class='payment_switch_label'>NFC-e;;</span>" data-on-text="Yes" data-off-text="No" checked="true"'>`;

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

  document.querySelector('#wc-pos-register-buttons .wc_pos_register_pay').addEventListener('click', function() {
    connect();

    if (document.querySelector("#pos_chip_pin #generate_order_id").style.display == 'none') {
      document.querySelector('.payment_method_pos_chip_pin .try_again-chip-pin').style.display = 'block';
    } else {
      document.querySelector('.payment_method_pos_chip_pin .try_again-chip-pin').style.display = 'none';
    }

    if (document.querySelector("#pos_chip_pin2 #generate_order_id").style.display == 'none') {
      document.querySelector('.payment_method_pos_chip_pin2 .try_again-chip-pin').style.display = 'block';
    } else {
      document.querySelector('.payment_method_pos_chip_pin2 .try_again-chip-pin').style.display = 'none';
    }
  });

  document.querySelector('#modal-order_payment .payment_method_pos_chip_pin .pos_chip_pin_order_id div.pos_chip_pin_order_generate a').addEventListener(
    'click',
    function(e) {
      document.querySelector('.payment_method_pos_chip_pin .try_again-chip-pin').style.display = 'block';
      is_processing = true;
      sendPayMessage('credit');
      blockOrWaitBlock(this);
    });

  document.querySelector('#modal-order_payment .payment_method_pos_chip_pin2 .pos_chip_pin_order_id div.pos_chip_pin_order_generate a').addEventListener(
    'click',
    function(e) {
      document.querySelector('.payment_method_pos_chip_pin2 .try_again-chip-pin').style.display = 'block';
      is_processing = true;
      sendPayMessage('debit');
      blockOrWaitBlock(this);
    });

  var jQueryTimer = setInterval(function() {
    if (window.jQuery) {

      clearInterval(jQueryTimer);

      jQuery(document).ajaxSuccess(function(evt, xhr, settings) {
        // TODO: logging
        if (settings.url.includes('wp-json/wc/v3/pos_orders/') && xhr.responseJSON.status == 'completed') {
          var o = {
            id: xhr.responseJSON.id,
            total: xhr.responseJSON.total,
            time: new Date(),
            receipt: xhr.responseJSON.print_url
          };
          print_queue.push(o);
          notas.unshift(o);
          request_nf(o, jQuery('#payment_print_nfce').bootstrapSwitch('state'), jQuery('#payment_emit_nfce').bootstrapSwitch('state'));
        }
      });

      jQuery(document).ajaxError(function(event, xhr, settings) {
        // TODO: logging
        if (settings.url.includes('wp-json/wc/v3/pos_orders/')) {
          try {
            var obj = JSON.parse(xhr.responseText.substr(xhr.responseText.indexOf('['), xhr.responseText.lastIndexOf(']')));
            if (obj.status == 'completed') {
              debugger;
              var o = {
                id: obj.id,
                total: obj.total,
                time: new Date(),
                receipt: obj.print_url
              };
              print_queue.push(o);
              notas.unshift(o);
              request_nf(o, jQuery('#payment_print_nfce').bootstrapSwitch('state'), jQuery('#payment_emit_nfce').bootstrapSwitch('state'));
            }
          } catch (e) {}
        }
      });

      jQuery('#wc-pos-actions #add_product_to_register').after('<a class="button" id="printer_select" href="#">Impressora</a>');

      jQuery('#wc-pos-actions #printer_select').click(qz_config);

      jQuery('#modal-printer_select #save_selected_printer').click(qz_save);

      jQuery('#payment_switch_wrap .payment_switch').bootstrapSwitch();

      jQuery('#modal-order_payment .pos_end_toggles .bootstrap-switch span span').each(function() {
        jQuery(this).text(jQuery(this).text().replace(';;',''));
        jQuery(this).text(jQuery(this).text().replace('Print','Recibo'));
      });
    }
  }, 100);
}

function qz_connect() {
  return new RSVP.Promise(function(resolve, reject) {
    if (qz.websocket.isActive()) { // if already active, resolve immediately
      resolve();
    } else {
      // try to connect once before firing the mimetype launcher
      qz.websocket.connect().then(resolve, function retry() {
        // if a connect was not succesful, launch the mimetime, try 3 more times
        window.location.assign("qz:launch");
        qz.websocket.connect({
          retries: 2,
          delay: 1
        }).then(resolve, reject);
      });
    }
  });
}

function qz_save() {
  localStorage.setItem('qz_selected_printer', JSON.stringify(jQuery('select#selected_printer option:selected').text()));
  displayMessageToUser('Impressora salva.', 'success');
  closeModal('modal-printer_select');
}

function request_nf(job, should_print = false, emit = true) {
  // TODO: handle if server refused to generate
  jQuery.ajax({
    url: '../../../wp-json/wc/v3/nota-fiscal',
    data: {
      id: job.id,
      force: emit
    },
    timeout: 0
  }, ).done(function(event, xhr, settings) {
    // TODO: logging
    if (event[0].status == 'aprovado' && event[0].uuid) {
      job.url = event[0].url_danfe;
      if (should_print)
      nf_html_get(job);
    } else {
      // TODO: o que fazer quando a nota não emitir
    }
  }).fail(function(evt) {
    // TODO: logging
    try {
      var obj = JSON.parse(evt.responseText.substr(evt.responseText.indexOf('['), evt.responseText.lastIndexOf(']')));
      if (obj[0].status == 'aprovado' && obj[0].uuid) {
        job.url = obj[0].url_danfe;
        if (should_print)
          nf_html_get(job);
      } else {
        // TODO: o que fazer quando a nota não emitir
      }
    } catch (e) {
      // TODO: Logging
    }
  });
}

function nf_html_get(job) {
  var header = jQuery.ajaxSettings.headers["X-WP-Nonce"];
  delete jQuery.ajaxSettings.headers["X-WP-Nonce"]
  jQuery.ajax({
    url: job.url,
    timeout: 0
  }, ).done(function(evt, xhr, settings) {
    // TODO: logging
    job.html = evt;
    qz_print(job);
  }).fail(function(evt) {
    // TODO: logging
  });
  jQuery.ajaxSettings.headers["X-WP-Nonce"] = header;
}

function qz_config() {
  if (qz) {
    openModal('modal-printer_select');
    jQuery('#modal-printer_select select#selected_printer').empty();
    qz_connect().then(function() {
      qz.printers.find().then(function(data) {
        for (var i = 0; i < data.length; i++) {
          jQuery('#modal-printer_select select#selected_printer').append(jQuery('<option>', {
            value: data[i],
            text: data[i]
          })).val(JSON.parse(localStorage.getItem('qz_selected_printer')));
        }
      });
    });

    var table = document.querySelector('#modal-printer_select table#past_orders').getElementsByTagName('tbody')[0];
    while (table.rows.length > 0) {
      table.deleteRow(0);
    }
    for (var i = 0; i < notas.length && i < 10; i++) {
      var row = table.insertRow(0);
      row.insertCell(0).innerHTML = notas[i].id;
      row.insertCell(1).innerHTML = notas[i].total;
      row.insertCell(2).innerHTML = notas[i].time.toLocaleTimeString();
      var btn = document.createElement('div');
      btn.className = 'wrap-button';
      txt = '<button class="button button-primary wp-button-large alignright manual-print-order-receipt" onclick="manual_print_receipt(' + notas[i].id + ')" type="button">Recibo</button>';
      if (notas[i].url)
        txt += ' - <button class="button button-primary wp-button-large alignright manual-print-order-nf" onclick="manual_print_nf(' + notas[i].id + ')" type="button">Imprimir NFC-e</button>';
      if (!notas[i].url)
        txt += ' - <button class="button button-primary wp-button-large alignright manual-print-order-receipt" onclick="manual_print_nf(' + notas[i].id + ')" type="button">Emitir NFC-e</button>';
      btn.innerHTML = txt;
      row.insertCell(3).innerHTML = btn.outerHTML;
    }

  } else
    displayMessageToUser('Módulo de Impressão não encontrado', 'warning');
}

function manual_print_nf(id) {
  for (var i = 0; i < notas.length; i++) {
    if (notas[i] && notas[i].id == id) {
      if (notas[i].html)
        qz_print(notas[i]);
      else if (notas[i].url)
        nf_html_get(notas[i]);
      else
        request_nf(notas[i], true, true);
      break;
    }
  }
}

function manual_print_receipt(id) {
  for (var i = 0; i < notas.length; i++) {
    if (notas[i] && notas[i].id == id) {
      posPrintReceipt(notas[i].receipt, false);
    }
  }
}

// print logic
function qz_print(job) {
  var printer = JSON.parse(localStorage.getItem('qz_selected_printer'));
  var options = {
  };
  var config = qz.configs.create(printer, options);
  var data = [{
    type: 'html',
    format: 'plain',
    data: job.html
  }];

  currently_printing.push(job);
  print_queue.splice(print_queue.indexOf(job), 1);

  // return the promise so we can chain more .then().then().catch(), etc.
  return qz_connect().then(function() {
    qz.print(config, data).catch(function(e) {
      print_queue.unshift(job);
      currently_printing.splice(currently_printing.indexOf(job), 1);
      displayMessageToUser('Erro ao imprimir NFC-e: ' + e, 'error');
    }).then(function(e) {
      currently_printing.splice(currently_printing.indexOf(job), 1);
    });
  });
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
  init();
} else
  document.addEventListener('DOMContentLoaded', function() {
    init();
  });

console.log('Content script loaded');
