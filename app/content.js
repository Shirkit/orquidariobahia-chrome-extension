var scripts = [
  "main.js", "node_modules/qz-tray/qz-tray-v2.1.js", "deps/rsvp-3.1.0.min.js", "deps/sha-256.min.js"
];

for (var i = 0; i < scripts.length; i++) {
  var s = document.createElement('script');
  s.src = chrome.runtime.getURL(scripts[i]);
  (document.head || document.documentElement).appendChild(s);
}
