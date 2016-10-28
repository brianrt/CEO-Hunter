var results = document.getElementsByClassName("r")[0];
var div = results.getElementsByTagName("a")[0];
var url = div.getAttribute("href");
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	sendResponse({farewell: url});
});