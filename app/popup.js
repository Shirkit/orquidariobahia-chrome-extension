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
  var data = {}
  data['qz_selected_printer'] = document.querySelector('select').value
  chrome.storage.local.set(data)
  document.querySelector('button').textContent += " +"
}

if (typeof qz !== 'undefined')
  qz_connect().then(function() {
    qz.printers.find().then(function(data) {
      var ss = document.querySelector('select')
      for (var i = 0; i < data.length; i++) {
        var opt = document.createElement('OPTION')
        opt.value = data[i]
        opt.text = data[i]
        ss.appendChild(opt)
      }
      chrome.storage.local.get('qz_selected_printer', function(a) {
        ss.value = a['qz_selected_printer']
      })
    })
  })

document.querySelector('button').addEventListener('click', qz_save)
