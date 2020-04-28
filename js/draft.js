if (!NodeList.prototype.forEach && Array.prototype.forEach) {
	NodeList.prototype.forEach = Array.prototype.forEach;
}

function refreshData(name) {
	var LS = name + "_LS";
	var rank = document.querySelector('input[name =' + CSS.escape(name + "_rank") + ']:checked').value;
	switch (rank) {
		case "AS":
		case "Both":
		case "5":
			document.getElementById(name).setAttribute("data-rank", "5");
			break;
		default:
			document.getElementById(name).setAttribute("data-rank", rank);
	}
}

function generate() {
	// Reset existing element, if any
	document.getElementById("output").style.display = "block";
	var nodeBr = document.querySelectorAll("table#output br").forEach(e => e.parentNode.removeChild(e));
	document.querySelectorAll("table#output div").forEach(e => e.parentNode.removeChild(e));
	var charList = document.querySelectorAll('table#charList tr:not(:first-child)');
	for (i = 0; i < charList.length; i++) {
		refreshData(charList[i].id);
	}

	// Generate images in the template table
	function copyImg(rank) {
		var charNodeList = document.querySelectorAll('tr[data-rank = "' + rank + '"]'); // Returns a nodeList of characters with given rank
		if (charNodeList.length > 0) {
			document.getElementById(rank + "-star").style.display = "block";
			document.getElementById(rank + "-star").innerHTML += "<br>";
		} else {
			document.getElementById(rank + "-star").style.display = "none";
		}
		for (i = 0; i < charNodeList.length; i++) {
			var rareType = document.querySelector('input[name =' + CSS.escape(charNodeList[i].id + "_rank") + ']:checked').value; // Returns 3, 4, 5, AS, Both
			var LS_value = document.getElementById(charNodeList[i].id + "_LS").value; // Returns value between 0 and 255
			var LS_type = document.getElementById(charNodeList[i].id).className; // Returns Light or Shadow
			switch (rareType) {
				case "Both":
					document.getElementById("5-star").innerHTML += '<div class="container"><img src="img/' + charNodeList[i].id + '.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
					document.getElementById("5-star").innerHTML += '<div class="container"><img src="img/' + charNodeList[i].id + '_AS.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
					break;
				case "AS":
					document.getElementById("5-star").innerHTML += '<div class="container"><img src="img/' + charNodeList[i].id + '_AS.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
					break;
				default:
					document.getElementById(rank + "-star").innerHTML += '<div class="container"><img src="img/' + charNodeList[i].id + '.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
			}
		}
	}
	copyImg(5);
	copyImg(4);
	copyImg(3);
}
	
function convert() {	
	domtoimage.toJpeg(document.getElementById('output'), { quality: 0.95 })
		.then(function (dataUrl) {
			var link = document.createElement('a');
			link.download = 'my-image-name.jpeg';
			link.href = dataUrl;
			link.click();
		});
}