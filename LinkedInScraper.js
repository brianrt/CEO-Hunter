var url;
setTimeout(function(){ 
	var sign_in = document.getElementsByClassName("nav-link");
	for(var i = 0; i < sign_in.length;i++){
		if(sign_in[i].innerHTML.trim()=="Sign In"){
			sign_in[i].style="font-size: 38px;color: red;";
			sign_in[i].innerHTML="-> Sign In <-";
			url = "failure";
			alert("Please sign in to LinkedIn. Then go back to the original webpage and try again.");
		}
		console.log('"'+sign_in[i].innerHTML.trim()+'"');
	}
},0000);

var result = document.getElementsByClassName("more")[0];
url = result.getAttribute("href");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	console.log(url);
	sendResponse({farewell: url});
});

