/// <reference path="jquery-1.7.2.js" />
/// <reference path="cv.css.js" />
/// <reference path="underscore-1.4.2.js" />

/**
 * Dependencies
 * - jQuery
 * - cv.css.js
 * - underscore-1.4.2.js
**/

;

(function ($, undefined) {
	
	$.cv = $.cv || {};

	// $.cv.css object definition
	//
	$.cv.css = $.cv.css || {};

	$.cv.css.productCompare = $.cv.css.productCompare || {};

	/* Events (if not defined, but SHOULD BE!) */
	$.cv.css.events = $.cv.css.events || {};

	/* Event Names */
	// Added like this to give us autocomplete goodness (Which seems to be the main benefit here)
	$.cv.css.eventnames.productComparisonComparisonsChanged = "productComparisonComparisonsChanged";
	$.cv.css.eventnames.productComparisonShowComparison = "productComparisonShowComparison";
	$.cv.css.eventnames.productComparisonAddProduct = "productComparisonAddProduct";
	$.cv.css.eventnames.productComparisonRemoveProduct = "productComparisonRemoveProduct";

	/* Local Storage Keys */
	$.cv.css.localStorageKeys.productComparisonProductList = "productComparisonProductList";


	// Event Handlers : Add and Remove Products to Compare
	//

	$.cv.css.bind($.cv.css.eventnames.productComparisonAddProduct, function (prodInfo) {
		$.cv.css.localAddProductComparison(prodInfo);
	});

	$.cv.css.bind($.cv.css.eventnames.productComparisonRemoveProduct, function (prodInfo) {
		$.cv.css.localRemoveProductComparison(prodInfo);
	});


	// Local Storage Methods
	//

	$.cv.css.localGetProductComparisons = function localGetProductComparisons() {
		var result = $.cv.css.getLocalStorage($.cv.css.localStorageKeys.productComparisonProductList);

		return (result === null ? [] : result);
	};

	$.cv.css.localDoesProductComparisonExist = function localDoesProductComparisonExist(prod) {
		// prod : product code string or object with product code and description
		var productCode = prod.hasOwnProperty("productCode") ?
			prod.productCode.toString() : prod.toString();

		if (productCode) {
			var data = $.cv.css.localGetProductComparisons() || [];

			for (var i in data) {
				if (data[i].productCode.toString().toLowerCase() === productCode.toLowerCase()) {
					return true;

					break;
				}
			}

			return false; 
		} else {
			console.log("CVWARNING: localRemoveProductComparison() given malformed 'prod' argument" + JSON.stringify(prodInfo));
		}
	}

	$.cv.css.localUpdateProductComparison = function (prodInfo) {
		// Verify the Structure Given
		if (prodInfo && prodInfo.hasOwnProperty("productCode") && prodInfo.hasOwnProperty("description")) {
			var data = $.cv.css.localGetProductComparisons() || [];
			var alreadyExists = _.any(
				data,
				function (o) {
					return o.productCode.toString().toLowerCase() === prodInfo.productCode.toString().toLowerCase()
				}),
				i = 0,
				p = null;

			if (alreadyExists === false) {
				$.cv.css.localAddProductComparison(prodInfo);
			} else {
				for (; i < data.length; ++i) {
					var p = data[i];
					if (p.productCode.toString().toLowerCase() === prodInfo.productCode.toString().toLowerCase()) {
						data[i] = prodInfo;
						break;
					}
				}

				$.cv.css.setLocalStorage(
					$.cv.css.localStorageKeys.productComparisonProductList,
					data);
			}

		} else {
			console.log("CVWARNING: localAddProductComparison() given malformed 'prodInfo' argument" + JSON.stringify(prodInfo));
		}
	};

	$.cv.css.localAddProductComparison = function localAddProductComparison(prodInfo) {
		// Verify the Structure Given
		if (prodInfo && prodInfo.hasOwnProperty("productCode") && prodInfo.hasOwnProperty("description")) {
			var data = $.cv.css.localGetProductComparisons() || [];
			var alreadyExists = _.any(
				data,
				function (o) {
					return o.productCode.toString().toLowerCase() === prodInfo.productCode.toString().toLowerCase()
				});

			if (alreadyExists === false) {
				if (prodInfo.hasOwnProperty("isChecked") === false)
					prodInfo.isChecked = false;

				data.push(prodInfo);

				$.cv.css.setLocalStorage(
					$.cv.css.localStorageKeys.productComparisonProductList,
					data);
			}

			$.cv.css.trigger(
				$.cv.css.eventnames.productComparisonComparisonsChanged, 
				$.cv.css.localGetProductComparisons());
		} else {
			console.log("CVWARNING: localAddProductComparison() given malformed 'prodInfo' argument" + JSON.stringify(prodInfo));
		}
	};

	$.cv.css.localRemoveProductComparison = function localRemoveProductComparison(prod) {
		// prod : product code string or object with product code and description
		var productCode = prod.hasOwnProperty("productCode") ?
			prod.productCode.toString() : prod.toString();

		if (productCode) {
			var data = $.cv.css.localGetProductComparisons() || [];

			for (var i in data) {
				if (data[i].productCode.toString().toLowerCase() === productCode.toLowerCase()) {
					data.splice(i, 1);

					$.cv.css.setLocalStorage(
						$.cv.css.localStorageKeys.productComparisonProductList,
						data);

					break;
				}
			}

			$.cv.css.trigger(
				$.cv.css.eventnames.productComparisonComparisonsChanged, 
				$.cv.css.localGetProductComparisons());
		} else {
			console.log("CVWARNING: localRemoveProductComparison() given malformed 'prod' argument" + JSON.stringify(prodInfo));
		}
	};

	$.cv.css.localClearProductComparisons = function localClearProductComparisons() {
		localStorage.removeItem($.cv.css.localStorageKeys.productComparisonProductList);

		$.cv.css.trigger(
			$.cv.css.eventnames.productComparisonComparisonsChanged, 
			$.cv.css.localGetProductComparisons());
	};

	/**
	 * Gets product and feature information for the specified products
	 *
	 * Options:
	 *   productCodes: [] - Array of products codes to compare.
	**/
	$.cv.css.productCompare.getProductComparisonInformation = function (options) {
		var opts = $.extend({
			productCodes: "",
			success: function (msg) { }
		}, options);

		var deferred = $.Deferred();
		var prom = $.cv.ajax.call('productCompare/GetProductComparisonInformation', {
			parameters: { productCodes: opts.productCodes }
		});

		prom.done(function (response) {
			// Filter the data to get rid of garbage, due to us using a DataSet created
			// recordset we have to ignore Fields check and therefore Product and 
			// the ProductComparisonData recordsets have fields all over the place that 
			// shouldn't be there. Remove Name, Value and Group from each product if
			// they are null (which they will be if not there) and ensure on each
			// ProductFeature that we only have Name, Value and Group properties!
			_.each(response.data, function (p) {
				if (p.Name === null)
					delete p.Name;

				if (p.Value === null)
					delete p.Value;

				if (p.Group === null)
				    delete p.Group;

                // If PackQty Exists it is the correct one to use as it checks the warehouse override.
				if (!$.cv.util.isNotDeclaredOrNullOrWhitespace(p.PackQty)) {
				    p.PackQuantity = p.PackQty;
				    delete p.PackQty;
				}

				if (p.ProductComparisonData) {
					_.each(p.ProductComparisonData, function (pcd) {
						for (var field in pcd) {
							if (field !== 'Name' && field !== 'Value' && field !== 'Group') {
								delete pcd[field];
							}
						}
					});
				}
			});

			if (opts.success)
				opts.success(response);

			deferred.resolve(response);
		});

		return deferred.promise();
	};

})(jQuery);
