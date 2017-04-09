var sign_in = document.getElementsByClassName("nav-link");
for(var i = 0; i < sign_in.length;i++){
	if(sign_in[i].innerHTML.trim()=="Sign In"){
		alert("Please sign in to LinkedIn in a new tab. Then go back to the original webpage and try again.");
		window.close();
	}
	console.log('"'+sign_in[i].innerHTML.trim()+'"');
}
var sign_in_two = document.getElementsByClassName("title")[0];
if(sign_in_two!=undefined && sign_in_two.innerHTML=="Make the most of your professional life"){
	alert("Please sign in to LinkedIn in a new tab. Then go back to the original webpage and try again.");
	window.close();
}
var sign_in_three = document.getElementsByClassName("join-linkedin-form float-label-form")[0];
if(sign_in_three!=undefined){
	alert("Please sign in to LinkedIn in a new tab. Then go back to the original webpage and try again.");
	window.close();
}
// console.log("hi there!");
// var html = document.body.innerHTML;
// console.log(html);
var result = document.getElementsByClassName("more")[0];
if(result==undefined){
	result = document.getElementsByClassName("snackbar-description-see-all-link")[0];
	if(result==undefined){
		window.close();
	}
	console.log(result);
}
var url = result.getAttribute("href");
if(result==undefined){
	window.close();
}
chrome.runtime.sendMessage({
	greeting: "company linkedin page",
	message: "https://www.linkedin.com"+url
});
window.close();