const HOST_NAME = "br.com.orquidariobahia.companion";
var native = null;
var connection = null;
var bugout = new debugout();
bugout.useLocalStorage = true;

function onNativeMessage(message) {
  bugout.log('Message received from Native:' + message);
  var response = {}
  if (message === null) {
    console.log('Null message received from native.');
  } else {
    message = JSON.parse(message);
    switch (message.result) {
      case :"-107":
        response.response = 'update';
        response.message = orquidario_messages['update'];
        break;
      case "0":
        response.response = 'pay_ok';
        response.message = orquidario_messages['pay_ok'];
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
        response.message = orquidario_messages['pay_fatal'];
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
        response.message = orquidario_messages['pay_tryagain'];
        break;
      case "-1004":
        response.response = 'pay_error';
        response.message = orquidario_messages['pay_error_1004'];
        break;
      case "-1020":
        response.response = 'pay_error';
        response.message = orquidario_messages['pay_error_1020'];
        break;
      case "-2001":
      case "-2002":
      case "-2003":
      case "-2005":
        response.response = 'pay_error';
        response.message = orquidario_messages['pay_error_bluetooth'];
        break;
      default:
        response.response = 'unkown_error';
        response.message = orquidario_messages['unkown_error'];
        break;
    }
    connection.postMessage(response);
  }
}


function onMessageExternal(message) {
  bugout.log('Message received from External:' + JSON.stringify(message));
  if (message.action === 'pay') {
    if (!message.amount || !message.paymentMethod) {
      connection.postMessage({
        response: 'pay_fatal',
        message: orquidario_messages['pay_fatal']
      })
    } else {
      setTimeout(function() {
        native.postMessage(message);
        //connection.postMessage(JSON.parse('{"response":"pay_ok","message":"Transação autorizada","data":{"transactionCode":"1A8D27707D7D4428957FD4DC6B62020F","date":"2019-07-06","time":"15:34:38","hostNsu":"70600011698","cardBrand":"MASTERCARD","bin":"516292","holder":"8357","userReference":"UserRef","terminalSerialNumber":"1260091723"}}'));
      }, 7000);
    }
  } else {
    connection.postMessage({
      response: 'unkown_error',
      message: orquidario_messages['unkown_error']
    });
    console.error(message);
  }
}

function onDisconnectExternal() {
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
      message: orquidario_messages['connect_error']
    });
    connection.disconnect();
    connection = null;
  }
}

chrome.runtime.onConnectExternal.addListener(
  function(port) {
    if (connection === null) {
      connection = port;
      connection.onMessage.addListener(onMessageExternal);
      connection.onDisconnect.addListener(onDisconnectExternal);

      native = chrome.runtime.connectNative(HOST_NAME);
      native.onMessage.addListener(onNativeMessage);
      native.onDisconnect.addListener(onNativeDisconnect);

      setTimeout(function() {
        if (connection != null && native != null)
          port.postMessage({
            response: 'connect_ok',
            message: orquidario_messages['connect_ok']
          });
      }, 1000);
      return true;
    } else {
      port.postMessage({
        response: 'connect_busy',
        message: orquidario_messages['connect_busy']
      });
      port.disconnect();
      return false;
    }
  });

bugout.log('Background extension loaded');