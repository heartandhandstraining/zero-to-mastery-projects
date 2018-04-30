
;

(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.orders = $.cv.css.orders || {};

    $.cv.css.orders.alternatesCountForOrderLines = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderline/alternatesCountForOrderLines", {
            parameters: {},
            success: opts.success
        });
    };

    $.cv.css.orders.alternatesForProduct = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderline/alternatesForProduct", {
            parameters: {
                productCode: opts.productCode
            },
            success: opts.success
        });
    };

    /*
        Can be called in two ways

     */

    // onlyShowErrors function
    // triggers event for only showing errors or showing all lines and toggles containers for show all lines/show only errors text

    $.cv.css.orders.onlyShowErrors = function (link) {
        $(link).toggleClass($.cv.css.isOnlyShowingErrorsClass);
        $.cv.css.trigger($.cv.css.eventnames.orderLinesOnlyShowErrors);
    };


    $.cv.css.orders.addToOrder = function (options) {
        var opts = $.extend({
            productCode: '',
            quantity: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/AddToOrder', {
            parameters: {
                productCode: opts.productCode,
                quantity: opts.quantity
            },
            success: opts.success
        });
    };

    // getCurrentOrderForUser function 
    // Gets Current Order ProntoSalesOrder Recordset Type of current user, using setup default JSON Fieldgroup GetCurrentOrderForUser
    $.cv.css.orders.getCurrentOrderForUser = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/GetCurrentOrderForUser', {
            success: opts.success
        });
    };

    $.cv.css.orders.areAddressLinesOK = function (options) {
        var opts = $.extend({
            success: function (msg) { },
            addressLines: []
        }, options);

        var prom = $.cv.ajax.call('orders/AreAddressLinesOK', {
            parameters: {
                addressLines: opts.addressLines
            },
            success: function (results) {
                opts.success.call({
                    success: results.data.length === 0,
                    message: results.data
                });
            }
        });

        var def = $.Deferred();

        prom.done(function (results) {
            def.resolve({
                success: results.data.length === 0,
                message: results.data
            });
        });

        return def.promise();
    };

    $.cv.css.orders.getOrderCompleteFieldGroupData = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/GetOrderCompleteFieldGroupData', {
            parameters: {},
            success: opts.success
        });
    };

    $.cv.css.orders.updateOrderCompleteFieldGroupData = function (options) {
        var opts = $.extend({
            newValues: {},
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/UpdateOrderCompleteFieldGroupData', {
            parameters: { newValues: opts.newValues },
            success: opts.success
        });
    };

    $.cv.css.orders.holdCurrentOrder = function (options) {
        var opts = $.extend({
            _objectKey: '',
            triggerOrderChanged: true,
            triggerOrderSubmitted: true,
            holdreference: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/holdcurrentorder', {
            parameters: { _objectKey: opts._objectKey, holdreference: opts.holdreference },
            success: function (msg) {
                // reload local order
                if (opts.triggerOrderSubmitted) {
                $.cv.css.trigger($.cv.css.eventnames.orderSubmitted);
                }
                var p1 = $.cv.css.getCurrentOrder();
                var p2 = $.cv.css.getCurrentOrderLines();
                $.when(p1, p2).then(function () {
                    if (opts.triggerOrderChanged) {
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                    }
                });
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.emptyCart = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/emptyCart', {
            parameters: {},
            success: function (msg) {
                // reload local order
                var p1 = $.cv.css.getCurrentOrder();
                var p2 = $.cv.css.getCurrentOrderLines();
                $.when(p1, p2).then(function () {
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });

                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.orders.updateCurrentOrder = function (options) {
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

    /**
     * Adds a product to the users current order
     *
     * Returns: A jQuery Primise. The resolved object structure is:
     * WARNING: each entry in data field array has the same structure
     * WARNING: each entry in data field array corresponds to the same index in errorMessages
     * WARNING: each data/errorMessage pair corresponds to one line added.
     * {
     *    data: [{
     *        editOrderOk: true, // N.B. Lowercase "k" in ok
     *        message: '',
     *        newLineSeq: 6,
     *        result : [
     *           // Pronto Sales Order Line fields here. One record only
     *           // contains the line after it was added
     *        ]
     *    }, 
     *    { ... }, 
     *    { ... },
     *    ...],
     *    errorMessage: [
     *      null, // N.B. can be null or a string value...
     *      '',
     *      "",
     *      ...
     *    ]
     * }
     *
     * N.B. you should check the "editOrderOk" variable to determine whether
     * the line was added successfully
    **/
    $.cv.css.orders.addToCurrentOrderBulk = function (options) {
        var opts = $.extend({
            batchData: [],
            triggerGetLines: false,
            gtmPageType: '',
            success: function (response) { }
        }, options);

        // Set UOM to blank if undefined.
        $.each(opts.batchData, function(index, item) {
            opts.batchData[index] = $.extend({}, $.cv.css.addToCurrentOrder.optionDefaults, item);
        });

        return $.cv.ajax.call('orders/addlinetocurrent', {
            parameters: { batchData: opts.batchData },
            success: function (response) {
                var lines = [],
                    orderLoaded,
                    orderLinesLoaded = {}; // $.when() considers this as "resolved"

                // Call passed in Success function.
                if (opts.success) {
                    opts.success(response);
                }

                // Extract changed lines and update local storage currentOrderLines...
                if (response.data) {
                    var data = response.data;
                    $.each(data, function (idx, item) {
                        if (item.result.length > 0) {
                            lines.push(item.result[0]);
                        }
                    });
                }

                $.cv.css.localUpdateCurrentOrderLines(lines);

                // Call getCurrentOrder which will update the $.cv.css.localSetCurrentOrder object 
                // and trigger the 'orderChanged' event 
                orderLoaded = $.cv.css.getCurrentOrder();

                if (opts.triggerGetLines) {
                    orderLinesLoaded = $.cv.css.getCurrentOrderLines();
                }

                $.when(orderLoaded, orderLinesLoaded).always(function () {
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });
            }
        });
    };

    $.cv.css.orders.addLineToOrder = function (options) {
        var opts = $.extend({
            _objectKey: null,
            productCode: '',
            orderNo: 0
        }, $.cv.css.addToCurrentOrder.optionDefaults, options);

        return $.cv.ajax.call('orders/addLineToOrder', {
            parameters: opts
        });
    };

    $.cv.css.orders.applyPaymentSurcharge = function (options) {
        var result = $.Deferred();
        var opts = $.extend({
            paymentMethod: 'CardAny',
            orderNo: 0,
            success: function (msg) { }
        }, options);
        $.cv.ajax.call('orders/applyPaymentSurcharge', {
            parameters: { paymentMethod: opts.paymentMethod, orderNo: opts.orderNo },
            success: opts.success,
            error: opts.error,
            sessionTimeout: opts.sessionTimeout
        }).done(function (response) {
            $.when.apply($, $.cv.css.trigger($.cv.css.eventnames.refreshOrderData).results).done(function () {
                result.resolve(response);
            });
        });
        return result.promise();
    };

    $.cv.css.orders.removePaymentSurcharge = function (options) {
        var opts = $.extend({
            _objectKey: $.cv.css.localGetCurrentOrder()._objectKey,
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/removePaymentSurcharge', {
            parameters: opts,
            success: opts.success
        }).done(function (response) {
            $.when.apply($, $.cv.css.trigger($.cv.css.eventnames.refreshOrderData).results);
        });
    };

    $.cv.css.orders.updateCurrentOrderLineBulk = function (options) {
        var prom = $.Deferred();
        var opts = $.extend({
            batchData: [],
            triggerOrderRefresh: true,
            success: function (msg) { }
        }, options);

        // Extend passed in option from defaults so that we fill in default values that are not provided.
        for (var i in opts.batchData) {
            var newBatchDataItem = $.extend({}, $.cv.css.updateCurrentOrderLine.optionDefaults, opts.batchData[i]);
            opts.batchData[i] = newBatchDataItem;
        }

        var updateProm = $.cv.ajax.call('orders/updatecurrentorderline', {
            parameters: { batchData: opts.batchData },
            success: function (msg) { }
        });

        updateProm.done(function (msg) {
            var result = [];
            var lines = [];
            if (msg.data) {
                var data = msg.data;
                $.each(data, function (idx, item) {
                    if (item.message == "") {
                        result.push("true");
                    } else {
                        result.push("false");
                    }
                    if (item.result.length > 0) {
                        lines.push(item.result[0]);
                    }
                });
            }
            $.cv.css.localUpdateCurrentOrderLines(lines);
            prom.resolve({ data: result });
            if (opts.triggerOrderRefresh) {
                // get order again
                var p1 = $.cv.css.getCurrentOrder();
                p1.always(function () {
                    // raise success once details reloaded
                    if (opts.success) {
                        opts.success(msg);
                    }

                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });
            }
        }).fail(function () {
            prom.resolve();
        });
        return prom.promise();
    };

    $.cv.css.orders.updateOrderLine = function (options) {
        var opts = $.extend({}, $.cv.css.updateCurrentOrderLine.optionDefaults, options);

        return $.cv.ajax.call('orders/updateorderline', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.deleteCurrentOrderLineBulkService = "orders/deletecurrentorderline";
    $.cv.css.orders.deleteCurrentOrderLineBulk = function (options) {
        var opts = $.extend({
            batchData: [],
            allLineSeqsToDeleteIfBatch: [],
            triggerOrderRefresh: true,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call($.cv.css.orders.deleteCurrentOrderLineBulkService, {
            parameters: {
                batchData: opts.batchData,
                allLineSeqsToDeleteIfBatch: opts.allLineSeqsToDeleteIfBatch
            },
            success: function (msg) {
                if (opts.triggerOrderRefresh) {
                    // reload order as totals would change
                    var p1 = $.cv.css.getCurrentOrder();
                    var p2 = $.cv.css.getCurrentOrderLines();
                    $.when(p1, p2).always(function () {
                        // raise success once details reloaded
                        if (opts.success) {
                            opts.success(msg);
                        }

                        $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                    });
                }
            }
        });
    };

    $.cv.css.orders.deleteOrderLine = function (options) {
        var opts = $.extend({
            _objectKey: null,
            seq: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/deleteOrderLine', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.determineCheckoutMessages = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/determinecheckoutmessages', {
            parameters: options,
            success: function (msg) {
                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.orders.validateForCheckout = function (options) {
        var opts = $.extend({
            _objectKey: '',
            validationMode: 'checkout',
            linesToValidate: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/validateforcheckout', {
            parameters: { _objectKey: opts._objectKey, validationMode: opts.validationMode, linesToValidate: opts.linesToValidate },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.applyPromoCode = function (options) {
        var opts = $.extend({
            _objectKey: '',
            promoCode: '',
            gtmSuccessfulPromoAddEventName: '',
            gtmFailedPromoAddEventName: '',
            success: function (msg) { }
        }, options);

        var promise = $.cv.ajax.call('orders/applypromocode', {
            parameters: { promoCode: opts.promoCode, _objectKey: opts._objectKey },
            success: function (response) {
                // Reload order as totals would change
                $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines()).always(function () {
                    // Raise success once details reloaded
                    if (opts.success) {
                        opts.success(response);
                    }

                    // Google Tag Manager Event
                    if (response.data.IsValid) {
                        if (opts.gtmSuccessfulPromoAddEventName) {
                            $.cv.css.gtm.push(opts.gtmSuccessfulPromoAddEventName, { promocode: opts.promoCode });
                        }
                    } else {
                        if (opts.gtmFailedPromoAddEventName) {
                            $.cv.css.gtm.push(opts.gtmFailedPromoAddEventName, { promocode: opts.promoCode });
                        }
                    }

                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });
            }
        }).fail(function() {
            if (opts.gtmFailedPromoAddEventName) {
                $.cv.css.gtm.push(opts.gtmFailedPromoAddEventName, { promocode: opts.promoCode });
            }
        });

        return promise;
    };

    $.cv.css.orders.removePromoCode = function (options) {
        var opts = $.extend({
            _objectKey: '',
            promoCode: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/removepromocode', {
            parameters: { promoCode: opts.promoCode, _objectKey: opts._objectKey },
            success: function (msg) {
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
        });
    };

    $.cv.css.orders.getQuotes = function (options) {
        var opts = $.extend({
            searchString: '',
            skip: 0,
            take: 10,
            sort: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/getQuotes', {
            parameters: {
                searchString: opts.searchString,
                skip: opts.skip,
                take: opts.take,
                sort: opts.sort
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.approveQuote = function (options) {
        var opts = $.extend({
            _objectKey: null
        }, options);
    
        return $.cv.ajax.call('orders/approveQuote', {
            parameters: opts
        });
    };

    $.cv.css.orders.rejectQuote = function (options) {
        var opts = $.extend({
            _objectKey: null,
            rejectionReasonCode: ''
        }, options);
    
        return $.cv.ajax.call('orders/rejectQuote', {
            parameters: opts
        });
    };
    
    $.cv.css.orders.getQuoteRejectionReasons = function (options) {
        var opts = $.extend({
        }, options);
    
        return $.cv.ajax.call('orders/getQuoteRejectionReasons', {
            parameters: opts
        });
    };
    
    $.cv.css.orders.extendQuote = function (options) {
        var opts = $.extend({
            _objectKey: null,
            expiry: null
        }, options);
    
        return $.cv.ajax.call('orders/extendQuote', {
            parameters: opts
        });
    };

    $.cv.css.orders.getLivePromoInfo = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            accessCode: "",
            success: function () { }
        }, options);

        return $.cv.ajax.call('orders/getLivePromoInfo', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.updateLivePromoInfo = function (options) {
        var opts = $.extend({
            sequence: -1,
            productCode: "",
            quantityTaken: 0,
            soOrderNo: 0,
            accessCode: "",
            success: function () { }
        }, options);

        return $.cv.ajax.call('orders/updateLivePromoInfo', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.requestQuote = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/requestQuote', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.submitQuote = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/submitQuote', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.copySearchResultQuoteToCurrentOrder = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/copySearchResultQuoteToCurrentOrder', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.changeOrderAccount = function (options) {
        if ($.type(options) === "string") {
            var customerCode = options;

            options = {
                customerCode: customerCode
            };
        }

        var opts = $.extend({
            customerCode: '',
            confirmChangeCustomer: false,
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/changeOrderAccount', {
            parameters: {
                customerCode: opts.customerCode,
                confirmChangeCustomer: opts.confirmChangeCustomer
            },
            success: opts.success
        });
    };

    // Merge the lines on both accounts
    $.cv.css.orders.enhancedChangeOrderAccount = function (action, options) {
        var path = '';

        var opts = $.extend({
            oldOrderNo: '',
            oldCustomerCode: '',
            targetCustomerCode: ''
        }, options);

        var paramsToSend = {
            oldOrderNo: opts.oldOrderNo,
            oldCustomerCode: opts.oldCustomerCode,
            targetCustomerCode: opts.targetCustomerCode
        };

        switch (action) {
            case "merge":
                path = "orders/mergeOrderToAccount";
                break;
            case "hold":
                path = "orders/holdOrderToAccount";
                paramsToSend.holdreference = opts.reference;
                break;
            case "delete":
                path = "orders/deleteOrderToAccount";
                break;
        }

        return $.cv.ajax.call(path, {
            parameters: paramsToSend,
            success: function (msg) {
                // set data in current order by triggering order changed
                var waiting = $.cv.css.getCurrentOrder();
                $.when(waiting).done(function () {
                    if (opts.success)
                        opts.success(msg);
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });
            }
        });
    };

    $.cv.css.orders.setCreateBackorderState = function (options) {
        if ($.type(options) === "boolean") {
            var yaynay = options;

            options = {
                createBackorder: yaynay
            };
        }

        var opts = $.extend({
            createBackorder: false
        }, options);

        return $.cv.ajax.call('orders/setCreateBackorderState', {
            parameters: {
                createBackorder: opts.createBackorder
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.cancelQuoteOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orders/cancelQuoteOrder', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
                $.cv.css.trigger($.cv.css.eventnames.refreshOrderData);
            }
        });
    };

    $.cv.css.orders.unsubmittedOrders = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/unsubmittedOrders', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.switchToOrder = function (options) {
        var opts = $.extend({
            reloadOrder: true,
            soOrderNo: ''
        }, options);

        var prom = $.Deferred();

        // Switch Orders
        var switchProm = $.cv.ajax.call('orders/switchToOrder', {
            parameters: opts
        });

        // Reload Orders
        switchProm.done(function () {
            if (opts.reloadOrder) {
                $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines())
                .always(function () {
                    prom.resolve();
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                });
            } else {
                prom.resolve();
            }
        }).fail(function () {
            prom.resolve();
        });;

        return prom.promise();
    };

    /*
        Changes to specified account and switches orders

        Note:   This is an abstraction around other dynamic service calls, it doesn't have a 
                corresponding service endpoint.

        Process:
        - triggers account change (silently) and loads new account (no one knows of account change yet!)
        - triggers switching to selected order (doesn't reload order yet!)
        - triggers accountChanged which triggers reloading of the order
        - once the order loading has finished (trigger now returns results from all handlers, which
          if promises are waited for resolved state) then we trigger orderChanged so that 
          widgets can update.
    */
    $.cv.css.orders.resumeOrder = function (options) {
        var opts = $.extend({
            customerCode: '',
            orderNo: ''
        }, options);

        var response = $.Deferred();

        // 1. change account
        var setAccountProm = $.cv.css.setCurrentAccount({ account: opts.customerCode, triggerChange: false });

        // 2. switch to order
        setAccountProm.done(function () {
            var switchProm = $.cv.css.orders.switchToOrder({ soOrderNo: opts.orderNo, reloadOrder: false });

            switchProm.done(function () {
                // 3. notify of Account Change - triggers order reload (silently)
                var accountChangedResponse = $.cv.css.trigger($.cv.css.eventnames.accountChanged);

                // Only trigger orderChanged when all handlers (that return promises anyway)
                // are resolved as otherwise we might refresh from stale local storage order.
                // In this case the accountChanged event triggers internal refresh of the orders 
                // which now returns a promises... When the order has reloaded
                // we can then trigger orderChanged and widgets can update themselves!
                $.when.apply($, accountChangedResponse.results).done(function () {
                    // 4. trigger order changed for widget updating...
                    $.when.apply($, $.cv.css.trigger($.cv.css.eventnames.orderChanged).results).done(function () {
                        response.resolve();
                    });
                });
            }).fail(function () {
                response.reject();
            });
        }).fail(function () {
            response.reject();
        });

        return response.promise();
    };

    $.cv.css.orders.setInvoiceReprint = function (options) {
        var opts = $.extend({}, $.cv.css.orders.setInvoiceReprint.optionDefaults, options);

        return $.cv.ajax.call('orders/setInvoiceReprint', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.setInvoiceReprintBulk = function (options) {
        var opts = $.extend({
            batchData: [],
            triggerOrderRefresh: true,
            success: function (msg) { }
        }, options);

        // Extend passed in option from defaults so that we fill in default values that are not provided.
        for (var i in opts.batchData) {
            var newBatchDataItem = $.extend({}, $.cv.css.orders.setInvoiceReprint.optionDefaults, opts.batchData[i]);
            opts.batchData[i] = newBatchDataItem;
        }

        return $.cv.ajax.call('orders/setInvoiceReprint', {
            parameters: { batchData: opts.batchData },
            success: opts.success
        });
    };

    $.cv.css.orders.setInvoiceReprint.optionDefaults = {
        orderNo: "",
        suffix: "",
        reprintTo: "",
        expectedInvoiceNo: "",
        forceOrderCreation: false,
        ignoreCustomerChecks: false,
        outputFormat: "",
        batchGroupID: "",
        customerCode: "",
        success: $.noop
    };

    $.cv.css.orders.sendInvoiceReprintBatchGroup = function (options) {
        var opts = $.extend({
            batchgroupID: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/sendInvoiceReprintBatchGroup', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.findNearestPickupStoresForLine = function (options) {
        var opts = $.extend({
            orderNo: 0,
            orderSuffix: "",
            lineSeq: 0,
            numberOfStores: 3,
            includeCurrentStore: true,
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderline/findNearestPickupStoresForLine', {
            parameters: {
                orderNo: opts.orderNo,
                orderSuffix: opts.orderSuffix,
                lineSeq: opts.lineSeq,
                numberOfStores: opts.numberOfStores,
                includeCurrentStore: opts.includeCurrentStore
            },
            success: opts.success
        });
    };

    $.cv.css.orders.updateOrderLineFieldGroupData = function (options) {
        var opts = $.extend({
            orderNo: 0,
            orderSuffix: "",
            lineSeq: 0,
            newValues: {},
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderline/updateOrderLineFieldGroupData', {
            parameters: {
                orderNo: opts.orderNo,
                orderSuffix: opts.orderSuffix,
                lineSeq: opts.lineSeq,
                newValues: opts.newValues
            },
            success: opts.success
        });
    };

    $.cv.css.orders.getOrderDocuments = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: ""
        }, options);

        return $.cv.ajax.call("orders/getorderdocuments", {
            parameters: {
                soOrderNo: opts.orderNo,
                soBoSuffix: opts.soBoSuffix
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.getCurrentOrderSignatureImageData = function (options) {
        // TODO(jwwishart) remove comment... maybe?
        console.warn("Getting Signature...!");
        var opts = $.extend({
            success: function() {}
        }, options);

        return $.cv.ajax.call("orders/currentSignatureImageData", {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.setCurrentOrderSignatureImageData = function (options) {
        // TODO(jwwishart) remove comment... maybe?
        console.warn("Saving Signature...!");
        var opts = $.extend({
            _objectKey: null,
            SignatureImageData: null,
            success: function() {}
        }, options);

        return $.cv.ajax.call("orders/currentSignatureImageData-update", {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.logGoogleAnalyticsOrderTrackingScriptRenderedOnClient = function (options) {
        var opts = $.extend({
            orderNo: 0,
            script: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call('orders/logGoogleAnalyticsOrderTrackingScriptRenderedOnClient', {
            parameters: {
                orderNo: opts.orderNo,
                script: opts.script
            },
            success: opts.success
        });
    };

    $.cv.css.orders.updateOrderValidationPostCode = function (options) {
        var opts = $.extend({
            postCode: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orders/updateOrderValidationPostCode', {
            parameters: opts,
            success: function (msg) {
                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.orders.getOrdersAwaitingPayment = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call("orders/getOrdersAwaitingPayment", {
            parameters: opts,
            success: function (msg) {
                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.orders.switchOrderToPayOrderAwaitingPayment = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call("orders/switchOrderToPayOrderAwaitingPayment", {
            parameters: opts,
            success: function (msg) {
                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.orders.getOrderLines = function (options) {
        var opts = $.extend({
            orderNo: "",
            suffix: "",
            isFromOrderSearch: true, // See Comment on underlying method for more information
            liveOrder: false,
            soOrderStatus: "",
            isLocalSetSelectedOrderLines: false,
            hrefDescription: true,
            checkCustomerCode: true,
            success: $.noop
        }, options);

        // local orderline/getlines needs the suffix appended to the order number
        opts.orderNo = opts.liveOrder ? opts.orderNo : opts.orderNo.toString() + opts.suffix;
        opts.suffix = opts.liveOrder ? opts.suffix : "";

        return $.cv.ajax.call(opts.liveOrder ? "orderline/getlineslive" : "orderline/getorderlinesforordertracking", {
            parameters: {
                orderNo: opts.orderNo.toString(),
                suffix: opts.suffix,
                soOrderStatus: opts.soOrderStatus,
                isFromOrderSearch: opts.isFromOrderSearch,
                hrefDescription: opts.hrefDescription,
                checkCustomerCode: opts.checkCustomerCode
            },
            success: function (msg) {
                // set data in local storage for the order lines.
                if (opts.isLocalSetSelectedOrderLines) {
                    $.cv.css.localSetSelectedOrderLines(msg.data);
                }
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.getDeliveryAddressLive = function (options) {
        var opts = $.extend({
            orderNo: "",
            suffix: "",
            soCustCode: "",
            soOrderStatus: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call("orders/getDeliveryAddressLive", {
            parameters: {
                orderNo: opts.orderNo.toString(),
                suffix: opts.suffix,
                soCustCode: opts.soCustCode,
                archive: opts.soOrderStatus === "90"
            },
            success: opts.success
        });
    };

    $.cv.css.orders.saveOrderLineReceiptChanges = function (options) {
        var opts = $.extend({
            _objectKey: null,
            changes: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call("orders/SaveOrderLineReceiptChanges", {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.saveOrderLineDeleteBackOrderChanges = function (options) {
        var opts = $.extend({
            _objectKey: null,
            changes: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call("orders/SaveOrderLineDeleteBackOrderChanges", {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.getReceiptingLogLines = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: ""
        }, options);

        return $.cv.ajax.call("orders/GetReceiptingLogLines", {
            parameters: {
                soOrderNo: opts.orderNo,
                soBoSuffix: opts.soBoSuffix
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.orders.isOrderReceiptingAvailable = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call("orders/IsOrderReceiptingAvailable", {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orders.deleteOrder = function (options) {
        var opts = $.extend({
            _objectKey: null,
            success: $.noop
        }, options);

        return $.cv.ajax.call("orders/DeleteProntoOrder", {
            parameters: opts,
            success: opts.success
        });
    };
})(jQuery);
