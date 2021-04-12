const EXTENSION_ID = 'blejmlgjkiefemelbggaackbadlajdhg';

var scripts = [
  "injected.js", "node_modules/qz-tray/qz-tray-v2.1.js", "deps/rsvp-3.1.0.min.js", "deps/sha-256.min.js"
]

for (var i = 0; i < scripts.length; i++) {
  var s = document.createElement('script');
  s.src = chrome.runtime.getURL(scripts[i]);
  (document.head || document.documentElement).appendChild(s);
}

chrome.storage.local.onChanged.addListener((changes, areaName) => {
  if (changes.qz_selected_printer) {
    window.postMessage({orq_printer:changes.qz_selected_printer.newValue})
  }
})

chrome.storage.local.get('qz_selected_printer', function(a) {
  window.postMessage({orq_printer: a['qz_selected_printer']})
  setTimeout(() => {
    window.postMessage({orq_printer: a['qz_selected_printer']})
  }, 100)
  setTimeout(() => {
    window.postMessage({orq_printer: a['qz_selected_printer']})
  }, 5000)
})

console.log('Content script loaded')
