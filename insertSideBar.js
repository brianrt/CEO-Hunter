var extensionDiv;
var body;
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.greeting == "initial load"){
			body = request.message;
			extensionDiv = document.createElement('div');
			extensionDiv.id = 'extension';
			extensionDiv.innerHTML = body;
			extensionDiv.style.position = "fixed";
			extensionDiv.style.top="50px";
			extensionDiv.style.right="10px";
			extensionDiv.style.width="300px";
			extensionDiv.style.zIndex="5000";
			extensionDiv.style.textAlign = "center";
			extensionDiv.style.backgroundColor = "white";
			extensionDiv.style.border = "thin solid #333333";
			extensionDiv.style.borderRadius = "8px";
			document.documentElement.appendChild(extensionDiv);
		}
		else if(request.greeting == "update data"){
			var body = request.message;
			extensionDiv.innerHTML = body;
		}
		else if(request.greeting == "toggle off"){
			console.log("toggle off");
			// extensionDiv.innerHTML = "";
			extensionDiv.style.width="0px";
			extensionDiv.style.right = "-100px";
		}
		else if(request.greeting == "toggle on"){
			console.log("toggle on");
			extensionDiv.innerHTML = request.message;
			extensionDiv.style.width="300px";
			extensionDiv.style.right = "10px";			
		}
});