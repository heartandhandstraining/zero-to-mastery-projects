/*
    See confluence page: http://confluence.commercevision.com.au/x/xob-B
*/

;
(function ($, undefined) {

    var LIST_UPDATED = "listUpdated",
        ORDER_LINES_RETRIEVED = "orderLinesRetrieved",
        NO_ORDER_LINES_RETRIEVED = "noOrderLinesRetrieved",
        SHOWING_ORDER = "showingOrder",
        INVOICE_REPRINT_REQUESTED = "invoiceReprintRequested",
		LINES_COPIED_TO_CART = "linesCopiedToCart";

    var orderSearchWidget = {

        // Standard Variables

        // widget name
        name: "orderSearch",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            recordsPerPage: 10,
            defaultStartOrderDateMonths: "3",
            orderStatusOptions: [{ value: "A", text: "All Orders" }, { value: "O", text: "Outstanding Orders" }, { value: "C", text: "Complete Orders" }, { value: "R", text: "Requiring Approvals" }],
            defaultOrderStatusSelected: "A",
            reprintInvoiceContact: "",
            // viewModel flags
            autoBind: true,
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,
            isLiveSearch: false,
            showOnlyUserOrders: true,
            searchOnLoad: true,
            refreshOnItemChange: false,
            forceCurrentCustomer: false,
            erpInvoiceReprintOutputFormatsDictionary: [],
            // view text defaults
            pageHeader: "Order Tracking",
            orderDetailPageHeader: "Your Order Details",
            noResultsMessage: "Your search returned no results",
            invoiceOrNumberEmpty: "Please enter a value for an invoice or order number",
            orderStatusIsEmpty: "Please select and order status",
            errorRetrievingResults: "There was an error retrieving your search results at this time, please try again later",
            invoiceReprintRequestSuccess: "This invoice has been requested for reprint, the request was sent to {0}",
            multipleInvoiceReprintRequestSuccess: "The invoices {0} have been requested for reprint, the request was sent to {1}",
            errorWithReprintFaxOrEmail: "Please enter either your Fax Number or valid email Address",
            errorRequestingReprint: "There was an error requesting your reprint at this time, please try again later",
            textProductsAddedMessage: "{0} products have been successfully copied to your current order",
            copyProductErrorMessage: "{0} : {1}",
            errorCopyingProducts: "There was an error copying your products at this time, please try again later",
            noLinesToCopy: "There are no lines with quantities to copy to your current order",
            errorConvertQuoteExpiredQuote: "The quote has expired and cannot be converted to your current order",
            textProductsAddedFromQuoteMessage: "{0} lines have been successfully copied from the quote to your current order",
            productsRemovedFromQuoteCopyMessage: "The following products are not valid and were not copied from the quote: {0}",
            errorCopyingProductsForQuote: "There was an error copying products from the quote at this time, please try again later",
            orderCannotBeFound: "Your requested order cannot be found",
            orderContainsNoLines: "This order has no lines to display"
        },

        extendEvents: [LIST_UPDATED, ORDER_LINES_RETRIEVED, NO_ORDER_LINES_RETRIEVED, SHOWING_ORDER, INVOICE_REPRINT_REQUESTED, LINES_COPIED_TO_CART],

        // MVVM Support

        viewModelBound: function () {
            // called after the widget view is bound to the viewModel
            var widget = this;
        },

        initDataSource: function () {
            var widget = this,
                vm = widget.viewModel,
                order = $.cv.util.queryStringValue("Order"),
                displayOrder = $.cv.util.queryStringValue("DisplayOrder");
            if ((order != null && order.length > 0) || (displayOrder != null && displayOrder.length > 0)) {
                var suffix = $.cv.util.queryStringValue("OrderSuffix") != null ? $.cv.util.queryStringValue("OrderSuffix") : "";
                vm.set("showingSearch", false);
                if (order != null && order.length > 0) {
                    vm.getOrder(order, suffix);
                } else {
                    vm.getOrder(displayOrder, suffix);
                }
            } else {
                vm.searchWithOptions();
            }
        },

        // private functions
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                $.each(widget.dataSource.view(), function (idx, item) {
                    // add standard commands
                    item.index = idx;
                    item.isShowingOrder = false;
                    item.requestInvoiceReprint = false;
                    item.showOrder = function () {
                        viewModel.showOrder(item);
                        viewModel.showApprovalStatusLines(item);
                        viewModel.showApprovalLogLines(item);
                    };
                    item.bind("change", function (e) {
                        if (e.field == "requestInvoiceReprint") {
                            widget.viewModel._invoiceReprintOrdersChanged();
                        }
                    });
                });
                return widget.dataSource.view();
            };

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements

                invoiceOrOrderNumber: "",

                reprintInvoiceContact: widget.options.reprintInvoiceContact,
                
                reprintInvoiceFileFormats: widget.options.erpInvoiceReprintOutputFormatsDictionary && widget.options.erpInvoiceReprintOutputFormatsDictionary.length > 0 
                                            ? widget.options.erpInvoiceReprintOutputFormatsDictionary : [],

                reprintInvoiceFileFormat: widget.options.erpInvoiceReprintOutputFormatsDictionary && widget.options.erpInvoiceReprintOutputFormatsDictionary.length > 0
                                            ? widget.options.erpInvoiceReprintOutputFormatsDictionary[0].value : "",

                reprintAvailable: true,

                invoiceReprintOrderString: "",

                orderStatus: widget.options.defaultOrderStatusSelected,

                orderStatusOptions: widget.options.orderStatusOptions,

                startOrderDate: new Date(new Date().setMonth(new Date().getMonth() - parseInt(widget.options.defaultStartOrderDateMonths))),

                endOrderDate: new Date(),

                today: new Date(),

                reference: "",

                productSearch: "",

                itemList: getDataView(),

                dataCount: 0,

                // UI Element state

                isProcessing: false,

                isSearchingInvoiceOrNumber: false,

                isSearchingWithOptions: false,

                isRequestingReprint: false,

                isCopyingToCurrentOrder: false,

                searchClicked: false,

                showingSearch: true,

                showingResults: false,

                showingOrderDetails: false,

                showingInvoiceReprint: false,

                hasInvoiceReprintOrders: false,

                hasMultipleInvoiceReprintOrders: false,

                reprintingAll: false,

                showInvoiceOrNumberValidationErrors: false,

                showSearchingWithOptionsValidationErrors: false,

                showInvoiceReprintValidationErrors: false,

                showQuoteConvert: false,

                showQuoteConvertExpiredAccept: false,
                
                orderDetailHeader: {},

                orderDetailLines: [],

                orderDocuments: [],

                hasOrderDocuments: function() {
                    return this.get("orderDocuments").length > 0;
                },

                approvalStatusLines: [],

                approvalLogLines: [],

                hasApprovalStatusLines: false,

                hasApprovalStatusLogs: false,

                // functions for UI events
                
                /*
                    This ensures the entered start date is not left empty
                */
                defaultStartOrderDate: function () {
                    if(this.get("startOrderDate") == null || this.get("startOrderDate").length == 0) {
                        this.set("startOrderDate", new Date(new Date().setMonth(new Date().getMonth() - parseInt(this.get("defaultStartOrderDateMonths")))));
                    }
                },

                /*
                    This ensures the entered end date is not left empty
                */
                defaultEndOrderDate: function () {
                    if (this.get("endOrderDate") == null || this.get("endOrderDate").length == 0) {
                        this.set("endOrderDate", this.get("today"));
                    }
                },

                /*
                    This updates the view after the data source changes
                */
                updateViewModelFromDataSource: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("dataCount", widget.dataSource.data().length);
                    widget.trigger(LIST_UPDATED, { viewCount: dataView.length, dataCount: this.get("dataCount") });
                    if (this.get("dataCount") > 0) {
                        this.setSearchProperties();
                        this.set("showingResults", true);
                    } else {
                        if (this.get("isSearchingInvoiceOrNumber") || this.get("isSearchingWithOptions")) {
                            $.cv.util.setMessage.apply(widget.viewModel, [this.get("noResultsMessage"), $.cv.css.messageTypes.info]);
                        }
                        this.set("showingResults", false);
                    }
                    this.set("isSearchingInvoiceOrNumber", false);
                    this.set("isSearchingWithOptions", false);
                },

                /*
                    This sets the display status of search based on the search button clicked
                */
                setSearchProperties: function (setSearchMethod) {
                    this.set("showInvoiceOrNumberValidationErrors", false);
                    this.set("showSearchingWithOptionsValidationErrors", false);
                    if(setSearchMethod != undefined)
                        this.set(setSearchMethod, true);
                },

                /*
                    This returns the default order search values
                */
                getSearchDefaults: function () {
                    var searchDefaults = {
                        liveSearch: this.get("isLiveSearch"),
                        onlySearchCurrentUser: this.get("showOnlyUserOrders"),
                        forwardOrderSearch: false,
                        completedOrders: false,
                        forceCurrentCustomer: this.get("forceCurrentCustomer"),
                        pageSize: this.get("recordsPerPage"),
                        take: this.get("recordsPerPage"),
                        serialnum: '',
                        startDeliveryDate: null,
                        endDeliveryDate: null,
                        invnum: "",
                        status: "",
                        startorderdate: kendo.toString(this.get("startOrderDate"), "dd/MM/yyyy"),
                        endorderdate: kendo.toString(this.get("endOrderDate"), "dd/MM/yyyy"),
                        reference: "",
                        productsearch: "",
                        success: function (e) {
                            console.log("success");
                        }
                    }
                    return searchDefaults;
                },

                /*
                    This returns the validity of the input invoice or order number
                */
                isInvoiceOrNumberValid: function () {
                    if (this.get("showInvoiceOrNumberValidationErrors")) {
                        return this.get("invoiceOrOrderNumber").length > 0;
                    } else {
                        return true;
                    }
                },

                /*
                    This returns the validity of the selected search status
                */
                isOrderStatusValid: function () {
                    if (this.get("showSearchingWithOptionsValidationErrors")) {
                        return this.get("orderStatus").length > 0;
                    } else {
                        return true;
                    }
                },

                /*
                    This returns the validity of the selected search options
                    ** Note ** the checking of the dates has not been included here as the idea is to use the built in kendo date picker widget that handles this
                */
                isSearchOptionsValid: function () {
                    var valid = true;
                    if (!this.isOrderStatusValid()) {
                        valid = false;
                        $.cv.util.setMessage.apply(widget.viewModel, [this.get("orderStatusIsEmpty"), $.cv.css.messageTypes.error]);
                        widget.setDataSource([]);
                    } else {
                    }
                    return valid;
                },

                /*
                    This performs the search when searching by invoice or order number and overrides the search defaults with relevant search value
                */
                searchInvoiceOrNumber: function () {
                    var _this = this;
                    _this.setSearchProperties("isSearchingInvoiceOrNumber");
                    this.set("showInvoiceOrNumberValidationErrors", true);
                    if (_this.isInvoiceOrNumberValid()) {
                        _this.search(_.extend(_this.getSearchDefaults(), { invnum: _this.get("invoiceOrOrderNumber") }), "isSearchingInvoiceOrNumber");
                    } else {
                        $.cv.util.setMessage.apply(widget.viewModel, [_this.get("invoiceOrNumberEmpty"), $.cv.css.messageTypes.error]);
                        _this.set("isSearchingInvoiceOrNumber", false);
                        widget.setDataSource([]);
                    }
                },

                /*
                    This performs the search when searching with options and overrides the search defaults with relevant search option values
                */
                searchWithOptions: function () {
                    this.setSearchProperties("isSearchingWithOptions");
                    this.set("showSearchingWithOptionsValidationErrors", true);
                    if (this.isSearchOptionsValid()) {
                        this.search(_.extend(this.getSearchDefaults(), {
                            status: this.get("orderStatus"),
                            startorderdate: kendo.toString(this.get("startOrderDate"), "dd/MM/yyyy"),
                            endorderdate: kendo.toString(this.get("endOrderDate"), "dd/MM/yyyy"),
                            reference: this.get("reference"),
                            productsearch: this.get("productSearch")
                        }), "isSearchingWithOptions");
                    } else {
                        this.set("isSearchingWithOptions", false);
                    }
                },

                /*
                    This will get the order passed in via parameters, the access to the order is handled server side
                */
                getOrder: function (orderNumber, orderSuffix) {
                    var vm = this;
                    $.cv.util.clearNotifications(vm);
                    vm.set("showingResults", false);
                    vm.set("isSearchingInvoiceOrNumber", true);
                    vm.set("invoiceOrOrderNumber", orderNumber + orderSuffix);
                    $.cv.css.getOrder({ orderNo: orderNumber + orderSuffix }).done(function (msg) {
                        if (msg.data && msg.data.length > 0) {
                            vm.showOrder(msg.data[0]);
                        } else {
                            $.cv.util.notify(widget.viewModel, vm.get("orderCannotBeFound"), $.cv.css.messageTypes.error);
                        }
                        vm.set("isSearchingInvoiceOrNumber", false);
                    }).fail(function () {
                        $.cv.util.notify(widget.viewModel, vm.get("errorRetrievingResults"), $.cv.css.messageTypes.error);
                        vm.set("isSearchingInvoiceOrNumber", false);
                    });
                },

                /*
                    This binds the data source to the search service and performs the search
                */
                search: function (searchOptions, setSearchMethod) {
                    var _this = this, data = [];
                    $.cv.util.clearMessage.apply(widget.viewModel);
                    _this.set("showingResults", false);
                    widget.setDataSource($.cv.data.dataSource({
                        method: "orders/search", params: searchOptions, pageSize: widget.options.recordsPerPage
                    }));
                },

                /*
                    This gets the lines for the order clicked then sets the display status to showing the order detail
                */
                showOrder: function (item) {
                    var vm = this;
                    if (item["isShowingOrder"] != undefined) {
                        item.set("isShowingOrder", true);
                    }

                    _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                    $.cv.css.getOrderLines({ orderNo: item.SoOrderNo, suffix: item.SoBoSuffix, liveOrder: vm.get("isLiveSearch") }).done(function (msg) {
                        // Get order detail and set on current order
                        
                        if (msg.data && msg.data.length > 0) {
                            widget.trigger(ORDER_LINES_RETRIEVED, { lines: msg.data });
                            vm.set("orderDetailHeader", item);
                            vm.set("reprintAvailable", !isNaN(item.SoOrderStatus) && parseInt(item.SoOrderStatus) >= 80 && item.SoOrderStatus <= 90);
                            vm.set("orderDetailLines", msg.data);
                            vm.set("showingSearch", false);
                            vm.set("showingResults", false);
                            vm.set("showingOrderDetails", true);
                            vm.showQuoteConvertButton();
                            widget.trigger(SHOWING_ORDER);
                        } else {
                            widget.trigger(NO_ORDER_LINES_RETRIEVED);
                            $.cv.util.notify(widget.viewModel, vm.get("orderContainsNoLines"), $.cv.css.messageTypes.error);
                        }
                        if (item["isShowingOrder"] != undefined) {
                            item.set("isShowingOrder", false);
                        }
                    });

                    // Get the documents on the order.
                    vm.set("orderDocuments", []);

                    $.cv.css.orders.getOrderDocuments({ orderNo: item.SoOrderNo, suffix: item.SoBoSuffix }).done(function (msg) {
                        if (msg.data && $.isArray(msg.data)) {
                            vm.set("orderDocuments", msg.data);
                        }
                    });
                },

                /*
                    This gets the Approval Records for the order 
                */
                showApprovalStatusLines: function (item) {
                    var vm = this;
                    $.cv.css.getSalesOrderApprovals({ orderNo: item.SoOrderNo }).done(function (msg) {
                        if (msg.data && msg.data.length > 0) {
                            vm.set("approvalStatusLines", msg.data);
                            vm.set("hasApprovalStatusLines", true);
                        } else {
                            vm.set("hasApprovalStatusLines", false);
                        }
                    });
                },

                /*
                    This gets the Approval Log Records for the order 
                */
                showApprovalLogLines: function (item) {
                    var vm = this;
                    $.cv.css.getSalesOrderApprovalLogs({ orderNo: item.SoOrderNo }).done(function (msg) {
                        if (msg.data && msg.data.length > 0) {
                            vm.set("approvalLogLines", msg.data);
                            vm.set("hasApprovalStatusLogs", true);
                        } else {
                            vm.set("hasApprovalStatusLogs", false);
                        }
                    });
                },

                /*
                    This shows button for when can convert a quote's items to current order
                */
                showQuoteConvertButton: function () {
                    var _this = this, order = _this.get("orderDetailHeader");

                    _this.set("showQuoteConvert", false);

                    // Only show with below conditions
                    if(widget.options.enableQuoteConversionToOrderInOrderSearch && order.SoOrderStatus == "02") { // i.e. is a quote
                        if(!widget.options.enableExpiredQuotesConversionToOrdersInOrderSearch 
                            && order.SoDeliveryDate
                            && $.cv.util.toDate(order.SoDeliveryDate) < (new Date())) {
                            return;
                        }

                        _this.set("showQuoteConvert", true);
                    }
                },

                /*
                    This hides the message, in response to cancel click, that is shown prompting user to accept or cancel the convert a quote's items to current order when it has expired.
                */
                cancelConvertQuote: function () {
                    var _this = this;
                    _this.set("showQuoteConvertExpiredAccept", false);
                },

                /*
                    This hides the message, in response to accpet click and converts the quote, that is shown prompting user to accept or cancel the convert a quote's items to current order when it has expired.
                */
                acceptExpiredConvertQuote: function () {
                    var _this = this;
                    _this.set("showQuoteConvertExpiredAccept", false);
                    _this.convertQuoteOnServer();
                },

                /*
                    This handles initial button click to converts items of quote order being viewed to current order
                */
                convertQuote: function() {
                    var _this = this, order =_this.get("orderDetailHeader");

                    if (widget.options.enableQuoteConversionToOrderInOrderSearch && order.SoOrderStatus == "02") { // i.e. is a quote
                        if(order.SoDeliveryDate && $.cv.util.toDate(order.SoDeliveryDate) < (new Date())) {
                            if (!widget.options.enableExpiredQuotesConversionToOrdersInOrderSearch) {
                                $.cv.util.notify(widget.viewModel, _this.get("errorConvertQuoteExpiredQuote"), $.cv.css.messageTypes.error);
                                return;
                            } else {
                                _this.set("showQuoteConvertExpiredAccept", true);
                                return;
                            }
                        }

                        _this.convertQuoteOnServer();
                    }
                },

                /*
                    This handles converting items of quote order being viewed to current order on server. Similar to copying search results order to current order but special quote handling.
                */
                convertQuoteOnServer: function () {
                    var _this = this,
                        lines = _.filter(this.get("orderDetailLines"), function (line) { return line.StockCode.length > 0 && line.OrderedQty > 0; }),
                        showGenericError = false,
                        order = _this.get("orderDetailHeader"),
                        clearExistingMessages = _this.get("clearExistingMessages");

                    _this.set("isCopyingToCurrentOrder", true);

                    if (lines.length > 0) {
                        $.cv.css.orders.copySearchResultQuoteToCurrentOrder({ soOrderNo: order.SoOrderNo, soBoSuffix: order.SoBoSuffix }).done(function (msg) {

                            if(msg.data) {
                                if(msg.errorMessage == null) {
                                    if(msg.data.success) {
                                        widget.trigger(LINES_COPIED_TO_CART, { lines: lines });
                                        $.cv.css.trigger($.cv.css.eventnames.refreshOrderData);
                                        $.cv.util.notify(widget.viewModel, _this.get("textProductsAddedFromQuoteMessage").format(msg.data.countLinesAdded), $.cv.css.messageTypes.success);
                                    } else
                                        $.cv.util.notify(widget.viewModel, msg.data.message, $.cv.css.messageTypes.error);

                                    if(msg.data.removedProducts.length > 0)
                                        $.cv.util.notify(widget.viewModel, _this.get("productsRemovedFromQuoteCopyMessage").format(msg.data.removedProducts.join(", ")), $.cv.css.messageTypes.error);
                                } else
                                    showGenericError = true;
                            } else
                                showGenericError = true;

                        }).fail(function () {
                            showGenericError = true;
                        });

                        if (showGenericError) {
                            _this.set("clearExistingMessages", false);
                            $.cv.util.notify(widget.viewModel, _this.get("errorCopyingProductsForQuote"), $.cv.css.messageTypes.error);
                            _this.set("clearExistingMessages", clearExistingMessages);
                        }
                    } else 
                        $.cv.util.notify(widget.viewModel, _this.get("noLinesToCopy"), $.cv.css.messageTypes.info);
                    
                    _this.set("isCopyingToCurrentOrder", false);
                },

                /*
                    This sets the display status of order search screen to show the order search section (hides the order detail)
                */
                backToResults: function () {
                    var redirect = $.cv.util.queryStringValue("R");
                    if (redirect == null) {
                        this.set("showingSearch", true);
                        this.set("showingResults", true);
                        this.set("showingOrderDetails", false);
                        this.set("showQuoteConvert", false);
                        this.hideInvoiceReprint();
                        this.set("orderDetail", {});
                    } else {
                        if (redirect.toLowerCase() == "account.aspx") {
                            history.back();
                        } else {
                            $.cv.util.redirect(redirect, {}, false);
                        }
                    }
                },

                /*
                    This sets the display status of invoice reprint to true
                */
                showInvoiceReprint: function () {
                    if (this.get("showingOrderDetails")) {
                        this.set("showingInvoiceReprint", true);
                    } else {
                        if (this.get("hasInvoiceReprintOrders")) {
                            this.set("showingInvoiceReprint", true);
                        }
                    }
                },

                /*
                    This sets the display status of invoice reprint to false
                */
                hideInvoiceReprint: function () {
                    this.set("showingInvoiceReprint", false);
                },

                /*
                    This returns the validity of the invoice reprint contact based on the regex string passed in
                */
                testRegEx: function (regExString) {
                    var reprintInvoiceContact = this.get("reprintInvoiceContact");
                    return $.cv.util.testRegEx(regExString, reprintInvoiceContact, false);
                },

                /*
                    This returns the validity of the fax for invoice reprint
                */
                isReprintValidFax: function () {
                    var reprintInvoiceContact = this.get("reprintInvoiceContact");
                    reprintInvoiceContact = reprintInvoiceContact.replace(/\(/g, "")
                                                                 .replace(/\)/g, "")
                                                                 .replace(/\s/g, "");
                    this.set("reprintInvoiceContact", reprintInvoiceContact);
                    return this.testRegEx(/^\+?[0-9]{10,}$/);
                },

                /*
                    This returns the validity of the email for invoice reprint
                */
                isReprintValidEmail: function () {
                    return this.testRegEx(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                },

                /*
                    This returns the validity of the fax or email for invoice reprint
                */
                isReprintFaxOrEmailValid: function () {
                    return ((this.isReprintValidFax() || this.isReprintValidEmail()) && this.get("showInvoiceReprintValidationErrors")) || !this.get("showInvoiceReprintValidationErrors");
                },

                /*
                    This updates the hasInvoiceReprintOrders property
                */
                _invoiceReprintOrdersChanged: function () {
                    var reprintOrders = this._getInvoiceReprintOrders();
                    this.set("hasInvoiceReprintOrders", reprintOrders.length > 0);
                    this.set("hasMultipleInvoiceReprintOrders", reprintOrders.length > 1);
                    var invoiceReprintOrderString = "";
                    $.each(reprintOrders, function (idx, item) {
                        invoiceReprintOrderString += invoiceReprintOrderString.length > 0 ? ", " : "";
                        invoiceReprintOrderString += item.SoOrderNo + (item.SoBoSuffix.length > 0 ? " " : "") + item.SoBoSuffix;
                    })
                    this.set("invoiceReprintOrderString", invoiceReprintOrderString);
                },

                /*
                    This returns an array of orders marked for invoice reprint
                */
                _getInvoiceReprintOrders: function () {
                    return _.filter(this.get("itemList"), function (item) { return item.requestInvoiceReprint; });
                },

                /*
                    This returns an array of batchData required for the multi invoice reprint request
                */
                _getInvoiceReprintOrderOpts: function () {
                    var vm = this,
                        reprintOrders = this._getInvoiceReprintOrders(),
                        batchData = [];
                    $.each(reprintOrders, function (idx, item) {
                        batchData.push({
                            orderNo: item.SoOrderNo,
                            suffix: item.SoBoSuffix,
                            reprintTo: vm.get("reprintInvoiceContact"),
                            outputFormat: vm.get("reprintInvoiceFileFormat"),
                            batchGroupID: ""
                        });
                    });
                    return batchData;
                },

                /*
                    This sets requestInvoiceReprint on all complete orders in the item list
                */
                reprintAll: function () {
                    var itemList = this.get("itemList"),
                        reprintingAll = !this.get("reprintingAll");
                    $.each(itemList, function (idx, item) {
                        if (item.IsOrderStatusComplete) {
                            item.set("requestInvoiceReprint", reprintingAll);
}
                    });
                    this.set("reprintingAll", reprintingAll);
                },

                /*
                    Calling this calls the set invoice reprint service if a valid fax or email is entered
                */
                reprintInvoice: function () {
                    var _this = this, order = _this.get("orderDetailHeader");
                    _this.set("isRequestingReprint", true);
                    _this.set("showInvoiceReprintValidationErrors", true);

                    if (!this.isReprintFaxOrEmailValid()) {
                        _this.set("triggerMessages", false);
                        $.cv.util.setMessage.apply(widget.viewModel, [_this.get("errorWithReprintFaxOrEmail"), $.cv.css.messageTypes.error]);
                        _this.set("isRequestingReprint", false);
                        _this.set("triggerMessages", widget.options.triggerMessages);
                    } else {
                        if (_this.get("showingOrderDetails")) {
                            _this._reprintSingleInvoice({ orderNo: order.SoOrderNo, suffix: order.SoBoSuffix, reprintTo: _this.get("reprintInvoiceContact"), outputFormat: _this.get("reprintInvoiceFileFormat"), batchGroupID: "" });
                        } else {
                            if (_this.get("hasInvoiceReprintOrders")) {
                                _this._reprintMultipleInvoices({ batchData: _this._getInvoiceReprintOrderOpts() });
                            } else {
                                return; // nothing to request
                            }
                        }
                    }
                },

                /*
                    Calling this calls the set invoice reprint service for a single order
                */
                _reprintSingleInvoice: function (opts) {
                    var _this = this;
                    $.cv.css.orders.setInvoiceReprint(opts)
                        .done(function (msg) {
                            _this.set("triggerMessages", false);
                            var isInvReqd = false;

                            if (arguments[0].data.result == "true") {
                                $.cv.util.setMessage.apply(widget.viewModel, [_this.get("invoiceReprintRequestSuccess").format(_this.get("reprintInvoiceContact")), $.cv.css.messageTypes.success]);
                                _this.set("reprintInvoiceContact", "");
                                isInvReqd = true;
                            }
                            else {
                                var errMsgObj = arguments[0].data.errMsg,
                                    errMsg = errMsgObj && errMsgObj.length > 0
                                                ? errMsgObj
                                                : _this.get("invoiceReprintRequestSuccess").format(_this.get("reprintInvoiceContact"));

                                $.cv.util.setMessage.apply(widget.viewModel, [errMsg, $.cv.css.messageTypes.error]);
                            }

                            _this.set("showInvoiceReprintValidationErrors", false);
                            _this.set("isRequestingReprint", false);
                            _this.set("triggerMessages", widget.options.triggerMessages);

                            if (isInvReqd)
                                widget.trigger(INVOICE_REPRINT_REQUESTED);

                        }).fail(function () {
                            _this.set("triggerMessages", false);
                            $.cv.util.setMessage.apply(widget.viewModel, [_this.get("errorRequestingReprint"), $.cv.css.messageTypes.error]);
                            _this.set("showInvoiceReprintValidationErrors", false);
                            _this.set("isRequestingReprint", false);
                            _this.set("triggerMessages", widget.options.triggerMessages);
                        });
                },

                /*
                                    Calling this calls the set invoice reprint service for a single order
                                */
                _reprintMultipleInvoices: function (opts) {
                    var vm = this;
                    $.cv.css.orders.setInvoiceReprintBulk(opts)
                        .done(function (msg) {
                            var data = msg.data,
                                successfulOrders = _.filter(data, function (item) { return item.result; }),
                                unsuccessfulOrders = _.filter(data, function (item) { return !item.result; }),
                                successfulOrdersString = "",
                                message = "";

                            vm.set("triggerMessages", false);

                            if (successfulOrders.length > 0) {
                                $.each(successfulOrders, function (idx, item) {
                                    successfulOrdersString += successfulOrdersString.length > 0 ? ", " : "";
                                    successfulOrdersString += opts.batchData[idx].orderNo + (opts.batchData[idx].suffix.length > 0 ? " " : "") + opts.batchData[idx].suffix;
                                });

                                message = vm.get("multipleInvoiceReprintRequestSuccess").format(successfulOrdersString, vm.get("reprintInvoiceContact"));

                                vm.set("reprintInvoiceContact", "");
                            }

                            if (unsuccessfulOrders.length > 0) {
                                $.each(unsuccessfulOrders, function (idx, item) {
                                    if (message.length == 0) {
                                        message = opts.batchData[idx].orderNo + (opts.batchData[idx].suffix.length > 0 ? " " : "") + opts.batchData[idx].suffix + ": " + item.errMsg;
                                    } else {
                                        message += "<div>" + opts.batchData[idx].orderNo + (opts.batchData[idx].suffix.length > 0 ? " " : "") + opts.batchData[idx].suffix + ": " + item.errMsg + "</div>";
                                    }
                                });
                            }

                            $.cv.util.setMessage.apply(widget.viewModel, [message, $.cv.css.messageTypes.success]);

                            vm.set("showInvoiceReprintValidationErrors", false);
                            vm.set("isRequestingReprint", false);
                            vm.set("triggerMessages", widget.options.triggerMessages);

                            if (successfulOrders.length > 0) {
                                widget.trigger(INVOICE_REPRINT_REQUESTED);
                            }

                        }).fail(function () {
                            vm.set("triggerMessages", false);
                            $.cv.util.setMessage.apply(widget.viewModel, [vm.get("errorRequestingReprint"), $.cv.css.messageTypes.error]);
                            vm.set("showInvoiceReprintValidationErrors", false);
                            vm.set("isRequestingReprint", false);
                            vm.set("triggerMessages", widget.options.triggerMessages);
                        });
                },

                /*
                    This gets the product details from a line required for the add to order service
                */
                getProductParams: function(line) {
                    var params = {};
                    params.productCode = line.StockCode;
                    params.quantity = line.OrderedQty;
                    params.costCentre = line.CostCentreCode;
                    params.notes = line.ExtendedLineDescription;
                    params.noteIsExtendedLineDescription = true;
                    return params;
                },

                /*
                    Calling this function will take the lines from the current order detail view and copy them to the users current order.
                    I will display any error messages that come back from attempting to add products that are no longer orderable
                */
                copyToCurrentOrder: function () {
                    var _this = this,
                        lines = _.filter(this.get("orderDetailLines"), function (line) { return line.StockCode.length > 0 && line.OrderedQty > 0 && line.LineType != "SC"; }),
                        productParams = [],
                        linesAdded = "",
                        errorMessages = [],
                        clearExistingMessages = this.get("clearExistingMessages"),
                        productParams = [],
                        localUpdatedCurrentOrderLines = {},
                        localCurrentOrderLines,
                        linesCopiedSucessfully = 0;

                    _this.set("isCopyingToCurrentOrder", true);
                    if (lines.length > 0) {
                        $.each(lines, function (idx, line) {
                            productParams.push(_this.getProductParams(line));
                        });

                        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                        $.cv.css.orders.addToCurrentOrderBulk({
                            batchData: productParams,
                            triggerGetLines: false
                        }).done(function (response) {
                            $.each(lines, function (idx, line) {
                                var responseData = response.data[idx];

                                if (response.errorMessage[idx] == null &&
                                    responseData != null &&
                                    responseData.editOrderOk === true) {
                                    linesAdded = linesAdded.length == 0 ? line.StockCode : linesAdded + ", " + line.StockCode;
                                    linesCopiedSucessfully++;
                                } else {
                                    if (response.errorMessage[idx] != null) {
                                        errorMessages.push({
                                            productCode: line.StockCode,
                                            errorMessage: response.errorMessage[idx]
                                        });
                                    } else if (responseData != null && responseData.message != '') {
                                        errorMessages.push({
                                            productCode: line.StockCode,
                                            errorMessage: responseData.message
                                        });
                                    }
                                }
                            });

                            widget.trigger(LINES_COPIED_TO_CART, { lines: lines });

                            if (linesAdded.length > 0) {
                                $.cv.util.setMessage.apply(widget.viewModel, [_this.get("textProductsAddedMessage").format(linesCopiedSucessfully, linesAdded), $.cv.css.messageTypes.success]);
                            }

                            if (errorMessages.length > 0) {
                                _this.set("clearExistingMessages", false);
                                $.each(errorMessages, function (idx, item) {
                                    $.cv.util.setMessage.apply(widget.viewModel, [_this.get("copyProductErrorMessage").format(item.productCode, item.errorMessage), $.cv.css.messageTypes.error]);
                                });
                                _this.set("clearExistingMessages", clearExistingMessages);
                            }
                            _this.set("isCopyingToCurrentOrder", false);
                        }).fail(function () {
                            $.cv.util.setMessage.apply(widget.viewModel, [_this.get("errorCopyingProducts"), $.cv.css.messageTypes.error]);
                            _this.set("isCopyingToCurrentOrder", false);
                        });
                    } else {
                        _this.set("isCopyingToCurrentOrder", false);
                        $.cv.util.setMessage.apply(widget.viewModel, [_this.get("noLinesToCopy"), $.cv.css.messageTypes.info]);
                    }
                }

            }));

            viewModel.bind("change", function (e) {
                if (e.field == "startOrderDate") {
                    viewModel.defaultStartOrderDate();
                }
                if (e.field == "endOrderDate") {
                    viewModel.defaultEndOrderDate();
                }
                if (e.field == "reprintInvoiceContact" && !viewModel.get("isRequestingReprint")) {
                    $.cv.util.clearMessage.apply(widget.viewModel);
                }
                if (e.field == "showingSearch" || e.field == "showingResults" || e.field == "showingOrderDetails" || e.field == "showingInvoiceReprint") {
                    $.cv.util.clearMessage.apply(widget.viewModel);
                }
            });

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            // future widgets will not use view templates
        }

    };

    // register the widget
    $.cv.ui.widget(orderSearchWidget);

})(jQuery);