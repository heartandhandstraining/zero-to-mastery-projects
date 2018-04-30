/* Name: promotional code
* Author: Aidan Thomas
* Created: 20130418 
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/cv.util.js
*          /Scripts/cv.css.orders.js
* Params:  
*           dataSource: 
*           autoBind: 
*           listUpdated: event to call once the list of promotion codes applied to the order has been updated
*           triggerMessages: triggers messages so that can be picked up by the messages widget (it will still set the widget internal message)
*           clearWidgetMessages: determines if global messages fired off by this widget should be cleared before displaying the new messages
*           textApplyPromotionCodeFailed: message displayed when the apply promo code dynamic service fails
*           textPromotionCodeSuccessfullyRemoved: message displayed when a promotion code has successfully been removed
*           textRemovePromotionCodeFailed: message displayed when the remove promo code dynamic service fails
*           textApplyPromotionalCodePrompt: text that appears on the apply button in the default view template
*           textRemovePromotionalCodePrompt: text that appears on the remove button in the default view template
*           viewTemplate: kendo template id for the main view
*           itemViewTemplate: kendo template id for each item
*/

;

(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        LISTUPDATED = "listUpdated",
        LOCATIONNONE = "None",
        LOCATIONTOP = "Top",
        LOCATIONBOTTOM = "Bottom",
        LOCATIONTOPANDBOTTOM = "TopAndBottom";


    var promotionalCodesWidget = {

        // Standard Variables

        // widget name
        name: "promotionalCodes",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            promoCodeFailedMessageType: $.cv.css.messageTypes.error,
            // viewModel flags
            autoBind: true,
            // events
            listUpdated: '',
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,
            // view text defaults
            textApplyPromotionCodeFailed: 'Failed to apply the promotion code',
            textPromotionCodeSuccessfullyRemoved: 'Promotion code successfully removed',
            textRemovePromotionCodeFailed: 'Failed to remove the promotion code',
            textApplyPromotionalCodePrompt: 'Apply',
            textRemovePromotionalCodePrompt: 'Remove',
            textPromotionCodeNowValid: 'Promotion code: {0} ({1}) now valid',
            textPromotionCodeNowInValid: 'Promotion code: {0} ({1}) now invalid',
            // widget settings
            promotionalCodeEntryLocation: "Top",
            // view Template
            viewTemplate: null, // TODO: Treat these as IDs, remove the last one.
            itemViewTemplate: null,
            inclusive: null, // null = default (show both product inclusive and exclusive promo codes), true = inclusive only, false = exclusive only

            gtmSuccessEventname: '',
            gtmFailEventname: ''
        },

        events: [DATABINDING, DATABOUND, LISTUPDATED],

        viewModel: null,

        view: null,

        // MVVM Support

        // private property
        _viewAppended: false,
        _itemViewAppended: false,


        // Standard Methods
        initialise: function (el, o) {

            var widget = this;

            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                // setup grid view
                widget._viewAppended = true;
                if (!widget.options.itemViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.itemViewTemplate = widget.name + "-item-template-" + kendo.guid();
                    widget._itemViewAppended = true;
                }
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                // add the itemView (not parsed)
                if (widget._itemViewAppended) {
                    widget.view += widget._getDefaultItemViewTemplate();
                }
                widget.element.html(widget.view);
            }
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);
            widget.trigger(DATABOUND);
            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.orderUpdated, widget.viewModel));
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

        // private function
        _getViewModel: function () {
            var widget = this;

            // initialise the datasource
            var initDataSource = function () {
                if (widget.options.dataSource.length == 0) {
                    var d1 = $.Deferred();
                    if (viewModel.get("order") == null) {
                        // if no order in set on the view model call the get order dynamic service (the order on the view model defaults to what is is storage)
                        // if the local storage is empty get it from the server
                        $.cv.css.unifyPromiseOrValue($.cv.css.localGetCurrentOrder(true), function() {
                            d1.resolve();
                        });
                    } else {
                        d1.resolve();
                    }
                    $.when(d1).done(function () {
                        var order = $.cv.css.localGetCurrentOrder();
                        // store the order into the view model
                        viewModel.set('order', order);

                        if (order != null) {
                            // Set the view model datasource to the array of promotional codes on the order
                            widget.options.dataSource = order.PromotionalCodes;

                            if (widget.options.currentDataSource != undefined) {
                                // see if the status of any of the promotional codes on the order has changed now the order has updated, display message accordingly
                                $.each(widget.options.dataSource, function (idx, item) {
                                    $.each(widget.options.currentDataSource, function (idx2, item2) {
                                        if (item.PromotionCode == item2.PromotionCode && item.IsValidOnCurrentOrder != item2.IsValidOnCurrentOrder) {
                                            if (item.IsValidOnCurrentOrder)
                                                viewModel.setMessage(widget.options.textPromotionCodeNowValid.format(item.PromotionCode, item.Description), $.cv.css.messageTypes.success);
                                            else
                                                viewModel.setMessage(widget.options.textPromotionCodeNowInValid.format(item.PromotionCode, item.Description), $.cv.css.messageTypes.error);
                                        }
                                    });
                                });
                            }
                            widget.options.currentDataSource = widget.options.dataSource;
                            setDataSource();
                        }
                    });
                }
                else
                    setDataSource();
            }

            var setDataSource = function () {
                // create kendo data source
                widget.dataSource = new kendo.data.DataSource({
                    data: widget.options.dataSource
                });

                if (widget.options.autoBind) {
                    widget.dataSource.fetch();
                }
                // update the list of promotion codes on the view model
                viewModel.updateItemList();
            }

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                var array = [];
                $.each(widget.dataSource.view(), function (idx, item) {
                    // add standard commands
                    item.Index = idx;
                    item.isRemoving = false;
                    // create a destroy command on each promotion code in the list of promotion codes on the order, this will allow removal of individual promotion codes
                    item.execCommand_destroy = function () {
                        item.set("isRemoving", true);
                        // remove the promo code
                        var d1 = $.cv.css.orders.removePromoCode({ _objectKey: viewModel.get("order")._objectKey, promoCode: item.PromotionCode });
                        $.when(d1).done(function (data) {
                            // remove the promo code from the kendo datasource
                            widget.dataSource.remove(item);
                            $.cv.css.trigger($.cv.css.eventnames.promoCodeRemoved, { promoCode: item.PromotionCode });
                            // reload the order
                            d2 = $.cv.css.getCurrentOrder();
                            $.when(d2).done(function (data) {
                                viewModel.clearMessage();
                                viewModel.setMessage(widget.options.textPromotionCodeSuccessfullyRemoved, $.cv.css.messageTypes.success);
                                // trigger the order changed event so widgets can pick up the change, including this widget
                                $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                                item.set("isRemoving", false);
                            });
                            //this.parent().parent().updateItemList();
                        }).fail(function (msg) {
                            //msg = JSON.parse(msg.errorMesage);
                            viewModel.clearMessage();
                            viewModel.setMessage(widget.options.textRemovePromotionCodeFailed, $.cv.css.messageTypes.error);
                            item.set("isRemoving", false);
                        });
                    }
                    array.push(item);
                });
                return array;
            }

            var viewModel = kendo.observable({

                // Properties for UI elements
                order: $.cv.css.localGetCurrentOrder(),

                promotionCode: '',

                usePromotionCodes: widget.options.promotionalCodeEntryLocation == LOCATIONNONE ? false : true,

                dataSource: widget.options.dataSource,

                message: '',

                clearWidgetMessages: widget.options.clearWidgetMessages,

                promotionalCodesExist: false,

                isAdding: false,

                showMessages: function (messages, type) {
                    var _this = this;
                    var msgs = messages;
                    _this.set("clearWidgetMessages", false);
                    $.each(msgs, function (idx, msg) {
                        if (msg != "")
                            _this.setMessage(msg, type);
                    });
                    _this.set("clearWidgetMessages", widget.options.clearWidgetMessages);
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name,
                        clearExisting: widget.options.clearWidgetMessages
                    });
                },

                clearMessage: function () {
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'promotionalCodes', clearExisting: true });
                },

                orderUpdated: function () {
                    //widget.options.currentDataSource = widget.options.dataSource;
                    widget.options.dataSource = [];
                    initDataSource();
                },

                updateItemList: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("promotionalCodesExist", dataView.length > 0);
                    widget.trigger(LISTUPDATED, { count: dataView.length });
                },

                itemList: getDataView(),

                itemListInclusive: function() {
                    return $.grep(this.get("itemList"), function (item) { return item.IsInclusive === true; });
                },

                itemListExclusive: function() {
                    return $.grep(this.get("itemList"), function (item) { return item.IsInclusive === false; });
                },

                hasInclusivePromotionCodes: function () {
                    var list = this.itemListInclusive();
                    return list.length > 0;
                },

                hasExclusivePromotionCodes: function () {
                    var list = this.itemListExclusive();
                    return list.length > 0;
                },

                hasNoPromotionCodes: function () {
                    var list1 = this.itemListInclusive();
                    var list2 = this.itemListExclusive();
                    return (list1.length <= 0 && list2.length <= 0);
                },

                hasBothInclusiveAndExclusivePromotionCodes: function () {
                    var list1 = this.itemListInclusive();
                    var list2 = this.itemListExclusive();
                    return (list2.length > 0 && list1.length > 0);
                },

                promoCodeInputKeyUp: function (event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();
                        this.applyPromotionCode();
                    }
                },

                applyPromotionCode: function () {
                    var _this = this;
                    _this.set("isAdding", true);
                    $.cv.css.orders.applyPromoCode({
                        _objectKey: _this.get("order")._objectKey,
                        promoCode: _this.promotionCode.trim(),
                        // Google Tag Manager: this method will be proxied to handle the
                        // relevant values below, otherwise they will be ignored.
                        gtmSuccessEventname: widget.options.gtmSuccessEventname,
                        gtmFailEventname: widget.options.gtmFailEventname
                    }).done(function (msg) {
                        var data = msg.data;

                        $.cv.css.trigger($.cv.css.eventnames.promoCodeApplied, { promoCode: data.PromotionCode });

                        // trigger order reload
                        $.cv.css.getCurrentOrder().done(function (msg) {
                            _this.clearMessage();
                            if (data.IsValid) {
                                // clear input
                                _this.set('promotionCode', '');
                                _this.setMessage(data.Message, $.cv.css.messageTypes.success);
                            } else {
                                if (data.Message != "") {
                                    _this.setMessage(data.Message, widget.options.promoCodeFailedMessageType);
                                } else {
                                    _this.setMessage(widget.options.textApplyPromotionCodeFailed, widget.options.promoCodeFailedMessageType);
                                }
                            }
                            _this.set("isAdding", false);
                        });
                    }).fail(function (msg) {
                        _this.clearMessage();
                        _this.setMessage(widget.options.textApplyPromotionCodeFailed, $.cv.css.messageTypes.error);
                        _this.set("isAdding", false);
                    });
                }

            });

            initDataSource();

            return viewModel;
        },


        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "<div data-view='true'>"
                          + "<div>"
                              + "<input data-bind='value: promotionCode, events: {keyup: promoCodeInputKeyUp}' class='promotional-code-input' type='text' />"
                              + "<input data-bind='click: applyPromotionCode' type='button' href='javascript:$.noop()' id='promotional-code-apply' value='" + widget.options.textApplyPromotionalCodePrompt + "' />"
                              + "<div class='itemList' data-bind='source: itemList, visible: promotionalCodesExist' data-template='" + widget.options.itemViewTemplate + "'>"
                              + "</div>"
                          + "</div>"
                      + "</div>";
            return html;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = ""
                    + "<script type='text/x-kendo-template' id='" + widget.options.itemViewTemplate + "'>"
                        + "<div class='promotional-code'>"
						    + "#= Description #"
                            + "<input data-bind='click: execCommand_destroy' type='button' href='javascript:$.noop()' class='promotional-code-remove' value='" + widget.options.textRemovePromotionalCodePrompt + "' />"
						+ "</div>"
                    + "</script>";
            return html;
        }

    }

    // register the widget

    $.cv.ui.widget(promotionalCodesWidget);

})(jQuery);