 
/**
 * Product Comparison Widgets
 *
 * CONTENTS
 * - productCompareButton Widget
 * - productCompareList Widget
 * - productCompare Widget
 * 
 * Author: Justin Wishart 
 * Date:   2013-02-04
 * Dependencies: 
 *  - jQuery
 *  - Kendo UI
 *  - cv.css.js
 *  - underscore-1.4.2.js
 *  - cv.css.productCompare.js
**/

;

// Documentation: http://confluence/display/DEV/Product+Compare+Button+%28productCompareButton%29
(function ($, undefined) {

	var PRODUCT_ADDED = 'productAdded',
        PRODUCT_REMOVED = 'productRemoved';

	var productCompareButton = {

		name: "productCompareButton",


		// Default Widget Options
		//

		options: {
			// Widget Data
			productCode: '',
			description: '',
            image: '',

			// View Model Flags
			enableRemoval: true,

			// Event Handlers Options
			productAdded: null,
			productRemoved: null,

			// Wiew flags

			// Text Defaults
			label: 'Add to Compare',
			title: null, // if null we go productCode + " : " + description, otherwise we add what is assigned

			// View Template
			viewTemplate: '', // Treat as ID: no # required
			gtmPageType: ''
		},

		events: [PRODUCT_ADDED, PRODUCT_REMOVED],

		viewModel: null,

		view: null,


		// Private Properties
		//

		_viewAppended: false,

		
		// Public Widget Methods
		//

		initialise: function (el, o) {
			var widget = this;

			// Auto Initialization Hack
			// Kendo UI Auto Initialize considers the value of data-product-code='0TB147BK' to
			// be a number, thus it assigns 0 (zero) to the options.productCode. So, we 
			// have to fix it :o(
			var tempProductCode = $(widget.element).attr("data-product-code");
			var tempDescription = $(widget.element).attr("data-description");

			// If they are undefined there is no attribute, might be setting values as options...
			if (tempProductCode) o.productCode = tempProductCode;
			if (tempDescription) o.description = tempDescription;

			// check for an internal view
			var internalView = $(el).children(":first");

			if (internalView.data("view")) {
				widget.view = internalView.html();
			} else {
				if (!widget.options.viewTemplate) {
					widget.options.viewTemplate = widget._getDefaultViewTemplate();
				}

				var viewTemplate = kendo.template(widget.options.viewTemplate);
				widget.view = viewTemplate(widget.options);
				$(el).append(widget.view);
				widget._viewAppended = true;
			}

			// now MMVM bind
			widget._bind();

			// Setup handler for when product comparison list has changed.
			$.cv.css.bind($.cv.css.eventnames.productComparisonComparisonsChanged, function () {
				widget.refresh();
			})
		},

		refresh: function () {
			this._bind();
		},

		destroy: function () {
			var widget = this;
			// remove the data element
			widget.element.removeData(widget.options.prefix + widget.options.name);

			// clean up the DOM
			if (widget._viewAppended) {
				widget.element.empty();
			}
		},


		// Private Widget Methods
		//

		_bind: function () {
			var widget = this;

			var viewModel = widget._getViewModel();
			var target = $(widget.element).children(":first");
			kendo.bind(target, viewModel);
		},

		_getViewModel: function () {
			var widget = this;
			var alreadyExists = $.cv.css.localDoesProductComparisonExist(widget.options.productCode);

			var viewModel = kendo.observable({
				// Properties for UI elements
				productCode: widget.options.productCode,
				description: widget.options.description,
                image: widget.options.image,
				title: widget.options.title ?
					widget.options.title : (widget.options.productCode + " : " + widget.options.description),

				label: widget.options.label,
				isSelected: alreadyExists,

				// UI Element state
				enableRemoval: widget.options.enableRemoval,

				// View Model Functions
				configureProductInComparisonList: function () {
					var data = {
						productCode: widget.options.productCode,
						description: widget.options.description,
                        image: widget.options.image
					};

					var alreadyExists = $.cv.css.localDoesProductComparisonExist(data);

					if (!alreadyExists) {
						$.cv.css.trigger($.cv.css.eventnames.productComparisonAddProduct, data)
						widget.trigger(PRODUCT_ADDED, { data: data });
						$(widget.element).trigger(PRODUCT_ADDED, [data]);
					} else if(alreadyExists && this.enableRemoval === true) {
						$.cv.css.trigger($.cv.css.eventnames.productComparisonRemoveProduct, data);
						widget.trigger(PRODUCT_REMOVED, { data: data });
						$(widget.element).trigger(PRODUCT_REMOVED, [data]);
					}
				}
			});

			return viewModel;
		},

		_getDefaultViewTemplate: function () {
			var widget = this;
			return [
				"<div>",
				"<input type='checkbox'",
					"data-bind='",
						"click: configureProductInComparisonList,",
						"checked: isSelected,",
						"attr: { title: title }",
					"'",
				"></input>",
				"<span data-bind='text: label, attr: { title: title }' />",
				"</div>"].join(' \n');
		}

	}

	// register the widget

	$.cv.ui.widget(productCompareButton);

})(jQuery);




;

// Documentation: http://confluence/display/DEV/Product+Compare+List+%28productCompareList%29
(function ($, undefined) {

    var PRODUCTS_CLEARED = 'productsCleared',
        PRODUCTS_REMOVED = 'productsRemoved',
		COMPARE_SELECTED = 'compareSelected';

	var productCompareList = {
		
		// Standard Variables

		// widget name
		name: "productCompareList",

		// default widget options
		options: {
			// viewModel flags
			maximumComparableProducts: 3,
			selectedMode: 'selected', // selected | in-list

			removeImageUri: '/images/icon-remove.png',
			removeImageTitle: 'Remove',

			// events
			productsCleared: null,
			productsRemoved: null,
			compareSelected: null,

			// Text Defaults
			title: 'Product Compare',
			noProductsMessage: 'No products have been selected for comparison',
			maxComparisonsExceededMessage: 'You cannot compare more than {1} products at a time. You have {0} products selected. Please deselect some products.', // {0} replaced by maximumComparableProducts
			compareSelectedButtonText: 'Compare Selected',
			removeCheckedButtonText: 'Remove Checked',
			removeAllButtonText: 'Remove All',

			// view Template
			viewTemplate: '', // treat like its an id
			gtmPageType: ''
		},

		events: [PRODUCTS_CLEARED, PRODUCTS_REMOVED, COMPARE_SELECTED],

		viewModel: null,

		view: null,

		// private property
		_viewAppended: false,


		// Standard Methods
		initialise: function (el, o) {
			var widget = this;
			// check for an internal view
			var internalView = $(el).children(":first");
			if (internalView.data("view")) {
				widget.view = internalView.html();
			} else {
				if (!widget.options.viewTemplate) {
					widget.options.viewTemplate = widget._getDefaultViewTemplate();
				}
				var viewTemplate = kendo.template(widget.options.viewTemplate);
				widget.view = viewTemplate(widget.options);
				$(el).append(widget.view);
				widget._viewAppended = true;
			}

			// now MMVM bind
			this._bind();

			// Setup handler for when product comparison list has changed.
		    $.cv.css.bind($.cv.css.eventnames.productComparisonComparisonsChanged, function() {
		        widget.refresh();
		    });
		},

		refresh: function() {
			this._bind();
		},

		_bind: function() {
			var widget = this;

			var viewModel = widget._getViewModel();
			var target = $(widget.element).children(":first");
			kendo.bind(target, viewModel);
		},

		destroy: function () {
			var widget = this;
			// remove the data element
			widget.element.removeData(widget.options.prefix + widget.options.name);
			// clean up the DOM
			if (widget._viewAppended) {
				widget.element.empty();
			}
		},

		// private function
		_getViewModel: function () {
			var widget = this;
			var products = $.cv.css.localGetProductComparisons();

			function _deleteProduct(productCode) {
				$.cv.css.localRemoveProductComparison(productCode);
			}

			var viewModel = kendo.observable({
				products: products,

				// Properties for UI elements

				// UI Element state
				hasProducts: products.length > 0,
				hasNoProducts: products.length === 0,

				productCount: products.length,
				maximumComparableProducts: widget.options.maximumComparableProducts,

				noProductsMessage: widget.options.noProductsMessage,
				title: widget.options.title,

				removeImageUri: widget.options.removeImageUri,
				removeImageTitle: widget.options.removeImageTitle,

				compareSelectedButtonText: widget.options.compareSelectedButtonText,
				removeCheckedButtonText: widget.options.removeCheckedButtonText,
				removeAllButtonText: widget.options.removeAllButtonText,

			    // UI Events
				clearProducts: function () {
					$.cv.css.localClearProductComparisons();

					widget.trigger(PRODUCTS_CLEARED);
					$(widget.element).trigger(PRODUCTS_CLEARED);
				},

				removeChecked: function () {
					var removedProducts = [];
					$.each(this.get("products").toJSON(), function (i, p) {
						if (p.isChecked === true) {
							removedProducts.push(p);
							$.cv.css.trigger($.cv.css.eventnames.productComparisonRemoveProduct, p);
						}
					});

					widget.trigger(PRODUCTS_REMOVED, { data: removedProducts });
					$(widget.element).trigger(PRODUCTS_REMOVED, [removedProducts]);
				},

				compareSelected: function () {
					if (this.canCompare()) {
						// Determine Selected Products
						var selected = this.getSelectedProducts(),
							max = widget.options.maximumComparableProducts,
							count = selected.length;

						// Get rid of some things to prevent confusion...
						$.each(selected, function (i, p) {
							delete p.isChecked;
							delete p.deleteProduct;
						});

						$.cv.css.trigger($.cv.css.eventnames.productComparisonShowComparison, selected);
						widget.trigger(COMPARE_SELECTED, { data: selected });
						$(widget.element).trigger(COMPARE_SELECTED, [selected]);
					}
				},
				
				getSelectedProducts: function() {
					var results = [];

					if (widget.options.selectedMode === 'selected') {
						// selected
						$.each(this.get("products").toJSON(), function (i, p) {
							if (p.isChecked === true) {
								results.push(p);
							}
						});
					} else {
						// in-list
						results = this.get("products").toJSON();
					}

					return results;
				},

				selectedProductCount: function() {
					return this.getSelectedProducts().length;
				},

				canCompare: function () {
					var max = widget.options.maximumComparableProducts;
					var count = this.selectedProductCount();
					var MIN_COMPARABLE_PRODUCTS = 2;

					return (count >= MIN_COMPARABLE_PRODUCTS && count <= max);
				},

				overMaximumProducts: function () {
					var max = widget.options.maximumComparableProducts;
					var count = this.selectedProductCount();

					return (count > max);
				},

				maximumProductsMessage: function () {
					var messageTemplate = widget.options.maxComparisonsExceededMessage;
					var max = widget.options.maximumComparableProducts;
					var count = this.selectedProductCount();

					messageTemplate = messageTemplate.replace("\{0}", count);
					messageTemplate = messageTemplate.replace("\{1}", max);

					return messageTemplate;
				}
			});

			// We need to be able to delete each of the individual products. To do this we
			// add a deleteProduct function to each of the product objects which is bound to the
			// click event of each product-compare-list-item-template LI. Each function is 
			// setup to remove particular product. (we can't do this otherwise without data
			// attributes which causes issues: i.e. click the image which causes click event, but
			// target is the image which doesn't have the product code bound. This would require
			// assumptions that I'm not willing to make or require dom traversal (considered bad!))
			$.each(viewModel.get("products"), function (i, p) {
				p.set("deleteProduct", function () {
					$.cv.css.localRemoveProductComparison(this.get("productCode"));
				});;

				// So we can determine checked state when removing selected or comparing selected.
				if (p.get("isChecked") === undefined) {
					p.set("isChecked", false);
				}

				p.bind("change", function (e) {
					if (e.field === "isChecked") {
						$.cv.css.localUpdateProductComparison(p.toJSON());
					}
				});
			});

			return viewModel;
		},

		_getDefaultViewTemplate: function () {
			var widget = this;
			
			return ['<div class="sidebar-window-compare">',
					'	<span class="sidebar-window-title" data-bind="text: title"></span>',
					'	<span class="sidebar-window-no-products" data-bind="visible: hasNoProducts, text: noProductsMessage"></span>',
					'	<ul class="sidebar-window-list" data-template="product-compare-list-item-template" data-bind="visible: hasProducts, source: products">',
					'	</ul>',
					'	<div class="sidebar-window-over-maximum" data-bind="visible: overMaximumProducts, text: maximumProductsMessage">',
					'	</div>',
					'	<div class="sidebar-window-buttons">',
					'		<a href="javascript:void(0);" class="button-generic" data-bind="click: compareSelected, enabled: canCompare, text: compareSelectedButtonText"></a>',
					'		<a href="javascript:void(0);" class="button-generic" data-bind="click: removeChecked, text: removeCheckedButtonText"></a>',
					'		<a href="javascript:void(0);" class="button-generic" data-bind="click: clearProducts, text: removeAllButtonText"></a>',
					'	</div>',
					'</div>',

					'<script id="product-compare-list-item-template" type="text/x-kendo-template">',
					'	<li>',
					'		<div class="list-checkbox"><input type="checkbox" data-bind="checked: isChecked" /></div>',
					'		<div class="list-desc" data-bind="text: description"></div>',
					'		<div class="sidebar-window-list-remove"><a href="javascript:void(0);" data-bind="click: deleteProduct"><img data-bind="attr: {src: removeImageUri, title: removeImageTitle}"/></a></div>',
					'	</li>',
					'</script>'].join(' \n');
		}

	}

	// register the widget

	$.cv.ui.widget(productCompareList);

})(jQuery);




;

// Documentation: http://confluence/display/DEV/Product+Compare+%28productCompare%29
(function ($, undefined) {

	var PRODUCT_ADDED_TO_CART = 'productAddedToCart',
		PRODUCT_ADD_FAILED = 'productAddFailed',
		BEFORE_SHOWN = "beforeShown",
		AFTER_SHOWN = 'afterShown';

	var productCompare = {

        name: "productCompare",

        options: {
            // View Model Defaults
            products: [], // Products to compare
            enableAutoShow: true,

            // ViewModel Flags
            enableKendoCurrencyFormatting: true, // If True -> Disables dollarSign, dollarSignPosition and spaceBetweenSignAndAmount
            kendoNumberFormat: 'C', // Specifies how to format the monetary amount. Default is as a currency (culture appropriate)

            dollarSign: '$',
            dollarSignPosition: 'front', // front | back - i.e. Front: $4.56 or €5.56 or ¤6.22 | Back: 12.00S₣
            spaceBetweenSignAndAmount: false,

            highlightFeatureCssClass: 'highlight-feature',

            enableAddProductFailedMessage: false,

            picture1Prefix: "",

            // Events
            productAddedToCart: null,
            afterShown: null,
            productAddFailed: null,

            // View Flags
            enableAddToCart: true,
            enableAvailability: true,
            enableEqualFeatureValueHighlighting: true,
            enableUnconfiguredFeatureRemoval: true,
            noFeatureValueContent: ' - ',
            createFeatureInfoArrays: false,
            compareItemsTop: [],
            showImage: true,
            showRibbon: true,
	        imagePrompt: "",
	        imgString: "",

	        // Text Defaults
	        title: 'Product Comparisons',
	        addToCartButtonText: 'Add to Cart',

	        // View Template
	        viewTemplate: '' // treat like its an id
	    },

	    events: [PRODUCT_ADDED_TO_CART, PRODUCT_ADD_FAILED, BEFORE_SHOWN, AFTER_SHOWN],

	    viewModel: null,

	    view: null,


	    // Private Properties
	    //

	    _viewAppended: false,


	    // Public Methods
	    initialise: function (el, o) {
	        var widget = this;
	        // check for an internal view
	        var internalView = $(el).children(":first");
	        if (internalView.data("view")) {
	            widget.view = internalView.html();
	        } else {
	            if (!widget.options.viewTemplate) {
	                widget.options.viewTemplate = widget._getDefaultViewTemplate();
	            }
	            var viewTemplate = kendo.template(widget.options.viewTemplate);
	            widget.view = viewTemplate(widget.options);
	            $(el).append(widget.view);
	            widget._viewAppended = true;
	        }

	        $(el).hide();

	        if (widget.options.products.length > 0) {
	            widget.refresh();
	        }

	        if (widget.options.enableAutoShow) {
	            // Setup handler for when product comparison list has changed.
	            $.cv.css.bind($.cv.css.eventnames.productComparisonShowComparison, function (products) {
	                // Assign products and refresh the widget.
	                widget.options.products = products;
	                widget.refresh();
	            })
	        }
	    },

	    refresh: function () {
	        var widget = this;
	        var prom = this._bind();

	        prom.done(function () {
	            widget.trigger(BEFORE_SHOWN);
	            $(widget.element).trigger(BEFORE_SHOWN);

	            $(widget.element).show();

	            widget.trigger(AFTER_SHOWN);
	            $(widget.element).trigger(AFTER_SHOWN);
	        })
	    },


	    // Public Methods
	    //

	    destroy: function () {
	        var widget = this;
	        // remove the data element
	        widget.element.removeData(widget.options.prefix + widget.options.name);
	        // clean up the DOM
	        if (widget._viewAppended) {
	            widget.element.empty();
	        }
	    },

	    compare: function (products) {
	        var widget = this;
	        widget.options.products = products;
	        widget.refresh();
	    },


	    // Private Methods
	    //

	    _bind: function () {
	        var widget = this;

	        var prom = widget._getViewModel();
	        prom.done(function(viewModel) {
	            var target = $(widget.element).children(":first");
	            kendo.bind(target, viewModel);
	        });

	        return prom;
	    },

	    _createFieldListDataImage: function (title, keys, fieldListData, compareInfo) {
	        var widget = this,
                data = {},
	            showFeature = false,
	            productMediaArray = [],
	            picture1Array = [],
                bpdRibbonImageArray = [],
                imgArray = [],
	            imgString = widget.options.imgString,
                imgPrefx = "";
	        if (_.contains(keys, "Picture1") || _.contains(keys, "ProductMedia")) {
	            data["Title"] = title;
	            data["Key"] = "Image";
	            picture1Array = _.contains(keys, "Picture1") ? _.pluck(compareInfo, "Picture1") : [];
	            if (widget.options.showRibbon) {
	                bpdRibbonImageArray = _.contains(keys, "BpdRibbonImage") ? _.pluck(compareInfo, "BpdRibbonImage") : [];
	            }
	            for (var i = 0; i < picture1Array.length; i++) {
	                var value = picture1Array[i];
	                var ribbon = widget.options.showRibbon ? bpdRibbonImageArray[i] : "";
	                var ribbonClass = widget.options.showRibbon && !$.cv.util.isNullOrWhitespace(bpdRibbonImageArray[i]) ? "" : "cv-is-hidden";
	                if (value === "controls/bit.gif") {
	                    imgPrefx = "/images/";
	                } else if (value.indexOf("/Images/ProductImages/Original/") != -1) {
	                    imgPrefx = "/images/ProductImages/Small/";
	                } else {
	                    imgPrefx = "/images/ProductImages/250/";
	                }
	                
	                imgArray.push(imgString.format(value.replace("/Images/ProductImages/Original/", ""), imgPrefx, ribbon, ribbonClass));
                }

	            data["Data"] = imgArray;
	            data["DataArray"] = [];
	            _.each(data["Data"], function (value) {
	                if (value != null) {
	                    showFeature = true;
	                }
	            });
	            data["ShowFeature"] = showFeature;
	            fieldListData.push(data);
	        }
	        return fieldListData;
	    },

	    _createFieldListData: function (title, key, keys, fieldListData, compareInfo, fallbackKey) {
	        var data = {},
                dataArray = [],
                fallbackDataArray = [],
	            showFeature = false;
	        if (_.contains(keys, key) || ($.cv.util.hasValue(fallbackKey) && _.contains(keys, fallbackKey))) {
	            data["Title"] = title;
	            data["Key"] = key;
	            dataArray = _.contains(keys, key) ? _.pluck(compareInfo, key) : [];
	            fallbackDataArray = _.contains(keys, fallbackKey) ? _.pluck(compareInfo, fallbackKey) : [];
	            if (dataArray.length > 0) {
	                _.each(dataArray, function (value, index) {
	                    if ($.cv.util.isNullOrWhitespace(value) && fallbackDataArray.length >= index && !$.cv.util.isNullOrWhitespace(fallbackDataArray[index])) {
	                        dataArray[index] = fallbackDataArray[index];
	                    }
	                });
	            }
	            data["Data"] = dataArray;
	            data["DataArray"] = [];
	            _.each(data["Data"], function (value) {
	                if (value != null) {
	                    showFeature = true;
	                }
	            });
	            data["ShowFeature"] = showFeature;
	            fieldListData.push(data);
	        }
	        return fieldListData;
	    },

	    _createAddToCartData: function (title, key, keys, fieldListData, compareInfo) {
	        var widget = this,
                data = {},
                productArray = [],
                canOrderAProduct = false,
                productCodeArray = _.contains(keys, "ProductCode") ? _.pluck(compareInfo, "ProductCode") : [],
                allowOrderEntryForProductArray = _.contains(keys, "AllowOrderEntryForProduct") ? _.pluck(compareInfo, "AllowOrderEntryForProduct") : [],
                isMasterProductArray = _.contains(keys, "IsMasterProduct") ? _.pluck(compareInfo, "IsMasterProduct") : [],
                packQuantityArray = _.contains(keys, "PackQuantity") ? _.pluck(compareInfo, "PackQuantity") : [];
            
            if(productCodeArray.length == 0) {
                return fieldListData;
            }

            for(var i = 0; i < productCodeArray.length; i++) {
                var productData = {};
                productData["AllowOrderEntryForProduct"] = allowOrderEntryForProductArray.length >= i ? allowOrderEntryForProductArray[i] : false;
                productData["IsMasterProduct"] = isMasterProductArray.length >= i ? isMasterProductArray[i] : false;
                canOrderAProduct = canOrderAProduct ? canOrderAProduct : productData["AllowOrderEntryForProduct"] && !productData["IsMasterProduct"];
                productData["PackQuantity"] = packQuantityArray.length >= i ? packQuantityArray[i] : 1;
                productData["ProductCode"] = productCodeArray[i];
                productArray.push(productData);
            }

            data["Title"] = title;
            data["Key"] = key;
            data["Data"] = productArray;
            data["DataArray"] = [];
            data["ShowFeature"] = widget.options.enableAddToCart;
            if (canOrderAProduct) {
                fieldListData.push(data);
            }
	        return fieldListData;
	    },

	    _createAvailabilityData: function (title, key, keys, fieldListData, compareInfo) {
	        var widget = this,
	            data = {},
	            productArray = [],
	            productCodeArray = _.contains(keys, "ProductCode") ? _.pluck(compareInfo, "ProductCode") : [],
	            availableQtyArray = _.contains(keys, "AvailableQty") ? _.pluck(compareInfo, "AvailableQty") : [],
	            conditionCodeArray = _.contains(keys, "ConditionCode") ? _.pluck(compareInfo, "ConditionCode") : [],
	            stockTypeArray = _.contains(keys, "StockType") ? _.pluck(compareInfo, "StockType") : [],
	            userGroup2Array = _.contains(keys, "UserGroup2") ? _.pluck(compareInfo, "UserGroup2") : [],
	            availableForOneArray = _.contains(keys, "AvailableForOne") ? _.pluck(compareInfo, "AvailableForOne") : [];

	        if (productCodeArray.length === 0) {
	            return fieldListData;
	        }

	        for (var i = 0; i < productCodeArray.length; i++) {
	            var productData = {};
	            productData["AvailableQty"] = availableQtyArray.length >= i ? availableQtyArray[i] : 0;
	            productData["ConditionCode"] = conditionCodeArray.length >= i ? conditionCodeArray[i] : "";
	            productData["StockType"] = stockTypeArray.length >= i ? stockTypeArray[i] : "";
	            productData["UserGroup2"] = userGroup2Array.length >= i ? userGroup2Array[i] : "";
	            productData["AvailableForOne"] = availableForOneArray.length >= i ? availableForOneArray[i] : "";
	            productArray.push(productData);
	        }

	        data["Title"] = title;
	        data["Key"] = key;
	        data["Data"] = productArray;
	        data["DataArray"] = [];
	        data["ShowFeature"] = true;
	        fieldListData.splice(3, 0, data);
	        return fieldListData;
	    },

	    _createFieldDataList: function(compareInfo) {
	        var widget = this,
		        fieldListData = [],
	            uniqueFieldNames = [],
		        keys = [];
	        if(compareInfo == undefined || compareInfo.length == 0) {
	            return fieldListData;
	        }

	        keys = _.keys(compareInfo[0]);

	        if (compareInfo[0].ProductComparisonData.length > 0) {
	            uniqueFieldNames = _.unique(
                    _.map(
                        _.filter(compareInfo[0].ProductComparisonData, function (item) {
                            return item.Data[0].ShowFeature;
                        }), function (item) {
                            return item.ShowGroup && !$.cv.util.isNullOrWhitespace(item.GroupName) ? item.GroupName : item.Data[0].Name;
                        })
                    );
	        }

	        fieldListData = widget._createFieldListDataImage(widget.options.imagePrompt, keys, fieldListData, compareInfo);
	        _.each(widget.options.compareItemsTop, function (item) {
	            fieldListData = widget._createFieldListData(item.Title, item.Key, keys, fieldListData, compareInfo, item.FallbackKey);
	        });

	        _.each(uniqueFieldNames, function (name) {
	            var data = [], showFeature = false;
	            _.each(compareInfo, function (product) {
	                var productData = [];
	                _.each(product.ProductComparisonData, function (dataItem) {
	                    _.each(dataItem.Data, function(item) {
	                        if ((dataItem.ShowGroup && dataItem.GroupName === name) || item.Name === name) {
	                            if (!$.cv.util.hasValue(item.Value)) {
	                                item.Value = widget.options.noFeatureValueContent;
	                            }
	                            productData.push(item);
	                        }
	                        if (item.ShowFeature) {
	                            showFeature = true;
	                        }
	                    });
	                });
	                data.push(productData);
	            });
	            fieldListData.push({ ShowFeature: showFeature, Title: name, Data: [], DataArray: data });
	        });

	        if(widget.options.enableAddToCart) {
	            fieldListData = widget._createAddToCartData(widget.options.addToCartButtonText, "AddToCart", keys, fieldListData, compareInfo);
	        }

	        if (widget.options.enableAvailability) {
	            fieldListData = widget._createAvailabilityData("Stock", "Availability", keys, fieldListData, compareInfo);
	        }

	        return _.filter(fieldListData, function (item) { return item.ShowFeature; });
        },

		_massageData: function (productComparisonData) {
			var widget = this;
			/**
			 * Assumptions:
			 *  - The comparison data must already be in the correct order for display and therefore
			 *    in their groups already
			 *  - the structure we are creating is:
			 *		[{
			 *			GroupName: null, // or ''
			 *			LowerCaseGroupName: null,
			 *			Data: [{
			 *				Name: 'Blurb',
			 *				Value: 'This is a long description aka, blurb on this product. too lazy to write more though!',
			 *			}, {
			 *				Name: 'Top Review',
			 *				Value: 'This is a long description aka, blurb on this product. too lazy to write more though!',
			 *			}]
			 *		}]
			**/

            // If user group is not set at all, use the feature name as the group name to make existing logic work
			if (_.all(productComparisonData, function (item) { return $.cv.util.isNullOrWhitespace(item.Group); })) {
			    _.each(productComparisonData, function (item) {
			        item.Group = item.Name;
			    });
			}

			// Get unique group names
			var results = [],
				uniqueGroupNames = _.unique(
					_.map(productComparisonData, function (row) { return row.Group }));

			// Create groups
			_.each(uniqueGroupNames, function (name) {
				var fixedName = (name === null || name === undefined ? '' : name.toString());
				var isNamelessGroup = fixedName === '';

				results.push({
					GroupName: fixedName,
					LowerCaseGroupName: fixedName.toLowerCase(),
					HasGroupName: !isNamelessGroup,
					ShowGroup: true, // Hidden if group entries are all hidden.
					Data: []
				});
			});

			// Put Feature Data into relevant groups...
			_.each(productComparisonData, function (entry) {
				var theGroup = _.find(results, function (group) {
					var infoGroupName = (entry.Group === null || entry.Group === undefined) ?
						'' : entry.Group.toString().toLowerCase();

					return group.LowerCaseGroupName === infoGroupName;
				});

				theGroup.Data.push(entry);
			});

			// Further Massage. We need to hide Groups
			_.each(results, function (group) {
				var visibleEntries = false;

				_.each(group.Data, function (feature) {
					if (feature.ShowFeature) {
						visibleEntries = true;
					}
				});

				if (!visibleEntries) {
					group.ShowGroup = false;
				}
			});

			return results;
		},

		_preProcessData: function (products) {
			// Assumptions:
			//  - Products have EXACTLY the same number of entries in ProductComparisionData
			//  - The entries are in EXACTLY the same order for all products.
			var widget = this,
				productCount = products ? products.length : 0;

			// This function will be attached to all entiries as the FormattedValue field (saves
			// creatin a new function for each entry)
			function formatterFunction() {
				return (this.Value === undefined || this.Value == null || this.Value === '') ?
					widget.options.noFeatureValueContent : this.Value;
			}

			if (productCount >= 2) {
				// Determine unique Name on the first product.
				// Add lowercase field while at it
				var names = _.unique(
					_.map(products[0].ProductComparisonData, function (pcd) {
						return pcd.Name.toString().toLowerCase();
					}));

				// Iterate through unique names and compare for all products
				_.each(names, function (name, i) {
					var firstValue = undefined,
						itemsForName = [],
						foundValue = false,
						foundDifference = false;

				    _.each(products, function(prod) {
				        var theEntries = _.filter(prod.ProductComparisonData, function(pcd) {
				            return pcd.Name.toString().toLowerCase() === name;
				        });

				        _.each(theEntries, function(entry) {
				            if (entry) {
				                // Highlight and hide feature values for binding
				                entry.HighlightInfo = {
				                    add: false,
				                    cssClass: widget.options.highlightFeatureCssClass
				                };

				                entry.ShowFeature = true;
				                entry.FormattedValue = formatterFunction;

				                // Add item to list so we can modify all products instance of the feature
				                // later
				                itemsForName.push(entry);

				                // Determine Value
				                if (firstValue === undefined) {
				                    if (entry.Value !== undefined && entry.Value !== null && entry.Value !== '') {
				                        firstValue = entry.Value;
				                        foundValue = true;
				                    }

				                    return;
				                }

				                if (firstValue !== entry.Value) {
				                    foundDifference = true;
				                }
				            }
				        });
				    });

					// Highlighting
					if (!foundDifference && widget.options.enableEqualFeatureValueHighlighting) {
						_.each(itemsForName, function (item) {
							item.HighlightInfo.add = true;
						});
					}

					// Hide Feature as no values available
					if (!foundValue && widget.options.enableUnconfiguredFeatureRemoval) {
						_.each(itemsForName, function (item) {
							item.ShowFeature = false;
						});
					}
				});
			}
		},

		_getViewModel: function () {
			var widget = this;

			// Get Array of product codes
			var productCodes = _.map(widget.options.products, function (p) {
				if (p.productCode !== undefined && p.productCode !== null && p.productCode !== '')
					return p.productCode;
			});

			// Get all comparison information.
			var productCompareRetrievalPromise = $.cv.css.productCompare.getProductComparisonInformation({
				productCodes: productCodes
			});

			// We will tell the caller when we are done as we 
			// need to modify the data somewhat before it's done.
			var resultsPromise = $.Deferred();  

			productCompareRetrievalPromise.done(function (response) {
				var compareInfo = response.data;

				// Make relevant items for highlighting and remove unnecessary features...
				widget._preProcessData(compareInfo);

				// Massage the data into and easy binding format...
				_.each(compareInfo, function (item) {
					item.ProductComparisonData = widget._massageData(item.ProductComparisonData);
				});

				var productCompareFieldInfo = widget.options.createFeatureInfoArrays ? widget._createFieldDataList(compareInfo) : [];

				var viewModel = kendo.observable({
					title: widget.options.title,
					addToCartButtonText: widget.options.addToCartButtonText,

					errorMessage: null,

					productCompareInfo: compareInfo, // Actual Comparison data.
					productCompareFieldInfo: productCompareFieldInfo,
					enableAddToCart: widget.options.enableAddToCart,
					enableAvailability: widget.options.enableAvailability
				});

				// Setup a product specific view model values...
				$.each(viewModel.get("productCompareInfo"), function (i, p) {
				    // Create a title for the product if not returned from dynamic service.
				    if (p.get("Title") === undefined) {
				        p.set("Title", p.get("ProductCode") + " : " + p.get("Description"));
				    }

				    if (widget.options.picture1Prefix != "")
				        p.set("Picture1", widget.options.picture1Prefix + p.get("Picture1"));

				    // Format the price using our simple options only if a field is not given (again)
				    if (widget.options.enableKendoCurrencyFormatting) {
				        if (p.get("FormattedPrice") === undefined) {
				            p.set("FormattedPrice", kendo.toString(p.get("Price"), widget.options.kendoNumberFormat));
				        }
				    } else {
				        // N.B. This functionality was added and tested. I will leave it here,
				        // but it is likely that the kendo currency formatting (above) will be used.
				        if (p.get("FormattedPrice") === undefined) {
				            var tempFormattedPrice = '';

				            if (widget.options.dollarSignPosition === 'front') {
				                tempFormattedPrice += widget.options.dollarSign;

				                if (widget.options.spaceBetweenSignAndAmount)
				                    tempFormattedPrice += ' ';

				                tempFormattedPrice += p.Price;
				            } else {
				                tempFormattedPrice += p.Price;

				                if (widget.options.spaceBetweenSignAndAmount)
				                    tempFormattedPrice += ' ';

				                tempFormattedPrice += widget.options.dollarSign;
				            }

				            p.set("FormattedPrice", tempFormattedPrice);
				        }
				    }

				    p.set("requestedQuantity", 1);

				    // Assign function allowing add to cart to be bound to click event.
				    p.set("addProductToCart", function () {
				        var productToAdd = {
				            productCode: p.get("ProductCode"),
				            quantity: p.get("requestedQuantity"),
				            price: p.get("Price"),
				            gtmPageType: widget.options.gtmPageType
				        };

				        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
				        var prom = $.cv.css.addToCurrentOrder(productToAdd);

				        prom.always(function (response) {
				            if (window.DEBUG)
				                alert(JSON.stringify(response));

				            // Setup message to be displayed if there IS a message to display else we consider it done
				            if (response.data && response.data.editOrderOk === false) {
				                // Show message in widget on failure to add to cart. (off by default)
				                if (widget.options.enableAddProductFailedMessage)
				                    viewModel.set("errorMessage", response.data.message);

				                productToAdd.error = response.data.message;

				                widget.trigger(PRODUCT_ADD_FAILED, { data: productToAdd });
				                $(widget.element).trigger(PRODUCT_ADD_FAILED, [productToAdd]);
				            } else {
				                viewModel.set("errorMessage", null);
				                if (response.data.message.length > 0) {
				                    productToAdd.message = response.data.message;
				                }

				                // Trigger widget events.
				                widget.trigger(PRODUCT_ADDED_TO_CART, { data: productToAdd });
				                $(widget.element).trigger(PRODUCT_ADDED_TO_CART, [productToAdd]);
				            }
				        });
				    });
				});

				resultsPromise.resolve(viewModel);
			});

			return resultsPromise;
		},

		_getDefaultViewTemplate: function () {
			var widget = this;
			var opts = widget.options;

			return ['<section>',
					'	<div class="widget-row">',
					'		<h1 data-bind="text: title"></h1>',
					'	</div>',
					'	<div class="widget-message-area" data-bind="visible: errorMessage, html: errorMessage"></div>',
					'	<div class="compare-product-group">',
					'		<div data-template="product-compare-product-info-item-template" data-bind="source: productCompareInfo">',
					'		</div>',
					'		<div class="clear"></div>',
					'	</div>',
					'</section>',
					'<script id="product-compare-product-info-item-template" type="text/x-kendo-template">',
					'	<div class="compare-product-item">',
					'		<img data-bind="attr: {src: Picture1}" />',
					'		<span class="compare-product-title" data-bind="text: Description, attr: { title: Title }"></span>',
					'			<div class="product-compare-data" data-template="product-compare-product-info-compare-data" data-bind="source: ProductComparisonData">',
					'			</div>',
					'		<div class="compare-product-atc">',
					'			<span class="compare-price" data-bind="text: FormattedPrice" />',
					opts.enableAddToCart ?
					'			<input type="number" min="1" data-bind="value: requestedQuantity" />' : '',
					opts.enableAddToCart ?
					'			<a href="javascript:void(0);" class="button-generic" data-bind="click: addProductToCart , text: addToCartButtonText"></a>' : '',
					'		</div>',
					'	</div>',
					'</script>',
					'<script id="product-compare-product-info-compare-data" type="text/x-kendo-template">',
					'	<div class="product-compare-data-group" data-bind="visible: ShowGroup">',
					'		<span class="product-compare-data-group-title" data-bind="visible: HasGroupName, text: GroupName">',
					'		</span>',
					'		<ul data-template="product-compare-product-feature-info" data-bind="source: Data">',
					'		</ul>',
					'	</div>',
					'</script>',
					'<script id="product-compare-product-feature-info" type="text/x-kendo-template">',
					'	<li data-bind="addClass: HighlightInfo, visible: ShowFeature">',
					'		<div><strong data-bind="text: Name"></strong></div>',
					'		<div data-bind="text: FormattedValue"></div>',
					'	</li>',
					'</script>'].join(' \n');
		}

	}

	// register the widget

	$.cv.ui.widget(productCompare);

})(jQuery);

