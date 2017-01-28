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
var toggle_dict = {};
var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>CEO Hunter</h1><t id=url></t><br><br><t id=LinkedInDescription class=title>Loading CEO Description...</t><br><t id=LinkedInName class=info>Loading CEO Name...</t><br><br><t class=title>Personal Email Address</t><br><t id=personalEmail class=info>Loading Email...</t><br><t id=confidence></t><br><br><t class=title>Company Email Address</t><br><t id=companyEmail class=info>Loading company email...</t><br><br><t class=title>Company Phone #</t><br><t id=companyPhone class=info>Loading phone...</t><br><br><a href="http://www.ceohunter.io/feedback/" style="color:blue;">Report bugs and request new features</a><br><br></div>';

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


function listenerCallback(request,sender,sendResponse){
  	if (request.greeting == "ceo" && !ceoName){
  		ceoName=true;
  		var ceo_name = request.message_ceo;
  		var ceo_description = request.message_description;
  		document.getElementById("LinkedInName").innerHTML=ceo_name;
  		document.getElementById("LinkedInDescription").innerHTML=ceo_description;
  		generateEmails(ceo_name);
  		console.log(document.getElementById("body"));
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
            if(element.includes("Email"))
                document.getElementById("companyEmail").innerHTML=element.substring(7);
            else if(element.includes("Phone"))
                document.getElementById("companyPhone").innerHTML=element.substring(7);
        }
        chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
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
            chrome.tabs.executeScript(activeTabs[0].id, {file: script, allFrames: true});
        });
    });
}

function lastResortGoogleAttempt(){
  var query = companyName+"+ceo";
  var access_key = 'AIzaSyBcBsQy0IOp-R2bZOi_hq6omvVVaA1Z1hA';
  var engine_id = '005408335780428068463:obi6mjahzr4';
  var url = "https://www.googleapis.com/customsearch/v1?key="+access_key+"&cx="+engine_id+"&q="+query+"&siteSearch=wikipedia.org";
  console.log(url);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      var hcard = resp.items[0].pagemap.hcard;
      console.log(hcard);
      if (hcard!=undefined){
        hcard = hcard[0]
        if(hcard.role!=undefined || hcard.nickname!=undefined){
          console.log("inside");
          var role = "CEO";
          var ceo  = hcard.fn
          if(hcard.role!=undefined){
            role = hcard.role;
          }
          listenerCallback({
            greeting: "ceo",
            message_ceo: ceo,
            message_description: role
          });
        }
      }
      else{
        if(document.getElementById("LinkedInDescription").innerHTML == "Loading CEO Description..."){
          document.getElementById("LinkedInDescription").innerHTML = "Not found"
        }
        if(document.getElementById("LinkedInName").innerHTML == "Loading CEO Name..."){
          document.getElementById("LinkedInName").innerHTML = "Not found";
        }
      }
    }
  }
  xhr.send();

}


function setTerminatingConditions(){
  setTimeout(function(){
        lastResortGoogleAttempt();
        if(document.getElementById("personalEmail").innerHTML == "Loading Email..."){
          document.getElementById("personalEmail").innerHTML = "Not found";
        }
        if(document.getElementById("companyEmail").innerHTML == "Loading company email..."){
          document.getElementById("companyEmail").innerHTML = "Not found";
        }
        if(document.getElementById("companyPhone").innerHTML == "Loading phone..."){
          document.getElementById("companyPhone").innerHTML = "Not found";
        }
      chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
        // closeTabs();
   },11000);
}

function initialize(){
	chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({active: true, windowId: currentWindow.id},function(activeTabs) {
        	tab_id = activeTabs[0].id;
            chrome.tabs.executeScript(tab_id, {file: "insertSideBar.js", allFrames: true},function(){
            	chrome.tabs.sendMessage(tab_id, {greeting: "initial load",message:document.getElementById("ceo_hunter").innerHTML});
            });
        });
    });
    setTerminatingConditions();
}

function launchSequence(){
    toggle = false;
    toggle_dict[tab_id]=toggle;
    first = false;
    ceoName = false;
    contact = false;
    contact_url = false;
    company = false;
    employeepage = false;
    companyWindowCreated = false;
    employeeWindowCreated = false;
    googleWindowCreated = false;
    getContactInfo();
    LinkedIn();
}

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("toggle: "+toggle);
  console.log("first: "+first);
  console.log("tab.id: "+tab.id+"tab_id: "+tab_id);
  if(tab.id!=tab_id){ //if we have switched tabs, we must relaunch the context script
    if(tab.id in toggle_dict){ //we have already seen this tab before
      toggle = !toggle_dict[tab.id];
    }
    else{
      first=true;
    }
  }
  if(tab.url != companyURL)
    first=true;
  if(first){
    document.getElementById("body").innerHTML=templateHTML;
    chrome.runtime.onMessage.addListener(listenerCallback);
    initialize();
    launchSequence();
  }
  else if(toggle){
    document.getElementById("body").innerHTML=templateHTML;
    chrome.tabs.sendMessage(tab_id, {greeting: "toggle on",message:document.getElementById("ceo_hunter").innerHTML});
    launchSequence();
  }
  else{
      // console.log("literally calling the off function");
      chrome.tabs.sendMessage(tab_id, {greeting: "toggle off",message:document.getElementById("ceo_hunter").innerHTML});
      toggle = true;
      toggle_dict[tab_id]=toggle;
  }

});