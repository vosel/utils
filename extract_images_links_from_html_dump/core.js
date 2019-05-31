
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

//This is a helper function which converts links from the json strings (they have escape sequences befor the '/' symbols)
function unescapeJsonFormattedLinkIfNeeded(urlToProcess)
{
	return urlToProcess.split("\\/").join("/");
}

// Note: the 'outputObject', should be used as a outlet for the results. This object should have newUrl() function for processing them.
function MyLinesProcessor(outputObject)
{
	this.output = outputObject;
	this.links_duplication_filter = {};
	this.process = function (lineToProcess) {
		var index = 0;
		while ((index <= lineToProcess.length) && (index >= 0)) {
			var searchResult = indexOfAny(lineToProcess, [".png", ".svg", ".jpg", ".avi", ".mkv", ".mp4"], index + 1);
			if (searchResult != null) {
				var url = unescapeJsonFormattedLinkIfNeeded(backTrackAndExtractUrl(searchResult.index, lineToProcess));
				index = searchResult.index;
				if (this.links_duplication_filter[url] == null) {
					this.output.newUrl(url);
					this.links_duplication_filter[url] = {};
				} else {
					this.output.duplicatedUrl(url);
				}
			} else {
				return;
			}
		}
	}
}
