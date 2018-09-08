function findCommonElements(arrayOfArraysOfStrings, thresholdCount, arrayOfExceptions)
{
	var setsOfElements = [];
	
	var createMapOfStrings = function(arrayOfValues) {
		var result = {};
		for (var i = 0; i < arrayOfValues.length; ++i) {
			var currentString = arrayOfValues[i];
			result[currentString] = 1;
		}
		return result;
	};
	for (var i = 0; i < arrayOfArraysOfStrings.length; ++i) {
		setsOfElements.push(createMapOfStrings(arrayOfArraysOfStrings[i]));
	}
	var setOfExceptions = createMapOfStrings(arrayOfExceptions);

	var countsForElements = {};
	for (var i = 0; i < setsOfElements.length; ++i) {
		var currentSet = setsOfElements[i];
		for (var field in currentSet) {
			if (currentSet.hasOwnProperty(field)) {
				if (setOfExceptions[field] != null) {
					continue;
				} else {
					if (countsForElements[field] == null) {
						countsForElements[field] = 0;
					}
					++countsForElements[field];
				}
			}
		}
	}
	var result = [];
	for (var keyString in countsForElements) {
		if (countsForElements.hasOwnProperty(keyString)) {
			if (countsForElements[keyString] >= thresholdCount) {
				result.push(keyString);
			}
		}
	}
	return result;
}