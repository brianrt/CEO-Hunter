var results = document.getElementsByClassName("r")[0];
var div = results.getElementsByTagName("a")[0];
var url = div.getAttribute("href");
chrome.runtime.sendMessage({
  greeting: "search result",
  message: url
});
window.close();