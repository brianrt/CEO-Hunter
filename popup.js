var companyDomain;
var companyURL;
var companyName;
var tab_id;

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
    if (request.greeting == "company linkedin page"){
        console.log(request.message);
        // chrome.tabs.update( tab_id, { url: companyURL });
    }
    if (request.greeting == "search result"){
        findAllEmployees(request.message);
    }
    if (request.greeting == "contacts"){
        var contacts = request.message;
        for (var index in contacts) {
            var element=contacts[index];
            if(element.includes("Email"))
                document.getElementById("companyEmail").innerHTML=element.substring(7);
            else if(element.includes("Phone"))
                document.getElementById("companyPhone").innerHTML=element.substring(7);
        }
    }
    else if(request.greeting == "contact urls"){
        var contactUrl = request.message;
        console.log("contact urls: "+request.message);
        // chrome.tabs.create({ url: contactUrl, active:false },function(tab){
        //     chrome.tabs.executeScript(tab.id, {file: 'contactPageScript.js', allFrames: true});
        // });

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
                    chrome.runtime.sendMessage({
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

window.onload = function() {
    chrome.runtime.onMessage.addListener(listenerCallback);
    getContactInfo();
    LinkedIn();
}