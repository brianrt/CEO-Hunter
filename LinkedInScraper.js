var companyname = "";
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	companyname = request.greeting;
  	// alert();
    console.log(request.greeting);
    var searchbox = document.getElementById('main-search-box');
	searchbox.value = companyname;
	searchbox.focus();
	var searchbutton = document.getElementsByName('search')[0];
	searchbutton.click();
	sendResponse({farewell: "done"});
});

