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
chrome.runtime.sendMessage({
	greeting: "log",
	message: "revenue: " + revenue
});

//Find Number of Employees
var queryString = 'size<';
if(htmlLower.indexOf(queryString)!=-1){
	employees = htmlLower.substring(htmlLower.indexOf(queryString)+queryString.length+10);
	employees = employees.substring(employees.indexOf(">")+1);
	employees = employees.substring(0,employees.indexOf(" employees")).trim();
	employees = employees.replace("-"," - ");
}
chrome.runtime.sendMessage({
	greeting: "log",
	message: "employees: " + employees
});

//Find the companyLocation
queryString = 'Headquarters<';
if(html.indexOf(queryString)!=-1){
	companyLocation = html.substring(html.indexOf(queryString)+queryString.length+10);
	companyLocation = companyLocation.substring(companyLocation.indexOf(">")+1);
	companyLocation = companyLocation.substring(0,companyLocation.indexOf("<")).trim();
}
chrome.runtime.sendMessage({
	greeting: "log",
	message: "location: " + companyLocation
});

//Find dateFounded
queryString = 'year founded<';
if(htmlLower.indexOf(queryString)!=-1){
	dateFounded = htmlLower.substring(htmlLower.indexOf(queryString)+queryString.length+10);
	dateFounded = dateFounded.substring(dateFounded.indexOf(">")+1);
	dateFounded = dateFounded.substring(0,dateFounded.indexOf("<")).trim();
}
chrome.runtime.sendMessage({
	greeting: "log",
	message: "date founded: " + dateFounded
});

chrome.runtime.sendMessage({
	greeting: "linkedInMetricsFinal",
	messageRevenue: revenue,
	messageLocation: companyLocation,
	messageDateFounded: dateFounded,
	messageNumEmployees: employees
});
window.close();