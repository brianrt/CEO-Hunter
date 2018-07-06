/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuthGoogle(interactive) {
  if(!webFlowLaunched){
    // webFlowLaunched = true;
    chrome.identity.launchWebAuthFlow({url: "https://ceohunter-a02da.firebaseapp.com/index.html?extension_login=true",interactive: true},function(responseUrl){
      if(responseUrl == undefined){
        //User closed the window
        webFlowLaunched = false;
      } else{
        var url = new URL(responseUrl);
        var token = url.searchParams.get("customToken");
        firebase.auth().signInWithCustomToken(token).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
        });
      }
    });
  }
}

//Create a new account
function createUser(email, password){
	console.log("creating a user");
	firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
		console.log("success");
		chrome.tabs.sendMessage(login_tab_id, {
			greeting: "success"
		});
	}).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(error);
		chrome.tabs.sendMessage(login_tab_id, {
			greeting: "error",
			message: errorMessage
		});
	});
}

//Sign user in
function signInUserEP(email, password){
	console.log("signing in ep");
	firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
		console.log("success");
		chrome.tabs.sendMessage(login_tab_id, {
			greeting: "success"
		});
	}).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(error);
		chrome.tabs.sendMessage(login_tab_id, {
			greeting: "error",
			message: errorMessage
		});
	});
}

//Link a signed in Google Account to an email password
function linkAccount(email, password){
	console.log("Linking account");
	var credential = firebase.auth.EmailAuthProvider.credential(email, password);
	firebase.auth().currentUser.link(credential).then(function(usercred) {
		//Success, now we are unlinking google.com auth provider
		console.log("Success, now we are unlinking google.com auth provider");
		firebase.auth().currentUser.unlink("google.com").then(function() {
			console.log("Success, now we are closing the tabs");
			//Close any login windows that may have opened up
			for(var i = 0; i < login_tab_ids.length; i++){
				var l_tab = login_tab_ids[i];
				if(l_tab != login_tab_id){
					chrome.tabs.remove(l_tab);
				}
			}
		  	chrome.tabs.sendMessage(login_tab_id, {
				greeting: "unlink"
			});
		}).catch(function(error) {
			//Close any login windows that may have opened up
			for(var i = 0; i < login_tab_ids.length; i++){
				var l_tab = login_tab_ids[i];
				if(l_tab != login_tab_id){
					chrome.tabs.remove(l_tab);
				}
			}
		  	chrome.tabs.sendMessage(login_tab_id, {
				greeting: "unlink"
			});
		});

	}, function(error) {
		console.log(error.code);
		if(error.code == "auth/requires-recent-login"){
			chrome.tabs.sendMessage(login_tab_id, {
				greeting: "recent",
			});
		} else {
			chrome.tabs.sendMessage(login_tab_id, {
				greeting: "error",
				message: error.message
			});
		}
	});
}

//Send email a link to reset password
function forgotPassword(email){
	firebase.auth().sendPasswordResetEmail(email).then(function() {
    	// Password reset email sent.
    	chrome.tabs.sendMessage(login_tab_id, {
			greeting: "forgot",
			message: "Password reset email sent"
		});
    }).catch(function(error) {
    	// Error occurred. Inspect error.code.
    	chrome.tabs.sendMessage(login_tab_id, {
			greeting: "forgot",
			message: error.message
		});
    });
}