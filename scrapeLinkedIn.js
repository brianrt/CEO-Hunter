function alertSignIn(){
	alert("Please sign in to LinkedIn in a new tab. Then go back to the original webpage and try again.");
	window.close();
}

var sign_in = document.getElementsByClassName("nav-link");
for(var i = 0; i < sign_in.length;i++){
	if(sign_in[i].innerHTML.trim()=="Sign In"){
		alertSignIn();
	}
	console.log('"'+sign_in[i].innerHTML.trim()+'"');
}
var sign_in_two = document.getElementsByClassName("title")[0];
if(sign_in_two!=undefined && sign_in_two.innerHTML=="Make the most of your professional life"){
	alertSignIn();
}
var sign_in_three = document.getElementsByClassName("join-linkedin-form float-label-form")[0];
if(sign_in_three!=undefined){
	alertSignIn();
}
var html = document.body.innerHTML;
if(html.indexOf("Sign in")!=-1){
	alertSignIn();
}
// console.log(html);
if(html.indexOf("/search/results/people/?facet")!=-1){ //found a link through method 1
	var link = html.substring(html.indexOf("/search/results/people/?facet"));
	link = "https://www.linkedin.com"+link.substring(0,link.indexOf("\""));
	console.log("here is the output link from method 1: "+link);
	//window.close();
}
else if(html.indexOf("https://www.linkedin.com/vsearch/p?f_CC=")!=-1){ // try method 2 with vsearch without the ";"
	console.log("method 1 didn't work, trying method 2...");
	var link = html.substring(html.indexOf("https://www.linkedin.com/vsearch/p?f_CC="));
	var result_link = link.substring(0,link.indexOf("\""));
	while(result_link.indexOf(";")!=-1){ //while there is a semicolon in the result, we want to search for the next one
		link = link.substring(40); //cutoff the virst vsearch search result
		link = link.substring(link.indexOf("https://www.linkedin.com/vsearch/p?f_CC="));
		result_link = link.substring(0,link.indexOf("\""));
		console.log("current search item: "+result_link);
	}
	console.log("here is the output link from method 2: "+result_link);
}
else{
	console.log("Neither method worked :(");
}

// 	chrome.runtime.sendMessage({
// 		greeting: "company linkedin page",
// 		message: link
// 	});
// 	window.close();
// }