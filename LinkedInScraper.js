var result = document.getElementsByClassName("more")[0];
var url = result.getAttribute("href");
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	sendResponse({farewell: url});
});

