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

var htmlLower = html.toLowerCase();

// chrome.runtime.sendMessage({
// 	greeting: "log",
// 	message: html
// });

//First attempt to find additional company metrics
var revenue = "-1";
var employees = "-1";
var companyLocation = "-1";
var dateFounded = "-1";

//Calculate Revenue
if(html.indexOf("See all ")!=-1){
	var numEmployees = html.substring(html.indexOf("See all ")+8);
	if(!(numEmployees.substring(0,20).includes("employees"))){
		numEmployees = numEmployees.substring(numEmployees.indexOf("See all ")+8);
	}
	numEmployees = numEmployees.substring(0,numEmployees.indexOf(" ")).replace(/\D/g,'');
	numEmployees = parseFloat(numEmployees)/10.0;
	if(numEmployees < 1.0){
		revenue = "<1M";
	} else if (numEmployees >= 1000.0) { 
		numEmployees = numEmployees / 1000.0;
		numEmployees = Math.round( numEmployees * 10 ) / 10;
		revenue = numEmployees.toString()+"B";
	} else {
		revenue = numEmployees.toString()+"M";
	}
}

//Find Number of Employees
var queryString = 'size<';
if(htmlLower.indexOf(queryString)!=-1){
	employees = htmlLower.substring(htmlLower.indexOf(queryString)+queryString.length+10);
	employees = employees.substring(employees.indexOf(">")+1);
	employees = employees.substring(0,employees.indexOf(" employees")).trim();
	employees = employees.replace("-"," - ");
}

//Find the companyLocation
queryString = 'Headquarters<';
if(html.indexOf(queryString)!=-1){
	companyLocation = html.substring(html.indexOf(queryString)+queryString.length+10);
	companyLocation = companyLocation.substring(companyLocation.indexOf(">")+1);
	companyLocation = companyLocation.substring(0,companyLocation.indexOf("<")).trim();
}

//Find dateFounded
queryString = 'year founded<';
if(htmlLower.indexOf(queryString)!=-1){
	dateFounded = htmlLower.substring(htmlLower.indexOf(queryString)+queryString.length+10);
	dateFounded = dateFounded.substring(dateFounded.indexOf(">")+1);
	dateFounded = dateFounded.substring(0,dateFounded.indexOf("<")).trim();
}

chrome.runtime.sendMessage({
	greeting: "linkedInMetrics",
	messageRevenue: revenue,
	messageLocation: companyLocation,
	messageDateFounded: dateFounded,
	messageNumEmployees: employees
});

//Search for CEO
if(html.indexOf("/search/results/people/?facet")!=-1){ //found a link through method 1
	var link = html.substring(html.indexOf("/search/results/people/?facet"));
	link = "https://www.linkedin.com"+link.substring(0,link.indexOf("\""));
	console.log("here is the output link from method 1: "+link);
	chrome.runtime.sendMessage({
		greeting: "company linkedin page",
		message: link
	});
	window.close();
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
	chrome.runtime.sendMessage({
		greeting: "company linkedin page",
		message: result_link
	});
	window.close();
}
else{
	console.log("Neither method worked :(");
	chrome.runtime.sendMessage({
		greeting: "who.is",
	});
	window.close();
}