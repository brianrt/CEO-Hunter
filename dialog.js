document.forms[0].onsubmit = function(e) {
   e.preventDefault(); // Prevent submission
   var positions = document.getElementsByName('position');
   console.log(positions);
   for(var i = 0; i < positions.length; i++){
      var position = positions[i];
      if(position.checked){
         window.close();
         chrome.runtime.getBackgroundPage(function(bgWindow) {
            bgWindow.setPosition(position.value);
         });
         break;
      }
   }
};