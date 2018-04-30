/*
* Name: Order summary
* Author: Aidan Thomas
* Date Created: 2013/01/04 
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js (built with jquery-1.7.1.min.js)
*          kendo.web.js (kendo.web.min.js v2012.2.710)
*
*          --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.util.js
*          /Scripts/cv.ajax.js
*          /Scripts/cv.css.orders.js
*          /Scripts/cv.css.orderTemplate.js
*/
;

(function ($, undefined) {


    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        WIDGETINITIALISED = "widgetInitialised",
		TEMPLATESAVED = "templateSaved",
        QUOTECANCELLED = "quoteCancelled",
        ORDERMODEORDER = "order",
		ORDERMODEQUOTE = "quote";


    var orderSummaryWidget = {

        // Standard Variables

        // widget name
        name: "orderSummary",

        // default widget options
        options: {
            // viewModel defaults
            linesElement: "[data-role='orderlines']",
            linesData: "orderLines",
            holdOrderRedirectUrl: "OrdersOnHold.aspx?Order={0}",
            saveAsTemplateRedirectUrl: "OrderTemplates.aspx?action=save&TemplateType=order",
            //requestQuoteUrl: "OrderComplete.aspx?type=quote",
            designStampUrl: "StampDesign.aspx",
            displayLineErrorsAsMessages: true,
            displayLineMessagesOnLines: true,
            displayErrorMessagesOnLoad: true,
            displayLineErrorSummaryMessage: true,
            hideHeaderMessageTypes: ["ForwardOrderDateInvalid", "OrderRequiresCustomerReference"],
            formatFieldsAsCurrency: [],
            headerCostCentreError: "InvalidCostCentresError",
            lineCostCentreError: "CostCentreError",
            // viewModel flags
            autoBind: true,
            triggerMessages: true,
            includeInBrowserHistory: true,
            reloadAfterOrderHeld: true,
            getLatestOrderOnLoad: false,
            displayingOrderInformation: true,
            displayingOrderMessages: false,
            saveAsTemplateUseModal: false,
            usingCostCentres: false,
            // events
            templateSaved: null,
            // view flags
            sessionTimeOutRedirectUrl: 'login.aspx',
            validateOnLoad: false,
            validateChanges: false,
            // view text defaults
            textCheckoutErrorDefaultMessage: 'There was an error preventing your checkout, please try again later',
            textCheckoutQuoteErrorDefaultMessage: 'There was an error preventing your quote, please try again later',
            textSaveAsTemplateSuccessful: 'Successfully saved your template',
            textRequestQuoteEmptyCartMessage: "Your cart is empty, please add products before you request a quote",
            textCancelQuoteEmptyCartMessage: "Your cart is empty, there is nothing to cancel",
            textQuoteCancelSuccessful: "Successfully cancelled the quote",
            textSubmitOrderNoItems: "Please add a product to your order before submitting your order",
            textErrorLinesHaveErrors: "There are lines with errors on your order",
            textErrorToggleLink: "<a class='show-hide-errors' href='javascript:void(0);' onclick='$.cv.css.orders.onlyShowErrors(this);'><span class='show-error'>show error lines</span><span class='show-all'>show all lines</span></a>",
            textHoldOrderConfirmSuccessful: "Order successfully placed on hold",
            textHoldOrderReferenceEmptyMessage: "Please enter a Hold Reference before putting your order on hold",
            // widget settings,
            enableOrderComplete: true,
            enableUpdateOrder: true,
            enableOrderHolding: false,
            enableSaveAsTemplate: false,
            enableRequestQuote: false,
            enableEmptyCart: false,
            enableDesignStamps: false,
            changeOrderAccount: false,
            hasMultipleAccounts: false,
            hidePricingInOrderGrid: false,
            isRep: false,
            isAdvancedQuoteOrder: false,
            isIncTax: true,
            linkToTaxToggleWidget: false,
            gstPrompt: "GST",
            textOrderCompleteButtonLabel: "Complete Order",
            textUpdateOrderButtonLabel: "Update Order",
            textOrderHoldingButtonLabel: "Hold Order",
            textSaveAsTemplateButtonLabel: "Save As Template",
            textRequestQuoteButtonLabel: "Request Quote",
            textEmptyCartButtonLabel: "Empty Cart",
            textDesignStampsButtonLabel: "Design Stamps",
            textCancelQuoteButtonLabel: "Cancel Quote",
            // This can be used when need to show details for some other order other than the users current order e.g. order searching, quotes etc.
            // Note: Currently it has only been implemented here for retreival and display in a read only fashion (e.g. can be used in checkout summary not 
            // in cart view). If this needs to be changed bear in mind that any functions in here that alter the order will likely need changes for this.
            orderNoOverride: 0,

            // Product Store Availability Click and Collect options
            enableStoreAvailabilityClickAndCollect: false, // When this is used and in cart view, user must choose delivery or pickup before going to checkout .
            currentPickupStoreName: "",
            deliveryAddressModeClickAndCollect: "",
            deliveryModeTargetName: "delivery-mode",
            storeLocatorPageContentVersionTargetClass: "change-store-list",
            textPickupChosenNoStoreset: "Please choose a store location for order pickup",
            deliveryAddressModeClickAndCollectNotSet: "Please select either Delivery or Pickup",

            deliveryOptionPopupId: "",

            // view Template
            viewTemplate: null // TODO: Treat these as IDs, remove the last one.
        },

        events: [DATABINDING, DATABOUND, TEMPLATESAVED, QUOTECANCELLED, WIDGETINITIALISED],

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
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                widget.element.html(widget.view);
            }
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);

            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.cartUpdated, widget.viewModel));

            $.cv.css.bind($.cv.css.eventnames.orderSubmitted, $.proxy(widget.viewModel.cartUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.localOrderChanged, $.proxy(widget.viewModel.reloadCart, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.checkoutMessages, $.proxy(widget.viewModel.checkoutOptionsUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.loggingOut, $.proxy(widget.viewModel.loggingOut, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.gettingLines, $.proxy(widget.viewModel.gettingLines, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.gettingOrder, $.proxy(widget.viewModel.gettingOrder, widget.viewModel));

            $.cv.css.bind($.cv.css.eventnames.viewApprovalOrder, function (order) {
                if (order) {
                    var opts = {};
                    opts.orderNoOverride = order.SoOrderNo;
                    widget.viewModel.cartUpdated(opts);
                }
            });

            if (widget.options.linkToTaxToggleWidget) {
                $.cv.css.bind($.cv.css.eventnames.setTaxToggle, $.proxy(widget.viewModel.setCartTotal, widget.viewModel));
            }

            $.cv.css.bind($.cv.css.eventnames.showDeliveryOptionPopup, $.proxy(widget.viewModel.showDeliveryOptionPopup, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.deliveryMethodClickAndCollectOnOrderChanged, $.proxy(widget.viewModel.deliveryMethodClickAndCollectOnOrderChanged, widget.viewModel));

            // detect url message and trigger message if order account set
            if (widget.options.displayingOrderMessages) {
                var messages = $.cv.css.localGetOrderSummaryMessages();
                if (messages != null && messages.length > 0) {
                    $.cv.css.localSetOrderSummaryMessages(null);
                    $.each(messages, function (index, item) {
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: item, type: $.cv.css.messageTypes.info, source: 'orderSummaryOrderMessage', clearExisting: false });
                    });
                }
            }
            widget.trigger(WIDGETINITIALISED);
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

            var initDataSource = function () {
                if (widget.options.displayingOrderInformation) {
                    if (widget.options.getLatestOrderOnLoad) {
                        // Get the order that the widget is using. It could be either the users current 
                        // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                        var d1 = widget.options.orderNoOverride === 0
                            ? $.cv.css.getCurrentOrder()
                            : $.cv.css.getOrder({ orderNo: widget.options.orderNoOverride });
                        $.when(d1).done(function () {
                            $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                        });
                    } else {
                        if (viewModel.get("order") == null)
                            viewModel.reloadCart();
                        else {
                            if (widget.options.validateOnLoad && viewModel.items() > 0)
                                viewModel.validateOrder();
                        }

                        viewModel.getAndSetLinesForOnHover();
                    }
                }
                if (widget.options.linkToTaxToggleWidget) {
                    viewModel.setCartTotal();
                }
            };

            var formatFieldsAsCurrency = function (order) {
                if (widget.options.formatFieldsAsCurrency.length > 0 && order != null) {
                    _.each(widget.options.formatFieldsAsCurrency, function (element, index, list) {
                        if (_.has(order, element)) {
                            order[element] = kendo.toString(order[element], 'c');
                        }
                    });
                }
                return order;
            };

            // This gets the order that the widget is using from local storage.
            // It should always be used when needing to deal with the order as it will handle whether the widget is being used 
            // for the users current order or if some other order e.g. order searching, approvals, quotes etc.
            var getOrderFromLocalStorageForWidget = function () {
                var localOrder = widget.options.orderNoOverride === 0
                        ? $.cv.css.localGetCurrentOrder(false)
                        : $.cv.css.localGetSelectedOrder(widget.options.orderNoOverride, "", false);

                return localOrder;
            };

            // This gets the order lines that the widget is using from local storage.
            // It should always be used when needing to deal with the order lines as it will handle whether the widget is being used 
            // for the users current order or if some other order e.g. order searching, approvals, quotes etc.
            var getOrderLinesFromLocalStorageForWidget = function () {
                var localOrderLines = widget.options.orderNoOverride === 0
                    ? $.cv.css.localGetCurrentOrderLines()
                    : $.cv.css.localGetSelectedOrderLines();

                return localOrderLines;
            };

            // This removes the updated order lines that the widget is using from local storage.
            // It should always be used when needing to deal with the order lines as it will handle whether the widget is being used 
            // for the users current order or if some other order e.g. order searching, approvals, quotes etc.
            var removeUpdatedOrderLinesFromLocalStorageForWidget = function () {
                if (widget.options.orderNoOverride === 0) {
                    $.cv.css.localRemoveUpdatedCurrentOrderLines();
                } else {
                    $.cv.css.localRemoveUpdatedSelectedOrderLines();
                }
            };

            // This gets the updated order lines that the widget is using from local storage.
            // It should always be used when needing to deal with the order lines as it will handle whether the widget is being used 
            // for the users current order or if some other order e.g. order searching, approvals, quotes etc.
            var getUpdatedOrderLinesFromLocalStorageForWidget = function () {
                if (widget.options.orderNoOverride === 0) {
                    $.cv.css.localGetUpdatedCurrentOrderLines();
                } else {
                    $.cv.css.localGetUpdatedSelectedOrderLines();
                }
            };

            // This updates the supplied modified order lines that the widget is using into local storage.
            // It should always be used when needing to deal with the order lines as it will handle whether the widget is being used 
            // for the users current order or if some other order e.g. order searching, approvals, quotes etc.
            var updatedOrderLinesToLocalStorageForWidget = function (modifiedLines) {
                if (widget.options.orderNoOverride === 0) {
                    $.cv.css.localUpdateCurrentOrderLines(modifiedLines);
                } else {
                    $.cv.css.localUpdateSelectedOrderLines(modifiedLines);
                }
            };

            var viewModel = kendo.observable({

                // Properties for UI elements
                order: formatFieldsAsCurrency(widget.options.orderNoOverride === 0
                    ? $.cv.css.localGetCurrentOrder()
                    : $.cv.css.localGetSelectedOrder(widget.options.orderNoOverride, "", false)),

                enableOrderComplete: widget.options.enableOrderComplete,

                enableUpdateOrder: widget.options.enableUpdateOrder,

                enableOrderHolding: widget.options.enableOrderHolding,

                enableSaveAsTemplate: widget.options.enableSaveAsTemplate,

                enableRequestQuote: widget.options.enableRequestQuote,

                enableEmptyCart: widget.options.enableEmptyCart,

                enableCancelQuote: widget.options.isAdvancedQuoteOrder,

                enableDesignStamps: function () {
                    var order = this.get("order");
                    return order == null ? false : (order.HasStamps != "undefined" ? order.HasStamps : false);
                },

                enableAccountSelect: function () {
                    return this.get("isRep") || this.get("hasMultipleAccounts");
                },

                hasMultipleAccounts: widget.options.hasMultipleAccounts,

                changeOrderAccount: widget.options.changeOrderAccount,

                hidePricingInOrderGrid: widget.options.hidePricingInOrderGrid,

                isRep: widget.options.isRep,

                textOrderCompleteButtonLabel: widget.options.textOrderCompleteButtonLabel,

                textUpdateOrderButtonLabel: widget.options.textUpdateOrderButtonLabel,

                textOrderHoldingButtonLabel: widget.options.textOrderHoldingButtonLabel,

                textSaveAsTemplateButtonLabel: widget.options.textSaveAsTemplateButtonLabel,

                textRequestQuoteButtonLabel: widget.options.textRequestQuoteButtonLabel,

                textEmptyCartButtonLabel: widget.options.textEmptyCartButtonLabel,

                textDesignStampsButtonLabel: widget.options.textDesignStampsButtonLabel,

                textCancelQuoteButtonLabel: widget.options.textCancelQuoteButtonLabel,

                deliveryAddressModeClickAndCollect: widget.options.deliveryAddressModeClickAndCollect,


                orderLineAmountTotal: function () {
                    var total = 0;

                    var lines = $.cv.css.localGetCurrentOrderLines();
                    if (this.get("order") && lines !== null) {
                        $.each(lines, function (index, item) {
                            if (item.LineType === "SN") {
                                total += item.OrderLineAmount;
                            }
                        });
                    }

                    return kendo.toString(total, "c");
                },

                orderLineAmountTotalExTax: function () {
                    var total = 0;

                    var lines = $.cv.css.localGetCurrentOrderLines();
                    if (this.get("order") && lines !== null) {
                        $.each(lines, function (index, item) {
                            if (item.LineType === "SN") {
                                total += item.OrderLineAmountExTax;
                            }
                        });
                    }

                    return kendo.toString(total, "c");
                },

                orderTotal: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmount') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmount'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalBeforeDiscount: function () {
                    return (this.get('order') != null && this.get('order.SoOrderTotalAmount') != undefined) ? (kendo.toString(this.get('order.SoOrderTotalAmount'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountLessCharges: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountLessCharges') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountLessCharges'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountLessChargesCustomerDefined: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountLessChargesCustomerDefined') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountLessChargesCustomerDefined'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountLessChargesExTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountLessChargesExTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountLessChargesExTax'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountLessChargesIncTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountLessChargesIncTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountLessChargesIncTax'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountBeforeDiscountLessChargesCustomerDefined: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountBeforeDiscountLessChargesCustomerDefined') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountBeforeDiscountLessChargesCustomerDefined'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountBeforeDiscountLessChargesExTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountBeforeDiscountLessChargesExTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountBeforeDiscountLessChargesExTax'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountBeforeDiscountLessChargesIncTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountBeforeDiscountLessChargesIncTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountBeforeDiscountLessChargesIncTax'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountAfterDiscountLessChargesExTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountBeforeDiscountLessChargesExTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountBeforeDiscountLessChargesExTax') - (this.get("order") ? this.promotionalDiscountTotal(true, true) : 0), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalAmountAfterDiscountLessChargesIncTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountBeforeDiscountLessChargesIncTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountBeforeDiscountLessChargesIncTax') - (this.get("order") ? this.promotionalDiscountTotal(true, false) : 0), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalExTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalAmountExGst') != undefined) ? (kendo.toString(this.get('order.OrderTotalAmountExGst'), 'c')) : (kendo.toString(0, 'c'));
                },

                taxRate: function () {
                    return (this.get('order') != null && this.get('order.TaxRate') != undefined) ? this.get('order.TaxRate') : 0;
                },

                orderTotalTax: function () {
                    return (this.get('order') != null && this.get('order.OrderTotalTax') != undefined) ? (kendo.toString(this.get('order.OrderTotalTax'), 'c')) : (kendo.toString(0, 'c'));
                },

                orderTotalCharges: function () {
                    return (this.get('order') != null && this.get('order.SoOrderTotalCharges') != undefined) ? (kendo.toString(this.get('order.SoOrderTotalCharges'), 'c')) : (kendo.toString(0, 'c'));
                },

                promotionalDiscountAmount: function () {
                    return (this.get('order') != null && this.get('order.SoPromotionalDiscountAmount') != undefined) ? (kendo.toString(this.get('order.SoPromotionalDiscountAmount'), 'c')) : (kendo.toString(0, 'c'));
                },

                promotionalDiscountAmountIncGst: function () {
                    return (this.get('order') != null && this.get('order.SoPromotionalDiscountAmountIncGST') != undefined) ? (kendo.toString(this.get('order.SoPromotionalDiscountAmountIncGST'), 'c')) : (kendo.toString(0, 'c'));
                },

                promotionalDiscountAmountExGst: function () {
                    return (this.get('order') != null && this.get('order.SoPromotionalDiscountAmountExGST') != undefined) ? (kendo.toString(this.get('order.SoPromotionalDiscountAmountExGST'), 'c')) : (kendo.toString(0, 'c'));
                },

                promotionalDiscountTax: function () {
                    return (this.get('order') != null && this.get('order.SoPromotionalTaxAmount') != undefined) ? (kendo.toString(this.get('order.SoPromotionalTaxAmount'), 'c')) : (kendo.toString(0, 'c'));
                },

                hasPromotionDiscount: function () {
                    return (this.get('order') != null && this.get('order.SoPromotionalDiscountAmount') != undefined) ? this.get('order.SoPromotionalDiscountAmount') > 0 : false;
                },

                promotionalDiscountAmountExclusiveExGst: function () {
                    var value = this.get("order") ? this.promotionalDiscountTotal(false, true) : 0;
                    return kendo.toString(value, "c");
                },

                promotionalDiscountAmountInclusiveExGst: function () {
                    var value = this.get("order") ? this.promotionalDiscountTotal(true, true) : 0;
                    return kendo.toString(value, "c");
                },

                promotionalDiscountAmountExclusiveIncGst: function () {
                    var value = this.get("order") ? this.promotionalDiscountTotal(false, false) : 0;
                    return kendo.toString(value, "c");
                },

                promotionalDiscountAmountInclusiveIncGst: function () {
                    var value = this.get("order") ? this.promotionalDiscountTotal(true, false) : 0;
                    return kendo.toString(value, "c");
                },

                promotionalDiscountTotal: function (inclusive, isExTax) {
                    var amount = 0;

                    var promoCodes = viewModel.getPromoCodesOfType(inclusive);
                    $.each(promoCodes, function (index, promoCode) {
                        var amountItems = $.grep(viewModel.get("order.PromotionalCodeAmounts"), function (item) { return item.PromotionCode === promoCode.PromotionCode; });
                        if (amountItems.length > 0) {
                            var item = amountItems[0];

                            amount += item.TotalAmount;
                            if (isExTax) {

                                amount -= item.TotalAmountTax;
                            }
                        }
                    });

                    return amount;
                },

                hasValidPromotionCodes: function () {
                    var count = 0;
                    if (this.get('order') != null && this.get('order.PromotionalCodes') != undefined) {
                        $.each(this.get('order.PromotionalCodes'), function (index, element) {
                            if (element.IsValidOnCurrentOrder) {
                                count++;
                            }
                        });
                    }
                    return count > 0;
                },

                hasPromotionCodes: function () {
                    return (this.get('order') != null && this.get('order.PromotionalCodes') != undefined) ? this.get('order.PromotionalCodes').length > 0 : false;
                },

                hasInclusivePromotionCodes: function () {
                    return this.hasPromotionCodeType(true);
                },

                hasExclusivePromotionCodes: function () {
                    return this.hasPromotionCodeType(false);
                },

                hasNoPromotionCodes: function () {
                    return this.hasNoPromotionCodeType();
                },

                hasBothInclusiveAndExclusivePromotionCodes: function () {
                    return this.hasBothPromotionCodeType();
                },

                hasValidInclusivePromotionCodes: function () {
                    return this.hasValidPromotionCodeType(true);
                },

                hasValidExclusivePromotionCodes: function () {
                    return this.hasValidPromotionCodeType(false);
                },

                hasValidPromotionCodeType: function (inclusive) {
                    if (this.hasPromotionCodes()) {
                        var count = 0;

                        var result = this.getPromoCodesOfType(inclusive);
                        $.each(result, function (index, item) {
                            if (item.IsValidOnCurrentOrder) {
                                count++;
                            }
                        });

                        return count > 0;
                    }

                    return false;
                },

                hasPromotionCodeType: function (inclusive) {
                    if (this.hasPromotionCodes()) {
                        var result = this.getPromoCodesOfType(inclusive);
                        return result.length > 0;
                    }

                    return false;
                },

                hasPromotionCodeTypeOnly: function (inclusive) {
                    var inclusiveResult = this.getPromoCodesOfType(true);
                    var exclusiveResult = this.getPromoCodesOfType(false);
                    if (this.hasPromotionCodes()) {
                        if (inclusive) {
                            return (inclusiveResult.length > 0 && exclusiveResult.length <= 0);
                        } else {
                            return (exclusiveResult.length > 0 && inclusiveResult.length <= 0);
                        }
                    }

                    return false;
                },

                hasNoPromotionCodeType: function () {
                    if (this.hasPromotionCodes()) {
                        return false;
                    }
                    var inclusiveResult = this.getPromoCodesOfType(true);
                    var exclusiveResult = this.getPromoCodesOfType(false);
                    return (inclusiveResult.length <= 0 && exclusiveResult.length <= 0);
                },

                hasBothPromotionCodeType: function () {
                    var inclusiveResult = this.getPromoCodesOfType(true);
                    var exclusiveResult = this.getPromoCodesOfType(false);
                    if (this.hasPromotionCodes()) {
                        return (inclusiveResult.length > 0 && exclusiveResult.length > 0);
                    }

                    return false;
                },

                getPromoCodesOfType: function (inclusive) {
                    return this.get("order") != null && this.get('order.PromotionalCodes') != undefined ? $.grep(this.get("order.PromotionalCodes"), function (item) { return item.IsInclusive === inclusive; }) : [];
                },

                // Loyalty Rewards
                hasLoyaltyRewardChargeLine: function () {
                    return (this.get("order") != null && this.get("order.HasLoyaltyRewardChargeLine") != undefined) ? this.get("order.HasLoyaltyRewardChargeLine") : false;
                },

                loyaltyRewardAmount: function () {
                    return this.get("order.OrderLoyaltyRewardLineAmount");
                },

                removeLoyaltyReward: function () {
                    this.set("isRemovingLoyaltyReward", true);
                    $.cv.css.trigger($.cv.css.eventnames.confirmRewardRemoval);
                },

                hasOrderCharges: function () {
                    return (this.get('order') != null && this.get('order.SoOrderTotalCharges') != undefined) ? this.get('order.SoOrderTotalCharges') > 0 : false;
                },

                orderTotalChargesLessFreightIncGst: function () {
                    var orderTotalCharge = (this.get('order') != null && this.get('order.SoOrderTotalCharges') != undefined) ? this.get('order.SoOrderTotalCharges') : 0;
                    var freightChargeAmount = (this.get('order') != null && this.get('order.FreightChargeAmount') != undefined) ? this.get('order.FreightChargeAmount') : 0;
                    return (kendo.toString((orderTotalCharge - freightChargeAmount), 'c'));
                },

                orderTotalChargesLessFreightExGst: function () {
                    var orderTotalCharge = (this.get('order') != null && this.get('order.SoOrderTotalCharges') != undefined) ? this.get('order.SoOrderTotalCharges') : 0;
                    var freightChargeAmount = (this.get('order') != null && this.get('order.FreightChargeAmount') != undefined) ? this.get('order.FreightChargeAmount') : 0;
                    var tax = (orderTotalCharge - freightChargeAmount) / (1 + 1 / (this.taxRate() / 100));
                    return (kendo.toString((orderTotalCharge - freightChargeAmount - tax), 'c'));
                },

                hasOrderChargesLessFreight: function () {
                    var orderTotalCharge = (this.get('order') != null && this.get('order.SoOrderTotalCharges') != undefined) ? this.get('order.SoOrderTotalCharges') : 0;
                    var freightChargeAmount = (this.get('order') != null && this.get('order.FreightChargeAmount') != undefined) ? this.get('order.FreightChargeAmount') : 0;
                    return (orderTotalCharge - freightChargeAmount) > 0;
                },

                freightChargeAmount: function () {
                    return (this.get('order') != null && this.get('order.FreightChargeAmount') != undefined) ? (kendo.toString(this.get('order.FreightChargeAmount'), 'c')) : (kendo.toString(0, 'c'));
                },

                freightChargeAmountExTax: function () {
                    return (this.get('order') != null && this.get('order.FreightChargeAmountExTax') != undefined) ? (kendo.toString(this.get('order.FreightChargeAmountExTax'), 'c')) : (kendo.toString(0, 'c'));
                },

                hasFreightCharge: function () {
                    var freightChargeAmount = (this.get('order') != null && this.get('order.FreightChargeAmount') != undefined) ? this.get('order.FreightChargeAmount') : 0;
                    return freightChargeAmount > 0 || this.freightChargeLines().length > 0;
                },

                hasZerDollarFreightCharge: function () {
                    if (this.get("hasFreightChargeLineRequiresQuote"))
                        return false;

                    var freightChargeAmount = (this.get('order') != null && this.get('order.FreightChargeAmount') != undefined) ? this.get('order.FreightChargeAmount') : 0;
                    return freightChargeAmount == 0 && this.freightChargeLines().length > 0;
                },

                hasFreightChargeLineRequiresQuote: function () {
                    var hasFrtChgLnReqsQuote = (this.get("order") != null && this.get("order.HasFreightChargeLineRequiresQuote") != undefined) ? this.get("order.HasFreightChargeLineRequiresQuote") : false;
                    return hasFrtChgLnReqsQuote;
                },

                showFreightChargeActualAmount: function () {
                    return this.hasFreightChargeLineRequiresQuote() === false && this.hasZerDollarFreightCharge() === false;
                },

                freightChargeLines: function () {
                    return (this.get('order') != null && this.get('order.FreightChargeLine') != undefined && this.get('order.FreightChargeLine') != null) ? this.get('order.FreightChargeLine') : [];
                },

                lineCount: function () {
                    var data = this.get('order');
                    return (data != null && data.ItemLineCount != undefined) ? data.ItemLineCount : 0;
                },

                isNotSingleLine: function () {
                    return this.lineCount() != 1;
                },

                items: function () {
                    var data = this.get('order');
                    return (data != null && data.SoOrderPackages != undefined) ? data.SoOrderPackages : 0;
                },

                isNotSingleItem: function () {
                    return this.items() != 1;
                },

                clickAndCollectPopupParams: {},

                showDeliveryOptionPopup: function (params) {
                    var vm = this;

                    if (widget.options.deliveryOptionPopupId === "") {
                        return;
                    }

                    if (params && params.e) {
                        params.e.preventDefault();
                    }

                    vm.set("clickAndCollectPopupParams", params);

                    $.fancybox({
                        href: "#" + widget.options.deliveryOptionPopupId,
                        padding: 0,
                        closeBtn: false,
                        autoSize: true
                    });
                },

                deliveryMethodClickAndCollectOnOrderChanged: function (selectedDelMode) {
                    var vm = this;

                    vm.set("order.DeliveryMethodClickAndCollect", selectedDelMode);
                },

                clickAndCollectPopupCancel: function () {
                    var vm = this;

                    vm.clearMessage();
                    $.fancybox.close();
                },

                clickAndCollectPopupConfirm: function () {
                    var vm = this;

                    vm.clearMessage();

                    // Validate - make sure an option has been selected (delivery or pickup).
                    var selectedDelMode = vm.get("deliveryAddressModeClickAndCollect");
                    if (selectedDelMode === "") {
                        vm.setMessage(widget.options.deliveryAddressModeClickAndCollectNotSet, $.cv.css.messageTypes.error);
                    } else {
                        $.fancybox.close();

                        // Add to cart and go to PayPal.
                        var params = vm.get("clickAndCollectPopupParams");
                        if (params && params.callback) {
                            params.callback();
                        }
                    }
                },

                setDeliveryAddressModeClickAndCollect: function () {
                    var vm = this;
                    var selectedDelMode = vm.get("deliveryAddressModeClickAndCollect");
                    var orderDelMode = this.get("order.DeliveryMethodClickAndCollect");

                    //CHeck to see if we are using Click and Collect. If not then reset the 
                    //checked state of the radio buttons to the state reflected by the order
                    //NOTE: ViewModel bound element does not update the state of the checked buttons. 
                    //This only works from the buttons down. You need to use jQuery to change this.

                    if (!widget.options.enableStoreAvailabilityClickAndCollect) {
                        $("input[name=\x22" + widget.options.deliveryModeTargetName + "\x22]").val([orderDelMode]);

                        return;
                    }

                    ///Click and collect is in use then check the store name and delivery mode for pickup.
                    //If no store name and delivery method chosen is pickup then disallow
                    var currentStoreName = widget.options.currentPickupStoreName;
                    if (currentStoreName.length === 0 && selectedDelMode === "Pickup") {
                        vm.setMessage(widget.options.textPickupChosenNoStoreset, $.cv.css.messageTypes.error);

                        $("." + widget.options.storeLocatorPageContentVersionTargetClass).show();

                        $("input[name=\x22" + widget.options.deliveryModeTargetName + "\x22]").val([orderDelMode]);

                        return;
                    }

                    // Don't do anything if selected mode is what is already on the order
                    if (selectedDelMode === orderDelMode) {
                        return;
                    }

                    var d1 = $.cv.css.deliveryAddress.setDeliveryMethodClickAndCollectOnOrder({ deliveryMode: selectedDelMode });
                    vm.set("processing", true);

                    d1.done(function (msg) {
                        var data = msg.data;
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length === 0) {
                                if (data.Success) {
                                    vm.updateAllLines();
                                    vm.set("order.DeliveryMethodClickAndCollect", selectedDelMode);
                                    vm.set("processing", false);

                                    $.cv.css.trigger($.cv.css.eventnames.deliveryMethodClickAndCollectOnOrderChanged, selectedDelMode);
                                } else {
                                    if (data.Messages.length > 0) {
                                        var message = "";
                                        for (var i = 0; i < data.Messages.length; i++) {
                                            message = message.length === 0 ? data.Messages[i] : message + ", " + data.Messages[i];
                                        }

                                        vm.setMessage(message, $.cv.css.messageTypes.error);
                                    }

                                    $("input[name=\x22" + widget.options.deliveryModeTargetName + "\x22]").val([orderDelMode]);
                                    vm.set("processing", false);
                                }
                            } else {

                                vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                                $("input[name=\x22" + widget.options.deliveryModeTargetName + "\x22]").val([orderDelMode]);
                                vm.set("processing", false);
                            }
                        }
                    }).fail(function () {
                        vm.set("processing", false);
                        if (msg.errorMessage != null) {
                            vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                            $("input[name=\x22" + widget.options.deliveryModeTargetName + "\x22]").val([orderDelMode]);
                        }
                    });
                },

                templateName: "",

                holdReference: "",

                hasValidHoldReference: function () {
                    return !$.cv.util.isNullOrWhitespace(viewModel.get("holdReference"));
                },

                orderSubmitting: false,
                isCheckoutWithPaypalExpress: false,

                processing: false,
                isLoggingOut: false,

                isProcessing: function () {
                    return this.get("processing");
                },

                isSavingAsTemplate: false,
                isHoldingOrder: false,
                isUpdatingOrder: false,
                isEmptyingCart: false,
                isRequestingQuote: false,
                isExportingOrder: false,
                isCancellingQuote: false,

                validationPreventingCheckout: false,

                preventCheckout: false,

                giftCards: [],
                orderTotalAfterGiftCards: 0,
                hasGiftCards: false,
                giftCardTotal: 0,

                _getCurrentGiftCards: function () {
                    var cards = [];

                    var theOrder = getOrderFromLocalStorageForWidget();
                    if (theOrder) {
                        var tempCards = theOrder.GiftCards || [];
                        var tempTotal = 0;

                        var generateRemoveGiftCard = function (cardNo) {
                            return function () {
                                $.cv.css.trigger($.cv.css.eventnames.giftCardRemoved, cardNo);
                            };
                        };

                        $.each(tempCards, function (i, c) {
                            c.removeGiftCard = generateRemoveGiftCard(c.CardNumber);
                            cards.push(c);

                            tempTotal += c.AmountToUse;
                        });

                        if (cards.length > 0) {
                            viewModel.set("orderTotalAfterGiftCards", theOrder.TotalPaymentBalanceAfterEnteredGiftCards);
                        } else {
                            viewModel.set("orderTotalAfterGiftCards", theOrder.OrderTotalAmount);
                        }

                        viewModel.set("giftCardTotal", tempTotal);
                    }

                    viewModel.set("giftCards", cards);
                    viewModel.set("hasGiftCards", cards.length > 0);

                    return cards;
                },

                cartUpdated: function (opts) {
                    var _this = this;
                    var d1 = $.Deferred();
                    var localOrder = null;

                    if (opts && $.cv.util.hasValue(opts.orderNoOverride)) {
                        widget.options.orderNoOverride = opts.orderNoOverride;
                    }

                    // Get the order that the widget is using. It could be either the users current 
                    // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                    var order = widget.options.orderNoOverride === 0
                        ? $.cv.css.localGetCurrentOrder(widget.options.displayingOrderInformation)
                        : $.cv.css.localGetSelectedOrder(widget.options.orderNoOverride, "", true);

                    var preventReValidation = opts && $.cv.util.hasValue(opts.preventValidation) ? opts.preventValidation : false;

                    if (order != null && $.isFunction(order.promise)) {
                        d1 = order;
                    } else {
                        d1.resolve();
                    }

                    d1.done(function () {
                        localOrder = getOrderFromLocalStorageForWidget();

                        _this.set('order', formatFieldsAsCurrency(localOrder));
                        _this.clearMessage();

                        widget.viewModel._getCurrentGiftCards();

                        if (!preventReValidation && // prevents validation when validation caused the update!
                            (widget.options.validateOnLoad || widget.options.validateChanges) &&
                            !_this.get("isLoggingOut") &&
                            !_this.get("orderSubmitting") && _this.items() > 0) {
                            _this.validateOrder();
                        }

                        if (_this.items() === 0) {
                            removeUpdatedOrderLinesFromLocalStorageForWidget();
                        }

                        // Check if any product is out of stock.
                        var anyOutOfStock = false;
                        var lines = getOrderLinesFromLocalStorageForWidget();
                        if (lines !== null) {
                            $.each(lines, function (index, line) {
                                if (line.LineType === "SN" && line.Product[0].AvailableForOneQty <= 0) {
                                    anyOutOfStock = true;
                                }
                            });
                        }

                        _this.getAndSetLinesForOnHover();
                        _this.set("hasProductCodesOutOfStock", anyOutOfStock);
                        _this.set("isRemovingLoyaltyReward", false);
                        _this.setCartTotal();
                    });
                },

                getOrderLinesFromLocalStorageForWidget: function () {
                    // Call the static method above (i.e. this is not recursive), it gives access to this method in any widget that extends this widget
                    var lines = getOrderLinesFromLocalStorageForWidget();

                    if (lines === null)
                        lines = [];

                    return lines;
                },

                reloadCart: function (opts) {
                    // local data already updated, just trigger event
                    var _this = this;
                    _this.cartUpdated(opts);
                },

                checkoutOptionsUpdated: function (msg) {
                    if (msg.allCheckoutMessagesConfirmed != undefined) {
                        this.set("preventCheckout", !msg.allCheckoutMessagesConfirmed);
                    }
                },

                loggingOut: function () {
                    this.set("isLoggingOut", true);
                },

                redirectToUrl: function (fallbackUrl, params, includeInBrowserHistory) {
                    if ($.cv.ajax.settings.timeoutRedirectUrl == "")
                        $.cv.util.redirect(fallbackUrl, params, !includeInBrowserHistory);
                    else
                        $.cv.util.redirect($.cv.ajax.settings.timeoutRedirectUrl, params, !includeInBrowserHistory);
                },

                message: '',

                clearExistingMessages: true,

                displayErrorMessagesOnLoad: widget.options.displayErrorMessagesOnLoad,

                setMessage: function (message, type, sourceSuffix) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name + ($.cv.util.hasValue(sourceSuffix) ? sourceSuffix : '')
                    });
                },

                clearMessage: function () {
                    this.set("clearExistingMessages", true);
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'orderSummary', clearExisting: this.get("clearExistingMessages") });
                },

                disableCheckout: function () {
                    return (this.get("isCheckoutWithPaypalExpress") === true
                        || this.get("orderSubmitting") === true
                        || this.get("preventCheckout") === true
                        || this.get("isGettingLines") === true
                        || this.get("isGettingOrder") === true);
                },

                isGettingLines: false,

                gettingLines: function (isGetting) {
                    this.set("isGettingLines", isGetting);
                },

                isGettingOrder: false,

                gettingOrder: function (isGetting) {
                    this.set("isGettingOrder", isGetting);
                },

                displayLineMessages: function (msgs, linesToValidateString) {
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            linesWidget.displayLineMessages(msgs, linesToValidateString);
                    });
                },

                updateAllLines: function () {
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            linesWidget.updateAllLines();
                    });
                },

                updateLinesFlaggedForUpdate: function (displayMessages, triggerOrderRefresh) {
                    var vm = this, updates = {}, allUpdates = new $.Deferred(), deletes = new $.Deferred();
                    deletes = this.deleteLinesFlaggedForDelete(false, false);
                    vm.set("isUpdatingOrder", true);
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            updates = linesWidget.updateLinesFlaggedForUpdate(displayMessages, triggerOrderRefresh);
                    });
                    $.when(updates, deletes).done(function () {
                        allUpdates.resolve();
                        vm.set("isUpdatingOrder", false);
                    });
                    return allUpdates;
                },

                deleteOrderConfirmClick: function () {
                    var vm = this;

                    var d = vm.deleteAllLines();
                    $.when.apply($, d).done(function () {
                        $.fancybox.close();
                    });
                },

                deleteAllLines: function () {
                    var vm = this;

                    vm.set("isEmptyingCart", true);

                    var d = [];
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget) {
                            d.push(linesWidget.deleteAllLines());
                        }
                    });

                    if (d.length === 0) {
                        d.push(new $.Deferred());
                    }

                    $.when.apply($, d).done(function () {
                        vm.set("isEmptyingCart", false);
                    });

                    return d;
                },


                deleteLinesFlaggedForDelete: function (displayMessages, triggerOrderRefresh) {
                    var d = new $.Deferred();
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            d = linesWidget.deleteLinesFlaggedForDelete(displayMessages, triggerOrderRefresh);
                        else
                            d.resolve();
                    });
                    return d;
                },

                getLinesToValidate: function () {
                    var _this = this, updatedLines = [], addedLines = [], linesToValidate = [], linesToValidateString = '', localUpdatedOrderLines = {};
                    localUpdatedOrderLines = getUpdatedOrderLinesFromLocalStorageForWidget();
                    if (localUpdatedOrderLines == null)
                        localUpdatedOrderLines = { addedLines: [], updatedLines: [], linesDeleted: false };
                    // if there is a list of updated lines in local storage on validate those particular lines
                    updatedLines = localUpdatedOrderLines["updatedLines"];
                    // if there is a list of new lines in local storage on validate those particular lines
                    addedLines = localUpdatedOrderLines["addedLines"];
                    if (updatedLines != null && addedLines != null)
                        linesToValidate = _.union(updatedLines, addedLines);
                    else {
                        if (updatedLines != null)
                            linesToValidate = updatedLines;
                        else if (addedLines != null)
                            linesToValidate = addedLines;
                    }
                    if (linesToValidate != null && linesToValidate.length > 0) {
                        linesToValidateString = _.reduce(linesToValidate, function (memo, num) { return memo + "," + num; });
                    } else {
                        // if there are no updated or new lines check if any have been deleted
                        if (localUpdatedOrderLines["linesDeleted"] != undefined && localUpdatedOrderLines["linesDeleted"])
                            linesToValidateString = "0"; // if only lines deleted only need to validate order header so pass in non existent line number
                    }
                    return linesToValidateString.toString();
                },

                validateOrder: function (orderMode) {
                    var vm = this,
                        linesToValidateString = '',
                        order = vm.get("order");

                    if ($.cv.css.syncValidation.gettingOrder || $.cv.css.syncValidation.gettingLines) {
                        return;
                    }

                    if (order && order._objectKey) {
                        var validationMode = typeof orderMode !== 'undefined' ? "checkout" : "cart";

                        linesToValidateString = vm.getLinesToValidate();

                        vm.set("validationPreventingCheckout", false);

                        $.cv.css.trigger($.cv.css.eventnames.validateOrderStarted);
                        
                        $.cv.css.orders.validateForCheckout({
                            _objectKey: order._objectKey,
                            validationMode: validationMode,
                            linesToValidate: linesToValidateString
                        }).done(function (response) {
                            var data = response.data,
                                params = {};

                            removeUpdatedOrderLinesFromLocalStorageForWidget();

                            // Lines Changed During Validation Require Merging into Local Storage
                            // Modification due to promo codes for example
                            if (data.modifiedLines && data.modifiedLines.length > 0) {
                                updatedOrderLinesToLocalStorageForWidget(data.modifiedLines);

                                $.cv.css.trigger($.cv.css.eventnames.localOrderChanged, { preventValidation: true });
                            }

                            $.cv.css.trigger($.cv.css.eventnames.validateOrderComplete);

                            if (!data.sessionHasTimedOut) {
                                vm.displayValidationMessages(data, linesToValidateString);

                                if (!vm.get("validationPreventingCheckout") && vm.get("orderSubmitting")) {
                                    if (vm.getLinesWithPreventCheckoutCount() == 0) {
                                        if (orderMode == ORDERMODEORDER) {
                                            $.cv.css.bind($.cv.css.eventnames.preOrderSubmitComplete, function () {
                                                $.cv.util.redirect(data.orderCompletionRedirectUrl, params, !widget.options.includeInBrowserHistory);
                                            });
                                        } else if (orderMode == ORDERMODEQUOTE) {
                                            $.cv.css.bind($.cv.css.eventnames.preOrderSubmitComplete, function () {
                                                vm.placeQuote();
                                            });
                                        }

                                        $.cv.css.trigger($.cv.css.eventnames.preOrderSubmit, { data: data });
                                    } else {
                                        vm.setMessage(widget.options.textErrorLinesHaveErrors.format(widget.options.textErrorToggleLink), $.cv.css.messageTypes.error);
                                    }
                                } else if (vm.get("validationPreventingCheckout") && vm.get("orderSubmitting")) {
                                    vm.set("orderSubmitting", false);
                                }

                                vm.set("processing", false);
                            } else {
                                vm.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, params, !widget.options.includeInBrowserHistory);
                            }
                        }).fail(function (msg) {
                            vm.set("processing", false);

                            if (msg.errorMessage != null) {
                                vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                            } else {
                                vm.setMessage(widget.options.textCheckoutErrorDefaultMessage, $.cv.css.messageTypes.error);
                            }
                        });
                    }
                },

                // Used for binding to view model of cart summary's on hover section
                linesForOnHover: [],
                haslinesForOnHover: false,

                // Can be used to make sure the viewmodel property linesForOnHover gets set or to return the lines for it.
                // NOTE: should only include normal stock type lines i.e. not charge lines
                getAndSetLinesForOnHover: function () {
                    var vm = this;
                    var stockLines = [];

                    var lines = vm.getOrderLinesFromLocalStorageForWidget();

                    // Check if line type is for a product.
                    if (lines !== null) {
                        $.each(lines, function (index, line) {
                            if (line.LineType === "SN") {
                                stockLines.push(line);
                            }
                        });
                    }

                    vm.set("haslinesForOnHover", stockLines.length > 0);
                    vm.set("linesForOnHover", stockLines);
                },

                getLinesWithErrorsCount: function () {
                    var count = 0;
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            count = linesWidget.getLineErrorCount();
                    });
                    return count;
                },

                getLinesWithPreventCheckoutCount: function () {
                    var count = 0;
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            count = linesWidget.getLinePreventChecktoutCount();
                    });
                    return count;
                },

                // builds array from the object returned
                buildLineValidationMessageArray: function (obj) {
                    var lineValidationErrors = new Array();
                    lineValidationErrors = [];
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            var el = {};
                            el["lineMessages"] = obj[key];
                            if (!widget.options.usingCostCentres && obj[key][0].errorType == widget.options.lineCostCentreError) {
                                continue;
                            }
                            lineValidationErrors.push(el);
                        }
                    }
                    return lineValidationErrors;
                },

                displayValidationMessages: function (data, linesToValidateString) {
                    var _this = this, linesHaveErrors = false;
                    _this.clearMessage();

                    var lineValidationErrors = _this.buildLineValidationMessageArray(data.lineValidationErrors);

                    if (data.headerValidationErrors.length > 0 || lineValidationErrors.length > 0) {
                        _this.set("clearExistingMessages", false);
                        $.each(data.headerValidationErrors, function (idx, item) {
                            // hides particular error messages that are not relevant on the orders page and only applicable on the checkout page
                            if ($.inArray(item.errorType, widget.options.hideHeaderMessageTypes) < 0) {
                                if (item.preventsCheckOut) {
                                    _this.set("validationPreventingCheckout", true);
                                    if ((!_this.get("orderSubmitting") && _this.get("displayErrorMessagesOnLoad")) || _this.get("orderSubmitting") || (!widget.options.usingCostCentres && item.errorType == widget.options.headerCostCentreError))
                                        _this.setMessage(item.errorMessage, $.cv.css.messageTypes.error);
                                } else {
                                    _this.setMessage(item.errorMessage, $.cv.css.messageTypes.warning);
                                }
                            }
                        });

                        // calls the orderLines widget (if it can be found) to display the error messages on the individual lines
                        if (widget.options.displayLineMessagesOnLines) {
                            if (lineValidationErrors.length > 0) {
                                _this.displayLineMessages(lineValidationErrors, linesToValidateString);
                            } else if (linesToValidateString.length > 0) {
                                _this.clearLineMessages(linesToValidateString);
                            }
                        }

                        $.each(lineValidationErrors, function (idx, item) {
                            $.each(item["lineMessages"], function (idx, lineItem) {
                                if (lineItem.errorMessage != "") {
                                    linesHaveErrors = true;
                                }
                                if (widget.options.displayLineErrorsAsMessages) {
                                    if (lineItem.errorMessage != "") {
                                        if (lineItem.preventsCheckOut) {
                                            if ((!_this.get("orderSubmitting") && _this.get("displayErrorMessagesOnLoad")) || _this.get("orderSubmitting"))
                                                _this.setMessage(lineItem.lineSeq + ', ' + lineItem.productCode + ': ' + lineItem.errorMessage, $.cv.css.messageTypes.error);
                                        } else {
                                            _this.setMessage(lineItem.lineSeq + ', ' + lineItem.productCode + ': ' + lineItem.errorMessage, $.cv.css.messageTypes.warning);
                                        }
                                    }
                                }

                                if (lineItem.preventsCheckOut)
                                    _this.set("validationPreventingCheckout", true);
                            });
                        });

                        if (widget.options.displayLineErrorSummaryMessage && !widget.options.displayLineErrorsAsMessages && linesHaveErrors) {
                            var preventCheckout = _this.getLinesWithPreventCheckoutCount() > 0;
                            if (preventCheckout) {
                                _this.setMessage(widget.options.textErrorLinesHaveErrors.format(widget.options.textErrorToggleLink), $.cv.css.messageTypes.error);
                            } else {
                                $.each(lineValidationErrors, function (idx, item) {
                                    $.each(item["lineMessages"], function (idx, lineItem) {
                                        if (lineItem.errorMessage && !lineItem.preventsCheckOut) {
                                            _this.setMessage(lineItem.lineSeq + ', ' + lineItem.productCode + ': ' + lineItem.errorMessage, $.cv.css.messageTypes.warning);
                                        }
                                    });
                                });
                            }
                        }

                        _this.set("clearExistingMessages", true);
                    } else if (linesToValidateString.length > 0) {
                        _this.clearLineMessages(linesToValidateString);
                    }
                },

                clearLineMessages: function (lines) {
                    $(widget.options.linesElement).each(function () {
                        var linesWidget = $(this).data(widget.options.linesData);
                        if (linesWidget)
                            count = linesWidget.clearLineMessages(lines);
                    });
                },

                processLineChanges: function () {
                    var _this = this, d1 = new $.Deferred(), d2 = new $.Deferred(), d3 = new $.Deferred(), d4 = new $.Deferred(), d5 = new $.Deferred();
                    d2 = this.deleteLinesFlaggedForDelete(false, false);
                    d3 = this.updateLinesFlaggedForUpdate(false, false);
                    $.when(d2, d3).done(function () {
                        var opts = {};
                        opts._detectSessionTimeout = true;
                        d4 = $.cv.css.getCurrentOrder(opts);
                        $.when(d4).done(function () {
                            var order = getOrderFromLocalStorageForWidget();
                            _this.set('order', formatFieldsAsCurrency(order));
                            d1.resolve();
                        });
                    });
                    return d1;
                },

                placeQuote: function () {
                    var _this = this;
                    var d1 = $.cv.css.orders.requestQuote();
                    $.when(d1).done(function (msg) {
                        var data = msg.data
                        var params = {};
                        if (!data.sessionHasTimedOut) {
                            if (data.Success)
                                $.cv.util.redirect(data.RedirectUrl, params, !widget.options.includeInBrowserHistory);
                            else {
                                _this.setMessage(widget.options.textCheckoutQuoteErrorDefaultMessage, $.cv.css.messageTypes.error);
                                _this.set("isRequestingQuote", false);
                            }
                            _this.set("processing", false);
                        } else {
                            _this.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, params, !widget.options.includeInBrowserHistory);
                        }
                    }).fail(function (msg) {
                        _this.set("processing", false);
                        _this.set("isRequestingQuote", false);
                        if (msg.errorMessage != null)
                            _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                        else
                            _this.setMessage(widget.options.textCheckoutQuoteErrorDefaultMessage, $.cv.css.messageTypes.error);
                    });
                },

                submitOrder: function () {
                    var vm = this;
                    vm.set("orderSubmitting", true);
                    vm.set("processing", true);

                    var d1 = vm.processLineChanges();
                    $.when(d1).done(function () {
                        if (vm.items() > 0)
                            vm.validateOrder(ORDERMODEORDER);
                        else {
                            vm.setMessage(widget.options.textSubmitOrderNoItems, $.cv.css.messageTypes.error);
                            vm.set("processing", false);
                            vm.set("orderSubmitting", false);
                        }
                    });
                },

                submitOrderPayPalExpress: function (e) {
                    var vm = this;

                    // If using Click & Collect, make sure user has selected either Delivery or Pickup.
                    var ok = true;
                    if (widget.options.enableStoreAvailabilityClickAndCollect) {
                        var selectedDelMode = vm.get("order.DeliveryMethodClickAndCollect");
                        if (selectedDelMode === "") {
                            vm.setMessage(widget.options.deliveryAddressModeClickAndCollectNotSet, $.cv.css.messageTypes.error);
                            ok = false;
                        }
                    }

                    if (ok) {
                        vm.set("isCheckoutWithPaypalExpress", true);

                        $.cv.css.trigger($.cv.css.eventnames.checkoutWithPayPalExpress, { e: e });
                    }
                },

                placeOrderOnHold: function () {
                    var _this = this;
                    var order = _this.get("order");
                    if (order._objectKey) {
                        _this.set("isHoldingOrder", true);
                        var d1 = $.cv.css.orders.holdCurrentOrder({ _objectKey: order._objectKey, triggerOrderChanged: !widget.options.reloadAfterOrderHeld, triggerOrderSubmitted: !widget.options.reloadAfterOrderHeld, holdreference: _this.holdReference });
                        _this.set("orderSubmitting", true);
                        _this.set("processing", true);
                        $.when(d1).done(function (msg) {
                            var data = msg.data;
                            if (!data.sessionHasTimedOut) {
                                $.cv.css.localSetCurrentOrder(null);
                                $.cv.css.localSetCurrentOrderLines(null);
                                if (widget.options.reloadAfterOrderHeld) {
                                    $.cv.util.redirect(widget.options.holdOrderRedirectUrl.format(order.SoOrderNo), {}, !widget.options.includeInBrowserHistory);
                                } else {
                                    _this.set("processing", false);
                                    _this.set("isHoldingOrder", false);
                                    // here we pass through a suffix, as we don't want the success message cleared out as a result of the cart being updated (and re-validated)
                                    _this.setMessage(widget.options.textHoldOrderConfirmSuccessful, $.cv.css.messageTypes.success, '-on-hold-success');
                                }
                                _this.set("holdReference", "");
                            } else {
                                _this.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, params, !widget.options.includeInBrowserHistory);
                            }
                        }).fail(function (msg) {
                            _this.set("processing", false);
                            _this.set("isHoldingOrder", false);
                            if (msg.errorMessage != null)
                                _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                            else
                                _this.setMessage(widget.options.textCheckoutErrorDefaultMessage, $.cv.css.messageTypes.error);
                        });
                    }
                },

                placeOrderOnHoldStayOnPage: function () {
                    viewModel.placeOrderOnHoldFromModal(false);
                },

                placeOrderOnHoldRedirect: function () {
                    viewModel.placeOrderOnHoldFromModal(true);
                },

                placeOrderOnHoldFromModal: function (redirect) {
                    if (viewModel.hasValidHoldReference()) {
                        widget.options.reloadAfterOrderHeld = redirect;
                        viewModel.placeOrderOnHold();
                        if (!redirect) {
                            $.fancybox.close();
                        }
                    } else {
                        viewModel.setMessage(widget.options.textHoldOrderReferenceEmptyMessage, $.cv.css.messageTypes.error);
                    }
                },

                saveAsTemplate: function () {
                    var _this = this;
                    _this.set("isSavingAsTemplate", true);
                    if (widget.options.saveAsTemplateUseModal) {
                        opts = {};
                        opts.templateName = _this.get("templateName");
                        var d1 = $.cv.css.orderTemplate.createTemplateFromCurrentOrder(opts);
                        _this.set("processing", true);
                        $.when(d1).done(function (msg) {
                            var data = msg.data
                            if (!data.sessionHasTimedOut) {
                                widget.trigger(TEMPLATESAVED);
                                if (widget.options.saveAsTemplateRedirectUrl != "")
                                    $.cv.util.redirect(widget.options.saveAsTemplateRedirectUrl, {}, !widget.options.includeInBrowserHistory);
                                else {
                                    _this.setMessage(widget.options.textSaveAsTemplateSuccessful, $.cv.css.messageTypes.success);
                                    _this.set("processing", false);
                                    _this.set("isSavingAsTemplate", false);
                                }
                                _this.set("templateName", "");
                            } else {
                                var params = {};
                                _this.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, params, !widget.options.includeInBrowserHistory);
                            }
                        }).fail(function () {
                            if (msg.errorMessage != null)
                                _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                            _this.set("isSavingAsTemplate", false);
                        });
                    } else {
                        _this.set("processing", false);
                        if (widget.options.saveAsTemplateRedirectUrl != "")
                            $.cv.util.redirect(widget.options.saveAsTemplateRedirectUrl, {}, !widget.options.includeInBrowserHistory);
                        else
                            _this.set("isSavingAsTemplate", false);
                    }
                },

                requestQuote: function () {
                    var _this = this, d1 = new $.Deferred();
                    if (this.items() > 0) {
                        this.set("processing", true);
                        this.set("orderSubmitting", true);
                        this.set("isRequestingQuote", true);
                        d1 = _this.processLineChanges();
                        $.when(d1).done(function () {
                            _this.validateOrder(ORDERMODEQUOTE);
                        });
                    } else
                        this.setMessage(widget.options.textRequestQuoteEmptyCartMessage, $.cv.css.messageTypes.error);
                },

                designStamps: function () {
                    $.cv.util.redirect(widget.options.designStampUrl, {}, !widget.options.includeInBrowserHistory);
                },

                cancelQuote: function () {
                    var _this = this;
                    if (_this.items() > 0) {
                        var d1 = $.cv.css.orders.cancelQuoteOrder();
                        _this.set("processing", true);
                        _this.set("isCancellingQuote", true);
                        $.when(d1).done(function (msg) {
                            var data = msg.data;
                            if (!msg.sessionHasTimedOut) {
                                $.cv.css.bindOnce($.cv.css.eventnames.localOrderChanged, function () {
                                    console.log(arguments);
                                    widget.trigger(QUOTECANCELLED);
                                    if (data.RedirectUrl !== "") {
                                        $.cv.util.redirect(data.RedirectUrl, {}, !widget.options.includeInBrowserHistory);
                                    }
                                    else
                                    {
                                        _this.setMessage(widget.options.textQuoteCancelSuccessful, $.cv.css.messageTypes.success);
                                        _this.set("isCancellingQuote", false);
                                    }
                                    _this.set("processing", false);
                                });
                            } else {
                                var params = {};
                                _this.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, params, !widget.options.includeInBrowserHistory);
                            }
                        }).fail(function () {
                            _this.set("processing", false);
                            _this.set("isCancellingQuote", false);
                            if (msg.errorMessage != null)
                                _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                        });
                    } else {
                        _this.setMessage(widget.options.textCancelQuoteEmptyCartMessage, $.cv.css.messageTypes.error);
                    }
                },

                hasProductCodesOutOfStock: false,

                notifyMeWhenInStock: function (e) {
                    var data = {
                        productCodes: "",
                        hasOutOfStockNotify: false,
                        onChange: function (flag) {
                            $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                        }
                    };
                    $.cv.css.trigger($.cv.css.eventnames.stockAvailabilityNotifyShowPopup, data);
                },

                setCartTotal: function (o) {
                    var vm = this,
                        incTax = $.cv.util.hasValue(o) ? o.isIncTax : vm.isIncTax;

                    vm.set("cartTotal", incTax ? vm.orderTotal() : vm.orderTotalExTax());
                    vm.set("cartTaxLabel", $.cv.util.string.format("({0} {1})", incTax ? "inc" : "ex", widget.options.gstPrompt));
                    vm.set("isIncTax", incTax);
                },

                exportCartToCsv: function () {
                    var vm = this;
                    var order = vm.get("order");
                    if (order._objectKey) {
                        vm.set("isExportingOrder", true);
                        vm.set("processing", true);

                        // TODO: See if we can do this with an ajax call so is processing works - for another day

                        window.location = "/OrderLineDownload.aspx";
                        
                        vm.set("isExportingOrder", false);
                        vm.set("processing", false);
                    }
                },

                cartTotal: kendo.toString(0, "c"),

                cartTaxLabel: (widget.options.isIncTax ? "inc " : "ex ") + widget.options.gstPrompt,

                isIncTax: widget.options.isIncTax
            });

            initDataSource();

            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";
            return html;
        }
    }

    // register the widget
    $.cv.ui.widget(orderSummaryWidget);
})(jQuery);
