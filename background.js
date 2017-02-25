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
var templateHTML = ' <div id="main_ceo_hunter"><h1 id=mainHeader>CEO Hunter (BETA)</h1><t id=url></t><br><br><t id=LinkedInDescription class=title>Loading CEO Description...</t><br><t id=LinkedInName class=info>Loading CEO Name...</t><br><br><t class=title>Personal Email Address</t><br><t id=personalEmail class=info>Loading Email...</t><br><t id=confidence></t><br><br><t class=title>Company Email Address</t><br><t id=companyEmail class=info>Loading company email...</t><br><br><t class=title>Company Phone #</t><br><t id=companyPhone class=info>Loading phone...</t><br><br><a href="http://www.ceohunter.io/feedback/" style="color:blue;">Report bugs and request new features</a><br><br></div>';

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
      chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
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

function lastResortMantaAttempt(){
}



function setTerminatingConditions(){
  setTimeout(function(){
    if(document.getElementById("LinkedInName").innerHTML == "Loading CEO Name..."){
      WhoIs();
    }else{
      displayNotFound();
    }
  },12000);
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
  if(document.getElementById("companyEmail").innerHTML == "Loading company email..."){
    document.getElementById("companyEmail").innerHTML = "Not found";
  }
  if(document.getElementById("companyPhone").innerHTML == "Loading phone..."){
    document.getElementById("companyPhone").innerHTML = "Not found";
  }
  chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
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
    companyURL = url;
    if(url.includes("www.")){
      url = url.substring(url.indexOf("www.")+4,url.length);
    }
    if(url.includes("://")){
        url = url.substring(url.indexOf("://")+3,url.length);
    }
    companyDomain = url.substring(0,url.indexOf("/"))
    companyName = url.substring(0,url.indexOf("."));
    console.log("domain: "+companyDomain);
    console.log("name: "+companyName);

    GoogleSearch();
    });
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
    whoIsUsed=false;
    getContactInfo();
    setCompanyURL();
    // CrunchBase();
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