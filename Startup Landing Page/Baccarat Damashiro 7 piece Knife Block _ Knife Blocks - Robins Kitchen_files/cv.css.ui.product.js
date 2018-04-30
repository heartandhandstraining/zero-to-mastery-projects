/*
* See: http://confluence.commercevision.com.au/x/3gL3B
*/
;

(function ($, undefined) {
    var PRODUCTADDEDTOCART = "productAddedToCart",
        PRODUCTADDEDTOFAVOURITES = "productAddedToFavourites",
        PRODUCTADDTOCARTFAIL = "productAddToCartFail",
        PRODUCTADDTOFAVOURITESFAIL = "productAddToFavouritesFail",
        PRODUCTREMOVEDFROMFAVOURITES = "productRemovedFromFavourites",
        PRODUCTREMOVEDFROMAVOURITESFAIL = "productRemovedFromFavouritesFail";

    var productWidget = {
        name: "product",
        extend: "mvvmwidget",

        extendEvents: [
            PRODUCTADDEDTOCART,
            PRODUCTADDEDTOFAVOURITES,
            PRODUCTADDTOCARTFAIL,
            PRODUCTADDTOFAVOURITESFAIL, 
            PRODUCTREMOVEDFROMFAVOURITES,
            PRODUCTREMOVEDFROMAVOURITESFAIL
        ],

        options: {
            // messages
            // view Template
            viewTemplate: null,
            // standard view options
            translationParams: "",
            productCode: "",
            productData: [{}],
            quantityBreaks: [],
            itemsOnOrder: 0,
            qtyOnBackOrder: 0,
            availableQty: 0,
            priceForOne: 0.00,
            nettPrice: 0.00,
            quantity: "",
            initialQuantityOverride: 0, // Can be used to provide a forced displayed initial qty that will always show regardless of other options such as forceOrderPackQty. e..g use when need to set compulsory amount for clusterline
            autoPopulateQty: true,
            defaultCostCentreCode: "",
            noteIsExtendedLineDescription: true,
            clearExistingMessages: false,
            triggerMessages: false,
            triggerFavouritesMessages: true,
            allowOrderEntryForProduct: true,
            allowDecimals: false,
            blurElementOnKeyup: true,
            addToCartRefreshTime: 600, // timeout when adding to cart to refresh order default to 400ms
            // others to be added to allow configuration of standard view
            // widget settings
            enableOrderLineNotes: false,
            useCostCentres: false,
            useOrderEntry: false,
            isFavourite: false,
            isUserFavouritesPage: false,
            multiUpdateThrottleTimeout: 400,
            addSelectedAttributeCodeToOrder: false,
            forceOrderPackQty: false,
            campaignCode:"",
            selectedUom: "",
            hideFooterZone: false,
            hidePricing: false,
            redirectToAfterAddToCart: false,
            ordersPageUrl: "/cart",
            triggerGetPriceOnQtyChange: false,

            outOfStock: false,
            availableClass: '',
            isListenerWidget: false,
            // Product Store Availability Click and Collect options
            enableStoreAvailabilityClickAndCollect: false, // When this is used, if product attributes all selected then need to set visibility of related availability icons.
            currentPickupStoreName: "",
            showPickupSelectProductAttributes: false, // attributes not yet set.
            showPickupAvailable: false,
            showPickupIndentProductCall: false,
            showPickupLowStockCall: false,
            showPickupStoreNotSet: false,
            showPickupUnavailable: false,
            showDeliverySelectProductAttributes: false, // attributes not yet set.
            showDeliveryAvailable: false,
            showDeliveryIndentProductCall: false,
            showDeliveryUnavailable: false,

            // Options for Product Store Availability Click and Collect when Delivery is in Warehouse Transfer Zone mode and have some additional options that don't match with standard mode delivery ones
            storeAvailClickAndCollectDeliveryDisplayMode: "",
            showDeliveryAvailableTwoToFiveDays: false,
            showDeliveryAvailableThreeToSixDays: false,
            showDeliveryAvailableFiveToSevenDays: false,
            showDeliverySpecialOrder: false,

            // Show Nearby Pickup Stores Availability Click and Collect options
            checkNearbyStoresPickupAvailMaximumStores: 3,
            includeCurrentStoreInNearbyStoresAvailCheck: true,
            textProductNoNearbyStoresHaveAvail: "This item is either not currently available for pickup from any stores near to your current store, or there are no other stores close by.",
            textProductErrorCheckingNearbyStoresAvail: "Error checking availability from nearby stores near to your current store, or there are no other stores close by.",

            //Product attributes options
            attributedProductList:null,
            pleaseSelectAttributeText: "Please select the {0}",
            attributeValueArray: "",
            prontoStockWarehouseRecord: "",
            packQuantity: 1,
            packQuantityTarget: "packQuantity",
            quantityTarget: "quantity",

            // Quick View
            rcQuickViewZoneSelector: ".cv-zone-product-3",
            rcQuickViewCloseButtonHtml: "<div class='close-overlay cv-ico-general-cross3'>Close</div>",
            rcQuickViewSlideToggleSelector: ".cv-zone-product-3 .close-overlay",
            
            textProductAddedToCart: "Your products have been successfully added to your cart",
            textQuantityMustBeNumeric: "Please enter whole numbers greater than zero",
            pleaseOrderInPackQuantity: "Must Order in pack quantity of {0}'s",
            textProductAddedToFavourites: "Your product has been successfully added to your favourites",
            textDefaultErrorAddingToFavourites: "Error adding this product to your favourites, it may already exist",
            textDefaultRemoveFavouriteSuccess: "Your product has been successfully removed from your favourites",
            textDefaultRemoveFavouriteFail: "Error removing this product from your favourites, it may have already been removed",
            defaultPleaseSelectAttribute: "Please ensure you have selected all product options",
            textAddToCartButtonLabel: "Add to Cart",
            textAddToFavouritesButtonLabel: "Add to Favourites",
            gtmPageType: ''
        },

        initialise: function (el, o) {
            var widget = this,
                opts = widget.options,
                vm = widget.viewModel;

            widget.translateParameters(el);

            widget._updatePriceBreaksThrottled = _.debounce(function () {
                vm._updatePriceBreaks();
            }, opts.multiUpdateThrottleTimeout);
        },

        translateParameters: function (el) {
            var widget = this;

            if (widget.options.translationParams.length > 0) {
                $.each(widget.options.translationParams.split(","), function (idx, item) {
                    if (widget.options[item] != undefined && widget.options[item] != $(el).data(item)) {
                        widget.options[item] = $(el).data(item);
                    }
                });
            }
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this;
            if (widget.options.isListenerWidget) {
                $.cv.css.bind($.cv.css.eventnames.productDetailsChanged, $.proxy(widget.viewModel.productDetailsChanged, widget.viewModel));
            }
        },

        _buildViewTemplate: function () {
            var widget = this;
        },

        getInitialQty: function () {
            var widget = this;

            // If passed through an initial qty override option to popualte then use this
            // e.g. CLusterlines when have a compulsory product and a suggested qty.
            var qty = widget.options.initialQuantityOverride > 0
                        ?
                        widget.options.initialQuantityOverride
                        :
                        (widget.options.forceOrderPackQty
                            ? (widget.options.quantity.toString().length > 0
                                ? widget.options.packQuantity
                                : widget.options.quantity)
                            : widget.options.quantity);

            qty = parseFloat(qty);

            return isNaN(qty) ? 0 : qty;
        },

        _updatePriceBreaksThrottled: $.noop,

        _getViewModel: function () {
            var widget = this;

            // We MUST have the product code from the attribute as as a string
            // without the kendo special parsing (which would parseInt the thing thus
            // removing any zeros at the start and any letters if starts with numbers.
            // Note: .attr() as it returns string whereas data() converts it to an int potentially also.
            widget.options.productCode = widget.element.attr("data-product-code") || "";
            widget.options.masterProductCode = widget.element.attr("data-master-product-code") || null;

            var initialQty = widget.getInitialQty();

            var viewModel = $.extend(kendo.observable(widget.options), {
                useOrderEntry: widget.options.useOrderEntry,
                isProcessing: false,
                isAddingToCart: false,
                isAddingToFavourites: false,
                isCheckoutWithPayPalExpress: false,

                hasOutOfStockNotify: false,
                notifyEmailAddress: "",

                packQuantityFloat: function() {
                    var vm = this,
                        parsed = parseFloat(vm.get("packQuantity"));

                    return isNaN(parsed) ? 0 : parsed;
                },

                campaignCode: $.cv.util.isNullOrWhitespace(widget.options.campaignCode) ? $.cv.util.queryStringValue("CampaignCode") : widget.options.campaignCode,
            
                viewLivePricingForProduct: function () {
                    var vm = this;

                    vm.set("isProcessing", true);

                    $.cv.css.product.getRenderedProductListItemZonedTemplate({
                        productCode: vm.get("productCode"),
                        campaignCode: vm.get("campaignCode")
                    }).done(function(data) {
                        if (data.data.Success) {
                            // Destroy the current widget.
                            widget.destroy();
                            
                            // Set the HTML for the template. Must wrap HTML in a div otherwise jQuery find won't find what we're looking for.
                            var $product = $("<div>" + data.data.Messages[0] + "</div>").find(".product").first();
                            $(widget.element).replaceWith($product);

                            // Hackery to get stuff to look good, work properly, etc.
                            var $footer = $product.find(widget.options.rcQuickViewZoneSelector);
                            $footer.prepend(widget.options.rcQuickViewCloseButtonHtml);
                            $product.find(widget.options.rcQuickViewSlideToggleSelector).click(function () {
                                $footer.slideToggle();
                            });
                            $product.addClass("is-quick-view");
                            $footer.find(".form-number").each(function() {
                                $.cv.util.kendoNumericTextBox(this);
                            });

                            // Init the widget.
                            kendo.init($product);

                            // Slide into view.
                            $footer.slideToggle();
                            var quickViewEventData = { widgetElement: $product };
                            if ($.cv.util.hasValue(data.data.AdditionalData) && $.cv.util.hasValue(data.data.AdditionalData.SiteTrackerDetails)) {
                                quickViewEventData["productImpressions"] = data.data.AdditionalData.SiteTrackerDetails;
                            }
                            $.cv.css.trigger($.cv.css.eventnames.quickViewProductLoaded, quickViewEventData);
                        } else {
                            $.each(data.data.Messages, function(index, message) {
                                vm.setMessage(message, $.cv.css.messageTypes.error);
                            });
                        }
                    }).always(function() {
                        vm.set("isProcessing", false);
                    });
                },
            
                execCommand_outOfStockNotify: function () {
                    var vm = this;

                    var data;
                    if (vm.get("hasOutOfStockNotify")) {
                        data = {
                            productCodes: vm.get("productCode"),
                            onChange: function (flag) {
                                vm.set("hasOutOfStockNotify", flag);
                            },
                            data: null
                        };
                        $.cv.css.trigger($.cv.css.eventnames.stockAvailabilityNotifyRemove, data);
                    } else {
                        data = {
                            productCodes: vm.get("productCode"),
                            hasOutOfStockNotify: vm.get("hasOutOfStockNotify"),
                            onChange: function (flag) {
                                vm.set("hasOutOfStockNotify", flag);
                            },
                            data: null
                        };
                        $.cv.css.trigger($.cv.css.eventnames.stockAvailabilityNotifyShowPopup, data);
                    }
                },

                enableOrderLineNotes: function () {
                    return this.get("useOrderEntry") && widget.options.enableOrderLineNotes;
                },

                useCostCentres: function () {
                    return this.get("useOrderEntry") && widget.options.useCostCentres;
                },

                quantity: initialQty,
                lastValidQuantity: initialQty,
                allowOrderEntryForProduct: widget.options.allowOrderEntryForProduct,
                isFavourite: widget.options.isFavourite,

                addProductKeyUp: function (event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();

                        this.addToCart();
                        if (widget.options.blurElementOnKeyup) {
                            $(event.srcElement).blur();
                        }
                    }
                },

                // This never gets changes from the original assigned product code (master product code)
                masterProductCode: $.cv.util.hasValue(widget.options.masterProductCode) ? widget.options.masterProductCode : widget.options.productCode,

                // Product Code might change to the attributed product code and the UI updated 
                // with the attributed product information...
                productCode: widget.options.productCode,
                productData: widget.options.productData[0],
                populateProductData: function (validMode) {
                    var vm = this;

                    var options = {
                        productCode: vm.get("productCode"),
                        validMode: validMode,
                        isAttributeSelection: vm.isMasterProduct() && vm.isAllAttributesSelected()
                    };

                    //only get the data if we don't already have it
                    if ($.cv.util.hasValue(vm.get("productData")) && vm.get("currentProductCode") !== options.productCode) {
                        vm.set("currentProductCode", options.productCode);
                        var call = widget.options.hideFooterZone
                            ? $.cv.css.product.getProductDetailNoPrices(options)
                            : $.cv.css.product.getProductDetail(options);

                        call.success(function (data) {
                            if (data.data[0].IsQuantityBreaksLiveOrDefaultSuppressed) {
                                var qtyBreakData = vm.get("productData").QuantityBreaksLiveOrDefault;
                                data.data[0].QuantityBreaksLiveOrDefault = qtyBreakData;
                            }
                            vm.set("productData", data.data[0]);

                            vm._updateAvailability();
                            vm._updateAllowOrderEntry();
                            vm._updateQtyOnBackOrder();

                            // price breaks are now returned as part of the detail so the price break update can be called here
                            vm.set('forceNextQtyCheck', true);
                            vm.updatePriceBreaks();
                        });
                    }
                },

                showInStock: function () {
                    var vm = this;
                    return vm.isMasterProduct() && !vm.isAllAttributesSelected() ? false : !vm.get("outOfStock");
                },

                showOutOfStock: function () {
                    var vm = this;
                    return vm.isMasterProduct() && !vm.isAllAttributesSelected() ? false : vm.get("outOfStock");
                },

                pricePerUnit: widget.options.priceForOne,
                extendedPrice: isNaN(widget.options.quantity) || isNaN(widget.options.priceForOne.toString().replace("$", "")) ? 0 : widget.options.quantity * widget.options.priceForOne.toString().replace("$", ""),
                lastCheckedQty: 0.00,
                forceNextQtyCheck: false,
                currentProductCode: '',
                _setQuantityBreakData: function (nettPrice, quantityBreaks) {
                    var vm = this;

                    // make sure this is a float as there are comparisons made with is value
                    nettPrice = !isNaN(nettPrice) ? parseFloat(nettPrice) : 0.00;

                    vm.set("quantityBreaksData",
                    {
                        NettPrice: nettPrice,
                        QuantityBreaksLiveOrDefault: quantityBreaks
                    });
                },
                quantityBreaksData: {},
                hasQuantityBreaks: function () {
                    var vm = this;
                    var productData = vm.get("productData");
                    var quantityBreaks = vm.get("quantityBreaksData");
                    return (quantityBreaks && quantityBreaks.QuantityBreaksLiveOrDefault && quantityBreaks.QuantityBreaksLiveOrDefault.length > 0) ||
                        (productData && productData.QuantityBreaksLiveOrDefault && productData.QuantityBreaksLiveOrDefault.length > 0);
                },
                
                // View Model properties that the visibility of the various "Click And Collect Store Availability" product icons are bound aaginst
                // Includes the pickup and delivery ones.
                showPickupSelectProductAttributes: widget.options.showPickupSelectProductAttributes, // attributes not yet set.
                showPickupAvailable: widget.options.showPickupAvailable,
                showPickupIndentProductCall: widget.options.showPickupIndentProductCall,
                showPickupLowStockCall: widget.options.showPickupLowStockCall,
                showPickupStoreNotSet: widget.options.showPickupStoreNotSet,
                showPickupUnavailable: widget.options.showPickupUnavailable,
                showDeliverySelectProductAttributes: widget.options.showDeliverySelectProductAttributes, // attributes not yet set.
                showDeliveryAvailable: widget.options.showDeliveryAvailable,
                showDeliveryIndentProductCall: widget.options.showDeliveryIndentProductCall,
                showDeliveryUnavailable: widget.options.showDeliveryUnavailable,

                // Options for Product Store Availability Click and Collect when Delivery is in Warehouse Transfer Zone mode and have some additional options that don't match with standard mode delivery ones
                showDeliveryAvailableTwoToFiveDays: widget.options.showDeliveryAvailableTwoToFiveDays,
                showDeliveryAvailableThreeToSixDays: widget.options.showDeliveryAvailableThreeToSixDays,
                showDeliveryAvailableFiveToSevenDays: widget.options.showDeliveryAvailableFiveToSevenDays,
                showDeliverySpecialOrder: widget.options.showDeliverySpecialOrder,

                // Stuff for "Click And Collect Store Availability" for showing nearby stores (to current store) pickup avail for product
                nearbyStoreLocations: [],
                noNearbyStoreLocations: false,

                _updateAvailability: function () {
                    var vm = this;

                    var productData = vm.get("productData");
                    if (productData && !$.cv.util.isNullOrWhitespace(productData.ProductCode)) {
                        vm._setClickAndCollectStoreAvailabilityIcons();
                        if (vm.isMasterProduct() && !vm.isAllAttributesSelected()) {
                            vm.set("availableClass", "");
                        } else {
                            var availForOne = vm.get("productData") ? vm.get("productData").AvailableForOne : "";
                            var outOfStock = !isNaN(availForOne) && parseInt(availForOne) <= 0;
                            vm.set("availableClass",
                                "cart-product-availability " + (outOfStock ? "out-of-stock" : "in-stock"));
                            vm.set("outOfStock", outOfStock);

                            if (!widget.options.isListenerWidget) {
                                $.cv.css.trigger($.cv.css.eventnames.productDetailsChanged, productData);
                            }
                        }
                    } else {
                        var stock = vm.get("outOfStock");
                        vm.set("availableClass",
                                "cart-product-availability " + (stock ? "out-of-stock" : "in-stock"));
                    }
                },

                _updateAllowOrderEntry: function() {
                    var vm = this;

                    var productData = vm.get("productData");
                    if (productData && !$.cv.util.isNullOrWhitespace(productData.ProductCode)) {
                        var allowOrderEntry = productData.AllowOrderEntryForProduct;
                        vm.set("allowOrderEntryForProduct", allowOrderEntry);
                    }
                },

                //
                // This is only currently used for when the product widget is used in ProductPurchaseDetails view so that product attribute selection
                // can update the qty on back order for the chosen product. Also, this is not always displayed by default but needs config to show.
                _updateQtyOnBackOrder: function () {
                    var vm = this;

                    var productData = vm.get("productData");
                    if (productData && $.cv.util.hasValue(productData.QtyOnBackOrderForCustomer)) {
                        vm.set("qtyOnBackOrder", productData.QtyOnBackOrderForCustomer);
                    }
                },

                _setClickAndCollectStoreAvailabilityIcons: function () {
                    if (!widget.options.enableStoreAvailabilityClickAndCollect)
                        return;

                    var vm = this;
                    var prodData = vm.get("productData");

                    if (prodData === undefined)
                        return;

                    var delOption = prodData.GetDeliveryOptionClickAndCollectAsString,
                        delOptionTfrZone = prodData.GetDeliveryOptionTransferZoneClickAndCollectAsString,
                        pickupOption = prodData.GetPickupOptionClickAndCollectAsString;

                    if (widget.options.storeAvailClickAndCollectDeliveryDisplayMode === "Standard") {
                        switch (delOption) {
                        case "SelectProductAttributes":
                            vm.set("showDeliverySelectProductAttributes", true);
                            vm.set("showDeliveryAvailable", false);
                            vm.set("showDeliveryIndentProductCall", false);
                            vm.set("showDeliveryUnavailable", false);
                            break;

                        case "Available":
                            vm.set("showDeliverySelectProductAttributes", false);
                            vm.set("showDeliveryAvailable", true);
                            vm.set("showDeliveryIndentProductCall", false);
                            vm.set("showDeliveryUnavailable", false);
                            break;

                        case "CallToOrderIndentProduct":
                            vm.set("showDeliverySelectProductAttributes", false);
                            vm.set("showDeliveryAvailable", false);
                            vm.set("showDeliveryIndentProductCall", true);
                            vm.set("showDeliveryUnavailable", false);
                            break;

                        case "Unavailable":
                            vm.set("showDeliverySelectProductAttributes", false);
                            vm.set("showDeliveryAvailable", false);
                            vm.set("showDeliveryIndentProductCall", false);
                            vm.set("showDeliveryUnavailable", true);
                            break;

                        case "NotApplicable":
                            vm.set("showDeliverySelectProductAttributes", false);
                            vm.set("showDeliveryAvailable", false);
                            vm.set("showDeliveryIndentProductCall", false);
                            vm.set("showDeliveryUnavailable", false);
                            break;
                        }
                    } else { // Assume it is WarehouseTransferZone mode
                        switch (delOptionTfrZone) {
                            case "SelectProductAttributes":
                                vm.set("showDeliverySelectProductAttributes", true);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", false);
                                break;

                            case "Available":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", true);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", false);
                                break;

                            case "TwoToFiveDays":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", true);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", false);
                                break;

                            case "ThreeToSixDays":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", true);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", false);
                                break;

                            case "FiveToSevenDays":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", true);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", false);
                                break;

                            case "SpecialOrder":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", true);
                                vm.set("showDeliveryUnavailable", false);
                                break;

                            case "Unavailable":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", true);
                                break;

                            case "NotApplicable":
                                vm.set("showDeliverySelectProductAttributes", false);
                                vm.set("showDeliveryAvailable", false);
                                vm.set("showDeliveryAvailableTwoToFiveDays", false);
                                vm.set("showDeliveryAvailableThreeToSixDays", false);
                                vm.set("showDeliveryAvailableFiveToSevenDays", false);
                                vm.set("showDeliverySpecialOrder", false);
                                vm.set("showDeliveryUnavailable", false);
                                break;
                        }
                    }

                    switch (pickupOption) {
                        case "SelectProductAttributes":
                            vm.set("showPickupSelectProductAttributes", true);
                            vm.set("showPickupAvailable", false);
                            vm.set("showPickupIndentProductCall", false);
                            vm.set("showPickupLowStockCall", false);
                            vm.set("showPickupStoreNotSet", false);
                            vm.set("showPickupUnavailable", false);
                            break;

                        case "Available":
                            vm.set("showPickupSelectProductAttributes", false);
                            vm.set("showPickupAvailable", true);
                            vm.set("showPickupIndentProductCall", false);
                            vm.set("showPickupLowStockCall", false);
                            vm.set("showPickupStoreNotSet", false);
                            vm.set("showPickupUnavailable", false);
                            break;

                        case "CallToOrderIndentProduct":
                            vm.set("showPickupSelectProductAttributes", false);
                            vm.set("showPickupAvailable", false);
                            vm.set("showPickupIndentProductCall", true);
                            vm.set("showPickupLowStockCall", false);
                            vm.set("showPickupStoreNotSet", false);
                            vm.set("showPickupUnavailable", false);
                            break;

                        case "CallStoreLowStock":
                            vm.set("showPickupSelectProductAttributes", false);
                            vm.set("showPickupAvailable", false);
                            vm.set("showPickupIndentProductCall", false);
                            vm.set("showPickupLowStockCall", true);
                            vm.set("showPickupStoreNotSet", false);
                            vm.set("showPickupUnavailable", false);
                            break;

                        case "StoreNotSet":
                            vm.set("showPickupSelectProductAttributes", false);
                            vm.set("showPickupAvailable", false);
                            vm.set("showPickupIndentProductCall", false);
                            vm.set("showPickupLowStockCall", false);
                            vm.set("showPickupStoreNotSet", true);
                            vm.set("showPickupUnavailable", false);
                            break;

                        case "Unavailable":
                            vm.set("showPickupSelectProductAttributes", false);
                            vm.set("showPickupAvailable", false);
                            vm.set("showPickupIndentProductCall", false);
                            vm.set("showPickupLowStockCall", false);
                            vm.set("showPickupStoreNotSet", false);
                            vm.set("showPickupUnavailable", true);
                            break;
                    }
                },

                getDataView: function (data) {
                    var array = [];
                    $.each(data, function (idx, item) {
                        // add standard commands
                        item.index = idx;
                        var dataItem = $.cv.util.getFieldItemData(item);
                        array.push(dataItem);
                    });
                    return array;
                },

                findNearestPickupStores: function () {
                    var vm = this,
                            pCode = vm.get("productCode"),
                            maxNumberOfStores = widget.options.checkNearbyStoresPickupAvailMaximumStores,
                            message = "";

                    vm.set("isProcessing", true);
                    vm.set("nearbyStoreLocations", []); 
                    vm.set("noNearbyStoreLocations", false);

                    $.cv.css.product.findNearestPickupStoresForProduct({
                        productCode: pCode,
                        numberOfStores: maxNumberOfStores,
                        includeCurrentStore: widget.options.includeCurrentStoreInNearbyStoresAvailCheck
                    }).done(function (data) {
                        if (data.data) {
                            if (data.data.length > 0) {
                                $.each(data.data, function(i, sl) {
                                    if (sl.StoreLocation.StoreLocationDetailsFieldData) {
                                        sl.StoreLocation.StoreLocationDetailsFieldData = vm.getDataView(sl.StoreLocation.StoreLocationDetailsFieldData);
                                    }
                                });

                                vm.set("nearbyStoreLocations", data.data);
                            } else {
                                vm.set("noNearbyStoreLocations", true);
                            }
                        } else {
                            if (data.errorMessage != null)
                                message = data.errorMessage;
                            else
                                message = widget.options.textProductErrorCheckingNearbyStoresAvail;

                            vm.setMessage(message, $.cv.css.messageTypes.error);
                        }

                        vm.set("isProcessing", false);

                        $.fancybox.update();
                    });

                    return true; // Need to return true as is triggered by click event on anchor tag which refs the modal window is to be fancyboxed.
                },

                _setExtendedPrice: function () {
                    var vm = this,
                        price = vm.get("pricePerUnit").toString().replace("$", ""),
                        qty = vm.get('quantity'),
                        extendedPrice = 0;

                    if (isNaN(qty) || isNaN(price)) {
                        extendedPrice = 0;
                    } else {
                        extendedPrice = qty * parseFloat(price);
                    }
                    vm.set("extendedPrice", extendedPrice);
                    $.cv.css.trigger($.cv.css.eventnames.productExtendedPriceUpdated, {
                        productCode: vm.get("productCode"),
                        extendedPrice: extendedPrice
                    });
                },

                _getPriceFromQuantityBreaks: function (qty) {
                    var vm = this;
                    var quantityBreaks = vm.get("quantityBreaksData").QuantityBreaksLiveOrDefault;

                    if (!$.cv.util.hasValue(quantityBreaks) || quantityBreaks.length === 0) {

                        // if there are no quantity breaks, check the product data
                        var productData = vm.get("productData");
                        if (!$.cv.util.hasValue(productData) ||
                            !$.cv.util.hasValue(productData.QuantityBreaksLiveOrDefault)) {
                            return null;
                        }

                        quantityBreaks = productData.QuantityBreaksLiveOrDefault;
                    }

                    var pricePerUnit = null;
                    var priceBreak = _.find(quantityBreaks,
                        function (quantityBreak) {
                            // return the first record where the break end value is greater than the required qty
                            // with the fall back to the last price break (with break end = -1
                            return quantityBreak.BreakEnd >= qty || quantityBreak.BreakEnd === -1;
                        });

                    if ($.cv.util.hasValue(priceBreak) && $.cv.util.hasValue(priceBreak.NettPrice)) {
                        pricePerUnit = priceBreak.NettPrice;
                    }

                    return pricePerUnit;
                },

                _productCodeCheckedAndNoBreaks: false,

                _updatePriceBreaks: function () {
                    var vm = this,
                        qty = vm.get('quantity');

                    if (qty === vm.get('lastCheckedQty') && vm.get('forceNextQtyCheck') === false)
                        return;

                    vm.set('lastCheckedQty', qty);

                    // if we have already checked this product code don't check again
                    if (vm.get("_productCodeCheckedAndNoBreaks")) {
                        vm._setExtendedPrice();
                        return;
                    }

                    // check if we can get a price from price breaks we may have already retrieved
                    var pricePerUnit = vm._getPriceFromQuantityBreaks(qty);
                    if ($.cv.util.hasValue(pricePerUnit)) {
                        vm.set("pricePerUnit", pricePerUnit);
                        vm._setExtendedPrice();
                        return;
                    }                    

                    // we have no price breaks so make a call to get them
                    $.cv.css.product.getPriceForQty({
                        productCode: vm.get("productCode"),
                        quantity: qty,
                        includeQuantityBreaks: true
                    })
                    .success(function (msg) {

                        // if the call comes back and the product code has no price breaks
                        // keep track of this so we don't check again
                        if (!$.cv.util.hasValue(msg.data.QuantityBreakInformation)) {
                            vm.set("_productCodeCheckedAndNoBreaks", true);
                        }
                        vm._setQuantityBreakData(msg.data.NettPriceForOne, msg.data.QuantityBreakInformation);
                        vm.set("pricePerUnit", parseFloat(msg.data.Price));
                        vm._setExtendedPrice();
                    });
                },

                updatePriceBreaks:function(){
                    /*
                        Call a throttled version of the method
                        Prevents multiple calls when a user clicks on plus or minus on a kendo numeric textbox
                        or makes multiple quantity chaanges in quick succession
                    */
                    widget._updatePriceBreaksThrottled();
                },
                
                getQuantity:function () {
                    var vm = this;
                    return vm.get('quantity');
                },
                
                setQuantity:function (qty) {
                    var vm = this;
                    vm.set('quantity', qty);
                },
                
                increaseQty: function () {
                    $.cv.util.kendoNumericTextBoxIncrease(this);
                    if (widget.options.triggerGetPriceOnQtyChange) {
                        this.updatePriceBreaks();
                    }
                },

                decreaseQty: function () {
                    $.cv.util.kendoNumericTextBoxDecrease(this, 0);
                    if (widget.options.triggerGetPriceOnQtyChange) {
                        this.updatePriceBreaks();
                    }
                },
                
                isMasterProduct:function(){
                    var vm = this;
                    return vm.get("attributedProductList") != null && vm.get("attributedProductList").length > 0;
                },
               
                // This will return the current attributes selected for this product.
                // If the product is not a master product but has an attributed product it can be changed.
                productAttributesHasBeenInit: false,
                currentProductAttributesLocal: [],
                currentProductAttributes: function(){
                    var vm = this,
                        allPossibleCombinations = vm.get("attributedProductList");
                        
                    if (vm.get("productAttributesHasBeenInit") == false){
                        vm.set("productAttributesHasBeenInit",true);
                        var temp=[],
                            i=0,
                            isFirst=true;
                        
                        //  if we are a master product we should have a list of options.
                        if (vm.isMasterProduct() && allPossibleCombinations.length > 0)
                        {
                            for(var attr in allPossibleCombinations[0][2])
                            // We only need one row as any product will always have all of the 
                            // Attr Types. ie color and size
                            {
                                var isSelect = attr.split('_')[1] == 'D';
                                temp.push({
                                    nameForDisplay:attr.split('_')[0],
                                    name: attr,
                                    val:"",
                                    index:i,
                                    isSelect: isSelect,
                                    showRadio: isFirst && !isSelect,
                                    showSelect: isFirst && isSelect,
                                    showPleaseSelect: !isFirst,
                                    updateShowSettings: function(){
                                        var observer = this,
                                        checkIDX = widget.viewModel.get("currentAttributeIDXToSelectNext");
                                        
                                        val = (checkIDX >= observer.get("index") || checkIDX == -1);
                                        
                                        observer.set("showPleaseSelect",!val);
                                        if(observer.isSelect == true){
                                            observer.set("showSelect",val);
                                        }else{
                                            observer.set("showRadio",val);
                                        }
                                    },

                                    // This will change depending on what the current previous attributes are.
                                    attributeOptionsSource: [],
                                    
                                    updateAttributeOptionsSource:function(){
                                        var observer = this,
                                        productViewModel = observer.parent().parent(),
                                        allPossibleCombinations = productViewModel.get("attributedProductList"),
                                        currentIndex = observer.index,
                                        local = productViewModel.currentProductAttributesLocal,
                                        tempObject = [],
                                        dataObject = observer.isSelect == true ? [
                                            kendo.observable({id:"",text:"Please Select",attrName:observer.name})
                                        ] : [];
                                        
                                        // Get all distinct options.
                                        if (allPossibleCombinations){
                                            for(var i = 0; i < allPossibleCombinations.length; i++){
                                                var invalid = false;
                                                // Check the current selected items
                                                for(var g = 0; g < local.length; g++)
                                                {
                                                    // Up until the current index
                                                    if(local[g].index < currentIndex && 
                                                    // If the combination we are checking has a value = current then its all good.
                                                    local[g].val != allPossibleCombinations[i][2][local[g].name])
                                                    {
                                                        invalid = true;
                                                    }
                                                }
                                                var data = allPossibleCombinations[i][2][observer.name];
                                                if(!_.contains(tempObject,data) && !invalid){
                                                    tempObject.push(data);
                                                }
                                            }
                                            // Now to return an observable obj.
                                            for(var q = 0; q < tempObject.length; q++)
                                            {
                                                dataObject.push(kendo.observable({
                                                    id:tempObject[q],
                                                    text:tempObject[q],
                                                    attrName:observer.name
                                                }));
                                            }
                                        }
                                        observer.set("attributeOptionsSource",dataObject);
                                    },
                                    
                                    // In a perfect world(/widget) this shouldn't be needed.
                                    // I should be able to just put a get into options of the.
                                    // productViewModel.get("currentAttributeIDXToSelectNext");
                                    // But it doesn't seem to be correctly applying the listener hence the following.
                                    updateWidget:function(){
                                        var observer = this,
                                        productViewModel = widget.viewModel;
                                        
                                        var local = productViewModel.currentProductAttributesLocal;
                                        var tag = _.find(productViewModel.get("_tagCombinations"), function (item) { return item.option === observer.name && item.value === observer.val });
                                        if ($.cv.util.hasValue(tag)) {
                                            tag.currentProductAttributes = local;
                                            $.cv.css.trigger($.cv.css.eventnames.productVariantSelected, tag);
                                        }
                                        for (var q = 0 ; q < local.length ; q++)
                                        {
                                            if(observer.index < local[q].index){
                                                local[q].set("val","");
                                                local[q].updateAttributeOptionsSource();
                                            }
                                            productViewModel.updateCurrentAttributeIDXToSelectNext();
                                            local[q].updateShowSettings();
                                        }
                                        
                                    }
                                });
                                isFirst = false;
                                i++;
                            }
                            vm._createTagCombinations();
                        }
                        
                        vm.set("currentProductAttributesLocal",temp);
                        var list = vm.get("currentProductAttributesLocal");
                        for (var i = 0; i < list.length; i ++){
                            list[i].updateAttributeOptionsSource();
                        }
                        
                        // At this point we need to check if and of our products are the default and if they are select them.
                        if (allPossibleCombinations != null) {
                            for (var g = 0; g < allPossibleCombinations.length; g++) {
                                if (allPossibleCombinations[g][1] == true) {
                                    for (var i = 0; i < list.length; i++) {
                                        list[i].set("val", allPossibleCombinations[g][2][list[i].name]);
                                        list[i].updateWidget();
                                    }
                                    break;
                                }
                            }
                        }

                        // I'm not attributed or master product if I am here and nothing was done.
                    }
                    return vm.get("currentProductAttributesLocal");
                },

                _createTagCombinations: function() {
                    var vm = this,
                        attributedProductList = vm.get("attributedProductList"),
                        tagCombinations = [];
                    for (var i = 0; i < attributedProductList.length; i++) {
                        if (_.isArray(attributedProductList[i]) && attributedProductList[i].length > 3) {
                            var attributedProduct = attributedProductList[i][2];
                            for (var option in attributedProduct) {
                                if (attributedProduct.hasOwnProperty(option) && attributedProductList[i][3][option.substring(0, option.indexOf("_"))] != undefined) {
                                    var combo = {
                                        option: option,
                                        value: attributedProduct[option],
                                        tag: attributedProductList[i][3][option.substring(0, option.indexOf("_"))]
                                    };
                                    if (_.where(tagCombinations,combo).length === 0) {
                                        tagCombinations.push(combo);
                                    }
                                }
                            }
                        }
                    }
                    vm.set("_tagCombinations", tagCombinations);
                },

                _tagCombinations: [],

                currentAttributeIDXToSelectNext:0,
                
                updateCurrentAttributeIDXToSelectNext: function(){
                    var vm = this,
                    // All of the attributes for the product with and without vals
                    attrList = vm.currentProductAttributes();
                    if(attrList && attrList.length !=0){
                        for(var a = 0; a <attrList.length ; a++)
                        {
                            if(attrList[a].val == ""){
                                // The first one we find without a value is the index we want.
                                vm.set("currentAttributeIDXToSelectNext", a);
                                vm.setProductCodeToAttributedProductCode();
                                return;    
                            }        
                        }
                    }
                    // Everything is selected. So return -1
                    vm.set("currentAttributeIDXToSelectNext",-1);
                    vm.setProductCodeToAttributedProductCode();
                },
                
                pleaseSelectAttributeText: function() {
                    var vm = this;
                    var attrList = vm.currentProductAttributes();
                    var attrIndex = vm.get("currentAttributeIDXToSelectNext");
                    
                    if(attrList && attrList.length != 0 && attrIndex != -1){
                        return widget.options.pleaseSelectAttributeText.replace("{0}", attrList[attrIndex].nameForDisplay);
                    }
                    return "";
                },
                
                isAllAttributesSelected: function() {
                    var vm = this;
                    var attrIndex = vm.get("currentAttributeIDXToSelectNext");

                    return attrIndex == -1;
                },
                
                setProductCodeToAttributedProductCode: function () {
                    /*
                     * The ProductCode is updated to the Attributed Product ProductCode so that that visuals can change... i.e.
                     * we would load the attributed product details to get the image, description, prices etc which might be
                     * different to the master product.
                     */
                    var vm = this;
                    
                    if(vm.isAllAttributesSelected() == true){
                        allPossibleCombinations = vm.get("attributedProductList"),
                        local = vm.currentProductAttributesLocal;
                        
                        // Get all distinct options.
                        if (allPossibleCombinations){
                            for(var i = 0; i < allPossibleCombinations.length; i++){
                                var valid = true;
                                for(var g = 0; g < local.length; g++)
                                {
                                    // Up until the current index
                                    if(local[g].val != allPossibleCombinations[i][2][local[g].name])
                                    {
                                        valid = false;
                                        break;
                                    }
                                }
                                if(valid == true){
                                    vm.set("productCode", allPossibleCombinations[i][0]);
                                    var validMode = 1; // include:0, exclude:1
                                    vm.populateProductData(validMode);
                                    return;
                                }
                            }
                        }
                    }
                    // If not then revert
                    vm.set("productCode", widget.options.productCode);
                    vm.populateProductData();
                },

                itemsOnOrder: widget.options.itemsOnOrder.toString().length == 0 ? 0 : (isNaN(widget.options.itemsOnOrder) ? 0 : widget.options.itemsOnOrder),

                availableQty: widget.options.availableQty,

                orderedMoreThanAvailable: function () {
                    return this.get("itemsOnOrder") > this.get("availableQty");
                },

                costCentreCode: widget.options.defaultCostCentreCode,

                productNotes: '',
                message: '',

                clearExistingMessages: widget.options.clearExistingMessages,
                triggerMessages: widget.options.triggerMessages,

                setMessage: function (message, type) {
                    var vm = this;
                    
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                getProductAddParams: function () {
                    var vm = this,
                        params = {};
                    var prodCode = vm.get("productCode");
                    var masterProdCode = vm.get("masterProductCode");
                    var addAttributedProductCode = (widget.options.addSelectedAttributeCodeToOrder && prodCode !== masterProdCode) ||
                    (widget.options.masterProductCode != null && widget.options.masterProductCode != widget.options.productCode);

                    // WARNING(jwwishart): 
                    // When you are dealing with attributed products you need to
                    //  pass to the add line to current service, the MASTER product code and the 
                    //  attribute values of the product that we want to add (i.e. what is in AttributeTitleValueSeq field
                    //  ProductAttributeProduct...
                    // This widget will adjust the productCode value based on the product that matches the 
                    //  selected attributes so that the product information will be updated (different prices, different description,
                    //  different product image etc...
                    //  Do to all the above, we need t o use to use the masterProductCode as it never changes from what is bound!
                    // ADDITION(athomas):
                    // The caveat to this is when the widget setting addSelectedAttributeCodeToOrder is set to true or the widget.options.masterProductCode != widget.options.productCode
                    //FURTHER CLARIFICATION (Tod Lewin): The purpose of this block is to always use the attributed product code EXCEPT when there is no attributed product code and we only have the master
                    //product code to work with. AddLine will make use of the attributes and the master product code to attempt to reconstitute an attributed product code and then add a matching product to 
                    //the order. The log is not about using the master product code in preference to attributed product but as a last resort.
                    params.productCode = addAttributedProductCode ? prodCode : masterProdCode;
                    params.quantity = vm.get("quantity");
                    params.costCentre = vm.get("costCentreCode");
                    params.notes = vm.get("productNotes");
                    params.noteIsExtendedLineDescription = widget.options.noteIsExtendedLineDescription;
                    params.refreshOrderTimeout = widget.options.addToCartRefreshTime;
                    params.uom = vm.get("selectedUom");
                    params.campaignCode = vm.get("campaignCode");
                    params.gtmPageType = widget.options.gtmPageType;

                    var attributedProductList = vm.get('attributedProductList');
                    // item[0]: ProductCode or AttributedProductCode, item[4]: CreateLineNotes
                    var addLineNotes = attributedProductList && $.grep(attributedProductList, function (item) { return item[0] === params.productCode && item[4] === true; }).length > 0;

                    if (!addAttributedProductCode && vm.get('attributesForProduct') && vm.get('attributesForProduct').length > 0) {
                        // SCENARIO: Product Attribute List widget - it will set the attributesForProduct 
                        // option on this sub widget instance ... we just need to split it.
                        params.attributes = vm.get('attributesForProduct').split(';');
                    } else if (addLineNotes) {
                        // SCENARIO: Product widget rendering a single Product
                        // Get the attribute values for the currently selected product


                            var attributes = [];
                            // We have to go through this and extract the value in the correct ORDER
                            // otherwise we might send things in the WRONG order! :o( that would be bad!
                            _.each(vm.currentProductAttributes(), function(attributeInformation, index) {
                                // nameForDisplay doesn't have the _D or _R suffix (which we don't want in the
                                // data we send...
                            attributes.push(attributeInformation.nameForDisplay + ':' + attributeInformation.val);
                            });

                            params.attributes = attributes;

                        }

                    return params;
                },

                resetDefaults: function (params) {
                    var vm = this;

                    var initVal = widget.getInitialQty();
                    if (initVal === 0) {
                        initVal = '';
                    }
               
                    vm.set('itemsOnOrder', parseInt(vm.get("itemsOnOrder")) + parseInt(params.quantity));
                    vm.set("quantity", initVal);
                    vm.set("lastValidQuantity", '');
                    vm.set("productNotes", '');
                    vm.set("costCentreCode", widget.options.defaultCostCentreCode);
                    vm.set("qtyOnBackOrder", widget.options.qtyOnBackOrder);
                },

                triggerAddedToCart: function (msg) {
                    var vm = this;
                    
                    widget.trigger(PRODUCTADDEDTOCART,{ 
                        productCode: vm.get("productCode"),
                        quantity: vm.get("quantity") == "" ? 1 : vm.get("quantity"),
                        msg: msg
                    });

                    if (vm.get("redirectToAfterAddToCart") == true && !vm.get("isCheckoutWithPayPalExpress"))
                        $.cv.util.redirect("/" + vm.get("ordersPageUrl"), {}, false);

                    if (widget.options.triggerMessages) {
                        if (msg.length === 0) {
                            vm.setMessage(widget.options.textProductAddedToCart.format(vm.get("productCode")), $.cv.css.messageTypes.success);
                        } else {
                            vm.setMessage(msg, $.cv.css.messageTypes.success);
                        }
                    }
                },

                triggerAddToCartFail: function (msg) {
                    var vm = this;
                    
                    widget.trigger(PRODUCTADDTOCARTFAIL,{ 
                        productCode: vm.get("productCode"),
                        errorMessage: msg 
                    });
                    
                    vm.setMessage(msg, $.cv.css.messageTypes.error);
                },

                triggerAddedToFavourites: function (msg) {
                    var vm = this;
                    
                    msg = typeof msg !== 'undefined' ? msg : '';
                    widget.trigger(PRODUCTADDEDTOFAVOURITES,{ 
                        productCode: vm.get("productCode"),
                        msg: msg 
                    });
                    
                    vm.setMessage(msg, $.cv.css.messageTypes.success);
                },

                triggerAddToFavouritesFail: function (msg) {
                    var vm = this;
                    
                    widget.trigger(PRODUCTADDTOFAVOURITESFAIL,{ 
                        productCode: vm.get("productCode"),
                        errorMessage: msg 
                    });
                    
                    vm.setMessage(msg, $.cv.css.messageTypes.error);
                },

                triggerRemoveFavourite: function (msg) {
                    var vm = this;
                    
                    widget.trigger(PRODUCTREMOVEDFROMFAVOURITES,{ 
                        productCode: vm.get("productCode"),
                        msg: msg 
                    });
                    
                    vm.setMessage(msg, $.cv.css.messageTypes.success);
                },

                triggerRemoveFavouriteFail: function (msg) {
                    var vm = this;
                    
                    widget.trigger(PRODUCTREMOVEDFROMAVOURITESFAIL,{ 
                        productCode: vm.get("productCode"),
                        errorMessage: msg 
                    });
                    
                    vm.setMessage(msg, $.cv.css.messageTypes.error);
                },

                isQuantityValid: function () {
                    var vm = this,
                        valid = true, 
                        quantity = vm.getQuantity();
                    
                    if (isNaN(quantity) || (!widget.options.allowDecimals && quantity % 1 != 0) || quantity <= 0) {
                        valid = false;
                    }
                    if (!valid) {
                        vm.setQuantity(vm.get("lastValidQuantity"));
                    } else {
                        vm.set("lastValidQuantity", quantity);
                    }
                    return valid;
                },

                checkoutWithPayPalExpress: function (e) {
                    var vm = this;
                    vm.set("isCheckoutWithPayPalExpress", true);

                    // Only add to cart if Click & Collect is turned off. If it's turned on,
                    // product will be added to cart if the 'ok' button is clicked in the popup.
                    if (widget.options.enableStoreAvailabilityClickAndCollect) {
                        vm.set("isCheckoutWithPayPalExpress", false);

                        var params = {
                            e: e,
                            callback: function() {
                                vm.set("isCheckoutWithPayPalExpress", true);
                                vm.addToCart(e);
                            }
                        };
                        $.cv.css.trigger($.cv.css.eventnames.showDeliveryOptionPopup, params);
                    } else {
                        vm.addToCart(e);
                    }
                },

                addToCart: function (e) {
                    var vm = this,
                        packQuantity = vm.packQuantityFloat();

                    // Fix issue with numeric textbox not updating on keyup.
                    $(widget.element).closest("[data-role=product]").find("input").blur();

                    var params = vm.getProductAddParams();

                    // Check if master product and all options are selected
                    if (vm.isMasterProduct() && !vm.isAllAttributesSelected()) {
                        vm.triggerAddToCartFail(vm.pleaseSelectAttributeText().length > 0 ? vm.pleaseSelectAttributeText() : widget.options.defaultPleaseSelectAttribute);
                        vm.set("isCheckoutWithPayPalExpress", false);
                        return null;
                    }

                    // Validate
                    if (($.cv.util.isNotDeclaredOrNullOrWhitespace(params.quantity)
                        || params.quantity === 0)
                        && vm.get("autoPopulateQty") === true
                    ) {
                        if (vm.get("forceOrderPackQty")) {
                            var quantity = packQuantity !== 0 ? packQuantity : 1;
                            params.quantity = quantity;
                            vm.set('quantity', quantity);
                        } else {
                            params.quantity = 1;
                            vm.set('quantity', 1);
                        }
                    }
                    else if (params.quantity.length == 0) {
                        // If we are doing an add all with no qty just bail out here
                        vm.set("isCheckoutWithPayPalExpress", false);
                        return null;
                    }
                    else if (vm.get("forceOrderPackQty") && params.quantity % packQuantity !== 0) {
                        if (packQuantity !== 0) {
                            vm.triggerAddToCartFail(
                                widget.options.pleaseOrderInPackQuantity.format(vm.get("packQuantity"))
                            );
                            vm.set("isCheckoutWithPayPalExpress", false);
                            return null;
                        }
                    }
                    
                    vm.clearErrorMessage();

                    if (!vm.isQuantityValid()) {
                        vm.triggerAddToCartFail(widget.options.textQuantityMustBeNumeric);
                        vm.set("isCheckoutWithPayPalExpress", false);
                        return null;
                    }

                    vm.set("isProcessing", true);
                    if (vm.get("isCheckoutWithPayPalExpress") === false) {
                        vm.set("isAddingToCart", true);
                    }

                    var target = $.cv.util.hasValue(e) ? $(e.target) : null;

                    _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                    return $.cv.css.addToCurrentOrder(params).done(function (response) {
                        vm.set("isProcessing", false);
                        vm.set("isAddingToCart", false);

                        if (response.data && response.data.editOrderOk === true) {
                            vm.triggerAddedToCart(response.data.message);

                            //Check to see if we are attempting to checkout with PayPal Express.
                            //If so fire event to checkoutWithPayPalExpress to allow
                            //proceeding to checkout. PayPalExpress widget is bound to this event
                            //if it's on the the page and will process to handle checking out this order.
                            if (vm.get("isCheckoutWithPayPalExpress") === true) {
                                $.cv.css.trigger($.cv.css.eventnames.checkoutWithPayPalExpress, { e: e });
                            }

                            var isSubstitute = $.cv.util.hasValue(target) ? target.data("isSubstitute") : false;
                            if (isSubstitute) {
                                $.cv.css.trigger($.cv.css.eventnames.hideAlternatesPopup);
                            }
                        } else {
                            vm.triggerAddToCartFail(response.data.message);
                            params.quantity = 0;
                        }

                        vm.resetDefaults(params);
                    });
                },

                addToFavourites: function () {
                    var vm = this,
                        pCode = vm.get("productCode").toString(),
                        addSuccess = false,
                        message = "";
                        
                    //var d = $.cv.ajax.call('userFavourites/AddFavourite', {parameters: { productCode: pCode }});
                    vm.set("isProcessing", true);
                    vm.set("isAddingToFavourites", true);
                    var d = $.cv.css.userFavourites.addFavourite({ productCode: pCode });
                    $.when(d).done(function (msg) {
                        vm.set("isProcessing", false);
                        vm.set("isAddingToFavourites", false);
                        vm.set("triggerMessages", widget.options.triggerFavouritesMessages);
                        vm.set("clearExistingMessages", true);
                        if ($.cv.css.userFavourites.defaults && $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite) {
                            message = msg.data.Messages[0];
                            if (msg.data.Success)
                                addSuccess = true;
                        } else {
                            if (msg.data == 'True') {
                                addSuccess = true;
                                message = widget.options.textProductAddedToFavourites;
                            } else {
                                if (msg.errorMessage != null)
                                    message = msg.errorMessage;
                                else
                                    message = widget.options.textDefaultErrorAddingToFavourites;
                            }
                        }
                        if (addSuccess) {
                            vm.triggerAddedToFavourites(message);
                            vm.set("isFavourite", true);

                            if (widget.options.isUserFavouritesPage) {
                                $(widget.element).removeClass("favourite-removed");
                            }
                        } else
                            vm.triggerAddToFavouritesFail(message);
                        vm.set("triggerMessages", widget.options.triggerMessages);
                        vm.set("clearExistingMessages", widget.options.clearExistingMessages);
                    });
                },

                removeFromFavourites: function () {
                    var vm = this,
                        pCode = vm.get("productCode").toString(),
                        removeSuccess = false,
                        message = "";
                        
                    vm.set("isProcessing", true);
                    vm.set("isAddingToFavourites", true);
                    $.cv.css.userFavourites.removeFavourites({ productCodes: [pCode] }).done(function (msg) {
                        vm.set("isProcessing", false);
                        vm.set("isAddingToFavourites", false);
                        vm.set("triggerMessages", widget.options.triggerFavouritesMessages);
                        vm.set("clearExistingMessages", true);

                        if (msg.data.toString().toLowerCase() === "true") {
                            removeSuccess = true;
                            message = widget.options.textDefaultRemoveFavouriteSuccess;
                            vm.set("isFavourite", false);
                        } else {
                            message = widget.options.textDefaultRemoveFavouriteFail;
                        }

                        if (removeSuccess) {
                            vm.triggerRemoveFavourite(message);
                            vm.set("isFavourite", false);

                            if (widget.options.isUserFavouritesPage) {
                                $(widget.element).addClass("favourite-removed");
                            }
                        } else {
                            vm.triggerRemoveFavouriteFail(message);
                        }
                        vm.set("triggerMessages", widget.options.triggerMessages);
                        vm.set("clearExistingMessages", widget.options.clearExistingMessages);
                    });
                },

                clearErrorMessage: function () {
                    var vm = this;
                    
                    vm.set("message", "");
                    var clearExistingMessages = vm.get("clearExistingMessages");
                    vm.set("clearExistingMessages", true);
                    vm.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message,{
                            message: "",
                            type: '',
                            source: 'product',
                            clearExisting: vm.get("clearExistingMessages")
                        });
                    vm.set("clearExistingMessages", clearExistingMessages);
                },

                showAltPrice: false,

                uomSelected: function (e) {
                    // Show alternate price.
                    this.set("showAltPrice", e.item.index() === 1);
                },

                productDetailsChanged: function (data) {
                    var vm = this;
                    if (vm.get("productCode") === data.ProductCode || ($.cv.util.hasValue(vm.get("masterProductCode")) && vm.get("productCode") === vm.get("masterProductCode"))) {
                        if (data.IsQuantityBreaksLiveOrDefaultSuppressed) {
                            var productData = vm.get("productData");
                            if ($.cv.util.hasValue(productData)) {
                                var qtyBreakData = productData.QuantityBreaksLiveOrDefault;
                                data.QuantityBreaksLiveOrDefault = qtyBreakData;
                            }
                        }
                        vm.set("productData", data);
                    }
                }
            });

            if ($.cv.css.userFavourites.defaults) {
                $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite = true;
            }

            //Check that the viewModel has productData associated with it
            //If not we need to make a call to get some.
            if (!viewModel.get("allowCustomOptions") && !$.cv.util.hasValue(viewModel.productData.ProductCode) && viewModel.isMasterProduct() && !viewModel.get("hidePricing")) {
                viewModel.populateProductData();
            } else {
                viewModel._updateAvailability();
            }

            // set the quantity break information on the viewModel if already retrieved
            // so we don't have to make another service call it again later to retrieve the same information
            // master products are handled differently as the data is in the productData already
            if (!viewModel.isMasterProduct()) {
                viewModel._setQuantityBreakData(widget.options.nettPrice, widget.options.quantityBreaks);
            }

            return viewModel;
        },

        getProductAddParams: function (isBulkAdd) {
            var widget = this;
            isBulkAdd = typeof isBulkAdd !== 'undefined' ? isBulkAdd : true;
            if ((isBulkAdd && widget.viewModel.quantity != '' && widget.viewModel.quantity > 0) || !isBulkAdd) {
                var params = widget.viewModel.getProductAddParams();
                return params;
            } else {
                return null;
            }
        },

        triggerAddedToCart: function (msg) {
            var widget = this;
            widget.viewModel.triggerAddedToCart(msg);
        },

        triggerAddToCartFail: function (msg) {
            var widget = this;
            widget.viewModel.triggerAddToCartFail(msg);
        },

        triggerAddedToFavourites: function (msg) {
            var widget = this;
            widget.viewModel.triggerAddedToFavourites(msg);
        },

        triggerAddToFavouritesFail: function (msg) {
            var widget = this;
            widget.viewModel.triggerAddToFavouritesFail(msg);
        },

        triggerRemoveFavourite: function (msg) {
            var widget = this;
            widget.viewModel.triggerRemoveFavourite(msg);
        },

        triggerRemoveFavouriteFail: function (msg) {
            var widget = this;
            widget.viewModel.triggerRemoveFavourite(msg);
        },

        resetDefaults: function (params) {
            var widget = this;
            widget.viewModel.resetDefaults(params);
        }
    };

    // register the widget
    $.cv.ui.widget(productWidget);
})(jQuery);
