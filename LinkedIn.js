var companyWindowCreated = false;
var employeeWindowCreated = false;
var googleWindowCreated = false;
var companyWindowId;
var employeeWindowId;
var googleWindowId;
var currWindowId;

function LinkedIn(){
  chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        console.log(url);
        // document.getElementById("url").innerHTML="www."+companyDomain;
        // document.getElementById("url").style.textDecoration = "underline";
        console.log(companyDomain);
        var query = companyDomain;
        openGooglePage(query);
    });
}


function openGooglePage(query){
  var access_key = 'AIzaSyAiU6yCuGGU3Y06iHvlprmXsMlgVhswdAQ';
  var engine_id = '005408335780428068463:obi6mjahzr4';
  var url = "https://www.googleapis.com/customsearch/v1?key="+access_key+"&cx="+engine_id+"&q="+query+"&exactTerms=LinkedIn";
  console.log(url);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      if(resp.searchInformation.totalResults == 0){
        return;
      }
      var result = resp.items[0].link;
      console.log(result);
      listenerCallback({
        greeting: "search result",
        message: result
      });
    }
  }
  xhr.send();
}

function openCompanyPage(url){
  if(!companyWindowCreated){
    chrome.tabs.create({ url: url, active: false}, function (newTab) {
      chrome.windows.getCurrent(function(currentWindow) {
        chrome.windows.create({
          tabId: newTab.id,
          type: 'popup',
          focused: false,
          width: 100,
          height: 100,
          left: currentWindow.left,
          top: currentWindow.top,
        }, function (w) {
          companyWindowCreated=true;
          companyWindowId = w.id;
          currWindowId = currentWindow.id;
            setTimeout(function(){
              chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedIn.js", allFrames: false});
            },3000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : companyWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedIn.js", allFrames: false});
      },3000);
      chrome.windows.update(currWindowId, {focused:true});
    });
  }
}

function openEmployeePage(url){
  if(!employeeWindowCreated){
    chrome.tabs.create({ url: url, active: false}, function (newTab) {
      chrome.windows.getCurrent(function(currentWindow) {
        chrome.windows.create({
          tabId: newTab.id,
          type: 'popup',
          focused: false,
          width: 100,
          height: 100,
          left: currentWindow.left,
          top: currentWindow.top,
        }, function (w) {
          employeeWindowCreated=true;
          employeeWindowId = w.id;
          currWindowId = currentWindow.id;
            setTimeout(function(){
              chrome.tabs.executeScript(newTab.id, {"file": "searchResult.js", allFrames: false},function(){
                chrome.tabs.sendMessage(newTab.id, {"greeting" : companyName});
              });
            },000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : employeeWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "searchResult.js", allFrames: false},function(){
                chrome.tabs.sendMessage(newTab.id, {"greeting" : companyName});
              });
      },000);
      chrome.windows.update(currWindowId, {focused:true});
    });
  }
}