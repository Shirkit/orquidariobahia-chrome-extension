const hostName = "com.google.chrome.example.echo";
var native = null;
var connection = null;

function onNativeMessage(message) {
  var response = {}
  if (message === null) {
    console.log('Null message received from native.');
  } else {
    message = JSON.parse(message);
    switch (message.result) {
      case "0":
        response.response = 'pay_ok';
        response.message = 'Transação autorizada';
        response.data = message.data
        break;
      case "-1001":
      case "-1002":
      case "-1006":
      case "-1007":
      case "-1008":
      case "-1009":
      case "-1010":
      case "-1011":
      case "-1012":
      case "-1013":
      case "-1015":
      case "-1016":
      case "-1017":
      case "-2022":
      case "-2023":
      case "-2024":
      case "-2026":
      case "-2029":
      case "-2030":
      case "-2031":
      case "-2032":
      case "-2036":
      case "-2037":
      case "-2038":
      case "-3000":
        response.response = 'pay_fatal';
        response.message = message + ' | Erro fatal. Favor salvar o log e contactar suporte.';
        break;
      case "-1003":
      case "-1005":
      case "-1014":
      case "-1018":
      case "-1019":
      case "-2004":
      case "-2027":
      case "-2028":
      case "-2033":
        response.response = 'pay_tryagain';
        response.message = message + ' | Falha na transação. Favor tentar novamente.';
        break;
      case "-1004":
        response.response = 'pay_error';
        response.message = message + ' | Erro na transação. Favor ver o terminal.';
        break;
      case "-1020":
        response.response = 'pay_error';
        response.message = message + ' | O terminal não pode estar no modo compartilhado.';
        break;
      case "-2001":
      case "-2002":
      case "-2003":
      case "-2005":
        response.response = 'pay_error';
        response.message = message + ' | Erro de conexão bluetooth. Não é possível realizar a conexão.';
        break;
      default:
        response.response = 'unkown_error';
        response.message = message;
        break;
    }
    connection.postMessage(response);
  }
}


function onMessage(message) {
  if (message.action === 'pay') {
    if (!message.amount || !message.paymentMethod) {
      connection.postMessage({
        response: 'pay_fatal',
        message: 'Valor ou método de pagamento não informado.'
      })
    } else {
      connection.postMessage(JSON.parse('{"response":"pay_ok","message":"Transação autorizada","data":{"transactionCode":"1A8D27707D7D4428957FD4DC6B62020F","date":"2019-07-06","time":"15:34:38","hostNsu":"70600011698","cardBrand":"MASTERCARD","bin":"516292","holder":"8357","userReference":"UserRef","terminalSerialNumber":"1260091723"}}'));
      //native.postMessage(message);
    }
  } else {
    connection.postMessage({
      response: 'unkown_error',
      message: 'Ação inválida. Por favor, falar com o suporte.'
    });
  }
}

function onDisconnect() {
  connection = null;
  if (native !== null) {
    native.disconnect();
  }
}

function onNativeDisconnect() {
  native = null;
  if (connection !== null) {
    connection.postMessage({
      response: 'connect_error',
      message: 'O terminal desconectou. Favor tentar novamente.'
    });
    connection.disconnect();
    connection = null;
  }
}

chrome.runtime.onConnect.addListener(
  function(port) {
    if (connection === null) {
      connection = port;
      connection.onMessage.addListener(onMessage);
      connection.onDisconnect.addListener(onDisconnect);

      native = chrome.runtime.connectNative(hostName);
      native.onMessage.addListener(onNativeMessage);
      native.onDisconnect.addListener(onNativeDisconnect);

      port.postMessage({
        response: 'connect_ok'
      });
      return true;
    } else {
      console.log("Someone is already connected");
      port.postMessage({
        response: 'connect_busy'
      });
      port.disconnect();
      return false;
    }
  });

console.log('Background extension loaded');
