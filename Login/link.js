//Setup callback triggers
$(".submit").click(createAccount);
chrome.runtime.onMessage.addListener(listenerCallback);
$("#confirm_password").keypress(function(e) {
    if(e.which == 13) {
        createAccount();
    }
});

//Set up a callback for the background script to send us messages
function listenerCallback(request,sender,sendResponse){
	if(request.greeting == "error"){
		alert(request.message);
	} else if(request.greeting=="success"){
		window.close();
	} else if(request.greeting=="unlink"){
		alert("Succesfully linked account. Please click extension to continue normal use.");
		window.close();
	} else if(request.greeting=="recent"){
		alert("PLEASE READ: Linking accounts requires you to have signed in recently. Click OK and you will be prompted to login with your current google account. After that you will be asked to repeat this step.");
		chrome.runtime.sendMessage({
			greeting: "Recent"
		});
		window.close();
	}
}

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