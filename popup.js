// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This extension demonstrates using chrome.downloads.download() to
// download URLs.

var allContacts = [];
var visibleContacts = [];
var contactopened = false;
var tabid="";

// Remove duplicates and invalid URLs.
function cleanList(){
  var kBadPrefix = 'javascript';
  var phoneExists=false;
  var changeflag = false;
  for (var i = 0; i < visibleContacts.length;) {
    if (phoneExists||((i > 0) && (visibleContacts[i] == visibleContacts[i - 1])) ||
        (visibleContacts[i] == '') ||
        (kBadPrefix == visibleContacts[i].toLowerCase().substr(0, kBadPrefix.length))) {
      visibleContacts.splice(i, 1);
    }
    else {
      var element = visibleContacts[i];
      if(element.includes("Phone")){
        phoneExists=true;
      }
      ++i;
    }
  }
}

function LinkedIn(){
  console.log("in linkedin function");
  var state_start = "DJFAKdj839jiw829llmsj";
  chrome.identity.launchWebAuthFlow(
    {'url': 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=771qad4rlidbzm&redirect_uri=https://aiamlfbdpnglpcnhhgbmjnhlijhcalml.chromiumapp.org&state='+state_start+'&scope=r_basicprofile', 'interactive': true},
    function(redirect_url) { /* Extract token from redirect_url */ 
      
      var start = redirect_url.indexOf("?code=")+6;
      var end = redirect_url.indexOf("&state=");
      var code = redirect_url.substring(start, end);
      var state_returned = redirect_url.substring(end+7);
      if(state_start==state_returned){
        console.log("state: "+state_returned);
        console.log("code: "+code);
        console.log(redirect_url);

        // POST /oauth/v2/accessToken HTTP/1.1
        // Host: www.linkedin.com
        // Content-Type: application/x-www-form-urlencoded

        // grant_type=authorization_code&code=987654321&redirect_uri=https%3A%2F%2Fwww.myapp.com%2Fauth%2Flinkedin&client_id=123456789&client_secret=shhdonottell

        var red_url = 'https%3A%2F%2Faiamlfbdpnglpcnhhgbmjnhlijhcalml.chromiumapp.org';
        var url = "https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code="+code+"&redirect_uri="+red_url+"&client_id=771qad4rlidbzm&client_secret=WlkcAe34iAPU9dqj";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send();
         
        xhr.onreadystatechange = processRequest;
         
        function processRequest(e) {
          if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            console.log("access token: "+response["access_token"]);
          }
        }


      }
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
    if(!contactopened){
      chrome.tabs.create({ url: contacts, active:false },function(tab){
        chrome.tabs.executeScript(tab.id, {file: 'contactPageScript.js', allFrames: true});
        tabid = tab.id;
      });
      contactopened=true;
    }
  }
  else{
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
 console.log("finally");
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
