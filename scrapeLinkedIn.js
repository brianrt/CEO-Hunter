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
var html = document.body.innerHTML;
console.log(html);
if(html.indexOf("/search/results/people/?facet")==-1){
	console.log("The link was not found, method doesn't work for this site");
	//window.close();
}
else{
	console.log("It worked");
	var link = html.substring(html.indexOf("/search/results/people/?facet"));
	link = "https://www.linkedin.com"+link.substring(0,link.indexOf("\""));
	console.log(link);
}
// var link = html.substring(html.indexOf("/search/results/people/?facet"));
// if(link==null){
// 	console.log("The link was null, method doesn't work for this site");
// }
// else{
// 	link = "https://www.linkedin.com"+link.substring(0,link.indexOf("\""));
// 	console.log(link);
// 	chrome.runtime.sendMessage({
// 		greeting: "company linkedin page",
// 		message: link
// 	});
// 	window.close();
// }