var companyDomain;
var companyURL;
var companyName;
var tab_id;
var ceoName = false;
var contact = false;
var contact_url = false;
var company = false;
var employeepage = false;
var toggle = true;
var first = true;
var tab_dict = {};
var url_dict = {};
var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>Deal Hunter (BETA)</h1><br><br><p id=LinkedInDescription class=ceo-hunter-title>Loading CEO Description...</p><br><p id=LinkedInName class=info>Loading CEO Name...</p><br><br><p class=ceo-hunter-title>Personal Email Address</p><br><p id=personalEmail class=info>Loading Email...</p><br><t id=confidence></t><br><br><p class=ceo-hunter-title>Company Phone #</p><br><p id=companyPhone class=info>Loading phone...</p><br><br><input type="hidden" id="mailTo"><p id="withgmail"></p><br><br><a href="http://www.ceohunter.io/feedback/" style="color:blue;">Report bugs and request new features</a></div><br>';
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

function addSuccessFullHunt(){
  user_hunts += 1;
  firebase.database().ref('Users/' + user_number).update({
    email: user_email,
    hunts : user_hunts
  });
  firebase.database().ref('Users/' + user_number+'/sites_visited/'+total_hunts).update({
    url: companyURL,
    status: "success",
  });
}

function removeSuccessfullHunt(){
  user_hunts -= 1;
  firebase.database().ref('Users/' + user_number).update({
    email: user_email,
    hunts : user_hunts
  });
  firebase.database().ref('Users/' + user_number+'/sites_visited/'+total_hunts).update({
    url: companyURL,
    status: "failed",
  });
}


function listenerCallback(request,sender,sendResponse){
  	if (request.greeting == "ceo" && !ceoName){
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
                document.getElementById("companyPhone").innerHTML=element.substring(7);
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
  setTimeout(function(){
    if(document.getElementById("LinkedInName").innerHTML == "Loading CEO Name..."){
      WhoIs();
    }else{
      displayNotFound();
      console.log("displayNotFound");
      whoIsUsed=false;
    }
  },15000);
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
    GoogleSearch();
    // LinkedIn();
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
              chrome.tabs.insertCSS(tab_id, {file: "extension.css", allFrames: true, runAt: "document_end"},function(){//Inject the CSS
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
    // CrunchBase();
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


function startExtension(tab) {
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
    launchSequence();//Begin running rest of extension
  }
  else if(tab_dict[tab.id]){//If the toggle for this tab is turned on
    if(url_dict[tab.id] != tab.url){
      initialize();
    }
    chrome.tabs.sendMessage(tab.id, {greeting: "toggle on",message:document.getElementById("ceo_hunter").innerHTML});
    console.log("toggle on");
    launchSequence();
  }
  else{
    if(url_dict[tab.id] != tab.url){ //If they changed urls without closing the tab, we can't toggle off. we need to launch it again
      tab_dict[tab.id] = !tab_dict[tab.id];
      initialize();
      launchSequence();
    } else {
      console.log("toggle off");
      chrome.tabs.sendMessage(tab.id, {greeting: "toggle off",message:document.getElementById("ceo_hunter").innerHTML});
    }
  }
  tab_dict[tab.id] = !tab_dict[tab.id];
}

function initUser(tab){
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
      startExtension(tab);
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  if(!firebase_intialized){
    fireBaseInit();
    firebase_intialized=true;
  }
  if(firebase.auth().currentUser!=null){
    if(user_email==""){
      initUser(tab);
      console.log("signed in, user_email not in");
    }else{
      console.log("signed in, user_email already recorded");
      startExtension(tab);
    }
  }
  else if(attempted_sign_in){ //If they attempted to sign in already but failed, don't keep asking them to sign in
    startExtension(tab);
  }
  else { //Needs to login
    console.log("needs to login");
    startAuth(true,tab);
    alert("Signing in, please click extension again");
  }
});