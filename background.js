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
var targeted_position = "";    
var tab_dict = {};
var url_dict = {};

//Use second link to change back TODO
var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><br><p id=LinkedInDescription class=ceo-hunter-title>Loading CEO Description...</p><br><p id=LinkedInName class=info>Loading CEO Name...</p><br><br><p class=ceo-hunter-title>Personal Email Address</p><br><p id=personalEmail class=info>Loading Email...</p><br><t id=confidence></t><br><br><p class=ceo-hunter-title>Company Phone #</p><br><p id=companyPhone class=info>Loading phone...</p><br><br><input type="hidden" id="mailTo"><p id="withgmail"></p><br><br><br><a href="http://www.ceohunter.io/feedback/" style="color:blue;">Report bugs and request new features</a></div><br>';
// var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><br><p id=LinkedInDescription class=ceo-hunter-title>Loading CEO Description...</p><br><p id=LinkedInName class=info>Loading CEO Name...</p><br><br><p class=ceo-hunter-title>Personal Email Address</p><br><p id=personalEmail class=info>Loading Email...</p><br><t id=confidence></t><br><br><p class=ceo-hunter-title>Company Phone #</p><br><p id=companyPhone class=info>Loading phone...</p><br><br><input type="hidden" id="mailTo"><p id="withgmail"></p><br><br><input id="changePos" type="button" value = "Choose position on next launch" onclick = \'document.cookie = "needsToChangePosition=True";\'><br><br><a href="http://www.ceohunter.io/feedback/" style="color:blue;">Report bugs and request new features</a></div><br>';
var checkBoxesHTML =' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><button id="test_button">Click me</button><br></div>'
//Firebase vars
var firebase_intialized = false;
var database;
var user_number = 0;
var user_email = "";
var user_hunts = 0;
var total_hunts = 0;
var attempted_sign_in = false;

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

function addSuccessFullHunt(ceo_name,ceo_description,email_address,confidence,was_cached){
  user_hunts += 1;
  firebase.database().ref('Users/' + user_number).update({
    email: user_email,
    hunts : user_hunts
  });
  firebase.database().ref('Users/' + user_number+'/sites_visited/'+total_hunts).update({
    url: companyURL,
    status: "success",
  });
  if(!was_cached && targeted_position == "ceo_owner"){
    addCompany(ceo_name,ceo_description,email_address,confidence);
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
    else if (request.greeting == "search result" && !company){
    	company = true;
      openCompanyPage(request.message);
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
        console.log(request.message);
        verifyEmails(request.message,sendResponse);
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
    firebase.database().ref('Users/' + user_number+'/sites_visited/'+total_hunts).set({
      url: companyURL,
      status: "failed",
    });
    if(targeted_position == "ceo_owner"){
      checkDataBase();
      // GoogleSearch();
      // LinkedIn();
    } else {
      Bloomberg();
      // LinkedIn();
    }
    });
}

function refreshHTML(){
  chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
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

function launchSequence(){
    total_hunts +=1;
    firebase.database().ref('Users/' + user_number).update({
      total_hunts : total_hunts
    });
    ceoName = false;
    contact = false;
    contact_url = false;
    company = false;
    employeepage = false;
    companyWindowCreated = false;
    employeeWindowCreated = false;
    googleWindowCreated = false;
    whoIsUsed=false;
    setTerminatingConditions();
    getContactInfo();
    setCompanyURL();
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
function startAuth(interactive,tab) {
  attempted_sign_in = true;
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      console.log("signing in");
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}


function startHunting(tab) {
  //start extension
  console.log("tab id: "+tab.id);
  document.getElementById("body").innerHTML=templateHTML;
  if(first){
    console.log("first");
    chrome.runtime.onMessage.addListener(listenerCallback);
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
      chrome.tabs.sendMessage(tab.id, {greeting: "toggle off",message:document.getElementById("ceo_hunter").innerHTML});
    }
  }
  tab_dict[tab.id] = !tab_dict[tab.id];
}

function initUser(){
  user_email = firebase.auth().currentUser.email;
    console.log(user_email);
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('/Users/').once('value').then(function(snapshot) {
      // var username = snapshot.val().username;
      var users = snapshot.val();
      var found = false;
      var i = 0;
      for (;i < users.length; i++){
        // console.log(users[i]);
        // console.log(users[i].email);
        var email = users[i].email;
        //console.log("email searching for: "+email);
        if(email == user_email){//email already exist in database
          found = true;
          break;
        }
      }
      if(found){
        console.log("found "+user_email);
        user_number=i;
        console.log(user_number);
        user_hunts = users[i].hunts;
        total_hunts = users[i].total_hunts;
        console.log("user hunts: "+user_hunts);
      } else{ //need to add to database
        user_number = i;
        console.log(user_number);
        user_hunts = 0;
        total_hunts = 0;
        firebase.database().ref('Users/' + user_number).set({
          email: user_email,
          hunts : user_hunts,
          total_hunts : total_hunts
        });
      }
      startHunting(main_tab);
  });
}

function checkIfPositionSelected(url){
  //Get rid of this to enable position selection TODO
  needsToChangePosition = false; 
  targeted_position = "ceo_owner";


  if(needsToChangePosition){
    needsToChangePosition = false;
    setTargetedPosition();
    chrome.cookies.onChanged.addListener(function (changeInfo){
      if (changeInfo.cookie.name == "needsToChangePosition"){
        needsToChangePosition = true;
        $("#changePos").attr("id","changePosBye");
        $("#changePosBye").hide();
        refreshHTML();
      }
    });
  }
  else{
    launchSequence();
  }
}

function setPosition(position) {
    console.log(position);
    targeted_position = position;
    launchSequence();
};

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

//Listen for activity on Linkedin.com
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(tab.url.includes("https://www.linkedin.com/in/")){
    console.log("hello!");
    chrome.tabs.executeScript(tab.id, {file: "jquery-3.1.1.min.js", allFrames: false},function(){//Inject Jquery
      chrome.tabs.executeScript(tab.id, {file: "injectLinkedIn.js", allFrames: false, runAt: "document_end"},function(){//Inject the javascript
        chrome.tabs.insertCSS(tab.id, {file: "InjectLinkedIn.css", allFrames: false, runAt: "document_end"},function(){//Inject the CSS
        });
      });
    });
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
  main_tab = tab;
  if(!firebase_intialized){
    fireBaseInit();
    firebase_intialized=true;
  }
  if(firebase.auth().currentUser!=null){
    if(user_email==""){
      initUser();
      console.log("signed in, user_email not in");
    }else{
      console.log("signed in, user_email already recorded");
      startHunting(main_tab);
    }
  }
  else if(attempted_sign_in){ //If they attempted to sign in already but failed, don't keep asking them to sign in
    startHunting(main_tab);
  }
  else { //Needs to login
    console.log("needs to login");
    startAuth(true,tab);
    alert("Signing in, please click extension again");
  }
});