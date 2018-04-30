/*
    See confluence page: http://confluence.commercevision.com.au/x/oYL-B
*/

;
(function ($, undefined) {

    var WIDGET_INITIALISED = "widgetInitialised",
        LIST_UPDATED = "listUpdated",
        NO_RESULTS = "noResults";

    var productAttributeListWidget = {

        // Standard Variables

        // widget name
        name: "productAttributeList",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            productCode: "",
            errorGettingProductList: "There was an error retrieving the product list at this time",
            noProductsFound: "There were no results found",
            noProductsAdded: "No items have been added to your cart, please enter a quantity",
            attributeValueArrayClass: "col-1-{0}",
            redirectToAfterAddToCart: false,
            ordersPageUrl: "/cart",
            // viewModel flags
            autoBind: true,
            autoLoad: false,
            priceForOneShowNettPrice: true,
            addSelectedAttributeCodeToOrder: false,
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,
            refreshOnItemChange: false
            // view text defaults
        },

        extendEvents: [WIDGET_INITIALISED, LIST_UPDATED, NO_RESULTS],

        // MVVM Support

        viewModelBound: function () {
            // called after the widget view is bound to the viewModel
            var widget = this;
            widget.trigger(WIDGET_INITIALISED);
            $.cv.css.bind($.cv.css.eventnames.productExtendedPriceUpdated, $.proxy(widget.viewModel.productExtendedPriceUpdated, widget.viewModel));
        },

        initDataSource: function () {
            var widget = this, vm = widget.viewModel, opts = widget.options;
            if (opts.autoLoad) {
                vm.getAttributeList();
            }
        },

        // private functions
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var getDataView = function (isDetailList) {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                $.each(widget.dataSource.view(), function (idx, item) {
                    // add standard commands
                    item.index = idx;
                });
                return widget.dataSource.view();
            };

            var _convertArrayToObjectArray = function (array) {
                var objArray = [];
                var count = array.length;
                for (var i = 0; i < count ; i++) {
                    objArray.push({ value: array[i].toString().replace(/'/g, "&#39;"), index: i, count: count });
                }
                return objArray;
            };

            var _convertProductFieldsToProperties = function (object) {
                var properties = "";
                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        if (object[key] != null) {
                            if (key.toLowerCase() == "priceforone" && widget.options.priceForOneShowNettPrice && _.has(object, "NettPriceForOne")) {
                                properties += " data-" +
                                    key.replace(/([A-Z]+)/g, function (_, letter) { return "-" + letter.toLowerCase() }).replace(/-/, "") +
                                    "=\"" + object["NettPriceForOne"] + "\"";
                            } else {
                                properties += " data-" +
                                    key.replace(/([A-Z]+)/g, function (_, letter) { return "-" + letter.toLowerCase() }).replace(/-/, "") +
                                    "=" + _parseProductFieldValue(object[key]);
                            }
                        }
                    }
                }
                return properties;
            }

            /*
             *   Parse Product Fields which have been passed in via Dynamic Service. Data in one of two forms. Object or Array of Objects. If Array of objects
             *   turn the array into a JSON string representation of the array. Else return string representation of the Object. If productField is null return
             *   an empty string;
             *
             */
            var _parseProductFieldValue = function (productFieldValue) {
                if (productFieldValue) {
                    if ($.isArray(productFieldValue)) {
                        var parsedProductField = JSON.stringify(productFieldValue);
                        return "\'" + parsedProductField + "\'";
                    }
                    return "\"" + productFieldValue.toString() + "\"";
                }
                return "\"\"";
            }

            /*
                This proocesses the product attribute combinations
            */
            var _processAttributeList = function (data) {
                var vm = widget.viewModel, tempArray = [];

                for (var k = 0; k < data.length; k++) {
                    var attributeValArray = $.cv.util.convertArrayToObjectArray(data[k].AttributeValArray);
                    var productTemplate =
                          '<div data-allow-custom-options="' + widget.options.allowCustomOptions + '" '
                            + ' data-role="product" '
                            + ' data-product-code="' + (data[k].AttributedProductCode.length > 0 ? data[k].AttributedProductCode : data[k].ProductCode) + '"'
                            + ' data-orders-page-url="' + widget.options.ordersPageUrl + '"' 
                            + ' data-redirect-to-after-add-to-cart="' + widget.options.redirectToAfterAddToCart + '"' 
                            + ' data-master-product-code="' + data[k].ProductCode + '"'
                            + ' data-attributes-for-product="' + data[k].AttributeTitleValueSeq + '"'
                            + ' data-attribute-value-array=\'' + JSON.stringify(attributeValArray) + '\''
                            + ' data-add-selected-attribute-code-to-order=\'' + vm.get('addSelectedAttributeCodeToOrder') + '\''
                            + $.cv.util.convertFieldsToProperties(data[k].AttributedProductProduct[0], "", widget.options.priceForOneShowNettPrice)
                            + ' data-trigger-messages="true" data-trigger-get-price-on-qty-change="true"></div>';

                    // We take the div
                    var productObject = $(productTemplate);
                    // Make an object of it
                    kendo.init(productObject);
                    // Init that object
                    tempArray[k] = productObject.data().product.viewModel;
                    // And Hey presto we have a widget viewModel.
                }
                widget.setDataSource(tempArray);
                vm.set("attributeTitleArray", _convertArrayToObjectArray(data[0].AttributeTitleArray));
                vm.set("columnCount", data[0].AttributeTitleArray.length);
            };

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements

                productCode: widget.options.productCode,

                itemList: getDataView(),

                dataCount: 0,

                attributeTitleArray: [],

                attributeListOrderTotal: 0,

                message: '',
                
                // Priovate properties

                // UI Element state

                isProcessing: false,

                isAdding: false,

                _isInitialLoad: true,

                attributesLoaded: false,

                hasAttributes: function () {
                    return this.get("itemList").length > 0;
                },

                // functions for UI events

                /*
                    This updates the view after the data source changes
                */
                updateViewModelFromDataSource: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("dataCount", widget.dataSource.data().length);
                    widget.trigger(LIST_UPDATED, { viewCount: dataView.length, dataCount: this.get("dataCount"), hasAttributes: this.hasAttributes() });
                    if (this.get("dataCount") == 0 && !this.get("_isInitialLoad")) {
                        widget.trigger(NO_RESULTS);
                        $.cv.util.notify(widget.viewModel, this.get("noProductsFound"), $.cv.css.messageTypes.info);
                    }
                    this.set("_isInitialLoad", false);
                },

                /*
                    This gets the products attribute combinations
                */
                getAttributeList: function () {
                    var vm = this;
                    if (!vm.get("attributesLoaded") && !vm.get("isProcessing") && vm.get("productCode").length > 0) {
                        vm.set("isProcessing", true);
                        $.cv.css.product.getAllAttributeCombinations({ productCode: vm.get("productCode") })
                            .done(function (data) {
                                if (data && data.data && data.data.length > 0) {
                                    _processAttributeList(data.data);
                                }
                                vm.set("isProcessing", false);
                                vm.set("attributesLoaded", true);
                            }).fail(function (data) {
                                $.cv.util.notify(widget.viewModel, vm.get("errorGettingProductList"), $.cv.css.messageTypes.error);
                                vm.set("isProcessing", false);
                            });
                    }
                },

                columnCount: function () {
                    return this.get("attributeTitleArray").length;
                },

                getAttributeValueArrayClass: function () {
                    return widget.options.attributeValueArrayClass.format(this.columnCount());
                },

                productExtendedPriceUpdated: function () {
                    var vm = this, nonZeroQuantityProducts = vm.nonZeroQuantityProducts(), total = 0;
                    $(nonZeroQuantityProducts).each(function () {
                        total += this.get("extendedPrice");
                    });
                    vm.set("attributeListOrderTotal",total);
                },

                nonZeroQuantityProducts: function () {
                    var nonZeroQuantityProducts = [], itemList = viewModel.get("itemList");
                    if (itemList.length > 0) {
                        nonZeroQuantityProducts = _.filter(itemList, function (item) { return item.getQuantity() > 0; });
                    }
                    return nonZeroQuantityProducts;
                },

                addProducts: function () {
                    var vm = this, nonZeroQuantityProducts = vm.nonZeroQuantityProducts(), products = [], product = {}, productWidgets = [], errorMessages = "";;
                    vm.set("isAdding", true);
                    if (!nonZeroQuantityProducts.length > 0) {
                        $.cv.util.notify(widget.viewModel, vm.get("noProductsAdded"), $.cv.css.messageTypes.warning);
                        vm.set("isAdding", false);
                    } else {
                        $(nonZeroQuantityProducts).each(function () {
                            product = this.getProductAddParams();
                            if (product && product.quantity.length != 0 && !isNaN(product.quantity)) {
                                productWidgets.push(this);
                                products.push(product);
                            }
                        });
                        $.cv.util.clearNotifications(widget.viewModel);
                        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                        $.cv.css.orders.addToCurrentOrderBulk({
                            batchData: products
                        }).done(function (response) {
                            $.each(products, function (idx, item) {
                                var responseData = response.data[idx];

                                if (response.errorMessage[idx] == null &&
                                    responseData != null &&
                                    responseData.editOrderOk === true) {
                                    productWidgets[idx].triggerAddedToCart(responseData.message);
                                } else {
                                    if (response.errorMessage[idx] != null) {
                                        productWidgets[idx].triggerAddToCartFail(response.errorMessage[idx]);
                                        errorMessages = errorMessages.length == 0 ? response.errorMessage[idx] : "," + response.errorMessage[idx];
                                    }
                                    if (responseData != null && responseData.message != '') {
                                        productWidgets[idx].triggerAddToCartFail(responseData.message);
                                    }
                                }

                                productWidgets[idx].resetDefaults(products[idx]);
                                productWidgets[idx]._updatePriceBreaks();

                                if (errorMessages.length > 0) {
                                    widget.setMessage(errorMessages, $.cv.css.messageTypes.error);
                                }
                            });
                            vm.set("isAdding", false);
                            vm.set("attributeListOrderTotal", 0);
                            products = [];
                            product = {};
                            productWidgets = [];
                            errorMessages = "";
                        }).fail(function (msg) {
                            var msg = JSON.parse(msg);
                            if (msg.sessionHasTimedOut)
                                widget.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, {}, true);
                            products = [];
                            product = {};
                            productWidgets = [];
                            errorMessages = "";
                            vm.set("isAdding", false);
                        });
                    }
                }

            }));

            viewModel.bind("change", function (e) {
                
            });

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            // future widgets will not use view templates
        }

    };

    // register the widget
    $.cv.ui.widget(productAttributeListWidget);

})(jQuery);