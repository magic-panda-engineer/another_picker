function toEn() {
	document.getElementById("toZh").style.display = "inline";
	document.getElementById("toEn").style.display = "none";
	document.getElementById("note-en").style.display = "block";
	document.getElementById("note-zh").style.display = "none";
	document.getElementById("generate").innerHTML = "Generate";
	document.getElementById("revise").innerHTML = "Modify";
	document.getElementById("import").innerHTML = "Import";
	document.getElementById("downloadCSV").innerHTML = "Save";
	document.getElementById("lab_opt5").lastChild.data = "Show 5★ + AS";
	document.getElementById("lab_opt4").lastChild.data = "Show 4★";
	document.getElementById("lab_opt3").lastChild.data = "Show 3★";
	document.getElementById("lab_optIncNo").lastChild.data = "Title include number of characters";
	document.getElementById("lab_optSumLS").lastChild.data = "Calculate dreams' character light/shadow sum";
	document.getElementById("lab_optRatioLS").lastChild.data = "Calculate dreams' character light/shadow ratio";
	document.getElementById("lab_optPNG").lastChild.data = "Direct PNG output (Does not support iPhone)";
	var buttonList = document.querySelectorAll("button");
	for (i = 0; i < buttonList.length; i++) {
		buttonList[i].style = "width: 75px";
	}
}

function refreshData(name) {
	var LS = name + "_LS";
	console.log('input[name="' + name + "_rank" + '"]:checked');
	var rank = document.querySelector('input[name="' + name + "_rank" + '"]:checked').value;
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
	var nodeDiv = document.querySelectorAll("table#tableOutput div");
	for (e = 0; e < nodeDiv.length; e++) {
		nodeDiv[e].remove();
	}
	var charList = document.querySelectorAll('table#charList tr:not(:first-child)');
	for (i = 0; i < charList.length; i++) {
		refreshData(charList[i].id);
	}

	// Generate images in the template table
	function copyImg(rank) {
		var charNodeList = document.querySelectorAll('tr[data-rank = "' + rank + '"]'); // Returns a nodeList of characters with given rank
		var displayCheck = document.getElementById("opt" + rank).checked;
		var sumLS = 0;
		if (charNodeList.length > 0 && displayCheck == true) {
			document.getElementById(rank + "-star").style.display = "table-cell";
			for (i = 0; i < charNodeList.length; i++) {
				var rareType = document.querySelector('input[name =' + escape(charNodeList[i].id + "_rank") + ']:checked').value; // Returns 3, 4, 5, AS, Both
				var LS_value = document.getElementById(charNodeList[i].id + "_LS").value; // Returns value between 0 and 255
				var LS_type = document.getElementById(charNodeList[i].id).classList[0]; // Returns Light or Shadow
				csv.value += "\n" + charNodeList[i].id + ',' + LS_value + ',' + rareType; // Push value to csv Textarea
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
				if (document.getElementById(charNodeList[i].id).classList[1] == "Dream") {
					sumLS += parseInt(LS_value);
				}
				p++;
			}
			document.getElementById("sumLS" + rank).innerHTML = sumLS;
		} else {
			document.getElementById(rank + "-star").style.display = "none";
		}
	}

	

	// Options and process
	if (document.getElementById("title").value != "自定義文字") {
		document.getElementById("tableTitle").innerHTML = document.getElementById("title").value;
		csv.value = 'Id,LS_value,rareType,title:'+document.getElementById("title").value; // Header line in CSV Textarea w/ title
	} else {
		document.getElementById("tableTitle").innerHTML = "";
		csv.value = 'Id,LS_value,rareType'; // Header line in CSV Textarea w/o
	}
	
	scroll(0, 0); // Scroll to top to avoid html2canvas generating blank image
	copyImg(5);
	copyImg(4);
	copyImg(3);
	
	if (document.getElementById("optIncNo").checked == true) {
		document.getElementById("tableTitle").innerHTML += " (" + p + ")";
	}
	
	// Convert sumLS to ratioLS
	document.getElementById("ratioLS5").innerHTML = parseFloat(document.getElementById("sumLS5").innerHTML/document.getElementById("sumLS3").innerHTML).toFixed(2);
	document.getElementById("ratioLS4").innerHTML = parseFloat(document.getElementById("sumLS4").innerHTML/document.getElementById("sumLS3").innerHTML).toFixed(2);
	if (document.getElementById("optSumLS").checked == true) {
		document.getElementById("sumLS").style.display = "block";
	} else {
		document.getElementById("sumLS").style.display = "none";
	}
	if (document.getElementById("optRatioLS").checked == true) {
		document.getElementById("ratioLS").style.display = "block";
	} else {
		document.getElementById("ratioLS").style.display = "none";
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
		}
			
		if (i == 0) { // Special handler for first line (check if it is a header line or content line)
			if (lines[0].indexOf("Id") == 0 ) {	
				console.log("Header line exists.");
				var j = 0; // [0: Header line | 1: Content line]
				if (lines[0].indexOf("title") > 0 ) {
					var t = lines[0].indexOf("title");
					console.log("Title found: [" + (t+6) + "] " + lines[0].substring(t+6));
					document.getElementById("title").value = lines[0].substring(t+6);
				}
			} else {
				var j = 1;
			}
		}
			
		if (j == 1) { // Only execute the below script for content line.

			// Check validity and set LS value
			var id_LS = document.getElementById(array[0] + "_LS");
			if (id_LS != null && array[1] < 256 && array[1] > -1) {
				id_LS.value = array[1];
			} else {
				alert("Given data is corrupted: {" + texts[i] + "} - invalid LS value");
			}

			// Check validity and set rareType
			var id_rareType = document.getElementsByName(array[0] + "_rank");
			if (["0", "3", "4", "5", "AS", "Both"].indexOf(array[2]) === -1) {
				alert("Given data is corrupted: {" + texts[i] + "} - invalid rank");
			}
			for (options = 0; options < id_rareType.length; options++) {
				if (id_rareType[options].value == array[2]) {
					if (id_rareType[options].disabled == false) {
						id_rareType[options].checked = true;
					} else {
						alert("Given data is corrupted: {" + texts[i] + "} - unavailable rank");
					}
				}
			}
		} else {
			j = 1; // Enable the above script after header line.
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
