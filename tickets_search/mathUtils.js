var PartitionsAndPermutations = {
	// Builds an array of all of the ways some number (first paramer) could be represented as a sum of a given number (second parameter) of integers >= 1.
	// see: https://en.wikipedia.org/wiki/Young_tableau
	// It returns an array of arrays of fixed length (len==amountOfSummands). Elements of these arrays contain information about the summands.
	buildYoungTabloesSet : function(totalTargetSum, amountOfSummands)
	{
		if ((totalTargetSum < amountOfSummands) || (amountOfSummands == 0)) {
			return []; // nothing to return here
		}
		var result = [];
		
		var currentPermutationsState = [];
		//init: fill the permutations state with initial setup - all ones, and last element containing the biggest possible value of a summand with given setup
		for (let i = 0; i < (amountOfSummands - 1); ++i) {
			currentPermutationsState.push(1);
		}
		currentPermutationsState.push(totalTargetSum - amountOfSummands + 1);
		
		while (true) {
			let permutationToStore = currentPermutationsState.slice(0); // this will make a copy of array
			result.push(permutationToStore);

			let atLastPermutation = true;
			for (let i = 0; i < (amountOfSummands-1); ++i) {
				if (currentPermutationsState[i] < (currentPermutationsState[i+1] - 1)) {
					++currentPermutationsState[i];
					--currentPermutationsState[i+1];
					atLastPermutation = false;
					break;
				}
			}
			if (atLastPermutation) {
				return result;
			}
		}
	},

	// Builds an array of arrays of indices. Each one represents one of the unique ways of distributing the elements (indexed 0..(arrayOfSizesOfSets.length-1)) into buckets. The sizes of buckets are provided in a parameter.
	findSetsOfSelections : function (arrayOfSizesOfSets)
	{
	//TODO: refactoring - turn this function into a object (with all of the function objects inside it becoming member functions)
		var TOTAL_ITEMS_COUNT = 0;
		for (let i = 0; i < arrayOfSizesOfSets.length; ++i) {
			TOTAL_ITEMS_COUNT += arrayOfSizesOfSets[i];
		}

		var currentPermutationsState = [];
		for (let i = 0; i < TOTAL_ITEMS_COUNT; ++i) {
			currentPermutationsState.push(-1);
		}

		var resetLowSignificantBucketsPositions = function(leastSignificantBucketIndexNotToBeReset) {
			for (let i = 0; i < TOTAL_ITEMS_COUNT; ++i) {
				if (currentPermutationsState[i] < leastSignificantBucketIndexNotToBeReset) {
					currentPermutationsState[i] = -1;
				}
			}
		};

		
		var reoccupyBucketToNextPositionIgnoringLessSignificantOnes = function(bucketIndexToReoccupy) {
			resetLowSignificantBucketsPositions(bucketIndexToReoccupy);
			
			let BUCKET_SIZE = arrayOfSizesOfSets[bucketIndexToReoccupy];
			let bestVacantPosition = -1;
			let bucketElementsInTail = 0;

			for (let i = 0; i < TOTAL_ITEMS_COUNT; ++i) {
				if (currentPermutationsState[i] == -1) {
					bestVacantPosition = i;
				}
				if (currentPermutationsState[i] == bucketIndexToReoccupy) { // the bucket is in the very end of the occupiable space, can't reoccupy it to the next position.
					++bucketElementsInTail;
					currentPermutationsState[i] = -1;  // these positions will be moved anyway, so we can remove them right now
					if (bestVacantPosition == -1) {
						if (bucketElementsInTail == BUCKET_SIZE) {
							return false;
						}
					} else {
						for (let j = bestVacantPosition; j >=0; --j) { //go back and fill up all of the positions with the 
							if (currentPermutationsState[j] == -1) {
								currentPermutationsState[j] = bucketIndexToReoccupy;
								--bucketElementsInTail;
							}
							
							if (bucketElementsInTail == 0) {
								return true;
							}
						}
					}
				}
			}
		};
		
		var findBiggestIndexSuitableForGivenBucket = function (bucketInQuestion) {
			if (bucketInQuestion >= (arrayOfSizesOfSets.length - 1)) {
				return TOTAL_ITEMS_COUNT-1;
			}
			if (arrayOfSizesOfSets[bucketInQuestion] < arrayOfSizesOfSets[bucketInQuestion+1]) {
				return TOTAL_ITEMS_COUNT-1;
			}
			for (let i = TOTAL_ITEMS_COUNT-1; i >= 0; --i) {
				if (currentPermutationsState[i] == (bucketInQuestion+1)) {
					return i;
				}
			}
			return -1;
		};
		
		var fillUpLowSignificantBucketsInUnallocatedSpace = function (indexOfBucketToAddFirst) {
			for (let currentBucketIndex = indexOfBucketToAddFirst; currentBucketIndex >=0; --currentBucketIndex) {
				
				let CURRENT_BUCKET_SIZE = arrayOfSizesOfSets[currentBucketIndex];
				let BIGGEST_ALLOWED_INDEX_TO_OCCUPY_WITHOUT_CONFLICT_WITH_MORE_SIGNIFICANT_OF_THE_SAME_SIZE = 
					findBiggestIndexSuitableForGivenBucket(currentBucketIndex);
				
				let allocatedPositionsCountForBucket = 0;
				for (let i = BIGGEST_ALLOWED_INDEX_TO_OCCUPY_WITHOUT_CONFLICT_WITH_MORE_SIGNIFICANT_OF_THE_SAME_SIZE; i >= 0; --i) {
					if (currentPermutationsState[i] < currentBucketIndex) {
						currentPermutationsState[i] = currentBucketIndex;
						++allocatedPositionsCountForBucket;
						if (CURRENT_BUCKET_SIZE == allocatedPositionsCountForBucket) {
							break; // bucket allocated, go to the next one, do the procedure again
						}
					}
				}
				if (CURRENT_BUCKET_SIZE > allocatedPositionsCountForBucket) {
					return false; // could not allocate this bucket, reporting the status to the callsite
				}
			}
			return true; // everything ok, the new permutaiton is valid.
		};
		
		fillUpLowSignificantBucketsInUnallocatedSpace(arrayOfSizesOfSets.length - 1);

		var result = [];
		result.push(currentPermutationsState.slice(0));
		
		while (true) {
			let foundNextPermutation = false;
			for (let discardedBucketsPointer = 1; discardedBucketsPointer < arrayOfSizesOfSets.length; ++discardedBucketsPointer) {
			// discardedBucketsPointer: all the buckets with the index less then or equal to discardedBucketsPointer should be moved
				var reoccupySuccessfull = reoccupyBucketToNextPositionIgnoringLessSignificantOnes(discardedBucketsPointer);
				if (reoccupySuccessfull) {
					var fillupSuccessfull = fillUpLowSignificantBucketsInUnallocatedSpace(discardedBucketsPointer - 1);
					if (fillupSuccessfull) {
						result.push(currentPermutationsState.slice(0));
						foundNextPermutation = true;
						break;
					}
				}
			}
			if (!foundNextPermutation) {
				// all of the permutations were cycled through, exiting.
				return result;
			}
		}
	},

	// This function is used to build the elements arrangements into buckets according to the elements of selectionsArray, which describe these arrangements.
	// The selectionsArray object is provided by the findSetsOfSelections() call.
	// For each element of this array, we build an array of buckets, where each bucket is filled by the elements in arrayOfElements.
	// TODO: add proper description to all of these functions (diagrams would be nice)
	// TODO: refactor the function interface - the bucketsCount parameter is determined solely by the selectionsArray's contents. It should be calculated inside this function (so we don't pass the wrong value from outside)
	buildAllSelectionsForElements : function (arrayOfElements, selectionsArray, bucketsCount)
	{
		var getNewEmptyBucketsArrayForSelection = function(length) {
			let result = [];
			for (let i = 0; i < bucketsCount; ++i) { result.push([]); }
			return result;
		};
		
		var resultAccumulator = [];
		for (let i = 0; i < selectionsArray.length; ++i) {
			let currentSelectionSetup = selectionsArray[i];
			let currentBuckets = getNewEmptyBucketsArrayForSelection(currentSelectionSetup.length);
			
			for (let selectionDescriptionIndex = 0; selectionDescriptionIndex < currentSelectionSetup.length; ++selectionDescriptionIndex) {
				let elementToAddToBucket = arrayOfElements[selectionDescriptionIndex];
				let bucketToAddElementTo = currentSelectionSetup[selectionDescriptionIndex];
				currentBuckets[bucketToAddElementTo].push(elementToAddToBucket);
			}
			resultAccumulator.push(currentBuckets);
		}
		return resultAccumulator;
	}
};