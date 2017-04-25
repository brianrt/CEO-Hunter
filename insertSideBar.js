(function () {
  var extensionDiv = null;
  var body;
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if(extensionDiv === null) {
        body                   = request.message;
        extensionDiv           = document.createElement('div');
        extensionDiv.id        = 'ceo-hunter-extension';
        extensionDiv.innerHTML = body;
        document.getElementsByTagName('body')[0].appendChild(extensionDiv);
        var button = document.getElementById('test_button');
        console.log(button);
        document.getElementById('test_button').setAttribute("onclick", 'console.log("Plz work!")');
      }

      /*if (request.greeting == "initial load") {
        body                   = request.message;
        extensionDiv           = document.createElement('div');
        extensionDiv.id        = 'ceo-hunter-extension';
        extensionDiv.innerHTML = body;
        document.documentElement.appendChild(extensionDiv);
      }*/
      if (request.greeting == "update data") {
        var body               = request.message;
        extensionDiv.innerHTML = body;
      }
      else if (request.greeting == "toggle off") {
        console.log("toggle off");
        // extensionDiv.innerHTML = "";
        extensionDiv.style.display = "none";
      }
      else if (request.greeting == "toggle on") {
        console.log("toggle on");
        extensionDiv.innerHTML   = request.message;
        extensionDiv.style.display = "block";
      }
    });
})();