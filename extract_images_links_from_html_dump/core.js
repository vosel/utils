
function backTrackAndExtractUrl(indexInsideUrl, lineString)
{
	var startIndex = indexInsideUrl;
	var endIndex = indexInsideUrl;
	var charIsPartOfUrl = function (character) {
		return ((character != '\"') && (character != '\'') && (character != ' ')&& (character != ','));
	};

	do {
		--startIndex;
	} while ((startIndex >= 0) && charIsPartOfUrl(lineString.charAt(startIndex-1)));
	do {
		++endIndex;
	} while ((endIndex < lineString.length-1) && charIsPartOfUrl(lineString.charAt(endIndex)));

	return lineString.substr(startIndex, endIndex - startIndex);
}

function indexOfAny(lineToProcess, arrayOfStringsToSearch, startSearchIndex) {
	var resultToReturn = null;
	for (var i = 0; i < arrayOfStringsToSearch.length; ++i) {
		var entry = arrayOfStringsToSearch[i];
		var resultIndex = lineToProcess.indexOf(entry, startSearchIndex);
		if (resultIndex > 0) {
			if ((resultToReturn == null) || (resultToReturn.index > resultIndex)) {
				resultToReturn = { matchedString: entry, index: resultIndex };
			}
		}
	}
	return resultToReturn;
}

// Note: the 'outputObject', should be used as a outlet for the results. This object should have newUrl() function for processing them.
function MyLinesProcessor(outputObject)
{
	this.output = outputObject;
	this.process = function (lineToProcess) {
		var index = 0;
		while ((index <= lineToProcess.length) && (index >= 0)) {
			var searchResult = indexOfAny(lineToProcess, [".png", ".svg", ".jpg", ".avi", ".mkv", ".mp4"], index + 1);
			if (searchResult != null) {
				var url = backTrackAndExtractUrl(searchResult.index, lineToProcess);
				index = searchResult.index;
				this.output.newUrl(url);
			} else {
				return;
			}
		}
	}
}
