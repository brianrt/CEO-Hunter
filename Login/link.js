$(".submit").click(createAccount);

//Set up a callback for the background script to send us messages
function listenerCallback(request,sender,sendResponse){
	if(request.greeting == "error"){
		alert(request.message);
	} else if(request.greeting=="success"){
		window.close();
	} else if(request.greeting=="unlink"){
		alert("Succesful, you will be prompted to login with the new email and password now. Select returning user.");
		chrome.runtime.sendMessage({
			greeting: "Signout"
		});
		window.close();
	} else if(request.greeting=="recent"){
		alert("This operation is sensitive and requires recent authentication. Click Ok, select returning user and re-login with google.");
		chrome.runtime.sendMessage({
			greeting: "Signout"
		});
		window.close();
	}
}
chrome.runtime.onMessage.addListener(listenerCallback);

function createAccount(){
	var email = $("#email").val();
	var password = $("#password").val();
	var confirm = $("#confirm_password").val();
	if(password != confirm) {
		alert("Passwords must match!");
	} else {
		chrome.runtime.sendMessage({
			greeting: "Link Account",
			email: email,
			password: password
		});
	}
}