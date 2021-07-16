//var print_queue = []
//var currently_printing = []
var notas = []
var printer = ""

function receiveMessage(event) {
  if (event && event.data && event.data.orq_printer)
    printer = event.data.orq_printer
}

function init() {

  setTimeout(qz_connect, 200);

  if (location.search.indexOf('wc_pip_action=print') > 0) {
    document.querySelector('a.woocommerce-pip-print').onclick = null;
    document.querySelector('#woocommerce-pip a.woocommerce-pip-print').addEventListener('click', function() {
      var data = [],
        pedidos = [];
      var body = document.querySelector('body');
      var btn = document.querySelector('a.woocommerce-pip-print');

      if (document.querySelector('body').classList.contains('packing-list')) {
        pedidos = document.querySelectorAll('body > div.container');
        pedidos.forEach(function(pedido) {
          body.removeChild(pedido);
        });
        body.removeChild(btn);
        for (var i = 0; i < pedidos.length; i++) {
          body.appendChild(pedidos[i]);
          data.push(
            { html: document.documentElement.outerHTML }
          );
          body.removeChild(pedidos[i]);
        }
        body.appendChild(btn);
        for (var i = 0; i < pedidos.length; i++) {
          body.appendChild(pedidos[i]);
        }
        for (var i = 0; i < data.length; i++)
          qz_print(data[i]);

      } else if (document.querySelector('body').classList.contains('pick-list')) {
        body.removeChild(btn);
        var job = {
          html: document.documentElement.outerHTML
        }
        body.appendChild(btn);
        qz_print(job);
      }
    });
    return;
  }

  /* Listen to XHR callbacks */
  var open = window.XMLHttpRequest.prototype.open,
    send = window.XMLHttpRequest.prototype.send

  function openReplacement(method, url, async, user, password) {
    this._url = url
    return open.apply(this, arguments)
  }

  function sendReplacement(data) {
    if (this.onreadystatechange) {
      this._onreadystatechange = this.onreadystatechange
    }
    this.onreadystatechange = onReadyStateChangeReplacement
    return send.apply(this, arguments)
  }

  function onReadyStateChangeReplacement() {
    if (this.readyState == 4 && this._url && this._url.includes('wp-json/wc-pos/orders/')) {
      try {
        var json = JSON.parse(this.response)
        if (json.status == 'processing' && json.created_via == 'POS') {
          var o = {
            id: json.id
          }
          //print_queue.push(o)
          notas[json.id] = o
          request_nf(o, true, true)
        }
      } catch (err) {

      }
    }
    if (this._onreadystatechange) {
      return this._onreadystatechange.apply(this, arguments)
    }
  }

  window.XMLHttpRequest.prototype.open = openReplacement
  window.XMLHttpRequest.prototype.send = sendReplacement

  /* Observe mutations */
  var target = document.querySelector('body')
  var config = {
    attributes: false,
    subtree: false,
    childList: true
  }
  var callback = function(list, observer) {
    for (el of list) {
      if (el.type == 'childList' && el.addedNodes && el.addedNodes.length == 1) {

        var nodes = document.querySelector('.q-dialog.fullscreen.no-pointer-events')
        if (nodes) {
          nodes = nodes.querySelectorAll('.q-dialog__inner div .q-card__actions button span.block')
          for (k of nodes) {
            if (k.textContent == 'Imprimir') {
              k.textContent = 'Imprimir Recibo'
              var parent = k.closest('button')
              var cloned = parent.cloneNode(true)
              cloned.querySelector('span.block').textContent = 'Imprimir NFC-e'
              parent.parentNode.insertBefore(cloned, parent)
              cloned.addEventListener('click', manual_print_nf)
            }
          }
        }
      }
    }
  }

  const observer = new MutationObserver(callback)
  observer.observe(target, config)
}

function manual_print_nf() {
  var s = document.querySelector('.q-dialog.fullscreen.no-pointer-events .q-dialog__inner div.row.q-card__section .text-body1').textContent.trim().replace('#','')
  var n = Number.parseInt(s)
  if (!isNaN(n)) {
    if (notas[n]) {
    if (notas[n].html)
      qz_print(notas[n])
    else if (notas[n].url)
      nf_html_get(notas[n])
    else
      request_nf(notas[n], true, true)
    } else {
      var job = {
        id : n
      }
      //print_queue.push(job)
      notas[n] = job
      request_nf(job, true, true)
    }
  }
}

function request_nf(job, should_print = false, emit = true) {
  var url = new URL(document.location.protocol + '//' + document.location.hostname + '/' + (document.location.pathname.includes('/wordpress/') ? 'wordpress/' : '') + 'wp-json/wc/v3/nota-fiscal/')
  url.search = new URLSearchParams({
    id: job.id
  })

  var headers = new Headers({
    "X-WP-Nonce": window.wc_pos_params.rest_nonce
  })

  fetch(url, {
      method: 'GET',
      headers: headers
    })
    .then(response => response.text())
    .then(response => {
      var responseJSON
      try {
        responseJSON = JSON.parse(response)
      } catch (err) {
        try {
          responseJSON = JSON.parse(response.substr(response.indexOf('['), response.lastIndexOf(']')))
        } catch (err) {
        }
      }
      if (Array.isArray(responseJSON))
        responseJSON = responseJSON[0]
      if (responseJSON && responseJSON.uuid && (responseJSON.status == 'aprovado' || responseJSON.status == 'processamento' || responseJSON.status == 'contingencia')) {
		if (responseJSON.danfe)
			job.url = responseJSON.danfe.replace('http:', 'https:')
		else if (responseJSON.url_danfe)
			job.url = responseJSON.url_danfe.replace('http:', 'https:')
        job.status = responseJSON.status
        if (should_print)
          nf_html_get(job)
        else
          console.error('Erro ao emitir nota fiscal')
      }
    })
    .catch((err, a, b, c) => {
      console.error(err)
    })
}

function nf_html_get(job) {
  var url = new URL(job.url)

  fetch(url, {
      method: 'GET',
    })
    .then(response => response.text())
    .then(responseText => {
      job.html = responseText
      qz_print(job)
    })
    .catch(err => console.error(err))
}

function qz_connect() {
  return new RSVP.Promise(function(resolve, reject) {
    if (qz.websocket.isActive()) { // if already active, resolve immediately
      resolve()
    } else {
      // try to connect once before firing the mimetype launcher
      qz.websocket.connect().then(resolve, function retry() {
        // if a connect was not succesful, launch the mimetime, try 3 more times
        window.location.assign("qz:launch")
        qz.websocket.connect({
          retries: 2,
          delay: 1
        }).then(resolve, reject)
      })
    }
  })
}

function qz_print(job) {
  var options = {}
  var config = qz.configs.create(printer, options)
  var data = [{
    type: 'pixel',
    format: 'html',
    flavor: 'plain',
    data: job.html
  }]

  // return the promise so we can chain more .then().then().catch(), etc.
  return qz_connect().then(function() {
    qz.print(config, data).catch(function(e) {
      console.error(e)
    }).then(function(e) {
    })
  })
}

window.addEventListener("message", receiveMessage, false)

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
  init()
} else
  document.addEventListener('DOMContentLoaded', function() {
    init()
  })

console.log('Injected script loaded')
