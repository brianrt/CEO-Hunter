// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This extension demonstrates using chrome.downloads.download() to
// download URLs.

var allContacts = [];
var visibleContacts = [];
var contactopened = false;
var companyname;
var tabid="";
var linkedintab;
var tabsToClose = [];

// Remove duplicates and invalid URLs.
function cleanList(){
  var kBadPrefix = 'javascript';
  var phoneExists=false;
  var emailExists=false;
  var changeflag = false;
  for (var i = 0; i < visibleContacts.length;) {
    if (emailExists || phoneExists||((i > 0) && (visibleContacts[i] == visibleContacts[i - 1])) ||
        (visibleContacts[i] == '') ||
        (kBadPrefix == visibleContacts[i].toLowerCase().substr(0, kBadPrefix.length))) {
      visibleContacts.splice(i, 1);
    }
    else {
      var element = visibleContacts[i];
      if(element.includes("Phone")){
        phoneExists=true;
      }
      if(element.includes("Email")){
        emailExists=true;
      }
      ++i;
    }
  }
}

//Todo: finish implimenting this
function getCompanyName(){
  var url = "";
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
    url = tabs[0].url;
    console.log(url);
  });
  
  if(url.includes("www.")){
    url = url.substring(url.indexOf("www.")+4,url.length);
  }
  if(url.includes("://")){
      url = url.substring(url.indexOf("://")+3,url.length);
  }
  return url.substring(0,url.indexOf("."));

}

function closeTabs(){
    chrome.tabs.remove(tabsToClose, function() { });
}

function getCompanyName(url){
  if(url.includes("www.")){
    url = url.substring(url.indexOf("www.")+4,url.length);
  }
  if(url.includes("://")){
    url = url.substring(url.indexOf("://")+3,url.length);
  }
  url = url.substring(0,url.indexOf("."));
  return url;
}

function LinkedIn(){
  console.log("in linkedin function");
  var url;
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
      var url = tabs[0].url;
      var query = "https://www.google.com/#q="+url+"+LinkedIn";
      chrome.tabs.create({ url: query, active:false },function(tab){
          tabsToClose.push(tab.id);
          setTimeout(function(){ 
            chrome.tabs.executeScript(tab.id,{file: 'googleResults.js',allFrames: true},function(){
                chrome.tabs.sendMessage(tab.id, {greeting: url}, function(response) {
                    var linkedinUrl = response.farewell;
                    chrome.tabs.create({ url: linkedinUrl, active:false },function(tab){
                        tabsToClose.push(tab.id);
                        setTimeout(function(){ 
                            chrome.tabs.executeScript(tab.id, {file: 'LinkedInScraper.js', allFrames: true}, function(){
                            chrome.tabs.sendMessage(tab.id, {greeting: url}, function(response) {
                                var companyUrl = response.farewell;
                                chrome.tabs.create({ url: companyUrl, active:false },function(tab){
                                    tabsToClose.push(tab.id);
                                    setTimeout(function(){ 
                                      chrome.tabs.executeScript(tab.id,{file: 'searchResult.js',allFrames: true},function(){
                                        
                                      });
                                    }, 4000);
                                });
                            });
                        });
                        }, 4000);
                        
                    });
                });
            });
          }, 3000);

      });
  });
}

//Takes all contact information in visibleContacts
function showContacts() {
  cleanList();
  var contactsTable = document.getElementById('contacts');
  while (contactsTable.children.length > 1) {
    contactsTable.removeChild(contactsTable.children[contactsTable.children.length - 1])
  }
  for (var i = 0; i < visibleContacts.length; ++i) {
    var row = document.createElement('tr');
    var col1 = document.createElement('td');
    col1.innerText = visibleContacts[i];
    col1.style.whiteSpace = 'nowrap';
    col1.onclick = function() {
      checkbox.checked = !checkbox.checked;
    }
    row.appendChild(col1);
    contactsTable.appendChild(row);
  }
  if(tabid!="")
    chrome.tabs.remove(tabid, function() { });
}

// Add contacts to allContacts and visibleContacts, sort and show them.  send_contacts.js is
// injected into all frames of the active tab, so this listener may be called
// multiple times.



chrome.extension.onRequest.addListener(function(contacts) {
  if(typeof contacts === 'string'){
    if(contacts.includes("name")){
      document.getElementById("LinkedIn").innerHTML=contacts.substring(4);
      closeTabs();
    }
    else if(!contactopened){
      chrome.tabs.create({ url: contacts, active:false },function(tab){
        chrome.tabs.executeScript(tab.id, {file: 'contactPageScript.js', allFrames: true});
        tabid = tab.id;
      });
      contactopened=true;
    }
  }
  else if(contacts.constructor === Array){
    if(contacts.length>0)
      visibleContacts=[];
    for (var index in contacts) {
      allContacts.push(contacts[index]);
    }
    allContacts.sort();
    visibleContacts = allContacts;
    showContacts();
  }
});

// Set up event handlers and inject send_contacts.js into all frames in the active
// tab.
window.onload = function() {
 LinkedIn();
  chrome.windows.getCurrent(function (currentWindow) {
    var script = 'send_contacts.js';
    chrome.tabs.getSelected(null,function(tab) {
      if(tab.url.toLowerCase().includes("contact"))
        script = 'contactPageScript.js';
    });
    chrome.tabs.query({active: true, windowId: currentWindow.id},function(activeTabs) {
      chrome.tabs.executeScript(
        activeTabs[0].id, {file: script, allFrames: true});
    });
  });
};
