$("#new").click(newSignin);
$("#returning").click(returnSignin);
$(".back").click(backToInit);
$("#GoogleButton").click(signInWithGoogle);
$("#createSubmit").click(createAccount);
$("#new_confirm_password").keypress(function(e) {
    if(e.which == 13) {
        createAccount();
    }
});
$("#signInSubmit").click(signIn);
$("#password").keypress(function(e) {
    if(e.which == 13) {
        signIn();
    }
});
$("#Forgot").click(forgotPassword);


//Set up a callback for the background script to send us messages
function listenerCallback(request,sender,sendResponse){
	if(request.greeting == "error"){
		alert(request.message);
	} else if(request.greeting=="success"){
		window.close();
	} else if(request.greeting=="forgot"){
		alert(request.message);
	}
}
chrome.runtime.onMessage.addListener(listenerCallback);

function newSignin(){
	console.log("New signin");
	$("#Init").hide();
	$("#NewEP").fadeIn();
}

function backToInit(){
	$("#ReturningEP").hide();
	$("#NewEP").hide();
	$("#Init").fadeIn();
}

function returnSignin(){
	console.log("Returning signin");
	$("#Init").hide();
	$("#ReturningEP").fadeIn();
}

function signInWithGoogle(){
	chrome.runtime.sendMessage({
		greeting: "Google Login",
	});
	window.close();
}

function createAccount(){
	var email = $("#new_email").val();
	var password = $("#new_password").val();
	var confirm = $("#new_confirm_password").val();
	if(password != confirm) {
		alert("Passwords must match!");
	} else {
		chrome.runtime.sendMessage({
			greeting: "Create New User",
			email: email,
			password: password
		});
	}
}

function signIn(){
	var email = $("#email").val();
	var password = $("#password").val();
	chrome.runtime.sendMessage({
		greeting: "Sign In EP",
		email: email,
		password: password
	});
}

function forgotPassword(){
	var email = $("#email").val();
	if (email == ""){
		alert("Please provide your email");
	} else {
		chrome.runtime.sendMessage({
			greeting: "Forgot Password",
			email: email
		});
	}
}