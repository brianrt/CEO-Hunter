// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This extension demonstrates using chrome.downloads.download() to
// download URLs.

var allContacts = [];
var visibleContacts = [];
var contactopened = false;
var tabid;

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
