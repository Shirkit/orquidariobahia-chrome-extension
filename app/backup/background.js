const HOST_NAME = "br.com.orquidariobahia.companion";
var connection = null;
var bugout = new debugout();
bugout.useLocalStorage = true;

chrome.webRequest.onCompleted.addListener(function (details) {
  console.log(details)

  if (details.url.includes('wp-json/wc/v3/pos_orders/')) {
    try {
      var json = JSON.parse(this.response)
      if (json.status == 'processing' && json.created_via == 'POS') {
        var o = {
          id: json.id,
          total: json.total,
          time: new Date(),
          receipt: json.print_url
        };
        print_queue.push(o)
        notas.unshift(o)
        request_nf(o, true, true)
      }
    } catch (err) {

    }
  }

}, {urls: ['<all_urls>']});

function onMessageExternal(message) {
  bugout.log('Message received from External:' + JSON.stringify(message));
}

function onDisconnectExternal() {
  connection = null;
}

chrome.runtime.onConnectExternal.addListener(
  function(port) {
    if (connection === null) {
      connection = port;
      connection.onDisconnect.addListener(onDisconnectExternal);
      connection.onMessage.addListener(onMessageExternal);

      return true;
    }
  }
);

bugout.log('Background extension loaded');
