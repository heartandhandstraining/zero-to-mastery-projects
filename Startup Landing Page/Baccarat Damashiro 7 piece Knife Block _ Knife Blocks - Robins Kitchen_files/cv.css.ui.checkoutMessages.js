
/* Name: checkout messages
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
*          /Scripts/widgets/cv.ui.mvvmwidget.js
*           --- CSS - OPTIONAL IF YOU WANT TO USE THESE ELEMENTS ---
*          /Scripts/widgets/cv.css.ui.pager2.js
* Params:  
*           dataSource: default:- [], the checkout message source for the list
*           autoBind: default:- true, tells the widget to fetch the data for the datasource, internal widgets contained within this widget should be set to false
*			useMultiLineConfirmations: default:- false, will display confirmation boxes for message requiring confirmations
*			useGlobalConfirmation: default:- true, will display a global confirmation checkbox to confirm all messages
*           listUpdated: default:- null, event that gets fired after the item list is bound, passes throught the current view count and the total data count
*			allUnconfirmed: default:- null, event fired when the global confirmation unconfirms all messages 
*			allConfirmed: default:- null, event fired when the global confirmation confirms all messages
*			widgetDataInitialised: default:- null, event fired when the data for the widget has been initialised
*           triggerMessages: default:- false, indicates if the widget will trigger a global message event
*           clearWidgetMessages: default:- true, indicates if old global messages will be cleared before new ones are displayed
*           pageable: default:- true, indicates if the datasource will be paged
*			pagerPosition: default:- "top", indicates the position of the pager in the default view, options: "top","bottom" or "both"
*			textConfirmMessagePrompt: default:- 'I confirm I have read this message', prompt for single messages or global confirmation when there is only one
*			textConfirmAllMessagesPrompt: default:- 'I confirm I have read all messages', prompt for global confirmation when there is more than one
*           textUnconfirmedCheckoutMessagesExist: default:- 'You have messages you need to confirm you have read', message displayed when there are messages that unconfirmed
*           viewTemplate: default:- null, when defined, view template text - if not defined, default view is used
*           itemTemplate: default:- '', when defined, assumed to be item template text. added to the widget under a generated id. Default to '' (not null or undefined) to ensure default item template is included in view
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        WIDGETDATAINTIALISED = "widgetDataInitialised",
        LISTUPDATED = "listUpdated",
        ALLUNCONFIRMED = "allUnconfirmed",
        ALLCONFIRMED = "allConfirmed",
        PROCEED = "proceed",
        CANCEL = "cancel",
        POSITIONBOTTOM = 'bottom',
        POSITIONTOP = 'top',
        POSITIONBOTH = 'both',
        PREORDERSUMBIT = $.Deferred();

    var checkoutMessagesWidget = {

        // Standard Variables

        // widget name
        name: "checkoutMessages",

        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            // viewModel flags
            autoBind: true,
            useMultiLineConfirmations: false,
            useGlobalConfirmation: true,
            getDataOnInit: false,
            // events
            listUpdated: null,
            allUnconfirmed: null,
            allConfirmed: null,
            widgetDataInitialised: null,
            // view flags
            triggerMessages: false,
            clearWidgetMessages: true,
            pageable: true,
            pagerPosition: POSITIONTOP,
            // view text defaults
            textConfirmMessagePrompt: "I confirm I have read this message",
            textConfirmAllMessagesPrompt: "I confirm I have read all messages",
            textUnconfirmedCheckoutMessagesExist: "You have messages you need to confirm you have read",
            // view Template
            viewTemplate: null,
            itemTemplate: ''
        },

        events: [DATABINDING, DATABOUND, WIDGETDATAINTIALISED, LISTUPDATED, ALLCONFIRMED, ALLUNCONFIRMED, CANCEL],

        initialise: function (el, o) {
            var widget = this;
            if (o.IS_MAF) {
                widget.onPageShow(function () {
                    if (widget.dataSource) {
                        _.each(widget.dataSource.data(), function (item) {
                            item.set('isConfirmed', false);
                        });
                    }
                });
            }
        },

        // MVVM Support

        viewModelBinding: function () {
            var widget = this;

            // Register Widget so we can determine when they are all completed loading
            $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadRegistration, { name: widget.name }); // MAF USE ONLY

            widget._PREORDERSUBMIT = PREORDERSUMBIT;
        },

        viewModelBound: function () {
            var widget = this;
            $.cv.css.addRemoveSubmitPromiseObjects("true", widget.name, PREORDERSUMBIT.promise());
            // called after the widget view is bound to the viewModel
            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.orderUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.preOrderSubmit, $.proxy(widget.viewModel.preOrderSubmit, widget.viewModel));
        },

        initDataSource: function () {
            var widget = this, initDeferred = $.Deferred(), orderDeferred = $.Deferred(), msgsDeferred = $.Deferred(), order = $.cv.css.localGetCurrentOrder(), ds = [];

            if (widget.options.getDataOnInit || widget.viewModel.get("isPreCheckout")) {
                widget.viewModel.set("isProcessing", true);
                // get local storage
                // if no local storage make dynamic service call
                var orderDeferred = $.Deferred();
                if (order == null) {
                    orderDeferred = $.cv.css.getCurrentOrder();
                } else {
                    orderDeferred.resolve();
                }
                $.when(orderDeferred).done(function () {
                    order = $.cv.css.localGetCurrentOrder();

                    // Rep's for example don't have orders... so bail so we don't break things
                    if (!$.cv.util.hasValue(order)) {
                        return;
                    }

                    var msgsDeferred = $.cv.css.orders.determineCheckoutMessages({ _objectKey: order._objectKey });
                    $.when(msgsDeferred).done(function (msg) {
                        if (!msg.errorMessage || msg.errorMessage.length == 0) {
                            ds = msg.data;
                            if (ds.length == 0) {
                                PREORDERSUMBIT.resolve();
                                $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                            }
                        }
                        else {
                            widget.viewModel.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                        }

                        var tmpCheckedOptions = _.map(widget.dataSource.data(),
                            function(item) {
                                return { rowID: item.RowID,
                                         isConfirmed: item.isConfirmed };
                        });

                        widget.setDataSource(ds);

                        if (widget.options.IS_MAF === true) {
                            _.each(widget.dataSource.data(),
                                function(item) {
                                    _.each(tmpCheckedOptions, function(old) {
                                        if (item.RowID == old.rowID) {
                                            item.set('isConfirmed', old.isConfirmed);
                                        }
                                    });
                                }
                            );
                        }

                        widget.viewModel.set('dataLoaded', true);
                        initDeferred.resolve();
                    });
                });
            } else {
                widget.setDataSource(ds);
                initDeferred.resolve();
            }
            $.when(initDeferred).done(function () {
                widget.viewModel.set("isProcessing", false);
                widget.trigger(WIDGETDATAINTIALISED, { viewCount: widget.viewModel.get("itemList").length, dataCount: widget.viewModel.get("dataCount"), hasMessagesRequiringConfirmation: widget.viewModel.get("hasMessagesRequiringConfirmation") });
            });
        },

        // private function
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var getHasMessageRequiringConfirmation = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                var hasMessageRequiringConfirmation = false;
                $.each(widget.dataSource.data(), function (idx, item) {
                    // if one message that is not confirmed is found set to false
                    if (item.RequiresUserConfirmation == 1) {
                        hasMessageRequiringConfirmation = true;
                    }
                });
                return hasMessageRequiringConfirmation;
            };
            var getAllConfirmed = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                var allCheckoutMessagesConfirmed = true;
                $.each(widget.dataSource.data(), function (idx, item) {
                    // if one message that is not confirmed is found set to false
                    if (item.RequiresUserConfirmation == 1 && (!item.isConfirmed || item.isConfirmed == undefined)) {
                        allCheckoutMessagesConfirmed = false;
                    }
                });
                return allCheckoutMessagesConfirmed;
            };

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                var allCheckoutMessagesConfirmed = true;
                $.each(widget.dataSource.view(), function (idx, item) {
                    // add standard commands
                    item.index = idx;
                    // default confirmation to false
                    if (item.RequiresUserConfirmation == 1 && !item.isConfirmed) {
                        item.isConfirmed = false;
                    }
                    if (widget.options.useMultiLineConfirmations) {
                        item.bind("change", function (e) {
                            if (e.field == "isConfirmed") {
                                // setting this will stop the update trigger for areAllCheckoutMessagesConfirmed from confirming or unconfirming all messages
                                viewModel.set("isSingleConfirmation", true);
                                viewModel.set("areAllCheckoutMessagesConfirmed", getAllConfirmed());
                                viewModel.set("isSingleConfirmation", false);
                            }
                        });
                    }
                });
                return widget.dataSource.view();
            };

            var viewModel = kendo.observable($.extend(self.options, {

                // Properties for UI elements
                isProcessing: false,

                isProceeding: false,

                isCancelling: false,

                isSingleConfirmation: false,

                isPreCheckout: false,

                updateViewModelFromDataSource: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("areAllCheckoutMessagesConfirmed", getAllConfirmed());
                    this.set("dataCount", widget.dataSource.data().length);
                    this.set("hasMessagesRequiringConfirmation", getHasMessageRequiringConfirmation());
                    widget.trigger(LISTUPDATED, { viewCount: dataView.length, dataCount: this.get("dataCount"), hasMessagesRequiringConfirmation: this.get("hasMessagesRequiringConfirmation") });
                },

                itemList: getDataView(),

                message: '',

                clearWidgetMessages: widget.options.clearWidgetMessages,

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                clearMessage: function () {
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'checkoutMessages', clearExisting: true });
                },

                dataCount: 0,

                dataLoaded: false,

                checkoutMessagesExist: function () {
                    return this.get("dataCount") > 0;
                },

                multipleCheckoutMessagesExist: function () {
                    return this.get("dataCount") > 1;
                },

                areAllCheckoutMessagesConfirmed: getAllConfirmed(),

                hasMessagesRequiringConfirmation: false,

                orderUpdated: function () {
                    this.set("isPreCheckout", false);
                    // for single page app this will make order reload after update
                    this.set("dataLoaded", false);
                    PREORDERSUMBIT = $.Deferred();
                    $.cv.css.addRemoveSubmitPromiseObjects("true", widget.name, PREORDERSUMBIT.promise());
                    widget.initDataSource();
                },

                preOrderSubmit: function () {
                    var vm = this;

                    this.set("isPreCheckout", true);
                    if (!widget.options.getDataOnInit && this.get('dataLoaded') === false)
                        widget.initDataSource();
                    else {
                        if (this.get("areAllCheckoutMessagesConfirmed")) {
                            PREORDERSUMBIT.resolve();
                            $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                        } else {
                            // BACKWARD COMPATIBILITY: following function only does something for mobile.
                            vm.preOrderSubmitFail();
                        }
                    }
                },

                preOrderSubmitFail: function () {
                    // BACKWARD COMPATIBILITY: Do nothing! Mobile overrides this.
                },

                confirmAllCheckoutMessages: function () {
                    if (this.get("areAllCheckoutMessagesConfirmed")) {
                        $.each(widget.dataSource.data(), function (idx, item) {
                            // set any unconfirmed messages to confirmed
                            if (item.RequiresUserConfirmation == 1 && (!item.isConfirmed || item.isConfirmed == undefined))
                                item.set("isConfirmed", true);
                        });
                        this.clearMessage();
                        widget.trigger(ALLCONFIRMED);
                    } else {
                        $.each(widget.dataSource.data(), function (idx, item) {
                            // set any already confirmed messages to unconfirmed
                            if (item.RequiresUserConfirmation == 1 && (item.isConfirmed || item.isConfirmed == undefined))
                                item.set("isConfirmed", false);
                        });
                        widget.trigger(ALLUNCONFIRMED);
                        this.setMessage(widget.options.textUnconfirmedCheckoutMessagesExist, $.cv.css.messageTypes.info);
                    }
                    $.cv.css.trigger($.cv.css.eventnames.checkoutMessages, { allCheckoutMessagesConfirmed: this.get("areAllCheckoutMessagesConfirmed") });
                },

                cancel: function() {
                    this.set("isProceeding", false);
                    this.set("isCancelling", true);
                    widget.trigger(CANCEL);
                },

                proceed: function () {
                    this.set("isCancelling", false);
                    if (this.get("areAllCheckoutMessagesConfirmed")) {
                        this.set("isProceeding", true);
                        $.cv.css.trigger(PROCEED);
                        if (this.get("isPreCheckout")) {
                            PREORDERSUMBIT.resolve();
                            $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                        }
                    }
                }

            }));

            viewModel.bind("change", function (e) {
                if (e.field == "areAllCheckoutMessagesConfirmed") {
                    // don't want single confirmation updates to confirm or unconfirm all message confirmations
                    if (!viewModel.get("isSingleConfirmation"))
                        viewModel.confirmAllCheckoutMessages();
                }
            });

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            widget._buildDefaultViewTemplate();
        },

        _buildDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            widget._buildDefaultPagerTopTemplate();
            widget._buildDefaultContentTemplate();
            widget._buildDefaultPagerBottomTemplate();
        },

        _buildDefaultContentTemplate: function () {
            var widget = this;
            var html = "<div class='cv-ui-element-content-area'>";
            if (widget.options.useGlobalConfirmation) {
                html += "<label for='checkout-message-confirmation-global'>";
                html += "<span data-bind='invisible: multipleCheckoutMessagesExist'>" + widget.options.textConfirmMessagePrompt + "</span>";
                html += "<span data-bind='visible: multipleCheckoutMessagesExist'>" + widget.options.textConfirmAllMessagesPrompt + "</span>";
                html += "</label>";
                html += "<input type='checkbox' id='checkout-message-confirmation-global' data-bind='checked: areAllCheckoutMessagesConfirmed' />";
            }
            // add the item template
            html += "<div class='itemList' data-bind='source: itemList' data-template='" + widget.options.itemTemplateId + "'></div>";
            html += "</div>";
            widget.viewTemplate += html;
        },

        // pager templates
        _buildDefaultPagerTopTemplate: function () {
            var widget = this;
            if (widget.options.pageable && (widget.options.pagerPosition == POSITIONBOTH || widget.options.pagerPosition == POSITIONTOP)) {
                widget._buildDefaultPagerTemplate();
            }
        },

        _buildDefaultPagerBottomTemplate: function () {
            var widget = this;
            if (widget.options.pageable && (widget.options.pagerPosition == POSITIONBOTH || widget.options.pagerPosition == POSITIONBOTTOM)) {
                widget._buildDefaultPagerTemplate();
            }
        },

        _buildDefaultPagerTemplate: function () {
            var widget = this;
            widget.viewTemplate += "<div data-role='pager' data-auto-bind='false' data-bind='source: dataSource'></div>";
        },

        _buildItemTemplateBody: function () {
            var widget = this;
            var html = "# if(index % 2 == 0) { #"
            html += "<div class='checkout-message odd-row'>";
            html += "# } else { #";
            html += "<div class='checkout-message even-row'>";
            html += "# } #";
            html += "<span data-bind='html: Message'></span>";
            if (widget.options.useMultiLineConfirmations) {
                html += "# if(RequiresUserConfirmation == 1) { #";
                html += "<span class='checkout-message-confirmation'>";
                html += "<input type='checkbox' id='checkout-message-confirmation#= RowID #' data-bind='checked: isConfirmed' />";
                html += "<label for='checkout-message-confirmation#= RowID #'>";
                html += widget.options.textConfirmMessagePrompt;
                html += "</label>";
                html += "</span>";
                html += "# } #";
            }
            html += "</div>";
            widget.itemTemplate += html;
        }

    };

    // register the widget
    $.cv.ui.widget(checkoutMessagesWidget);

})(jQuery);