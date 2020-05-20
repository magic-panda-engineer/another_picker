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
	document.getElementById("lab_optIncNo").lastChild.data = "Title includes number of characters";
	document.getElementById("lab_optIncDate").lastChild.data = "Title includes generation date";
	document.getElementById("lab_optSumLS").lastChild.data = "Calculate dreams' character light/shadow sum";
	document.getElementById("lab_optRatioLS").lastChild.data = "Calculate dreams' character light/shadow ratio";
	document.getElementById("lab_optPNG").lastChild.data = "Direct PNG output (Does not support iPhone)";
	document.getElementById("ratioLS").firstChild.data = " Dreams' character L/S ratio [";
	document.getElementById("sumLS").firstChild.data = " Dreams' character L/S sum [";
	var buttonList = document.querySelectorAll("button");
	for (i = 0; i < buttonList.length; i++) {
		buttonList[i].style = "width: 75px";
	}
}

function refreshData(name) {
	var LS = name + "_LS";
	var rank = document.querySelector('input[type="radio"][name="' + name + "_rank" + '"]:checked').value;
	document.getElementById(name).setAttribute("data-rank", rank);
}

function generate() {
	var p = 0; // population
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
	var charList = document.querySelectorAll('table#charList tbody tr');
	for (i = 0; i < charList.length; i++) {
		refreshData(charList[i].id);
	}

	// Options and process
	if (document.getElementById("title").value != "自定義文字") {
		document.getElementById("tableTitle").innerHTML = document.getElementById("title").value;
		document.getElementById("csv").value = 'Id,LS_value,rarity,title:' + document.getElementById("tableTitle").innerHTML; // Header line in CSV Textarea w/ title
	} else {
		document.getElementById("tableTitle").innerHTML = "";
		document.getElementById("csv").value = 'Id,LS_value,rarity'; // Header line in CSV Textarea w/o
	}

	scroll(0, 0); // Scroll to top to avoid html2canvas generating blank image
	var sum5 = 0;
	var sum4 = 0;
	var sum3 = 0;
	for (rank = 5; rank >= 3; rank--) {
		document.getElementById(rank + "-star").style.display = "none";
	}

	// Generate images in the template table
	for (i = 0; i < charList.length; i++) {
		var rank = charList[i].dataset.rank;
		var AS = document.querySelector('input[type="checkbox"][name="' + escape(charList[i].id + "_rank") + '"]').checked;
		var LS_value = parseInt(document.getElementById(charList[i].id + "_LS").value); // Returns value between 0 and 255
		var LS_type = document.getElementById(charList[i].id).classList[0]; // Returns Light or Shadow
		if (document.getElementById(charList[i].id).classList[1] == "Dream") {
			if (AS == true) {
				sum5 += parseInt(LS_value);
			} else {
				switch (rank) {
					case "5":
						sum5 += LS_value;
						break;
					case "4":
						sum4 += LS_value;
						break;
					case "3":
						sum3 += LS_value;
						break;
				}
			}
		}
		if (rank != "0") {
			document.getElementById(rank + "-star").style.display = "table-cell";
			document.getElementById(rank + "-star").innerHTML += '<div class="container"><img src="img/' + charList[i].id + '.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
			p++;
			if (AS == true) {
				document.getElementById("5-star").style.display = "table-cell";
				document.getElementById("5-star").innerHTML += '<div class="container"><img src="img/' + charList[i].id + '_AS.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
				document.getElementById("csv").value += "\n" + charList[i].id + "," + LS_value + "," + "A" + rank; // Push value to csv Textarea | A3, A4, A5 for AS characters
			} else {
				if (!(LS_value == "" && rank == "0")) {
					document.getElementById("csv").value += "\n" + charList[i].id + "," + LS_value + "," + rank; // Push value to csv Textarea
				} else if (LS_value > 0) {
					console.log("Invalid input found: {" + charList[i].id + "," + LS_value + "," + rank + "} - Given L/S value without rank.");
				}
			}
		} else if (AS == true) {
			document.getElementById("5-star").style.display = "table-cell";
			document.getElementById("5-star").innerHTML += '<div class="container"><img src="img/' + charList[i].id + '_AS.jpg"><div class="output' + LS_type + '">' + LS_value + '</div></div>';
			document.getElementById("csv").value += "\n" + charList[i].id + "," + LS_value + "," + "A0"; // Push value to csv Textarea
			p++;
		}

	}

	// Update dreams' light/shadow values
	document.getElementById("sumLS5").innerHTML = sum5;
	document.getElementById("sumLS4").innerHTML = sum4;
	document.getElementById("sumLS3").innerHTML = sum3;

	// Hide unwanted output
	for (rank = 5; rank >= 3; rank--) {
		if (document.getElementById("opt" + rank).checked == false) {
			document.getElementById(rank + "-star").style.display = "none";
		}
	}

	// Display population number per setting
	if (document.getElementById("optIncNo").checked == true) {
		document.getElementById("tableTitle").innerHTML += " (&#128101; " + p + ")";
	}

	// Display input date per setting
	if (document.getElementById("optIncDate").checked == true) {
		document.getElementById("tableTitle").innerHTML += " (&#128197;" + new Date().toISOString().slice(0, 10) + ")";
	}

	// Convert sumLS to ratioLS
	document.getElementById("ratioLS5").innerHTML = parseFloat(parseFloat(document.getElementById("sumLS5").innerHTML / document.getElementById("sumLS3").innerHTML).toFixed(2));
	document.getElementById("ratioLS4").innerHTML = parseFloat(parseFloat(document.getElementById("sumLS4").innerHTML / document.getElementById("sumLS3").innerHTML).toFixed(2));
	if (document.getElementById("optSumLS").checked == true) {
		document.getElementById("sumLS").style.display = "block";
	} else {
		document.getElementById("sumLS").style.display = "none";
	}
	if (document.getElementById("optRatioLS").checked != true || document.getElementById("sumLS3").innerHTML == "0") { // also hide if no 3-star input
		document.getElementById("ratioLS").style.display = "none";
	} else {
		document.getElementById("ratioLS").style.display = "block";
	}

	// Convert HTML to PNG
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
	// Wipe existing inputs
	var charLS = document.querySelectorAll("tbody tr td input[type='number']");
	for (i = 0; i < charLS.length; i++) {
		charLS[i].value = "";
	}
	var charRarity = document.querySelectorAll("tbody tr td input[type='radio']");
	for (i = 0; i < charRarity.length; i++) {
		if (charRarity[i].value == "0") {
			charRarity[i].checked = true;
		}
	}
	var charAS = document.querySelectorAll("tbody tr td input[type='checkbox']");
	for (i = 0; i < charAS.length; i++) {
		charAS[i].checked = false;
	}

	// Remove optIncNo and optIncDate if checked
	// if (document.getElementById("optIncDate").checked == true) {
	// if (substr(0, t.lastIndexOf("("));

	// Legacy converter
	var textArea = document.getElementById("csv").value;
	if (textArea.indexOf("AS") > 0 || textArea.indexOf("Both") > 0) {
		console.log("Legacy CSV format found.");
		document.getElementById("csv").value = textArea.replace(/AS/g, "A0").replace(/Both/g, "A5");
	}
	if (textArea.indexOf("Nopaew") > 0) {
		console.log("Legacy CSV Id found.");
		document.getElementById("csv").value = textArea.replace(/Nopaew/g, "Poporo");
	}

	var lines = $('#csv').val().split(/\n/)
	var texts = [];

	for (i = 0; i < lines.length; i++) {
		// only push this line if it contains a non whitespace character.
		if (/\S/.test(lines[i])) {
			texts.push($.trim(lines[i]));
			var array = texts[i].split(',');
		}

		if (i == 0) { // Special handler for first line (check if it is a header line or content line)
			if (lines[0].indexOf("Id") == 0) {
				console.log("Header line exists.");
				var j = 0; // [0: Header line | 1: Content line]
				if (lines[0].indexOf("title") > 0) {
					var t = lines[0].indexOf("title");
					console.log("Title found: [" + (t + 6) + "] " + lines[0].substring(t + 6));
					document.getElementById("title").value = lines[0].substring(t + 6);
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

			// Check validity and set rarity
			var id_rarity = document.querySelectorAll('input[type="radio"][name="' + escape(array[0] + "_rank") + '"]');
			if (["3", "4", "5", "A0", "A3", "A4", "A5", "AS", "Both"].indexOf(array[2]) === -1) {
				alert("Given data is corrupted: {" + texts[i] + "} - invalid rank"); // AS and Both for legacy compatibility
			}
			for (options = 0; options < id_rarity.length; options++) {

				// Import AS info, then remove AS indicator in array
				if (array[2].charAt(0) == "A") {
					if (document.querySelector("input[type='checkbox'][name='" + escape(array[0] + "_rank") + "']").disabled == false) {
						document.querySelector("input[type='checkbox'][name='" + escape(array[0] + "_rank") + "']").checked = true;
					} else {
						alert("Given data is corrupted: {" + texts[i] + "} - unavailable AS rank");
						console.log("Given data is corrupted: {" + texts[i] + "} - unavailable AS rank");
						console.log(document.querySelector("input[type='checkbox'][name='" + escape(array[0] + "_rank") + "']").disabled);
					}
					if (id_rarity[options].value == array[2].charAt(1)) {
						if (id_rarity[options].disabled == false) {
							id_rarity[options].checked = true;
						} else {
							alert("Given data is corrupted: {" + texts[i] + "} - unavailable rank");
							console.log("Given data is corrupted: {" + texts[i] + "} - unavailable rank");
							console.log(id_rarity[options].value == array[2].charAt(1));
						}
					}
				} else {
					// Import rarity info for non-AS characters
					if (id_rarity[options].value == array[2]) {
						if (id_rarity[options].disabled == false) {
							id_rarity[options].checked = true;
						} else {
							alert("Given data is corrupted: {" + texts[i] + "} - unavailable rank");
							console.log("Given data is corrupted: {" + texts[i] + "} - unavailable rank");
							console.log((id_rarity[options].disabled == false));
						}
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
