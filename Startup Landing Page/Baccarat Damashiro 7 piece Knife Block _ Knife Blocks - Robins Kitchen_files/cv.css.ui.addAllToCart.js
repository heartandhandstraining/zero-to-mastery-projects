/* Name: current user account
* Author: Aidan Thomas 
* Created: 20130220
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/cv.ajax.js
*          /Scripts/cv.util.js
* Params:  
*       productElement: 
*       productData: 
*/
;
(function ($, undefined) {

    var addAllToCartWidget = {

        //
        // Standard Variables
        //

        // Widget name
        name: "addAllToCart",

        
        // Default widget options
        options: {
			productElement: "[data-role='product']",
			productData: "product",
            // standard view options
            triggerMessages: true,
            // view flags
			sessionTimeOutRedirectUrl: 'login.aspx',
            textNoProductsAdded: "No items have been added to your cart, please enter a quantity",
            categoryCodeCluster: "", // This should be set when using to add all products when viewing a cluster.
            textErrorGettingClusterLines: "Error retrieving Cluster Line details",
            addIsProcessingToElement: ""
        },

        //
        // Private Properties
        //

        // If have a categoryCodeCluster set in options (i.e. viewing products for a cluster) then this will used to store the ClusterLines 
        // datasource and will be fetchedon initialise to that when add to cart click event occurs we can validate the qtys etc of each product 
        // agaisnt each matching ClusterLine's requirements.
        clusterLines: [],

        //
        // Standard Methods
        //
        initialise: function (el, o) {
            var widget = this;

            widget.getClusterLinesIfNeededThenRegisterAddToCartClick(el, o);
        },

        destroy: function () {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended) {
                $.cv.util.destroyKendoWidgets(widget.element);
                widget.element.empty();
            }
        },

        redirectToUrl: function (fallbackUrl, params, includeInBrowserHistory) {
            if ($.cv.ajax.settings.timeoutRedirectUrl == "")
                $.cv.util.redirect(fallbackUrl, params, !includeInBrowserHistory);
            else
                $.cv.util.redirect($.cv.ajax.settings.timeoutRedirectUrl, params, !includeInBrowserHistory);
        },

        setMessage: function (message, type, clearExisting) {
            var widget = this, vm = widget.viewModel;

            clearExisting = typeof clearExisting !== "undefined" ? clearExisting : true;

            // This widget don't ave a vm silly, need to pass through options as first param.
            var msgOpts = {
                triggerMessages: widget.options.triggerMessages,
                message: message,
                type: type,
                source: widget.name,
                clearExisting: clearExisting
            }
            $.cv.util.notify(msgOpts, message, type, msgOpts);
        },

        clearMessage: function () {
            var widget = this;
            if (widget.options.triggerMessages)
                $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'addAllToCart', clearExisting: true });
        },
        
        // If the widget options specifies a categoryCodeCluster i.e. viewing set of products on a cluster, then this will
        // fetch the ClusterLines datasource for that category. It then registers the Add To Cart button click event of this
        // widget so can't hit add to cart until have the clusters back, as they are needed to do validation when adding to cart.
        // If no cluster in use, won't fetch anything so will just register the Add To Cart click event straight away.
        getClusterLinesIfNeededThenRegisterAddToCartClick: function (el, o) {
            var widget = this;

            if (widget.options.categoryCodeCluster && widget.options.categoryCodeCluster.length > 0) {
                var d1 = $.cv.css.category.getClusterLinesForCategory({ categoryCode: widget.options.categoryCodeCluster });
                $.when(d1).done(function(msg) {
                    var data = msg.data;
                    if (!msg.sessionHasTimedOut) {
                        if (!msg.errorMessage || msg.errorMessage.length === 0) {
                            if (data) {
                                widget.clusterLines = data;
                                
                                // Only setup for add to cart handling when using clusterlines, if no issue with fetching data otherwise can't verify details
                                widget.registerAddToAllClick(el, o);
                            }
                        } else {
                            widget.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                        }
                    } else {
                        widget.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, false);
                    }
                }).fail(function() {
                    this.setMessage(widget.options.textErrorGettingClusterLines, $.cv.css.messageTypes.error);
                });
            } else {
                // No clusterlines in use so can just set up add to cart click event now, don't need to wait for data to come back.
                widget.registerAddToAllClick(el, o);
            }
        },
        
        // When ClusterLines is in use i.e. have a Category Code present in options for it, then will be adding all items  with qtys
        // entered in current display which should be all the clusterlines for the category that are products. Some of this can be
        // configured as compulsory and may also have a suggested qty (is used to mean the min amount). So need to check all of them
        // present and correct. Also, need to ensure that all of these products get the compulsory flag set and passed in to AddLine()
        // Those that aren't compulsory and those that are all need the cluster category code set and passed in too. If any issues
        // with compulsory ones then will show errors and at end should return false so caller won't proceed to add to cart.
        validateQtysIfClusterAndSetAdditionalInfo: function (products, productWidgets) {
            var widget = this;

            // If not using a ClusterLine then don't validate anything just return true.
            // Should have already fetched the ClusterLines datasource to use during initialisation of this widget.
            if (widget.options.categoryCodeCluster.length === 0
                || !widget.clusterLines || widget.clusterLines.length === 0) {
                return true;
            }

            widget.clearMessage();
            var clusterErrors = false;
            // Now go through each of the items in our ClusterLines datasouce so can check for compulsory ones and ensure correct qty entered for the product
            $.each(widget.clusterLines, function (idy, clItem) {
                var productFound = false;
                // Now go through each of the products for adding to cart to locate matching one for current ClusterLine
                $.each(products, function (idx, pItem) {
                    if (clItem.ProductCode.toLowerCase() === pItem.productCode.toLowerCase()) {
                        // Always set the cluster's category code onto product item as need to pass this through for all of them to AddLine()
                        pItem.categoryCodeCluster = widget.options.categoryCodeCluster;

                        if (clItem.Compulsory && clItem.QtyIfCompulsory > 0) {
                            if (pItem.quantity < clItem.QtyIfCompulsory) {
                                var errMsg = "Product: " + clItem.ProductCode + " is compulsory and must be ordered in a quantity of at least " + clItem.QtyIfCompulsory.toString() + ".";
                                productWidgets[idx].triggerAddToCartFail(errMsg);
                                clusterErrors = true;
                            } else {
                                // Set the compulsory flag to the product for passing in to AddLine()
                                pItem.compulsoryCluster = true;
                            }
                        }
                        productFound = true; // Don't break out though as possible to have a product more than once in a cluster.
                    }
                });

                // If didn't find the Product for Cluster and it was mandatory then that is bad so need to also show error and prevent adding to cart
                if (!productFound && clItem.Compulsory && clItem.QtyIfCompulsory > 0) {
                    var errMsg = "Product: " + clItem.ProductCode + " is compulsory and must be ordered in a quantity of at least " + clItem.QtyIfCompulsory.toString() + ".";
                    widget.setMessage(errMsg, $.cv.css.messageTypes.error,  false );
                    clusterErrors = true;
                }
            });

            // Return if any errors found so caller don't proceed to add to cart but should just bail out. Errors will already have been triggered above
            return !clusterErrors;
        },

        registerAddToAllClick: function (el, o) {
            var widget = this,
                products = [],
                product = {},
                productWidgets = [],
                errorMessages = "";

            $(widget.element).click(function () {
                var $isProcessingElement = $.cv.util.isNullOrWhitespace(widget.options.addIsProcessingToElement) ? $(el) : $(el).find(widget.options.addIsProcessingToElement);

                $isProcessingElement.addClass($.cv.css.isProcessingClass);
                $(widget.options.productElement).each(function () {
                    var productWidget = $(this).data(widget.options.productData);
                    if (productWidget) {
                        product = productWidget.getProductAddParams();
                        if (product && product.quantity.length != 0 && !isNaN(product.quantity)) {
                            productWidgets.push(productWidget);
                            products.push(product);
                        }
                    }
                });

                if (products.length > 0) {
                    widget.clearMessage();
                    
                    // If adding items for a Cluster then will need to validate compulsory items all have correct qtys.
                    if (widget.clusterLines && widget.clusterLines.length > 0) {
                        var clusterCheckOk = widget.validateQtysIfClusterAndSetAdditionalInfo(products, productWidgets);
                        
                        // No more continuing, need to bailand not add to cart. Error messages will have been shown.
                        if (!clusterCheckOk) {
                            $isProcessingElement.removeClass($.cv.css.isProcessingClass);
                            products = [];
                            product = {};
                            productWidgets = [];
                            return;
                        }
                    }

                    _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                    $.cv.css.orders.addToCurrentOrderBulk({
                        batchData: products
                    }).done(function (response) {
                        //clear product messages before iterating through the products.
                        //NOTE: using a dummy object here so we can clear without an actual product widget.
                        $.cv.util.clearNotifications({ viewModel: kendo.observable({ name: widget.options.productData, triggerMessages: true }) });

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

                            if (errorMessages.length > 0) {
                                widget.setMessage(errorMessages, $.cv.css.messageTypes.error, false);
                            }
                        });
                        $isProcessingElement.removeClass($.cv.css.isProcessingClass);
                        products = [];
                        product = {};
                        productWidgets = [];
                        errorMessages = "";
                    }).fail(function (msg) {
                        var msg = JSON.parse(msg);
                        if (msg.sessionHasTimedOut)
                            widget.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, {}, true);
                        $isProcessingElement.removeClass($.cv.css.isProcessingClass);
                        products = [];
                        product = {};
                        productWidgets = [];
                        errorMessages = "";
                    });
                } else {
                    widget.setMessage(widget.options.textNoProductsAdded, $.cv.css.messageTypes.warning);
                    $isProcessingElement.removeClass($.cv.css.isProcessingClass);
                }
            });
        }
    }

    // register the widget

    $.cv.ui.widget(addAllToCartWidget);

})(jQuery);