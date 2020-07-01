sap.ui.define([], function () {
	"use strict";

	return {

		arrayFind: function (array, predicate) {
			var value;
			for (var i = 0; i < array.length; ++i) {
				value = array[i];

				if (predicate.call(undefined, value, i, array)) {
					return value;
				}
			}
			return undefined;
		},

		arrayIncludes: function (array, searchElement) {
			for (var i = 0; i < array.length; ++i) {
				if (array[i] === searchElement) {
					return true;
				}
			}
			return false;
		},

		// Modifies the array in place, removing all entries that do not match the predicate
		arrayFilterInPlace: function (array, predicate) {
			for (var i = array.length - 1; i >= 0; --i) {
				if (!predicate(array[i])) {
					array.splice(i, 1);
				}
			}
		},

		// Returns a comparator that can be used by Array.prototype.sort() in order to sort an array of objects.
		// The parameters are arrays with two elements each, specifiying a property name
		// and a sorting direction ("asc" or "desc").
		// The objects will be sorted primarily by the first property, breaking ties using the subsequent properties.
		// Example: myArray.sort(Utils.sortByProperties(["lastname", "asc"], ["firstname", "asc"], ["age", "desc"]));
		sortByProperties: function ( /* variable arguments */ ) {
			var sortCriteria = arguments;
			return function (left, right) {
				for (var i = 0; i < sortCriteria.length; ++i) {
					var sProperty = sortCriteria[i][0];
					var sDirection = sortCriteria[i][1];
					if (left[sProperty] !== right[sProperty]) {
						return (
							left[sProperty] < right[sProperty]
						) ^ (
							sDirection === "desc"
						) ? -1 : 1;
					}
				}
				return 0;
			};
		},

		objectToQueryString: function (object) {
			var keys = Object.keys(object);
			var string = "";
			for (var i = 0; i < keys.length; i++) {
				string += keys[i] + "=" + encodeURIComponent(object[keys[i]]);
				if (i !== keys.length - 1) {
					string += "&";
				}
			}
			return string;
		},

		isStringInLimit: function (string, limit) {
			return string.length <= limit;
		}

	};

});