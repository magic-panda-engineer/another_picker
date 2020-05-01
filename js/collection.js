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
	var p = 0;
	document.getElementById("revise").disabled = false;
	if (document.getElementsByTagName("canvas")[0] != null) {
		document.getElementsByTagName("canvas")[0].remove();
	}
	
	// Reset existing element, if any
	document.getElementById("tableOutput").style.display = "table";
	var nodeBr = document.querySelectorAll("table#tableOutput br").forEach(e => e.parentNode.removeChild(e));
	document.querySelectorAll("table#tableOutput div").forEach(e => e.parentNode.removeChild(e));
	var charList = document.querySelectorAll('table#charList tr:not(:first-child)');
	for (i = 0; i < charList.length; i++) {
		refreshData(charList[i].id);
	}

	// Generate images in the template table
	function copyImg(rank) {
		var charNodeList = document.querySelectorAll('tr[data-rank = "' + rank + '"]'); // Returns a nodeList of characters with given rank
		var displayCheck = document.getElementById("opt" + rank).checked;
		if (charNodeList.length > 0 && displayCheck == true) {
			document.getElementById(rank + "-star").style.display = "table-cell";
			document.getElementById(rank + "-star").innerHTML += "<br>";
		} else {
			document.getElementById(rank + "-star").style.display = "none";
		}
		for (i = 0; i < charNodeList.length; i++) {
			var rareType = document.querySelector('input[name =' + CSS.escape(charNodeList[i].id + "_rank") + ']:checked').value; // Returns 3, 4, 5, AS, Both
			var LS_value = document.getElementById(charNodeList[i].id + "_LS").value;	// Returns value between 0 and 255
			var LS_type = document.getElementById(charNodeList[i].id).className;	// Returns Light or Shadow
			csv.value += "\n" + charNodeList[i].id + ',' + LS_value + ',' + rareType;	// Push value to csv Textarea
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
			p++;
		}
	}
	
	scroll(0,0);
	// For 1st row in CSV Textarea
	csv.value = 'Id,LS_value,rareType';
	copyImg(5);
	copyImg(4);
	copyImg(3);
	
	// Options
	if (document.getElementById("title").value != "自定義文字") {
		document.getElementById("tableTitle").innerHTML = document.getElementById("title").value;
	}
	if (document.getElementById("optIncNo").checked == true) {
		document.getElementById("tableTitle").innerHTML += " (" + p + ")";
	}
	if (document.getElementById("optPNG").checked == true) {
		html2canvas(document.getElementById("tableOutput")).then(function(canvas) {
		// html2canvas(document.getElementById("tableOutput"), {y: tableOutput.getBoundingClientRect().y}).then(function(canvas) {
			document.getElementById("canvasOutput").appendChild(canvas);
			document.getElementsByTagName("canvas")[0].id = "canvas";
			var image = canvas.toDataURL("image/jpg", 0.5);
			document.getElementById("download").href = image;
		});
		document.getElementById("charList").style.display = "none";
		document.getElementById("tableOutput").style.display = "none";
	} else {
		document.getElementById("charList").style.display = "none";
	}
}

function revise() {
	document.getElementById("charList").style.display = "table";
	if (document.getElementsByTagName("canvas")[0] != null) {
		document.getElementsByTagName("canvas")[0].remove();
	}
	document.getElementById("options").scrollIntoView(false);
	console.log("charList display style has been undone.");
}

function importCSV() {
	var lines = $('#csv').val().split(/\n/);
	var texts = [];
	for (i = 0; i < lines.length; i++) {
		// only push this line if it contains a non whitespace character.
		if (/\S/.test(lines[i])) {
			texts.push($.trim(lines[i]));
			var array = texts[i].split(',');
			if (i > 0) {	// Skip header line
				
				// Check validity and set LS value
				var id_LS = document.getElementById(array[0] + "_LS");
				if (id_LS != null && array[1] < 256 && array[1] > -1) {
					id_LS.value = array[1];
				} else {
					alert("Given data is corrupted: {"+ texts[i] + "} - invalid LS value");
				}
				
				// Checck validity and set rareType
				var id_rareType = document.getElementsByName(array[0] + "_rank");
				if (!["0", "3", "4", "5", "AS", "Both"].includes(array[2])) {
					alert("Given data is corrupted: {"+ texts[i] + "} - invalid rank");
				}
				for (options = 0; options < id_rareType.length; options++) {
					if (id_rareType[options].value == array[2]) {
						if (id_rareType[options].disabled == false) {
							id_rareType[options].checked = true;
						} else {
							alert("Given data is corrupted: {"+ texts[i] + "} - unavailable rank");
						}
					}
				}
			}
		}
	}
}

function downloadCSV() {
	var universalBOM = "\uFEFF";
	// The download function takes a CSV string, the filename and mimeType as parameters
	// Scroll/look down at the bottom of this snippet to see how download is called
	var download = function(content, fileName, mimeType) {
		var a = document.createElement('a');
		mimeType = mimeType || 'application/octet-stream';

		if (navigator.msSaveBlob) { // IE10
			navigator.msSaveBlob(new Blob([content], {
				type: mimeType
			}), fileName);
		} else if (URL && 'download' in a) { //html5 A[download]
			a.href = URL.createObjectURL(new Blob([content], {
				type: mimeType
			}));
			a.setAttribute('download', fileName);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} else {
			location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
		}
	}

	download(universalBOM + $('#csv').val(), 'collection.csv', 'text/csv;encoding:utf-8');
}