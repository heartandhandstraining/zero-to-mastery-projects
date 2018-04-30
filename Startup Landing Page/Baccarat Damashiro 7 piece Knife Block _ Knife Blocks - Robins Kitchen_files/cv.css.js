/// <reference path="../jquery-1.7.2.js" />
/*
 * cv.css.js
 * Author: Chad Paynter
 * Date: 14/09/2012
 * Description: cv.css plugin for calls to CSS dynamic services
 * Dependencies:
 * jquery - In Script folder or http://jquery.com/
 * cv.ajax -  In Script folder cv.ajax.js
 * cv.util - In Script folder cv.util.js
 */
;
(function ($, undefined) {

    $.cv = $.cv || {};

    // $.cv.css object definition
    //
    $.cv.css = $.cv.css || {};

    /* events */
    $.cv.css.events = $.cv.css.events || {};


    // Global Unique Identifier
    (function () {
        var guidValue = 0;

        $.cv.css.guid = function () {
            return guidValue++;
        };
    })();

    /* message types */
    $.cv.css.messageTypes = { error: 'alert-box alert', warning: 'alert-box warning', info: 'alert-box info', success: 'alert-box success' };

    /* global processing class */
    $.cv.css.isProcessingClass = 'cv-is-processing';

    /* global form Auto-Complete class */
    $.cv.css.formAutoCompleteClass = 'form-autocomplete';

    /* global column count class */
    $.cv.css.columnCountClassPrefix = "column-";
    $.cv.css.columnCountElement = ".cv-data-zone-2:first .data-list-column";

    /* global show error only class */
    $.cv.css.isOnlyShowingErrorsClass = 'cv-is-only-showing-errors';

    /* global animation delay */
    $.cv.css.animationDelay = 3000;

    /* global mandatory field empty message, {0} is a place holder the field prompt */
    $.cv.css.mandatoryFieldIncompleteMessage = "The {0} field is required";

    /* global incomplete field message, {0} is a place holder the field prompt */
    $.cv.css.invalidFieldMessage = "{0} is incorrect or incomplete";

    /* global input error class */
    $.cv.css.inputError = "error";

    /* enter pressed binder event */
    $.cv.css.enterPressedEvent = "keyup";

    /* text of the default selection for look-up fields */
    $.cv.css.pleaseSelectText = "Please Select...";

    /* enable or disable automatically adding a default selection, such as "Please Select...", to look-ups */
    $.cv.css.addPleaseSelectToLookup = true;

    /* global column sorting classes */
    $.cv.css.sortColumnContainer = ".cv-sortable-column-container";
    $.cv.css.sortColumn = ".cv-sortable-column";
    $.cv.css.sortColumnAsc = "asc";
    $.cv.css.sortColumnDesc = "desc";

    /* global kendoNumericTextBox classes */
    $.cv.css.kendoNumericTextContainer = '.cv-numeric-input';
    $.cv.css.kendoNumericTextBoxPlus = '.cv-link.form-number-plus';
    $.cv.css.kendoNumericTextBoxMinus = '.cv-link.form-number-minus';

    /* help identify BPD sites */
    $.cv.css.isBpd = false;

    /* event names */
    $.cv.css.eventnames = {
        accountChanged: 'accountChanged',
        userChanged: 'userChanged',
        login: 'login',
        loginLogoutSuccess: 'loginLogoutSuccess',
        logout: 'logout',
        loggingOut: "loggingOut",
        orderChanged: 'orderChanged',
        orderSubmitted: 'orderSubmitted',
        catalogueChanged: 'catalogueChanged',
        message: 'message',
        checkoutMessages: 'checkoutMessages',
        userStocktakeChanged: 'userStocktakeChanged',
        userStocktakeItemRemoved: 'userStocktakeItemRemoved',
        orderLinesOnlyShowErrors: 'orderLinesOnlyShowErrors', // raised from orders.js when only errors clicked to be displayed

        // Click & Collect
        showDeliveryOptionPopup: "showDeliveryOptionPopup",
        deliveryMethodClickAndCollectOnOrderChanged: "deliveryMethodClickAndCollectOnOrderChanged",

        // Account Payment
        showingAccountPaymentSummary: "showingAccountPaymentSummary",
        accountPaymentSurchargeChanged: "accountPaymentSurchargeChanged",
        
        // Approvals
        approvalConfirmed: "approvalConfirmed",
        approvalNotSpecified: "approvalNotSpecified",
        approvalError: "approvalError",
        viewApprovalOrder: "viewApprovalOrder",
        approvalOrderUpdated: "approvalOrderUpdated",
        viewLinesMode: "viewLinesMode",
        viewOrdersMode: "viewOrdersMode",

        // Address
        addressChanged: 'addressChanged',
        addressBeingEdited: 'addressBeingEdited',
        addressValidated: "addressValidated",
        billingAddressChanged: 'billingAddressChanged',
        addressSaved: 'addressSaved',
        addressValidationUpdated: "addressValidationUpdated",

        // Address Lookup
        addressLookupValueEdited: "addressLookupValueEdited",
        addressLookupSelected: "addressLookupSelected",
        validateAddressLookup: "validateAddressLookup",

        cartItemsChanging: 'cartItemsChanging',
        cartItemsChanged: 'cartItemsChanged',
        gettingOrder: "gettingOrder",
        gettingLines: "gettingLines",
        refreshOrderData: 'refreshOrderData',
        preOrderSubmit: 'preOrderSubmit',
        preOrderSubmitComplete: 'preOrderSubmitComplete',
        widgetPreOrderSubmitComplete: 'widgetPreOrderSubmitComplete',
        giftCardsChanged: 'giftCardsChanged',
        giftCardRemoved: 'giftCardRemoved',
        branchChanged: 'branchChanged',
        deliveryAddressModeChanged: "deliveryAddressModeChanged",
        pickupWarehouseChanged: "pickupWarehouseChanged",
        templatedListChanged: "templatedListChanged",
        freightValidated: "freightValidated",
        freightQuoteSelected: "freightQuoteSelected", // raised from freightCarrier.js when opt to submit order as quote to get freight quote.
        freightQuoteInstructsVisisble: "freightQuoteInstructsVisisble", // raised from freightCarrier.js when option to choose a freight quote is made visible.
        metadataSummaryFilterChanged: "metadataSummaryFilterChanged", // raised from metaDataDummary.js when the filter changes and widget is set to not redirect
        priceFilterRedirect: "priceFilterRedirect",
        cartLinesRendered: "cartLinesRendered",
        documentReady: "documentReady",
        promoCodeApplied: "promoCodeApplied",
        promoCodeRemoved: "promoCodeRemoved",
        productExtendedPriceUpdated: "productExtendedPriceUpdated",
        orderCompleteFieldsValidated: "orderCompleteFieldsValidated",

        //Delivery Method Events
        deliveryMethodSetOnOrder: "deliveryMethodSetOnOrder",
        deliveryMethodClearedFromOrder: "deliveryMethodClearedFromOrder",
        deliveryMethodValidated: "deliveryMethodValidated",
        deliveryMethodLoadedCheck: "deliveryMethodLoadedCheck",

        //Freight Carrier Events
        updateFreightStatusChanged: 'updateFreightStatusChanged',

        // local storage events
        localOrderChanged: 'localOrderChanged',
        localdeliveryAddressChanged: "localdeliveryAddressChanged",

        // MyStampsApi
        myStampsApiRefreshImage: "myStampsApiRefreshImage",
        myStampsApiShowEditor: "myStampsApiShowEditor",
        myStampsEditorClosed: "myStampsEditorClosed",

        // COLOP stamps
        colopStampChanged: "colopStampChanged",

        // Stock Availability Notify
        stockAvailabilityNotifyShowPopup: "stockAvailabilityNotifyShowPopup",
        stockAvailabilityNotifyRemove: "stockAvailabilityNotifyRemove",
        removeLineFromCartAfterSelectingNotifyWhenInStock: "removeLineFromCartAfterSelectingNotifyWhenInStock",

        // Alternates
        showAlternatesPopup: "showAlternatesPopup",
        hideAlternatesPopup: "hideAlternatesPopup",
        showAlternatesButton: "showAlternatesButton",

        // Infinite scrolling
        infiniteScrollingInit: "infiniteScrollingInit",
        infiniteScrollingPageLoaded: "infiniteScrollingPageLoaded",


        // Rewards
        //

        // ** Notification only (doesn't execute queries/commands)
        loyaltyRewardsChanged:    'loyaltyRewardsChanged',

        confirmRewardApplication: 'confirmRewardApplication',
        confirmRewardRemoval:     'confirmRewardRemoval',

        loyaltyRewardsConfirmationClosed: 'loyaltyRewardsConfirmationClosed',

        // Order Validation
        validateOrderStarted: 'validateOrderStarted',
        validateOrderComplete: 'validateOrderComplete',

        // Product Price Filter
        priceFilterSliderChange: "priceFilterSliderChange",

        // Product variant selected
        productVariantSelected: "productVariantSelected",

        systemSettingsLoaded: 'systemSettingsLoaded',

        // Questionnaires
        questionnaireLoaded: "questionnaireLoaded",
        questionnaireBeforeSubmit: "questionnaireBeforeSubmit",

        // Payment options
        paymentOptionsRendered: "paymentOptionsRendered",
        selectedPaymentOptionChanged: "selectedPaymentOptionChanged",

        // PayPalExpress
        checkoutWithPayPalExpress: "checkoutWithPayPalExpress",
        proccessingGiftCard: "proccessingGiftCard",

        // Overlay
        showOverlay: "showOverlay",
        overlayClosed: "overLayClosed",

        productDetailsChanged: "productDetailsChanged",

        // Checkout events
        continueToPayment: "continueToPayment",
        backToAddress: "backToAddress",

        recentlyViewedProductsSet: "recentlyViewedProductsSet",
        mostPopularProductsSet: "mostPopularProductsSet",

        //Quick Order Entry Events
        addProductToOrderByEnterKey: "addProductToOrderByEnterKey",

        // Quick View Product Events
        quickViewProductLoaded: "quickViewProductLoaded",

        // Account Select
        changeAccount: "changeAccount",

        // Tax toggle events
        setTaxToggle: "setTaxToggle",

        // Order Templates
        sortByOrderTemplateColumn: "sortByOrderTemplateColumn"
};
    

    /* variable specifiying if a 400 error returned from a service call */
    $.cv.css.received400 = false;

    /* Used to prevent duplicate validation when both order and orderlines are retrieved concurrently */
    $.cv.css.syncValidation = { gettingOrder: false, gettingLines: false };

    /* variable used to turn on or of widget field placeholders */
    $.cv.css.usePlaceHolders = true;

    $.cv.css.nonconfirmedMessageBeingShown = false;

    /* variable used to provide additional information to methods being proxied */
    $.cv.css._proxyMeta = {};

    // stored for the templates used in $.cv.css.renderFieldTemplate
    $.cv.css.fieldTemplates = {
        fieldTemplate: null,
        fallback: "<span hidden=\"hidden\"></span>"
    };
    // set the fieldTemplate in $.cv.css.fieldTemplates
    $.cv.css.setFieldTemplate = function (element) {
        if (!$.cv.util.hasValue(element) || $(element).length === 0)
            return;
        var html = $(element).html();
        if (html.length > 0) {
            $.cv.css.fieldTemplates.fieldTemplate = kendo.template(html, { useWithBlock: false }); /* The useWithBlock: false improves the performance of the kendo templating engine */
        }
    };
    // Used to render individual fields from datasource or list
    $.cv.css.renderFieldTemplate = function(data, field, opts) {
        var defaults = { showPrompt: true, alignRight: false, addSpanClass: true, readOnly: false };
        if (typeof opts == "object") {
            _.extend(defaults, opts);
        }
        _.each(_.pairs(defaults), function (item) { data[item[0]] = item[1] });
        if (!data.fieldItem || ($.cv.util.hasValue(field) && data.fieldItem.fieldName !== field) || $.cv.css.fieldTemplates.fieldTemplate == null) {
            return $.cv.css.fieldTemplates.fallback;
        }
        return $.cv.css.fieldTemplates.fieldTemplate(data);
    };

    //widgets with validation errors or have not yet passed all validation requirements
    $.cv.css.pageValidationErrors = {};

    //local storage data currently being loaded, stops multiple calls to the same service
    $.cv.css.preOrderSubmitPromiseObjects = {};

    $.cv.css.dataLoadingPromiseObjects = {};

    $.cv.css.addRemovePageValidationError = function (valid, widget) {
        if (!valid && !_.contains(_.keys($.cv.css.pageValidationErrors), widget)) {
            $.cv.css.pageValidationErrors[widget] = widget;
        }
        else if (valid && _.contains(_.keys($.cv.css.pageValidationErrors), widget)) {
            $.cv.css.pageValidationErrors = _.omit($.cv.css.pageValidationErrors, widget);
        }
    };

    $.cv.css.addRemoveSubmitPromiseObjects = function (add, widget, deferred) {
        if (add) {
            $.cv.css.preOrderSubmitPromiseObjects[widget] = deferred;
        }
        else {
            $.cv.css.preOrderSubmitPromiseObjects = _.omit($.cv.css.preOrderSubmitPromiseObjects, widget);
        }
    };

    $.cv.css.loadingPromiseObjectExists = function (key) {
        return (_.contains(_.keys($.cv.css.dataLoadingPromiseObjects), key));
    };
    $.cv.css.addRemoveLoadingPromiseObjects = function (add, key, deferred) {
        if (add) {
            $.cv.css.dataLoadingPromiseObjects[key] = deferred;
        }
        else {
            $.cv.css.dataLoadingPromiseObjects = _.omit($.cv.css.dataLoadingPromiseObjects, key);
        }
    };

    $.cv.css.bind = function (eventCode, handler, insertBefore) {
        if (window.DEBUG === true) {
            console.info("EVENT BOUND: " + eventCode);
        }

        // Don't bind anything where the eventCode is not a valid string or the handler isn't defined
        if (handler == null || eventCode == null || eventCode === '' || $.trim(eventCode) === '') {
            return;
        }

        var eventCodes = [];

        if ($.type(eventCode) === 'array') {
            eventCodes = eventCode;
        } else {
            eventCodes.push(eventCode);
        }

        for (var ec in eventCodes) {
            (function () {
                var code = eventCodes[ec];
                var handlerArray = $.cv.css.events[code];
                insertBefore = typeof insertBefore !== 'undefined' ? insertBefore : false;
                if (!handlerArray) {
                    handlerArray = $.cv.css.events[code] = [];
                }
                if (!insertBefore)
                    handlerArray.push(handler);
                else {
                    handlerArray.unshift(handler);
                }
            })();
        }
    };
    
    $.cv.css.unbind = function (eventcode, handler) {
        if (window.DEBUG === true) {
            console.info("EVENT UNBOUND: " + eventcode);
        }

        var handlerArray = $.cv.css.events[eventcode];

        if (handlerArray == null)
            return;

        handlerArray = _.without(handlerArray, handler);

        $.cv.css.events[eventcode] = handlerArray;
    };

    $.cv.css.bindOnce = function (eventCode, handler, insertBefore) {
        var internalHandler = function () {
            $.cv.css.unbind(eventCode, internalHandler);

            handler && handler.apply(this);
        };

        $.cv.css.bind(eventCode, internalHandler, insertBefore);
    }

    $.cv.css.trigger = function (eventCode, params) {
        if (window.DEBUG === true) {
            console.info("EVENT TRIGGERED: " + eventCode);
        }

        var eventArgs = {
            cancel: false,
            stopHandlerExecution: false,
            event: eventCode,
            params: params
        };

        var cancelled = false,
            handlers = $.cv.css.events[eventCode],
            results = [],
            allDonePromise = $.Deferred();

        // Don't bind anything where the eventCode is not a valid string
        if (eventCode == null || eventCode === '' || $.trim(eventCode) === '') {
            handlers = false; // go into below if... no handlers! 
        }

        if (!handlers) {
            var noHandlerResponseData = {
                event: eventCode,
                params: params || null,
                cancelled: false,
                handlerCount: 0,
                results: []
            };

            allDonePromise.resolve(noHandlerResponseData);

            return $.extend(allDonePromise.promise(), noHandlerResponseData);
        }

        $.each(handlers, function (index, item) {
            // Results into returned object's results argument as array
            // so that caller can $.when() results if they are expected to be promises for example.
            // Anything that is not a Deferred will be considered auto-resolved!
            results.push(item(params, eventArgs));

            if (eventArgs.cancel === true) {
                cancelled = true;
            }

            if (eventArgs.stopHandlerExecution === true) {
                return false;
            }

            return true;
        });

        // Resolves when all results are resolved. handlers that return
        // promises will resolve when done, any other object will resolve instantly...
        // when they are all done this allDonePromise will resolve.
        allDonePromise = $.when.apply($, results);

        // Response 
        var response = $.Deferred();

        var responseData = {
            event: eventCode,
            params: params || null,
            cancelled: cancelled,
            handlerCount: handlers ? handlers.length : 0,
            results: results
        };

        allDonePromise.done(function () {
            response.resolve(responseData);
        });

        return $.extend(response.promise(), responseData);
    };


    // Document Ready Abstraction
    //

    var docReadyDeferred = $.Deferred(),
        documentReadyEventAlreadyFired = false;

    // Document Ready Abstraction
    // Abstracts jquery.ready providing ability to do async execution of the callback
    // (i.e. order is not depended on by subsequence document ready callbacks.
    // and also triggers out documentReady event
    // WARNING: this triggering of documentReady event has been disabled and will be returned to later due to conflict with BPD
    // 
    // Overloads:
    //   $.cv.documentReady(callback);
    //     callback:  FUNCTION - REQUIRED 
    //                Callback that will be executed
    //
    //   $.cv.documentReady(doAsync, callback);
    //      doAsync:  BOOOLEAN - REQUIRED
    //                True if you want to do the function call async to prevent lockup, otherwise false.
    //                This is done by executing in a setTimeout to push the function execution
    //                to the end of the async execution pool.
    //                WARNING: Only set to true if you don't care about ordering of execution
    //      callback: FUNCTION - REQUIRED
    //                Callback that will be executed
    $.cv.documentReady = function (arg1, arg2) {
        var async;
        var func;

        if ($.type(arg1) === 'function') {
            func = arg1;
        } else {
            // Assume arg1 is a boolean and arg2 is a function
            async = arg1 === true || arg1 === false ? arg1 : false;
            func = arg2;
        }

        if (docReadyDeferred.state() === "resolved") {
            if (async) {
                setTimeout(func, $.cv.documentReady.timeBeforeCall);
            } else {
                func();
            }

            return;
        }

        docReadyDeferred.done(function () {
            if (async) {
                setTimeout(func, $.cv.documentReady.timeBeforeCall);
            } else {
                func();
            }
        });
    };

    // Available if you need to check the status of the deferred etc.
    $.cv.documentReady.promise = docReadyDeferred.promise();
    $.cv.documentReady.timeBeforeCall = 20; // milliseconds... This might need some optimising.

    $.cv.css.bind($.cv.css.eventnames.documentReady, function () {
        documentReadyEventAlreadyFired = true;
    });

    // This is the ONLY place we should need to call jQuery.ready() and 
    // we can just use $.cv.documentReady() which will trigger the
    // callback immediately if document ready has occured or 
    // call the callback when document ready occurs. It also 
    // triggers the documentReady event if it has not already
    // been triggered.
    $(function () {
        docReadyDeferred.resolve();

        // Make sure this is only triggered once, just in case some
        // other system has triggered this before we got to triggering it.
        if (documentReadyEventAlreadyFired === false) {
            // TODO: we will in a future call trigger this once we have refactored usage in BPD a little
            //$.cv.css.trigger($.cv.css.eventnames.documentReady);
        }
    });


    /* events end */

    /* settings */

    $.cv.css.settings = $.cv.css.settings || {};

    /* settings end */

    /* statics */

    // Rendermodes as used by localget/setRenderMode
    $.cv.css.renderModes = { Tablet: 'Tablet', Phone: 'Phone' };

    /* statics END */

    /* public methods */

    $.cv.css.getSystemSettings = function (options) {
        // wire up loading for 'livesearch' and pagesize
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('setting/live', {
            parameters: {},
            success: function (msg) {
                var data = msg.data;
                if (data.length == 1) {

                    // set data to localsettings
                    $.cv.css.settings = data[0];
                    $.cv.css.localSetSettings(data[0]);

                    $.cv.css.trigger($.cv.css.eventnames.systemSettingsLoaded);
                }
                if (opts.success)
                    opts.success(data);
            }
        });
    };

    /* Crud operations */

    // send the service name and data to update (requires at least _objectKey and a property) to update
    $.cv.css.updateObject = function (options) {
        return $.cv.css.modifyObject(options, '-update');
    };

    // send the service name and data of object to delete (requires at least _objectKey)
    $.cv.css.deleteObject = function (options) {
        return $.cv.css.modifyObject(options, '-delete');
    };

    $.cv.css.modifyObject = function (options, operation) {
        var opts = $.extend({
            serviceName: '',
            success: function (msg) { },
            data: null
        }, options);
        return $.cv.ajax.call(opts.serviceName + operation, {
            parameters: opts.data,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };


    /* END Crud operations */

    /* Authentication */

    $.cv.css.login = function (username, password, options) {
        var opts = $.extend({
            accessThroughWeb: true,
            loadOrdersAfterLogin: false,
            keepMeLoggedIn: false,
            triggerEvents: true,
            gtmSuccessEventName: '',
            success: function () { }
        }, options);
        opts.isLogin = true;
        opts.loadCurrentUser = true;
        return $.cv.ajax.call('user/login', {
            parameters: {
                username: username,
                password: password,
                accessThroughWeb: opts.accessThroughWeb,
                keepMeLoggedIn: opts.keepMeLoggedIn
            },
            success: function (msg) {
                var data = msg.data;
                // 0 or 15/16(force password change) allows a successful load of order details
                if (data.result == 0 || data.result == 15 || data.result == 16) {
                    if (opts.triggerEvents === true) {
                        $.cv.css.trigger($.cv.css.eventnames.loginLogoutSuccess, { data: data, opts: opts });
                    }

                    // Google Tag Manager Event
                    if (opts.gtmSuccessEventName) {
                        $.cv.css.gtm.push(opts.gtmSuccessEventName);
                    }
                } else {
                    // login didn't go through
                    if (opts.success) {
                        opts.success(data);
                    }
                }
            }
        });
    };

    $.cv.css.logout = function (options) {
        var opts = $.extend({
            loadOrdersAfterLogout: false,
            logoutRedirectUrl: "/",
            ociLogoutRedirectUrl: "/OCIOrderSubmit.aspx",
            ociLogoutParameters: { logout: true },
            triggerEvents: true,
            skipLoadUser: false,
            gtmSuccessEventName: '',
            success: function () { }
        }, options);

        opts.loadOrdersAfterLogin = opts.loadOrdersAfterLogout;
        opts.isLogin = false;
        opts.loadCurrentUser = false;

        var resultProm = $.Deferred();
        var userRetrieved = $.Deferred();

        if (opts.triggerEvents === true) {
            $.cv.css.trigger($.cv.css.eventnames.loggingOut);
        }

        if (opts.skipLoadUser === true) {
            // Use what is in local storage as it should be set 
            // proper
            userRetrieved.resolve();
        } else {
            userRetrieved = $.cv.css.getCurrentUser({ triggerEvents: opts.triggerEvents });
        }

        userRetrieved.always(function (x) {
            var user = $.cv.css.localGetUser();

            if (user && user.IsOCISession) {
                $.cv.css.logoutOCI({
                    logoutRedirectUrl: opts.ociLogoutRedirectUrl,
                    logoutParameters: opts.ociLogoutParameters
                });
            } else {
                $.cv.ajax.call('user/logout', {
                    success: function(msg) {
                        var data = msg.data;
                        // Raise logout event
                        if (opts.triggerEvents === true) {
                            $.cv.css.trigger($.cv.css.eventnames.logout, data);
                            $.cv.css.trigger($.cv.css.eventnames.loginLogoutSuccess, { data: data, opts: opts });
                        }

                        // Google Tag Manager Event
                        if (opts.gtmSuccessEventName) {
                            $.cv.css.gtm.push(opts.gtmSuccessEventName);
                        }

                        if (opts.success) {
                            opts.success(data);
                        }
                    }
                }).done(function(response) {
                    resultProm.resolve(response);
                }).fail(function() {
                    resultProm.reject.apply(resultProm, Array.prototype.slice.call(arguments, 0));
                });
            }
        });

        return resultProm;
    };

    $.cv.css.logoutOCI = function (options) {
        var opts = $.extend({
            logoutRedirectUrl: "/OCIOrderSubmit.aspx",
            logoutParameters: { logout: true },
            success: function () { }
        }, options);
        $.cv.css.clearLocalStorage();
        $.cv.util.redirect(opts.logoutRedirectUrl, opts.logoutParameters, false);
    };

    /* Authentication END */

    /* User */

    // DEPRECIATED use $.cv.css.user.changeUserPassword instead
    $.cv.css.changeUserPassword = function (options) {
        if ($.cv.css.user && $.cv.css.user.changeUserPassword)
            return $.cv.css.user.changeUserPassword(options);
        else
            throw new Error("The cv.css.user.js file is required");
    };

    // DEPRECIATED use $.cv.css.user.retrieveUserPassword instead
    $.cv.css.retrieveUserPassword = function (options) {
        if ($.cv.css.user && $.cv.css.user.retrieveUserPassword)
            return $.cv.css.user.retrieveUserPassword(options);
        else
            throw new Error("The cv.css.user.js file is required");
    };

    // DEPRECIATED use $.cv.css.user.getCurrentUser instead
    $.cv.css.getCurrentUser = function (options) {
        if ($.cv.css.user && $.cv.css.user.getCurrentUser)
            return $.cv.css.user.getCurrentUser(options);
        else
            throw new Error("The cv.css.user.js file is required");
    };

    // DEPRECIATED use $.cv.css.user.setCurrentUser instead
    $.cv.css.setCurrentUser = function (options) {
        if ($.cv.css.user && $.cv.css.user.setCurrentUser)
            return $.cv.css.user.setCurrentUser(options);
        else
            throw new Error("The cv.css.user.js file is required");
    };


    /* User END */

    /* Account */

    $.cv.css.getCurrentAccount = function (options) {
        var opts = $.extend({
            triggerChange: true,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('customer/getcurrent', {
            parameters: {},
            success: function (msg) {
                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                    // set local 
                    $.cv.css.localSetCurrentAccount(msg.data[0]);

                    // trigger changed as it may have changed
                    if (opts.triggerChange) {
                        $.cv.css.trigger($.cv.css.eventnames.accountChanged);
                    }

                    // raise success
                    if (opts.success) {
                        opts.success(msg);
                    }
                }
            }
        });
    };

    $.cv.css.setCurrentAccount = function (options) {
        var prom = $.Deferred(),
            opts;

        if ($.type(options) !== 'object') {
            (function () {
                var account = options;

                options = {
                    account: account
                };
            })();
        }

        opts = $.extend({
            account: '',
            triggerChange: true,
            success: function (msg) { }
        }, options);

        var acctSetProm = $.cv.ajax.call('customer/accountset', {
            parameters: {
                accountCode: opts.account
            }
        });

        acctSetProm.done(function (response) {
            if (!response.errorMessage || response.errorMessage.length == 0) {
                $.cv.css.getCurrentAccount({ triggerChange: opts.triggerChange })
                 .always(function () {
                     prom.resolve();
                 });
            } else {
                prom.resolve();
            }
        }).fail(function () {
            prom.resolve();
        });

        return prom.promise();
    };

    $.cv.css.accountSearch = function (options) {
        var opts = $.extend({
            searchString: '',
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('customer/accountsearch', {
            parameters: { searchString: opts.searchString, skip: opts.skip, take: opts.take, sort: "Code" },
            success: opts.success
        });
    };

    $.cv.css.billtosearch = function (options) {
        var opts = $.extend({
            searchString: '',
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('customer/billtosearch', {
            parameters: { searchString: opts.searchString, skip: opts.skip, take: opts.take, sort: "Code" },
            success: opts.success
        });
    };

    $.cv.css.getstatementperiods = function (options) {
        var opts = $.extend({
            accountCode: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('customer/getstatementperiods', {
            parameters: { accountCode: opts.accountCode },
            success: opts.success
        });
    };

    /* Account END */


    /* Category */

    // DEPRECIATED - use cv.css.category.js
    $.cv.css.categorySearch = function (options) {
        if ($.cv.css.category && $.cv.css.category.categorySearch)
            return $.cv.css.category.categorySearch(options);
    };

    // DEPRECIATED - use cv.css.category.js
    $.cv.css.categoryProducts = function (options) {
        if ($.cv.css.category && $.cv.css.category.categoryProducts)
            return $.cv.css.category.categoryProducts(options);
    };

    /* Category END */


    /* Order */

    $.cv.css.orderSearch = function (options) {
        var opts = $.extend({
            liveSearch: false,
            startorderdate: '',
            endorderdate: '',
            onlySearchCurrentUser: true,
            forwardOrderSearch: false,
            completedOrders: false,
            status: '',
            reference: '',
            productsearch: '',
            serialnum: '',
            invnum: '',
            startDeliveryDate: null,
            endDeliveryDate: null,
            forceCurrentCustomer: false,
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/search', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.canRepOverrideDiscount = function (discount, discountoverridethreshold, discountvalue, originalprice, pricevalue, priceoverridethreshold) {
        var canOverride = true;
        //check discountoverride by adding discount + discountoverridethreshold and ensure value entered is less than or equal to discountvalue
        if (discountvalue !== null && discountvalue !== 0) {
            if (discount !== null && discountvalue !== 0) {
                if (discountvalue > (discount + discountoverridethreshold))
                    canOverride = false;
            }
        }
        if (pricevalue !== null && pricevalue !== originalprice) {
            //check priceoverride by calculating pricevalue as percentage of originalprice if percentage is less than or equal to priceoverridethreshold
            var pricePercent = 1 - (pricevalue / originalprice);
            if (pricevalue > -1 && priceoverridethreshold != undefined && (priceoverridethreshold === 0 || pricePercent > (priceoverridethreshold / 100)))
                canOverride = false;
        }

        return canOverride;
    };

    $.cv.css.updateCurrentOrderLine = function (options) {
        var prom = $.Deferred();
        var opts = $.extend({}, $.cv.css.updateCurrentOrderLine.optionDefaults, options);

        var updateProm = $.cv.ajax.call('orders/updatecurrentorderline', {
            parameters: opts,
            success: function (msg) { }
        });

        updateProm.done(function (msg) {
            var result = [];
            var lines = [];
            var resMsg = "";
            if (msg.data) {
                var data = msg.data;
                resMsg = data.message;

                if (resMsg === "") {
                    result.push("true");
                } else {
                    result.push("false");
                }
                if (data.result.length > 0) {
                    lines.push(data.result[0]);
                }
            }
            $.cv.css.localUpdateCurrentOrderLines(lines);
            prom.resolve({ data: result, message: resMsg });
            // get order again
            var p1 = $.cv.css.getCurrentOrder();
            p1.always(function () {
                // raise success once details reloaded
                if (opts.success)
                    opts.success(msg);
                $.cv.css.trigger($.cv.css.eventnames.orderChanged);
            });
        }).fail(function () {
            prom.resolve();
        });
        return prom.promise();
    };

    $.cv.css.updateCurrentOrderLine.optionDefaults = {
        sequence: null,
        quantity: null,
        price: "-1.0", // price override
        discount: "-1.0", // disc override
        deliveryDate: null,
        note: "",
        costCentreCode: "",
        nonContractReason: "",
        success: $.noop
    };

    /**
     * Adds a product to the users current order. Throttles calls so that 
     * multiple calls within a short period of time (opts.refreshOrderTimeout)
     * will be sent as a batch to orders/addlinetocurrent via call to 
     * $.cv.css.orders.addToCurrentOrderBulk()
     *
     * Returns: A jQuery Primise. The resolved object structure is:
     * {
     *    data: {
     *        editOrderOk: true, // N.B. Lowercase "k" in ok
     *        message: '',
     *        newLineSeq: 6,
     *        result : [
     *           // Pronto Sales Order Line fields here. One record only
     *           // contains the line after it was added
     *        ]
     *    }
     * }
     *
     * N.B. you should check the "editOrderOk" variable to determine whether
     * the line was added successfully
    **/
    $.cv.css.addToCurrentOrder = function (options) {
        var selCampaign = $.cv.css.localGetSelectedCampaign();

        // CampaignCode default
        $.cv.css.addToCurrentOrder.optionDefaults.campaignCode = (selCampaign ? selCampaign : '');

        var opts = $.extend({}, $.cv.css.addToCurrentOrder.optionDefaults, options);

        $.cv.css.temp = $.cv.css.temp || {};

        // Set up batch collection
        if ($.cv.css.temp.batchAddToCartData == null)
            $.cv.css.temp.batchAddToCartData = [];
        if ($.cv.css.temp.batchAddToCartDeferred == null)
            $.cv.css.temp.batchAddToCartDeferred = [];

        // Trigger event to indicate items changing
        $.cv.css.trigger($.cv.css.eventnames.cartItemsChanging);

        var productParams = {
            productCode: opts.productCode,
            quantity: opts.quantity,
            campaignCode: opts.campaignCode,
            price: opts.price,
            discount: opts.discount,
            notes: opts.notes,
            noteIsExtendedLineDescription: opts.noteIsExtendedLineDescription,
            attributes: opts.attributes,
            costCentre: opts.costCentre,
            stampData: opts.stampData,
            stampProofData: opts.stampProofData,
            uom: opts.uom
        };

        $.cv.css.temp.batchAddToCartData.push(productParams);

        var done = $.Deferred();

        // Clear the timeout if another call has come in
        if ($.cv.css.temp.tOut != null) {
            clearTimeout($.cv.css.temp.tOut);
        }

        // Waiting X seconds for another request to add a line if none come through, update the order
        $.cv.css.temp.tOut = setTimeout(function () {
            // Grab snapshot of data and deferreds
            var deferredSet = $.cv.css.temp.batchAddToCartDeferred;
            $.cv.css.temp.batchAddToCartDeferred = [];
            var batchSet = $.cv.css.temp.batchAddToCartData;
            $.cv.css.temp.batchAddToCartData = [];

            // Execute batch of add lines...
            $.cv.css.orders.addToCurrentOrderBulk({
                batchData: batchSet,
                triggerGetLines: opts.triggerGetLines,
                gtmPageType: opts.gtmPageType
            }).done(function(msg) {
                $.cv.css.trigger($.cv.css.eventnames.cartItemsChanged);

                // Trigger success function and deferred object resolve for all batched calls...
                for (var i = 0; i < msg.data.length; i++) {
                    (function() {
                        var batchItemResponse = { data: msg.data[i], errorMessage: msg.errorMessage[i] };

                        // Call: Success()
                        if (deferredSet[i]._addToCurrentOrderOptions &&
                            deferredSet[i]._addToCurrentOrderOptions.success) {
                            deferredSet[i]._addToCurrentOrderOptions.success(batchItemResponse);
                        }

                        // Resolve Deferred.
                        deferredSet[i].resolve(batchItemResponse);
                    })();
                }

                // Call batchSuccess on completion of the batch
                // Note: you have to pass the handler trough to the LAST call in the batc
                // but just adding it to all of them should not be an issue. It will only be
                // called once!
                if (opts.batchSuccess) {
                    opts.batchSuccess(msg, batchSet);
                }
            });
        }, opts.refreshOrderTimeout);

        // Attach options to deferred object so that we can call success function if present
        done._addToCurrentOrderOptions = opts;

        $.cv.css.temp.batchAddToCartDeferred.push(done);

        return done.promise();
    };

    $.cv.css.addToCurrentOrder.optionDefaults = {
        productCode: '',
        quantity: 1,
        price: -1, // price override
        discount: -1, // disc override
        campaignCode: '', // set on first call.
        notes: '',
        costCentre: '',
        noteIsExtendedLineDescription: false,
        attributes: null,
        stampData: null,
        stampProofData: null,
        refreshOrderTimeout: 1, // timeout before the whole order is reloaded
        triggerGetLines: false,
        uom: "",
        categoryCodeCluster: "",
        success: function (response) { },
        batchSuccess: function (response) { }
    };

    $.cv.css.getCurrentOrder = function (options) {
        var opts = $.extend({
            success: $.noop,
            refreshCurrentOrder: false
        }, options);

        if (!$.cv.css.received400) {
            $.cv.css.syncValidation.gettingOrder = true;
            $.cv.css.trigger($.cv.css.eventnames.gettingOrder, true);
            return $.cv.ajax.call('orders/current', {
                parameters: opts, // << variable undeclared args here, don't change.
                success: function (msg) {
                    $.cv.css.syncValidation.gettingOrder = false;
                    $.cv.css.trigger($.cv.css.eventnames.gettingOrder, false);
                    // WARNING: Rep's might not have an order
                    if ($.cv.util.hasValue(msg.data)) {
                        $.cv.css.localSetCurrentOrder(msg.data[0]);
                    }

                    if (opts.success) {
                        opts.success(msg);
                    }
                }
            });
        } else {
            var d = $.Deferred();
            $.cv.css.localSetCurrentOrder([]);
            d.resolve();
            return d.promise();
        }
    };

    // DEPRECIATED - use $.cv.css.orders.updateCurrentOrder
    $.cv.css.updateCurrentOrder = function (options) {
        // Extract non-data options.
        var triggerOrderChangedEvent = true,
            triggerOrderReload = true;

        // If a value was sent through for these two options we need
        // to cache them in the variables above and delete them so that they
        // are not send to the service 
        if ($.cv.util.hasValue(options.triggerOrderChangedEvent)) {
            triggerOrderChangedEvent = options.triggerOrderChangedEvent;
            delete options.triggerOrderChangedEvent;
        }

        if ($.cv.util.hasValue(options.triggerOrderReload)) {
            triggerOrderReload = options.triggerOrderReload;
            delete options.triggerOrderReload;
        }

        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/current-update', {
            parameters: opts,

            success: function (msg) {
                if (triggerOrderReload === true) {
                    // Reload
                    $.cv.css.getCurrentOrder().done(function () {
                        if (opts.success) {
                            opts.success(msg);
                        }

                        // Notify
                        if (triggerOrderChangedEvent === true) {
                            $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                        }
                    });
                } else {
                    // Don't Reload
                    if (opts.success) {
                        opts.success(msg);
                    }

                    // Notify
                    if (triggerOrderChangedEvent === true) {
                        $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                    }
                }
            }
        });
    };

    $.cv.css.getOrder = function (options) {
        var opts = $.extend({
            orderNo: "",
            invoiceNo: "",
            checkCustomerCode: true,
            checkAdditionalCustomerCodes: false,
            isFromOrderSearch: true, // See Comment on underlying method for more information
            liveOrder: $.cv.css.settings.EnableLiveOrderEnquiryOffline !== undefined ? $.cv.css.settings.EnableLiveOrderEnquiryOffline : false,
            isLocalSetSelectedOrder: false,
            success: $.noop
        }, options);
        $.cv.css.syncValidation.gettingOrder = true;
        $.cv.css.trigger($.cv.css.eventnames.gettingOrder, true);
        return $.cv.ajax.call((opts.liveOrder ? 'orders/getorderlive' : 'orders/getorder'), {
            parameters: {
                orderNo: opts.orderNo.toString(),
                invoiceNo: opts.invoiceNo.toString(),
                checkCustomerCode: opts.checkCustomerCode,
                checkAdditionalCustomerCodes: opts.checkAdditionalCustomerCodes,
                isFromOrderSearch: opts.isFromOrderSearch
            },
            success: function (msg) {
                $.cv.css.syncValidation.gettingOrder = false;
                $.cv.css.trigger($.cv.css.eventnames.gettingOrder, false);
                // set data in local storage for the order lines.
                if (opts.isLocalSetSelectedOrder && $.cv.util.hasValue(msg.data)) {
                    $.cv.css.localSetSelectedOrder(msg.data[0]);
                }

                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.getOrderLines = function (options) {
        var opts = $.extend({
            orderNo: '',
            suffix: '',
            isFromOrderSearch: true, // See Comment on underlying method for more information
            liveOrder: $.cv.css.settings.EnableLiveOrderEnquiryOffline !== undefined ? $.cv.css.settings.EnableLiveOrderEnquiryOffline : false,
            isLocalSetSelectedOrderLines: false,
            success: function (msg) { }
        }, options);

        // local orderline/getlines needs the suffix appended to the order number
        opts.orderNo = opts.liveOrder ? opts.orderNo : opts.orderNo.toString() + opts.suffix;
        opts.suffix = opts.liveOrder ? opts.suffix : "";

        $.cv.css.syncValidation.gettingLines = true;
        $.cv.css.trigger($.cv.css.eventnames.gettingLines, true);

        return $.cv.ajax.call((opts.liveOrder ? 'orderline/getlineslive' : 'orderline/getlines'), {
            parameters: {
                orderNo: opts.orderNo.toString(),
                suffix: opts.suffix,
                isFromOrderSearch: opts.isFromOrderSearch
            },
            success: function (msg) {
                $.cv.css.syncValidation.gettingLines = false;
                $.cv.css.trigger($.cv.css.eventnames.gettingLines, false);
                // set data in local storage for the order lines.
                if (opts.isLocalSetSelectedOrderLines) {
                    $.cv.css.localSetSelectedOrderLines(msg.data);
                }
                if (opts.success)
                    opts.success(msg);
            }
        });
    };
    
    $.cv.css.getSalesOrderApprovals = function (options) {
        var opts = $.extend({
            orderNo: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('salesOrderApproval/GetSalesOrderApprovals', {
            parameters: {
                orderNo: opts.orderNo.toString()
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.getSalesOrderApprovalLogs = function (options) {
        var opts = $.extend({
            orderNo: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('salesOrderApproval/GetSalesOrderApprovalLogs', {
            parameters: {
                orderNo: opts.orderNo.toString()
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.setOrderTerm = function (options) {
        var opts = $.extend({
            orderterm: '',
            _objectKey: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/setorderterm', {
            parameters: { _objectKey: opts._objectKey, orderterm: opts.orderterm },
            success: function (msg) {
                // reload local order
                $.cv.css.getCurrentOrder();
                $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                if (opts.success)
                    opts.success(msg);

            }
        });
    };

    $.cv.css.submitOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/submit', {
            parameters: { _objectKey: opts._objectKey },
            success: function (msg) {
                // Trigger order submitted, reload local order
                $.cv.css.trigger($.cv.css.eventnames.orderSubmitted);

                $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines()).then(function () {
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });

                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css._currentOrderLinesResponseCleanupConverter = function (response) {
        var result = jQuery.parseJSON(response);
        var data = result.data;

        if (data.length > 0) {
            // the line SolLIneDescription field is returned in Description
            // in all cases but it can be truncated so we will grab it off the
            // product record and assign it over the top to avoid the truncation.
            _.each(data, function (line) {
                if (line.Description &&
                    line.Product &&
                    line.Product[0] &&
                    line.Product[0].Description) {
                    line.Description = line.Product[0].Description;
                }
            });
        }

        return result;
    };

    $.cv.css.getCurrentOrderLines = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        if (!$.cv.css.received400) {
            $.cv.css.syncValidation.gettingLines = true;
            $.cv.css.trigger($.cv.css.eventnames.gettingLines, true);
            return $.cv.ajax.call('orderline/currentorderlines', {
                parameters: {},
                success: function (msg) {
                    $.cv.css.syncValidation.gettingLines = false;
                    $.cv.css.trigger($.cv.css.eventnames.gettingLines, false);
                    // set data in currenot order
                    $.cv.css.localSetCurrentOrderLines(msg.data);
                    if (opts.success)
                        opts.success(msg);
                },
                converters: {
                    "text json": $.cv.css._currentOrderLinesResponseCleanupConverter
                }
            });
        } else {
            var d = $.Deferred();
            $.cv.css.localSetCurrentOrderLines([]);
            d.resolve();
            return d.promise();
        }
    };

    $.cv.css.deleteCurrentOrderLine = function (options) {
        var opts = $.extend({
            seq: null,
            triggerOrderRefresh: true,
            gtmPageType: '',
            description: '',
            productCode: '',
            price: '',
            category: '',
            quantity: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/deletecurrentorderline', {
            parameters: { seq: opts.seq },
            success: function (msg) {
                if (opts.triggerOrderRefresh === true) {
                    // reload order as totals would change
                    var p1 = $.cv.css.getCurrentOrder();
                    var p2 = $.cv.css.getCurrentOrderLines();
                    $.when(p1, p2).always(function () {
                        // raise success once details reloaded
                        if (opts.success)
                            opts.success(msg);
                        $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                    });
                }
            }
        });
    };

    /* Order END */

    /* Product */

    // DEPRECIATED - use cv.css.product.js
    $.cv.css.attributeproduct = function (options) {
        if ($.cv.css.product && $.cv.css.product.attributeproduct)
            return $.cv.css.product.attributeproduct(options);
    };

    // DEPRECIATED - use cv.css.product.js
    $.cv.css.productSearch = function (options) {
        if ($.cv.css.product && $.cv.css.product.productSearch)
            return $.cv.css.product.productSearch(options);
    };

    // DEPRECIATED - use cv.css.product.js
    $.cv.css.productSearchFastAdd = function (options) {
        if ($.cv.css.product && $.cv.css.product.productSearchFastAdd)
            return $.cv.css.product.productSearchFastAdd(options);
    };

    // DEPRECIATED - use cv.css.product.js
    $.cv.css.getProductDetail = function (options) {
        if ($.cv.css.product && $.cv.css.product.getProductDetail)
            return $.cv.css.product.getProductDetail(options);
    };

    /* Product END */

    /* User */

    $.cv.css.getOrderTerms = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('user/orderterms', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    }; // DEPRECIATED use $.cv.css.deliveryAddress.getDeliveryAddressesForCurrentUser instead
    $.cv.css.getDeliveryAddresses = function (options) {
        if ($.cv.css.deliveryAddress && $.cv.css.deliveryAddress.getDeliveryAddressesForCurrentUser)
            return $.cv.css.deliveryAddress.getDeliveryAddressesForCurrentUser(options);
    }; /* User END */

    /* Reporting */

    $.cv.css.getSalesData = function (options) {
        var opts = $.extend({
            keyData: '',
            keyType: '',
            recordTypes: '',
            tableName: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('salesdata/report', {
            parameters: { keyData: opts.keyData, keyType: opts.keyType, recordTypes: opts.recordTypes, tableName: opts.tableName },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    }; /* Reporting END */

    /* Campaigns */

    $.cv.css.currentCampaign = null;

    $.cv.css.setCurrentCampaign = function (campaign) {
        $.cv.css.localSetSelectedCampaign(campaign);
    };
    $.cv.css.campaignList = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('campaign/all', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };
    $.cv.css.campaignProductSearch = function (options) {
        var selCampaign = $.cv.css.localGetSelectedCampaign();
        var opts = $.extend({
            campaignCode: (selCampaign ? selCampaign : ''),
            searchString: '',
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/campaignproductsearch', {
            parameters: { campaignCode: opts.campaignCode, searchString: opts.searchString, skip: opts.skip, take: opts.take },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };

    /* Campaigns END */


    /* Favourites */

    $.cv.css.favouritesSearch = function (options) {
        var opts = $.extend({
            searchString: '',
            contractFilter: '',
            skip: 0,
            take: 10,
            sort: '',
            success: function (msg) { }
        }, options);

        var parameters = {
            searchString: opts.searchString,
            contractFilter: opts.contractFilter,
            skip: opts.skip,
            take: opts.take
        };

        // Allow Disabling of client sort order
        if ($.cv.css.favouritesSearch.config.enableSorting === true) {
            parameters.sort = opts.sort;
        }

        // Globally configured Sort Order (Custom Sort Order)
        if ($.cv.css.favouritesSearch.config.customSortField != "DEFAULT") {
            parameters.sort = $.cv.css.favouritesSearch.config.customSortField + " " +
                              $.cv.css.favouritesSearch.config.customSortDirection;
        }

        // Globally configured Month Limit (based on products purchased in
        // the last N months)
        if ($.cv.css.favouritesSearch.config.monthLimit != "ALL") {
            parameters.monthLimit = $.cv.css.favouritesSearch.config.monthLimit;
        }

        return $.cv.ajax.call('products/favourites', {
            parameters: parameters,
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };

    $.cv.css.favouritesSearch.config = {
        // We need to let the server do the sorting sometimes so we want to 
        // stop sending a sort from the client side.
        enableSorting: true,
        customSortField: null,
        customSortDirection: null
    };

    $.cv.css.favouritesPriorPurchasesSearch = function (options) {
        var opts = $.extend({
            searchString: '',
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/priorpurchases', {
            parameters: { searchString: opts.searchString, skip: opts.skip, take: opts.take },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };

    /* Favourites END */

    /* Search */

    // Predictive search
    $.cv.css.predictiveSearch = function (options) {
        var opts = $.extend({
            searchTerm: '',
            serviceName: '',
            resultSeperator: ',',
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call(opts.serviceName, {
            parameters: { searchTerm: opts.searchTerm, skip: opts.skip, take: opts.take, seperator: opts.resultSeperator },
            success: opts.success
        });
    };

    $.cv.css.getAvailableProductFeatureValues = function (options) {
        var opts = $.extend({
            mode: "",
            featureFilter: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('search/getAvailableProductFeatureValues', {
            parameters: { mode: opts.mode, featureFilter: opts.featureFilter },
            success: opts.success
        });
    };

    $.cv.css.getAllProductFeatureValues = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('search/getAllProductFeatureValues', {
            parameters: {},
            success: opts.success
        });
    };

    $.cv.css.getProductFeatureNameValuesWithFilter = function (options) {
        var opts = $.extend({
            nameFilter: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('search/getProductFeatureNameValuesWithFilter', {
            parameters: { nameFilter: opts.nameFilter },
            success: opts.success
        });
    };
    
    $.cv.css.getProductFeaturesWithFilter = function (options) {
        var opts = $.extend({
            productFeatureName: '',
            filter: '',
            requireAdvancedSearch: false,
            showCount: false,
            checkNumeric: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('search/getProductFeaturesWithFilter', {
            parameters: { productFeatureName: opts.productFeatureName, filter: opts.filter, requireAdvancedSearch: opts.requireAdvancedSearch, showCount: opts.showCount, checkNumeric: opts.checkNumeric },
            success: opts.success
        });
    }; /* Search END */

    /* Systable */

    $.cv.css.getSystableData = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('systable/data', {
            parameters: opts,
            success: function (response) {
                // Set Into local Storage
                if (response.errorMessage == null || response.errorMessage == '') {
                    $.cv.css.localSetSysTable(response.data);
                }

                if (opts.success) {
                    opts.success(response);
                }
            }
        });
    };

    /* Systable END */

    /* Template Related Utilities START */

    $.cv.css.getParsedTemplate = function (options) {
        var opts;

        if ($.type(options) === 'string') {
            var tmp = { templateName: options };
            options = tmp;
        }

        opts = $.extend({
            templateName: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call('getParsedTemplate', {
            parameters: { templateName: opts.templateName },
            success: opts.success
        });
    };

    /* Template Related Utilities END */


    /* Captcha Generation and Pre-Post Validation */

    $.cv.css.generateCaptcha = function () {
        // First argument is success function if provided
        var success = $.noop;

        if (arguments[0] && typeof arguments[0] === 'function') {
            success = arguments[0];
        }

        return $.cv.ajax.call('captcha', {
            parameters: {
                createNewCaptcha: true,
                captchaTextToValidate: ''
            },
            success: success
        });
    };

    $.cv.css.validateCaptcha = function (captchaText) {
        // Second argument is success function if provided
        var success = $.noop;

        if (arguments[1] && typeof arguments[1] === 'function') {
            success = arguments[1];
        }

        return $.cv.ajax.call('captcha', {
            parameters: {
                createNewCaptcha: false,
                captchaTextToValidate: captchaText
            },
            success: success
        });
    };

    /* Captcha Generation and Pre-Post Validation */

    /**
     * Allows client side code to ping the server to determine
     * availability of connection to the server.
     **/
    $.cv.css.ping = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call('ping', {
            parameters: opts,
            success: opts.success,
            converters: {
                'text json': $.cv.util._booleanResponseConverter
            }
        });
    };

    /* public methods END */


    /* localStorage keys */

    $.cv.css.localStorageKeys = {
        currentAccount: 'currentAccount',
        currentUser: 'currentUser',
        renderMode: 'renderMode',
        pageSize: 'pageSize',
        currentOrder: 'currentOrder',
        currentOrderLines: 'currentOrderLines',
        updatedCurrentOrderLines: 'updatedCurrentOrderLines',
        selectedCampaign: 'selectedCampaign',
        currentCatalogue: 'currentCatalogue',
        userCatalogues: 'userCatalogues',
        recentlyViewedProducts: 'recentlyViewedProducts',
        settings: 'settings',
        userStocktake: 'userStocktake',
        orderSummaryMessages: 'orderSummaryMessages',
        sysTable: 'sysTable',
        currentMultiBranchSite: 'currentMultiBranchSite',
        defaultRepCustomerSet: 'defaultRepCustomerSet',
        multiBranchSites: 'multiBranchSites',
        lastLoggedInUserID: 'lastLoggedInUserID',
        selectedOrder: 'selectedOrder',
        selectedOrderLines: 'selectedOrderLines',
        updatedSelectedOrderLines: 'updatedSelectedOrderLines',
        currentDeliveryAddress: 'currentDeliveryAddress',
        currentPickupAddress: 'currentPickupAddress',
        selectedOrderDeliveryAddress: 'selectedOrderDeliveryAddress',
        selectedOrderPickupAddress: 'selectedOrderPickupAddress',

        // Mobile
        menuPageId: "menuPageId",
        // Guest Checkout
        usingGuestCheckout: "usingGuestCheckout",

        // Site Tracker
        productFromList: "productFromList"
    };

    /* localStorage keys end*/

    /* sessionStorage keys */

    $.cv.css.sessionStorageKeys = {
        currentAccount: 'currentAccount',
        currentUser: 'currentUser',
        pageSize: 'pageSize',
        currentOrder: 'currentOrder',
        currentOrderLines: 'currentOrderLines',
        updatedCurrentOrderLines: 'updatedCurrentOrderLines',
        currentCatalogue: 'currentCatalogue',
        userCatalogues: 'userCatalogues',
        recentlyViewedProducts: 'recentlyViewedProducts',
        settings: 'settings',
        userStocktake: 'userStocktake',
        orderSummaryMessages: 'orderSummaryMessages',
        sysTable: 'sysTable',
        defaultRepCustomerSet: 'defaultRepCustomerSet',
        currentMultiBranchSite: 'currentMultiBranchSite',
        multiBranchSites: 'multiBranchSites',
        selectedOrder: 'selectedOrder',
        selectedOrderLines: 'selectedOrderLines',
        updatedSelectedOrderLines: 'updatedSelectedOrderLines',
        currentDeliveryAddress: 'currentDeliveryAddress',
        currentPickupAddress: 'currentPickupAddress',
        selectedOrderDeliveryAddress: 'selectedOrderDeliveryAddress',
        selectedOrderPickupAddress: 'selectedOrderPickupAddress',

        // Mobile
        menuPageId: "menuPageId"
    };

    /* sessionStorage keys end*/

    /* clear storage exlusion keys */

    $.cv.css.clearStorageExclusionKeys = {
        recentlyViewedProducts: 'recentlyViewedProducts',
        lastLoggedInUserID: 'lastLoggedInUserID',
        renderMode: 'renderMode'
    };

    /* clear storage exlusion keys end*/

    /* localStorage methods */


    /* helper methods */

    /* GP data helper methods */

    // GP data methods
    $.cv.css.maskGPData = function (data, mask, formatter) {
        var gpPercentMask = "93900";
        var gpAmountMask = "29800";
        if (mask) {
            if (data["GPPercentageExTotal"] != undefined)
                data["GPPercentageExTotal"] = (gpPercentMask + formatter.toString($.cv.css.cleanGPNumbers(data["GPPercentageExTotal"]), "n2")).replace('.', '');
            if (data["GPAmountExTotal"] != undefined)
                data["GPAmountExTotal"] = (gpAmountMask + formatter.toString($.cv.css.cleanGPNumbers(data["GPAmountExTotal"]), "n2")).replace('.', '');
            if (data["GPPercentage"] != undefined)
                data["GPPercentage"] = (gpPercentMask + formatter.toString($.cv.css.cleanGPNumbers(data["GPPercentage"]), "n2")).replace('.', '');
            if (data["GPPercentageEx"] != undefined)
                data["GPPercentageEx"] = (gpPercentMask + formatter.toString($.cv.css.cleanGPNumbers(data["GPPercentageEx"]), "n2")).replace('.', '');
            if (data["GPAmount"] != undefined)
                data["GPAmount"] = (gpAmountMask + formatter.toString($.cv.css.cleanGPNumbers(data["GPAmount"]), "n2")).replace('.', '');
            if (data["GPAmountEx"] != undefined)
                data["GPAmountEx"] = (gpAmountMask + formatter.toString($.cv.css.cleanGPNumbers(data["GPAmountEx"]), "n2")).replace('.', '');
            if (data["ReplacementCost"] != undefined)
                data["ReplacementCost"] = (gpAmountMask + formatter.toString($.cv.css.cleanGPNumbers(data["ReplacementCost"]), "n2")).replace('.', '');
        }
        return data;
    };

    // N.B. used currently in text binder.
    $.cv.css.maskGPValue = function (fieldName, value, formatter) {
        var gpPercentMask = "93900",
            gpAmountMask = "29800";

        if (!value) return value;

        var cleaned = (formatter.toString($.cv.css.cleanGPNumbers(value), "n2")).replace('.', '');

        if (_.contains(['GPPercentageExTotal', 'GPPercentage', 'GPPercentageEx'], fieldName)) {
            return gpPercentMask + cleaned;
        }

        if (_.contains(['GPAmountExTotal', 'GPAmount', 'GPAmountEx', 'ReplacementCost'], fieldName)) {
            return gpAmountMask + cleaned;
        }

        return value;
    };

    $.cv.css.cleanGPNumbers = function (val) {
        if (typeof (val) == 'string') {
            // remove characters
            val = val.replace('&nbsp;', '');
            val = val.replace('%', '');
            val = val.replace('$', '');
            val = val.replace(' ', '');
            // set to float
            val = val.length > 0 ? parseFloat(val) : 0.00;
            // set to zero if not valid
            val = isNaN(val) ? 0.00 : val;
        }
        return val;
    };

    $.cv.css.GPPercentagePrompt = function (mask) {
        return mask ? 'SSNP: ' : 'GP Percentage (ex GST): ';
    };

    $.cv.css.GPAmountPrompt = function (mask) {
        return mask ? 'SSN: ' : 'GP Amount (ex GST): ';
    };

    $.cv.css.replacementCostPrompt = function (mask) {
        return mask ? 'SSNC: ' : 'Cost: ';
    };

    /* GP data helper methods END */

    $.cv.css.fixDateFields = function (fieldList, data) {
        $.each(fieldList, function (index, item) {
            if (data[item] && data[item].length > 0)
                data[item] = $.cv.util.toDate(data[item]);
        });
        return data;
    };

    /* local storage helper methods */

    // Function to evaluate once whether the browser supports localstorage.
    (function () {
        var supports = false;
        var supportsSessionStorage = false;

        try {
            localStorage.setItem('key', 'value');
            localStorage.removeItem('key');
            supports = true;
        } catch (e) { }

        try {
            sessionStorage.setItem('key', 'value');
            sessionStorage.removeItem('key');
            supportsSessionStorage = true;
        } catch (e) { }

        $.cv.css.browserSupportsLocalStorage = function () {
            return supports;
        };
        $.cv.css.browserSupportsSessionStorage = function () {
            return supportsSessionStorage;
        };
        $.cv.css.browserSupportsStorage = function () {
            return supportsSessionStorage && supports;
        };
    })();

    // Detect if IE Browser and if so version number (>=5 only)
    // This is to support some code in cv.util.js that used to use jquery browser field in older versions
    // to check for ie versions < 8... This replicates the functionality without 
    // dependency on jQuery.browser.
    // WARNING: doesn't detect IE 10, but we don't care as we only need to know whether
    // browser is < IE 8 so we can do slightly different things.
    // https://gist.github.com/padolsey/527683

    var browserInfo = null;

    (function () {
        var getResult = function () {
            var ie = (function () {
                var undef,
                    v = 3,
                    div = document.createElement('div'),
                    all = div.getElementsByTagName('i');

                while (
                    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                    all[0]
                );

                return v > 4 ? v : undef;
            }());

            return {
                isIE: ie !== undefined,
                version: ie !== undefined ? ie : null
            };
        };

        $.cv.css.browser = function () {
            if (browserInfo === null) {
                browserInfo = getResult();
            }

            return browserInfo;
        };
    })();

    $.cv.css.useLocal = function (key) {
        if ($.cv.css.sessionStorageKeys[key] == undefined)
            return true;
        else {
            return $.cv.css.browserSupportsLocalStorage();
        }
    };

    // memoryLocalStorage used when no localStorage or cookies available
    $.cv.css.memoryLocalStorage = {
        setItem: function (key, value) {
            this.values[key] = value;
        },
        getItem: function (key, value) {
            return this.values[key];
        },
        removeItem: function (key) {
            delete this.values[key];
        },
        values: {}
    };

    $.cv.css.setLocalStorage = function (key, value) {
        value = $.cv.css._prepareForLocalStorage(value);

        if ($.cv.css.browserSupportsStorage()) {
            try {
                //throw 'cookie';
                if ($.cv.css.useLocal(key))
                    localStorage.setItem(key, JSON.stringify(value));
                else
                    sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                $.cv.css.memoryLocalStorage.setItem(key, JSON.stringify(value));
            }
        }
        else
            $.cv.css.memoryLocalStorage.setItem(key, JSON.stringify(value));
    };

    $.cv.css.getLocalStorage = function(key) {
        var data;
        if ($.cv.css.browserSupportsStorage()) {
            try {
                //throw 'cookie';
                if ($.cv.css.useLocal(key))
                    data = localStorage.getItem(key);
                else
                    data = sessionStorage.getItem(key);
            } catch (e) {
                data = $.cv.css.memoryLocalStorage.getItem(key);
            }
        } else
            data = $.cv.css.memoryLocalStorage.getItem(key);

        // if the storage item is not defined data comes back as a string = "undefined"
        if (data && data != "undefined") {
            var result = JSON.parse(data);

            if (result) {
                result = $.cv.css._fixFromLocalStorage(result);
            }

            return result;
        } else
            return null;
    };

    $.cv.css.removeLocalStorage = function(key) {
        if ($.cv.css.browserSupportsStorage()) {
            try {
                //throw 'cookie';
                if ($.cv.css.useLocal(key))
                    localStorage.removeItem(key);
                else
                    sessionStorage.removeItem(key);
            } catch (e) {
                $.cv.css.memoryLocalStorage.removeItem(key);
            }
        } else
            $.cv.css.memoryLocalStorage.removeItem(key);
    };


    var LOCAL_STORAGE_DATE_OBJECT_FIELD_NAME = "__cv_date_object";

    $.cv.css._prepareForLocalStorage = function (value) {
        // Convert special types to special object

        // Date
        if ($.type(value) === 'date') {
            var dateStruct = {
                // Date
                year: value.getFullYear(),
                month: value.getMonth(),
                date: value.getDate(),

                // Time
                hour: value.getHours(),
                minutes: value.getMinutes(),
                seconds: value.getSeconds(),
                milliseconds: value.getMilliseconds()
            };

            var result = {};
            result[LOCAL_STORAGE_DATE_OBJECT_FIELD_NAME] = dateStruct;

            return result;
        }

        // Iterate Object/array
        if ($.type(value) === 'array' || $.type(value) === 'object') {
            // Clone object/array at this level. (i.e. done recursive)
            if ($.type(value) === 'array') {
                value = value.slice(0); // This is generally (most browsers) the quickest way to clone an array.
            }

            if ($.type(value) === 'object') {
                value = $.extend({}, value); // Easiest way! :o)
            }

            $.each(value, function (i, item) {
                value[i] = $.cv.css._prepareForLocalStorage(item);
            });
        }

        return value;
    };

    $.cv.css._fixFromLocalStorage = function (value) {
        // Reconstruct special types
        if (value == null)
            return null;

        // Date
        if (value[LOCAL_STORAGE_DATE_OBJECT_FIELD_NAME] != null) {
            var obj = value[LOCAL_STORAGE_DATE_OBJECT_FIELD_NAME];

            return new Date(obj.year, obj.month, obj.date
                  , obj.hour, obj.minutes, obj.seconds, obj.milliseconds);
        }

        // Iterate Object/array
        if ($.type(value) === 'array' || $.type(value) === 'object') {
            $.each(value, function (i, item) {
                value[i] = $.cv.css._fixFromLocalStorage(item);
            });
        }

        return value;
    };

    $.cv.css.clearLocalStorage = function () {
        var storageKeys = {};
        _.extend(storageKeys, $.cv.css.localStorageKeys, $.cv.css.sessionStorageKeys);
        $.each(storageKeys, function (key, value) {
            if ($.cv.css.clearStorageExclusionKeys[key] == undefined)
                $.cv.css.removeLocalStorage(key);
        });
    };

    /* local storage helper methods END */


    /* helper methods END */

    $.cv.css.localGetUsingGuestCheckout = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.usingGuestCheckout);
    };

    $.cv.css.localSetUsingGuestCheckout = function (isUsing) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.usingGuestCheckout, isUsing);
    };

    $.cv.css.localGetDefaultRepCustomerAssigned = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.defaultRepCustomerSet);
    };

    $.cv.css.localSetDefaultRepCustomerAssigned = function (isSet) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.defaultRepCustomerSet, isSet);
    };

    $.cv.css.localGetSysTable = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.sysTable);
    };

    $.cv.css.localSetSysTable = function (sysTableData) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.sysTable, sysTableData);
    };

    $.cv.css.localGetSettings = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.settings);
    };

    $.cv.css.localSetSettings = function (settingsForSite) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.settings, settingsForSite);
    };

    $.cv.css.localGetSelectedCampaign = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.selectedCampaign);
    };

    $.cv.css.localSetSelectedCampaign = function (campaign) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.selectedCampaign, campaign);
    };

    $.cv.css.localGetCurrentOrderLines = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentOrderLines);
    };

    $.cv.css.localUpdateCurrentOrderLines = function (lines) {
        if (lines.length > 0) {
            var currentOrderLines = $.cv.css.localGetCurrentOrderLines();
            if (currentOrderLines && currentOrderLines != null && currentOrderLines.length != 0) {
                $.each(lines, function (idx, line) {
                    if (_.filter(currentOrderLines, function (item) { return line.LineSeq.toString() == item.LineSeq.toString(); }).length > 0) {
                        currentOrderLines = _.filter(currentOrderLines, function (item) { return line.LineSeq.toString() != item.LineSeq.toString(); });
                        currentOrderLines = _.union(currentOrderLines, line);
                    } else {
                        currentOrderLines = _.union(currentOrderLines, line);
                    }
                });
            } else {
                currentOrderLines = lines;
            }
            currentOrderLines = _.sortBy(currentOrderLines, function (item) { return item.LineSeq; });
            $.cv.css.localSetCurrentOrderLines(currentOrderLines);
        }
    };

    $.cv.css.localSetCurrentOrderLines = function (order) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentOrderLines, order);
    };

    $.cv.css.localGetUpdatedCurrentOrderLines = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.updatedCurrentOrderLines);
    };

    $.cv.css.localSetUpdatedCurrentOrderLines = function (lines) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.updatedCurrentOrderLines, lines);
    };

    $.cv.css.localRemoveUpdatedCurrentOrderLines = function () {
        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.updatedCurrentOrderLines);
    };

    // Current Order ----------------------------------------------------------
    $.cv.css.localGetCurrentOrder = function (loadIfNull) {
        var d1 = $.Deferred();
        loadIfNull = typeof loadIfNull !== 'undefined' ? loadIfNull : false;
        var o = $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentOrder);

        if (o != null || !loadIfNull) {
            return o;
        } else {
            if (!$.cv.css.loadingPromiseObjectExists($.cv.css.localStorageKeys.currentOrder)) {
                d1 = $.cv.css.getCurrentOrder();
                $.cv.css.addRemoveLoadingPromiseObjects(true, $.cv.css.localStorageKeys.currentOrder, d1);
                $.when(d1).done(function () {
                    $.cv.css.addRemoveLoadingPromiseObjects(false, $.cv.css.localStorageKeys.currentOrder);
                });
                return d1;
            } else {
                return $.cv.css.dataLoadingPromiseObjects[$.cv.css.localStorageKeys.currentOrder];
            }
        }
    };

    $.cv.css.localSetCurrentOrder = function (order) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentOrder, order);
    };

    // Selected Order ---------------------------------------------------------
    // A "selected" order is one that is not your current order but
    // that you might need to do work on, like delete a line or edit a qty
    // if you are approving the order. It is a storage place for a working
    // non-current order in other words
    $.cv.css.localGetSelectedOrder = function (orderNo, orderSuf, loadIfNull) {
        var d1 = $.Deferred();
        loadIfNull = typeof loadIfNull !== "undefined" ? loadIfNull : false;
        var o = $.cv.css.getLocalStorage($.cv.css.localStorageKeys.selectedOrder);
        orderNo = typeof orderNo !== "undefined" ? orderNo : 0;
        orderSuf = typeof orderSuf !== "undefined" ? orderSuf : "";

        if ((o != null
            && (orderNo === 0
                || (orderNo === o.SoOrderNo
                    && orderSuf === o.SoBoSuffix)))
            || !loadIfNull) {
            return o;
        } else if (orderNo > 0) {
            if (!$.cv.css.loadingPromiseObjectExists($.cv.css.localStorageKeys.selectedOrder)) {
                d1 = $.cv.css.getOrder({ orderNo: orderNo + orderSuf, isLocalSetSelectedOrder: true });
                $.cv.css.addRemoveLoadingPromiseObjects(true, $.cv.css.localStorageKeys.selectedOrder, d1);
                $.when(d1).done(function () {
                    $.cv.css.addRemoveLoadingPromiseObjects(false, $.cv.css.localStorageKeys.selectedOrder);
                });
                return d1;
            } else {
                return $.cv.css.dataLoadingPromiseObjects[$.cv.css.localStorageKeys.selectedOrder];
            }
        }
        return null;
    };

    $.cv.css.localSetSelectedOrder = function (order) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.selectedOrder, order);
    };

    $.cv.css.localGetSelectedOrderLines = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.selectedOrderLines);
    };

    $.cv.css.localSetSelectedOrderLines = function (order) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.selectedOrderLines, order);
    };

    $.cv.css.localUpdateSelectedOrderLines = function (lines) {
        if (lines.length > 0) {
            var selectedOrderLines = $.cv.css.localGetSelectedOrderLines();
            if (selectedOrderLines && selectedOrderLines.length !== 0) {
                $.each(lines, function (idx, line) {
                    if (_.filter(selectedOrderLines, function (item) { return line.LineSeq.toString() === item.LineSeq.toString(); }).length > 0) {
                        selectedOrderLines = _.filter(selectedOrderLines, function (item) { return line.LineSeq.toString() !== item.LineSeq.toString(); });
                        selectedOrderLines = _.union(selectedOrderLines, line);
                    } else {
                        selectedOrderLines = _.union(selectedOrderLines, line);
                    }
                });
            } else {
                selectedOrderLines = lines;
            }
            selectedOrderLines = _.sortBy(selectedOrderLines, function (item) { return item.LineSeq; });
            $.cv.css.localSetCurrentOrderLines(selectedOrderLines);
        }
    };
    
    $.cv.css.localGetUpdatedSelectedOrderLines = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.updatedSelectedOrderLines);
    };

    $.cv.css.localSetUpdatedSelectedOrderLines = function (lines) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.updatedSelectedOrderLines, lines);
    };

    $.cv.css.localRemoveUpdatedSelectedOrderLines = function () {
        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.updatedSelectedOrderLines);
    };

    // Selected Order Delivery Address ------------------------------------------------
    $.cv.css.localGetSelectedOrderDeliveryAddress = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.selectedOrderDeliveryAddress);
    };

    $.cv.css.localSetSelectedOrderDeliveryAddress = function (address) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.selectedOrderDeliveryAddress, address);
    };

    $.cv.css.localGetSelectedOrderPickupAddress = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.selectedOrderPickupAddress);
    };

    $.cv.css.localSetSelectedOrderPickupAddress = function (address) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.selectedOrderPickupAddress, address);
    };

    // Current Delivery Address ------------------------------------------------
    $.cv.css.localGetcurrentDeliveryAddress = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentDeliveryAddress);
    };

    $.cv.css.localSetcurrentDeliveryAddress = function (address) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentDeliveryAddress, address);
    };

    $.cv.css.localGetcurrentPickupAddress = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentPickupAddress);
    };

    $.cv.css.localSetcurrentPickupAddress = function (address) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentPickupAddress, address);
    };

    // Current Account --------------------------------------------------------
    $.cv.css.localGetCurrentAccount = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentAccount);
    };

    $.cv.css.localSetCurrentAccount = function (account) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentAccount, account);
    };

    $.cv.css.localGetUser = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentUser);
    };

    $.cv.css.localSetUser = function (user) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentUser, user);
    };

    $.cv.css.localGetLastLoggedInUserID = function () {
        var result = $.cv.css.getLocalStorage($.cv.css.localStorageKeys.lastLoggedInUserID);

        // Cleanup: empty for null and undefined or for any guest user account
        if (result == null || result.indexOf('guestuser') == 0) {
            result = '';
        }

        return result;
    };

    $.cv.css.localSetLastLoggedInUserID = function (userID) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.lastLoggedInUserID, userID);
    };

    // Set the render mode in local storage
    $.cv.css.localSetRenderMode = function (toRenderFor) {
        var myRender = toRenderFor;
        // calculate mode if auto to Tablet if width > 480 pixels
        if (toRenderFor === 'Auto')
            myRender = $(window).width() > 480 ? $.cv.css.renderModes.Tablet : $.cv.css.renderModes.Phone;

        if ($.mobile && $.cv.mobile.setPhoneOrTabletCssClass) {
            $.cv.mobile.setPhoneOrTabletCssClass();
        }

        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.renderMode, myRender);
    };

    // get render mode (Tablet/Phone)
    $.cv.css.localGetRenderMode = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.renderMode);
    };

    $.cv.css.localGetMenuPageId = function () {
        var menuPageId = $.cv.css.getLocalStorage($.cv.css.localStorageKeys.menuPageId);
        if (menuPageId != null) {
            return menuPageId;
        }

        return "mainPage"; // this is normally what the MAF main page is set to!
    };

    $.cv.css.localSetMenuPageId = function (id) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.menuPageId, id);
    };

    // get page size
    $.cv.css.localGetPageSize = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.pageSize);
    };

    // set page size
    $.cv.css.localSetPageSize = function (size) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.pageSize, size);
    };

    $.cv.css.localGetUserStocktake = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.userStocktake);
    };

    $.cv.css.localSetUserStocktake = function (stocktake) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.userStocktake, stocktake);
    };

    /* order summary messages */

    $.cv.css.localGetOrderSummaryMessages = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.orderSummaryMessages);
    };

    $.cv.css.localSetOrderSummaryMessages = function (messages) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.orderSummaryMessages, messages);
    };
    
    /* localStorage methods END */

    // This just allows unification of handling something that returns a 
    // promise or a value by wrapping it in a promise itself.
    $.cv.css.unifyPromiseOrValue = function (valueOrPromise, success, failure) {
        var response = $.Deferred(),
            isDeferred = false;

        // Promise?
        if ($.cv.util.hasValue(valueOrPromise) &&
            // ensure its a jQuery promise
            valueOrPromise.state &&
            valueOrPromise.then &&
            valueOrPromise.done &&
            valueOrPromise.fail &&
            valueOrPromise.always)
        {
            isDeferred = true;

            valueOrPromise.done(function (r) {
                success && success(r);
                response.resolve(r);
            }).fail(function (r) {
                failure && failure(r);
                response.reject(r);
            });
        }

        // Non-Promise
        if (!isDeferred) {
            success && success(valueOrPromise);
            response.resolve(valueOrPromise);
        }

        return response.promise();
    };

})(jQuery);

$(function () {
    // Global event binding for localstorage refreshing
    var refreshOrderData = function (options) {
        var opts = $.extend({
            triggerEvents: true
        }, options);

        var orderRefreshed = $.Deferred();

        // Need to check if the user logging in is a Rep
        // if so their current account may be empty so get current order and get current order lines will fail
        var user = $.cv.css.localGetUser();

        if ((user && user.IsUserSalesRep) || ($.cv.mobile && $.cv.mobile.offline)) {
            // only empty the local storage if the rep does not have a current account, which will be the case after they select an account from the account select widget
            if ($.cv.css.localGetCurrentAccount() != null) {
                orderRefreshed = $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines());
            } else {
                // if rep user, clear local storage values that may have been set by another logged in user
                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrder);
                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrderLines);
                $.cv.css.localRemoveUpdatedCurrentOrderLines();
                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.userCatalogues);

                orderRefreshed.resolve(null, null);
            }
        } else {
            orderRefreshed = $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines());
        }

        // Trigger local orderchanged - this will notify widgets
        orderRefreshed.done(function () {
            if (opts.triggerEvents === true) {
                $.cv.css.trigger($.cv.css.eventnames.localOrderChanged);
            }
        });

        return orderRefreshed.promise();
    };

    var loginLogoutSuccess = function (data) {
        data = data || {};
        var opts = data.opts || {};

        var haveLatestOrder = $.Deferred();
        var haveUser = $.Deferred();
        var haveSysTableData = $.Deferred();

        $.cv.css.bind($.cv.css.eventnames.localOrderChanged, function () {
            haveLatestOrder.resolve();
        });

        // Ensure user loaded if required
        if (opts.loadCurrentUser) {
            haveUser = $.cv.css.getCurrentUser();
        } else {
            haveUser.resolve();
        }

        // Ensure SysTable Data if necessary
        if (opts.isLogin) {
            haveSysTableData = $.cv.css.getSystableData();
        } else {
            haveSysTableData.resolve();
        }

        // wait on these deferred items then run triggers
        $.when(haveUser, haveSysTableData).always(function () {
            var accountReset = $.Deferred();
            var user = $.cv.css.localGetUser();

            if (user && !user.IsUserSalesRep && opts.isLogin) {
                accountReset = $.cv.css.getCurrentAccount({ triggerChange: false });
            } else {
                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentAccount);
                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrder);
                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrderLines);
                accountReset.resolve();
            }

            var redirectAfterAccountSelect = (user && user.HasMultipleAccounts && user.MasterForceMultiAccountSelect);

            var loadOrderPermitted = $.Deferred();

            // if non mobile, load after login and wait until local order has changed from
            // the global event binding userChanged
            accountReset.done(function () {
                if ($.cv.css.localGetCurrentAccount() && opts.loadOrdersAfterLogin) {
                    haveLatestOrder.done(function () {
                        loadOrderPermitted.resolve();
                    });
                } else {
                    loadOrderPermitted.resolve();
                }
            });

            loadOrderPermitted.done(function () {
                // raise login event return 0;
                if (opts.isLogin) {
                    var extendedData = $.extend({}, data.data, { redirectAfterAccountSelect: redirectAfterAccountSelect });
                    $.cv.css.trigger($.cv.css.eventnames.login, extendedData);
                } else if (opts.suppressRedirect !== true) {
                    if (opts.logoutRedirectUrl != undefined && opts.logoutRedirectUrl !== "")
                        $.cv.util.redirect(opts.logoutRedirectUrl, {}, false);
                }
                if (opts.success)
                    opts.success(data);
            });
        });
    };

    var preOrderSubmit = function () {
        var preOrderSubmit = $.Deferred();

        preOrderSubmit.done(function () {
            $.cv.css.trigger($.cv.css.eventnames.preOrderSubmitComplete);
        });

        if (!_.isEmpty($.cv.css.preOrderSubmitPromiseObjects)) {
            $.cv.css.bind($.cv.css.eventnames.widgetPreOrderSubmitComplete, function () {
                var allResolved = true;
                $.each($.cv.css.preOrderSubmitPromiseObjects, function (idx, item) {
                    if (item.state() != "resolved")
                        allResolved = false;
                });

                if (allResolved)
                    preOrderSubmit.resolve();
            });
        } else {
            preOrderSubmit.resolve();
        }

        return preOrderSubmit.promise();
    };

    // order data localstorage refresh
    $.cv.css.bind($.cv.css.eventnames.refreshOrderData, refreshOrderData);
    $.cv.css.bind($.cv.css.eventnames.accountChanged, refreshOrderData);
    $.cv.css.bind($.cv.css.eventnames.userChanged, refreshOrderData);
    $.cv.css.bind($.cv.css.eventnames.loginLogoutSuccess, loginLogoutSuccess);
    $.cv.css.bind($.cv.css.eventnames.preOrderSubmit, preOrderSubmit);
});
