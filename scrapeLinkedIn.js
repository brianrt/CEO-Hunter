var sign_in = document.getElementsByClassName("nav-link");
for(var i = 0; i < sign_in.length;i++){
	if(sign_in[i].innerHTML.trim()=="Sign In"){
		alert("Please sign in to LinkedIn in a new tab. Then go back to the original webpage and try again.");
		window.close();
	}
	console.log('"'+sign_in[i].innerHTML.trim()+'"');
}
var result = document.getElementsByClassName("more")[0];
if(result==null){
	result = document.getElementsByClassName("snackbar-description-see-all-link")[0];
	console.log(result);
}
var url = result.getAttribute("href");
chrome.runtime.sendMessage({
	greeting: "company linkedin page",
	message: url
});
window.close();