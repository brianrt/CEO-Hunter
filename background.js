var companyDomain;
var companyURL;
var companyPhone;
var companyName;
var tab_id;
var main_tab;
var ceoName = false;
var contact = false;
var contact_url = false;
var company = false;
var employeepage = false;
var toggle = true;
var first = true;
var needsToChangePosition = true;
var preventFromLaunching = false;
var targeted_position = "";    
var tab_dict = {};
var url_dict = {};

//Other Metrics, if they become -1 it's because they can't be found, 0 means not calculated yet
var Revenue = "0";
var Location = "0";
var numEmployees = "0";
var dateFounded = "0";
var getMetricsCalled = false;

//Use second link to change back TODO
var tableText = '<table class=hunter_table id=stats_table> <tr class=hunter_table> <td class=hunter_table_insides><t id=revenue class=table_results>Loading...</t><br><t>Revenue</t></td> <td class=hunter_table_insides><t id=employees class=table_results>Loading...</t><br><t>Employees</t></td> </tr> <tr class=hunter_table> <td class=hunter_table_insides><t id=date_founded class=table_results>Loading...</t><br><t>Date Founded</t></td> <td class=hunter_table_insides><t id=location class=table_results>Loading...</t><br><t>Location</t></td> </tr></table>';
var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><br><p id=LinkedInDescription class=ceo-hunter-title>Loading CEO Description...</p><br><p id=LinkedInName class=info>Loading CEO Name...</p><br><p id=personalEmail class=info>Loading Email...</p><br><t id=confidence></t><br><br><p class=ceo-hunter-title id=huntsUsed>Company Phone #</p><br><p id=companyPhone class=info>Loading phone...</p><br><br><p class=ceo-hunter-title>Company Metrics</p><br>'+tableText+'<div id = account_info><p class="hunt_info" id="hunts_used">0</p><p class="hunt_info"> / </p><p class="hunt_info" id="total_hunts">0</p><p class = "hunt_info"> hunts used. </p><a target="_blank" href="https://ceohunter-a02da.firebaseapp.com/" style="color:blue;">Upgrade</a></div></div>';
// var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><br><p id=LinkedInDescription class=ceo-hunter-title>Loading CEO Description...</p><br><p id=LinkedInName class=info>Loading CEO Name...</p><br><br><p class=ceo-hunter-title>Personal Email Address</p><br><p id=personalEmail class=info>Loading Email...</p><br><t id=confidence></t><br><br><p class=ceo-hunter-title>Company Phone #</p><br><p id=companyPhone class=info>Loading phone...</p><br><br><input type="hidden" id="mailTo"><p id="withgmail"></p><br><br><input id="changePos" type="button" value = "Choose position on next launch" onclick = \'document.cookie = "needsToChangePosition=True";\'><br><br><a href="http://www.ceohunter.io/feedback/" style="color:blue;">Report bugs and request new features</a></div><br>';
var checkBoxesHTML =' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><button id="test_button">Click me</button><br></div>'
//Firebase vars
var firebase_intialized = false;
var database;
var userId;
var user_number = 0;
var user_email = "";
var hunts_used = 0;
var total_hunts = 0;
var all_hunts_used = false;
var attempted_sign_in = false;
var user_initialized = false;
//LinkedIn page feature vars
var linkedInTabId=-1;
var webFlowLaunched = false;

function getEmail(text){
  var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(emailRe.test(text)){
    return text;
  }
  return "";
}

function getPhoneNumber(text){
  var phoneRe = /\(?\d{3}\)?[-. –](\d{3})[-. –](\d{4})/;
  if (phoneRe.test(text))
    return text.match(phoneRe)[0];
  return "";
}

function addSuccessFullEmailLinkedIn(){
  firebase.database().ref('stripe_customers/' + userId + '/success').set(true);
}

function addSuccessFullHunt(ceo_name,ceo_description,email_address,confidence,was_cached){
  //TODO: add entry to stripe_customers/userID/success so back end knows to increment

  firebase.database().ref('stripe_customers/' + userId + '/success').set(true);
  if(!was_cached && targeted_position == "ceo_owner"){
    // addCompany(ceo_name,ceo_description,email_address,confidence);
  }
  displayNotFound();
}

function addCompany(ceo_name,ceo_description,email_address,confidence){
  firebase.database().ref('/Companies/Count/').once('value').then(function(snapshot) {
    var numCompanies = snapshot.val();
    console.log("Number of companies: "+numCompanies);

    //Calculate hash of company domain
    var key = md5(companyDomain);

    //Update the company count (if it gets to this point, we've found a new company)
    numCompanies+=1;
    firebase.database().ref('/Companies/').update({Count:numCompanies});

    var phone = companyPhone;
    if(phone == undefined){
      phone = "Not found";
    }

    //Add company to database
    firebase.database().ref('Companies/List/'+key).update({
      company_name: companyName,
      url: companyURL,
      confidence: confidence,
      phone: phone,
      ceo: {
        name: ceo_name,
        description: ceo_description,
        email: email_address
      }
    });

  });
  
}

function listenerCallback(request,sender,sendResponse){
    if (request.greeting == "who.is"){
      console.log("who.is callback received")
      if(targeted_position != "ceo_owner"){
        displayNotFound();
      } else{
        WhoIs();
      }
    }
    else if (request.greeting == "log"){
    	console.log("log: "+request.message);
    }
    else if (request.greeting == "linkedInMetrics" && Revenue == "0"){
    	Revenue = request.messageRevenue;
    	Location = request.messageLocation;
    	dateFounded = request.messageDateFounded;
    	numEmployees = request.messageNumEmployees;
    }
    else if (request.greeting == "linkedInMetricsFinal" && Revenue == "0"){
    	Revenue = request.messageRevenue;
    	Location = request.messageLocation;
    	dateFounded = request.messageDateFounded;
    	numEmployees = request.messageNumEmployees;
    	getMetrics(false);
    }
  	else if (request.greeting == "ceo" && !ceoName){
      	console.log("ceo callback received")
  		ceoName=true;
  		var ceo_name = request.message_ceo.trim();
  		var ceo_description = request.message_description;
  		document.getElementById("LinkedInName").innerHTML=ceo_name;
  		document.getElementById("LinkedInDescription").innerHTML=ceo_description;
  		generateEmails(ceo_name,ceo_description);
  	}
    else if (request.greeting == "company linkedin page" && !employeepage){
    	employeepage = true;
        console.log(request.message);
        openEmployeePage(request.message);
    }
    else if (request.greeting == "contacts"){
    	contact = true;
        var contacts = request.message;
        for (var index in contacts) {
            var element=contacts[index];
            if(element.includes("Phone")){
                companyPhone = element.substring(7);
                document.getElementById("companyPhone").innerHTML=companyPhone;
              }
        }
        refreshHTML();
    }
    else if(request.greeting == "contact urls" && !contact_url){
    	contact_url = true;
        var contactUrl = request.message;
        console.log("contact urls: "+request.message);
        $.ajax
        (
            { 
                url: contactUrl,
                success: function(data) { 
                    var d = document.createElement('div');
                    d.innerHTML = data;
                    contacts = [].slice.apply(d.querySelectorAll('p,li,a,div'));
                    var foundPhone = false;
                    contacts = contacts.map(function(element) {
                      var text = element.innerText;
                      var html = element.innerHTML;
                      if(!foundPhone){
                        var phone = getPhoneNumber(text)
                        if(phone.length>0){
                          foundPhone = true;
                          return "Phone: "+phone;
                        }
                      }
                      var email = getEmail(text)
                      if(email.length>0){
                        return "Email: "+email;
                      }
                      return "";
                    });
                    contacts.sort();
                    listenerCallback({
                      greeting: "contacts",
                      message: contacts
                    });
                }

            }
        );
    }
    else if (request.greeting == "emails"){
        if(all_hunts_used){
          sendResponse({farewell: -2,hunts_used: hunts_used, total_hunts: total_hunts});
        } else {
          addSuccessFullEmailLinkedIn();
          verifyEmails(request.message,sendResponse);
        }
    }
    return true;
}

function getContactInfo(){
    chrome.windows.getCurrent(function (currentWindow) {
        var script = 'send_contacts.js';
        chrome.tabs.getSelected(null,function(tab) {
            tab_id = tab.id;
            if(tab.url.toLowerCase().includes("contact"))
                script = 'contactPageScript.js';
        });
        chrome.tabs.query({active: true, windowId: currentWindow.id},function(activeTabs) {
            chrome.tabs.executeScript(activeTabs[0].id, {file: script, allFrames: false});
        });
    });
}

function setTerminatingConditions(){
//   setTimeout(function(){
//     if(document.getElementById("LinkedInName").innerHTML == "Loading CEO Name..."){
//       WhoIs();
//     }else{
//       displayNotFound();
//       console.log("displayNotFound");
//       whoIsUsed=false;
//     }
//   },15000);
}

function displayNotFound(){         
	if(document.getElementById("LinkedInDescription").innerHTML == "Loading CEO Description..."){
		document.getElementById("LinkedInDescription").innerHTML = "Not found"
	}
	if(document.getElementById("LinkedInName").innerHTML == "Loading CEO Name..."){  
		document.getElementById("LinkedInName").innerHTML = "Not Found";
	}
	if(document.getElementById("personalEmail").innerHTML == "Loading Email..."){
		document.getElementById("personalEmail").innerHTML = "Not found";
	}
	if(document.getElementById("companyPhone").innerHTML == "Loading phone..."){
		document.getElementById("companyPhone").innerHTML = "Not found";
	}
	refreshHTML();

	//Prevent from being called more than once with a flag
	if(!getMetricsCalled){
		//Find additional metrics here
		getMetricsCalled = true;
		var checkLinkedIn = Revenue == "0";
		getMetrics(checkLinkedIn);
	}
}

function getRequestHTML(url,callback){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var data = xhr.responseText;
			var d = document.createElement('div');
            d.innerHTML = data;
            callback(d);
		}
	}
	xhr.send();
}

function ajax_page(query,callback){
  console.log(query);
  $.ajax
  (
      { 
          url: query,
          success: function(data) {
              var d = document.createElement('div');
              d.innerHTML = data;
              callback(d);

          }
      }
  );
}

//Checks our database to see if the results have already been cached
function checkDataBase(){
  var key = md5(companyDomain);
  firebase.database().ref('/Companies/List/'+key).once('value').then(function(snapshot) {
    if(snapshot.val() == null){
      //The company is not cached, need to proceed as normal
      GoogleSearch();
    }
    else {
      //We have found a cached result!
      console.log("found cached result");
      //Retrieve the data
      var company = snapshot.val();
      var ceo = company.ceo;

      //Select color based on confidence of email
      var color = "green";
      switch(company.confidence){
        case "Risky":
          color = "#cccc00";
          break;
        case "Not Likely":
          color = "red";
          break;
      }

      //Update html directly
      document.getElementById("LinkedInDescription").innerHTML = ceo.description;
      document.getElementById("LinkedInName").innerHTML = ceo.name;
      document.getElementById("personalEmail").innerHTML = ceo.email;
      document.getElementById("companyPhone").innerHTML = company.phone;
      document.getElementById("confidence").innerHTML = company.confidence;
      document.getElementById("confidence").style.color = color;

      //Add email ceo button
      if (company.confidence != "Not Likely"){
        var ceo_array = ceo.name.split(" ");
        if(company.confidence == "Risky"){
          $("#mailTo").attr("onclick","window.open('https://mail.google.com/mail/?view=cm&fs=1&to="+ceo_array[0].charAt(0)+ceo_array[ceo_array.length-1].toLowerCase()+"@"+companyDomain+"','', 'top=300,left=400,width=500,height=500');");
        } else {
          $("#mailTo").attr("onclick","window.open('https://mail.google.com/mail/?view=cm&fs=1&to="+ceo.email+"','', 'top=300,left=400,width=500,height=500');");
        }
        $("#mailTo").attr("type","button");
        $("#mailTo").attr("target","_blank");
        $("#mailTo").val("Email CEO");
        $("#withgmail").html("(With Gmail)");
      }
      
      //Send new HTML to window
      refreshHTML();

      //Add a hunt to our server for the user
      addSuccessFullHunt(ceo.name,ceo.description,ceo.email,company.confidence,true);
    }
  });
  
}

function setCompanyURL(){
  chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(tabs){
      
    //set global company information
    var url = tabs[0].url;
    url_dict[tabs[0].id]=url;
    companyURL = url;
    if(url.includes("www.")){
      url = url.substring(url.indexOf("www.")+4,url.length);
    }
    if(url.includes("://")){
        url = url.substring(url.indexOf("://")+3,url.length);
    }
    companyDomain = url.substring(0,url.indexOf("/"))
    parts = companyDomain.split(".")
    companyDomain = parts[parts.length-2]+"."+parts[parts.length-1];
    companyName = parts[parts.length-2];
    console.log("domain: "+companyDomain);
    console.log("name: "+companyName);
    //Add company url to firebase account for logging
    // firebase.database().ref('Users/' + user_number+'/sites_visited/'+total_hunts).set({
    //   url: companyURL,
    //   status: "failed",
    // });
    if(targeted_position == "ceo_owner"){
      // checkDataBase();
      Bloomberg();
      // CrunchBase();
      // LinkedIn();
      // AngelList();
    } else {
      Bloomberg();
      // LinkedIn();
    }
    });
}

function refreshHTML(){
  try{
    chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
  } catch(err){
  }
}

function initialize(){
	chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({active: true, windowId: currentWindow.id},function(activeTabs) {
        	tab_id = activeTabs[0].id;
            chrome.tabs.executeScript(tab_id, {file: "insertSideBar.js", allFrames: false},function(){//Inject the javascript
              chrome.tabs.insertCSS(tab_id, {file: "Styles/extension.css", allFrames: true, runAt: "document_end"},function(){//Inject the CSS
                chrome.tabs.sendMessage(tab_id, {greeting: "initial load",message:document.getElementById("ceo_hunter").innerHTML});
              });
            });
        });
    });
}

function remainingHuntsLeft(){
  setNumHunts();
  if(all_hunts_used){
    $(".ceo-hunter-title").html("");
    $(".info").html("");
    $("#confidence").html("");
    $("#stats_table").html("");
    $("#huntsUsed").html("All hunts used! Please upgrade for more hunts.");
    refreshHTML();
    return false;
  }
  return true;
}

function launchSequence(){
    if(remainingHuntsLeft()){
		ceoName = false;
		contact = false;
		contact_url = false;
		company = false;
		employeepage = false;
		companyWindowCreated = false;
		employeeWindowCreated = false;
		googleWindowCreated = false;
		whoIsUsed=false;
		Revenue = "0";
		Location = "0";
		numEmployees = "0";
		dateFounded = "0";
		getMetricsCalled = false;
		getContactInfo();
		setCompanyURL();
    }
}

function fireBaseInit(){
  var config = {
    apiKey: "AIzaSyBkHvvVtyKfd4DwsRHldn52Z7FWfZ_jnr8",
    databaseURL: "https://ceohunter-a02da.firebaseio.com",
    storageBucket: "ceohunter-a02da.appspot.com"
  };
  firebase.initializeApp(config);
}


/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  if(!webFlowLaunched){
    webFlowLaunched = true;
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


function startHunting(tab) {
  if(!preventFromLaunching){//prevents from accidental launches
    //start extension
    console.log("tab id: "+tab.id);
    document.getElementById("body").innerHTML=templateHTML;
    if(first){
      console.log("first");
      first = false;
    }
    if(!(tab.id in tab_dict)){//First for this tab
      console.log("first time for tab");
      tab_dict[tab.id]=true;
      initialize();//Initial load of context script for this tab
      checkIfPositionSelected(tab.url);//Begin running rest of extension
    }
    else if(tab_dict[tab.id]){//If the toggle for this tab is turned on
      if(url_dict[tab.id] != tab.url){
        initialize();
      }
      checkIfPositionSelected(tab.url);
      chrome.tabs.sendMessage(tab.id, {greeting: "toggle on",message:document.getElementById("ceo_hunter").innerHTML});
      console.log("toggle on");
    }
    else{
      if(url_dict[tab.id] != tab.url){ //If they changed urls without closing the tab, we can't toggle off. we need to launch it again
        tab_dict[tab.id] = !tab_dict[tab.id];
        initialize();
        checkIfPositionSelected(tab.url);
      } else {
        console.log("toggle off");
        console.log("locking down");
        preventFromLaunching = true; // If they toggle off, we want to prevent launches
        chrome.tabs.sendMessage(tab.id, {greeting: "toggle off",message:document.getElementById("ceo_hunter").innerHTML});
      }
    }
    tab_dict[tab.id] = !tab_dict[tab.id];
  } else {
    console.log("prevented launch");
  }
}

// Adds a listener for changes to the number of hunts used
function initUser(email,callback){
  firebase.database().ref(`/stripe_customers/${userId}`).on('value', snapshot => {
    var data = snapshot.val();
    if(data == null){
      firebase.database().ref(`customers_to_be_created/${userId}`).set({email: email}).then(() => {
          console.log("wrote value");
      });
    } else {
      if(data.total_hunts != null){
        total_hunts = data.total_hunts;
      }
      if(data.hunts_used != null){
        hunts_used = data.hunts_used;
      }
      if(data.all_hunts_used != null){
        all_hunts_used = data.all_hunts_used;

        //Send linkedin tab updated hunt info if needed
        if(linkedInTabId != -1){
          chrome.tabs.sendMessage(linkedInTabId, {hunts_used: hunts_used, total_hunts: total_hunts});
        }
        if(!user_initialized){
          user_initialized = true;
          console.log("got all the data, can start hunting");
          if(callback != null){
            callback(main_tab);
          }
        }
      }
      setNumHunts();
    }
  });
}

function setNumHunts(){
  if(total_hunts == 4000000000){
    $("#total_hunts").html("Unlimited");
  } else {
    $("#total_hunts").html(total_hunts);
  }
  $("#hunts_used").html(hunts_used);
  refreshHTML();
}

function checkIfPositionSelected(url){
  //Get rid of this to enable position selection TODO
  needsToChangePosition = false; 
  targeted_position = "ceo_owner";


  // if(needsToChangePosition){
  //   needsToChangePosition = false;
  //   setTargetedPosition();
  //   chrome.cookies.onChanged.addListener(function (changeInfo){
  //     if (changeInfo.cookie.name == "needsToChangePosition"){
  //       needsToChangePosition = true;
  //       $("#changePos").attr("id","changePosBye");
  //       $("#changePosBye").hide();
  //       refreshHTML();
  //     }
  //   });
  // }
  // else{
    launchSequence();
  // }
}

// function setPosition(position) {
//     console.log(position);
//     targeted_position = position;
//     launchSequence();
// };

function setTargetedPosition(){
  chrome.tabs.create({
    url: chrome.extension.getURL('position_selection.html'),
    active: false
  }, function(tab) {
    // After the tab has been created, open a window to inject the tab
    chrome.windows.create({
      tabId: tab.id,
      type: 'popup',
      focused: true,
      height:400,
      width:340,
      top:400,
      left:400
    });
  });
}

// Listen for activity on Linkedin.com
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(tab.url.includes("https://www.linkedin.com/in/")){
    linkedInTabId = tab.id;
    if(!firebase_intialized){
      fireBaseInit();
      firebase_intialized=true;
    }
    firebase.auth().onAuthStateChanged(function(user) {
      console.log("On auth change linkedin");
      if (user) {
        userId = user.uid;
        console.log("User is signed in l.");
        if(!user_initialized){
          firebase.database().ref(`customers_to_sign_in/${user.uid}`).remove().then(() => {
            console.log("removed customers_to_sign_in entry");
            initUser(user.email,null);
          });
        }
        chrome.tabs.executeScript(tab.id, {file: "jquery-3.1.1.min.js", allFrames: false},function(){//Inject Jquery
          chrome.tabs.executeScript(tab.id, {file: "injectLinkedIn.js", allFrames: false, runAt: "document_end"},function(){//Inject the javascript
            chrome.tabs.insertCSS(tab.id, {file: "InjectLinkedIn.css", allFrames: false, runAt: "document_end"},function(){//Inject the CSS
            });
          });
        });
      } else {
        console.log("User is not signed in l.");
        startAuth(true);
      }
    }); 
  }
});

// Begin Flow
chrome.runtime.onMessage.addListener(listenerCallback);
chrome.browserAction.onClicked.addListener(function(tab) {
  preventFromLaunching = false; //The user clicked, the extension will launch
  main_tab = tab;
  if(!firebase_intialized){
    fireBaseInit();
    firebase_intialized=true;
  }
  firebase.auth().onAuthStateChanged(function(user) {
    console.log("On auth change extension");
    if (user) {
      userId = user.uid;
      console.log("User is signed in.");
      if(!user_initialized){
        firebase.database().ref(`customers_to_sign_in/${user.uid}`).remove().then(() => {
          console.log("removed customers_to_sign_in entry");
          initUser(user.email,startHunting);
        });
      } else {
        startHunting(main_tab);
      }
    } else {
      console.log("User is not signed in.");
      startAuth(true);
    }
  });
});