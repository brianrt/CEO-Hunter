var results = document.getElementsByClassName("r")[0];
try{
	var div = results.getElementsByTagName("a")[0];
	var url = div.getAttribute("href");
	chrome.runtime.sendMessage({
	  greeting: "search result",
	  message: url
	});
}
catch(err){
	console.log("there was an error: "+err.message);
}
window.close();