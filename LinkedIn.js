var companyWindowCreated = false;
var employeeWindowCreated = false;
var googleWindowCreated = false;
var companyWindowId;
var employeeWindowId;
var googleWindowId;
var currWindowId;

function setCompany(url){
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
}

function LinkedIn(){
  chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(tabs){
        var url = tabs[0].url;
        setCompany(url);
        document.getElementById("url").innerHTML="www."+companyDomain;
        document.getElementById("url").style.textDecoration = "underline";
        console.log(companyDomain);
        var query = "https://www.google.com/#q="+companyDomain+"+LinkedIn";
        openGooglePage(query);
        // var query = "http://www.bing.com/search?q=Linkedin+"+companyDomain;
        // console.log(query);
        // $.ajax
        // (
        //     { 
        //         url: query,
        //         success: function(data) {
        //             var d = document.createElement('div');
        //             d.innerHTML = data;
        //             var results = d.getElementsByClassName("b_algo");
        //             var result = results[0];
        //             for(var i = 0; i < results.length; i++){
        //                 var div = results[i].getElementsByTagName("a")[0];
        //                 var title = div.innerHTML;
        //                 if(title.toLowerCase().includes("linkedin") && title.replace(/\W/g, '').toLowerCase().includes(companyName.replace(/\W/g, '').toLowerCase())){
        //                     console.log(title+": "+result);
        //                     console.log(title.replace(/\D/g,''));
        //                     console.log(companyName.replace(/\W/g, ''));
        //                     result = results[i];
        //                     break;
        //                 }
        //             }
        //             var div = result.getElementsByTagName("a")[0];
        //             var url = div.getAttribute("href");
        //             listenerCallback({
        //               greeting: "search result",
        //               message: url
        //             });

        //         }
        //     }
        // );
    });
}

function openGooglePage(url){
  if(!googleWindowCreated){
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
          googleWindowCreated=true;
          googleWindowId = w.id;
          currWindowId = currentWindow.id;
            setTimeout(function(){
              chrome.tabs.executeScript(newTab.id, {"file": "googleResults.js", allFrames: true});
            },5000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : googleWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "googleResults.js", allFrames: true});
      },3000);
      chrome.windows.update(currWindowId, {focused:true});
    });
  }
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
              chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedIn.js", allFrames: true});
            },3000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : companyWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedIn.js", allFrames: true});
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
              chrome.tabs.executeScript(newTab.id, {"file": "searchResult.js", allFrames: true});
            },000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : employeeWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "searchResult.js", allFrames: true});
      },000);
      chrome.windows.update(currWindowId, {focused:true});
    });
  }
}