/*
 *  Widget Skeleton: ViewModel pattern, no dataSource

    Reference for Kendo MVVM bindings: http://docs.kendoui.com/getting-started/framework/mvvm/bindings/value

    require
    Scripts/jquery-1.8.3.js
    Scripts/kendo.core.js
    Scripts/kendo.data.js
    Scripts/kendo.binder.js
    Scripts/cv.js
    Scripts/cv.css.js (For CSS Related Widgets)
    Scripts/cv.css.orders.js (For CSS Related Widgets)
    Scripts/cv.css.paymentProcessor.js (For CSS Related Widgets)
    Scripts/cv.util.js
    Scripts/cv.widget.kendo.js

    Conventions and requirements:
    * declare event names as variables to avoid typos
    * declare a widget definition object including the following:
    * include "name" property specifying the name of the widget
    * include options property containing the default widget option values
    *   avoid setting option default to "undefined", as this prevents declarative initialisation of that option
    *   note that options are case sensitive
    *   group options as follows: view model defaults, view model functional flags, event handlers (= null), view functional flags, view text defaults, viewTemplate (= null)
    * include events array for any events to be triggered
    * reference the widget object as "widget" - var widget = this; - inside widget object methods
    *   then reference options as widget.options, and the widget instance DOM element as widget.element
    * initialise method
    *   purpose - get the view - get the view model - bind the view model to the view
    *   check for an internal view
    *   if no internal view, 
    *       use options.viewTemplate or call _getDefaultViewTemplate 
    *       note tha viewTemplate option is an element ID, not template HTML
    *       evaluate the template passing the widget.options
    *       set _viewAppended to true
    *   bind the View Model to the View
    * destroy method
    *   if DOM elements have been appended, they should be removed
    *   remove the data element from widget.element
    * ViewModel
    *   declare _getViewModel() function which returns the widget view model
    *   initialise method should assign this to viewModel widget property
    *   refer to options using widget.options.xxx
    *   declare the viewModel object as kendo.observable() - do not extend widget.options - as this may include event handlers and other properties not required in the view model
    *   avoid referring to DOM elements, as they may not exist in a particular implementation's view
    *   avoid triggering events on DOM elements - trigger events on the widget object (they must be defined in the events array)
    *   avoid retrieving DOM event parameters from viewModel method parameters - unless they are explicitly defined as keyUp event handlers or similar where the DOM event parameters are necessary
    * View
    *   declare _getDefaultViewTemplate() method which returns the default View template html
    *   default view template should be modified depending on the widget options
    *
    * register the widget by passing the widget definition object to $.cv.ui.widget()

 */

// TODO: add in other payment options, currently only handles account, credit card (standard and eway), approval and paypal payments

;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        OPTIONSRENDERED = "optionsRendered",
        PAYMENTUNSUCCESSFUL = "paymentUnsuccessful",

        PAYMENTPROVIDERMODESTANDARD = "standard",
        PAYMENTPROVIDERMODEWAY = "eway",
        PAYMENTPROVIDERMODEWAYV3 = "eway-v3",

        EWAYPROCESSINGMODE = "ClientSidePost",
        MASTERCARD = "CARDMASTERCARD",
        VISA = "CARDVISA",
        AMEX = "CARDAMEX",
        DINERSCLUB = "CARDDINERS";

    var paymentOptionsWidget = {


        // Standard Variables

        // widget name
        name: "paymentOptions",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            autoBind: true,
            paymentOptionTextField: "label",
            paymentOptionValueField: "value",
            triggerMessages: true,
            // viewModel flags
            accountPayment: false,
            isAccountPaymentPage: false,
            paymentOptionsVisible: true,
            creditCard: false,
            paypal: false,
            bpay: false,
            weWillCallYou: false,
            eft: false,
            eftBankReceiptNumberDisabled: false,
            approval: false,
            quote: false,
            thirdParty: false,
            zeroDollar: false,
            isFreightQuoteSelected: false,
            isFreightQuoteInstructsVisisble: false,
            thirdPartyInstallments: false,
            includeInBrowserHistory: true,
            showValidationMessagesNotPreventingCheckout: false,
            autoSelectCardType: true,
            currentSelectedOption: "accountPayment",
            paymentTypes: {
                unallocatedPayment: "UNALLOC_PAY",
                account: "ACCOUNT",
                card: "CARD",
                paypal: "PAYPAL",
                bpay: "BPAY",
                weWillCallYou: "CALL",
                eft: "EFT",
                zero: "ZERO",
                approval: "APPROVAL", 
                approvalConfigRequired: "ApprovalConfigurationError",
                quote: "QUOTE",
                giftCard: "GIFT",
                thirdParty: "3RDPARTY",
                thirdPartyInstallments: "_3RDPTYINS"
            },
            paymentTypeLabels: {
                UNALLOC_PAY: "Unallocated Payment",
                ACCOUNT: "Account",
                CARD: "Credit Card",
                PAYPAL: "Paypal",
                BPAY: "BPay",
                WEWILLCALLYOU: "We Will Call You",
                EFT: "EFT",
                APPROVAL: "Approval",
                ApprovalConfigurationError: "Configure Approver",
                QUOTE: "Quote",
                GIFTCARD: "gift",
                THIRDPARTY: "3rd Party"
            },
            paymentTypeValues: {
                UNALLOC_PAY: "unallocatedPayment",
                ACCOUNT: "accountPayment",
                CARD: "creditCard",
                PAYPAL: "paypal",
                BPAY: "bpay",
                CALL: "weWillCallYou",
                EFT: "eft",
                ZERO: "zero",
                APPROVAL: "approval",
                ApprovalConfigurationError: "",
                QUOTE: "quote",
                GIFTCARD: "gift",
                THIRDPARTY: "thirdParty",
                _3RDPTYINS: "thirdPartyInstallments"
            },
            cardPromptOverrides: { Visa: "", MasterCard: "Master Card", Amex: "" },
            approvalPromptOverrides: { APPROVALPAYONACCOUNT: "", APPROVALPAYONCARD: "" },
            cardExpiryMonthPrompts: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
            cardYearsToShow: 10,
            amexNumberOfDigits: 15,
            nonAmexNumberOfDigits: 16,

            // Regex options for the various Card Types
            cardTypeRegExVisa: "^4",
            // This one is more complex as in addition to relatively straightforward prefix that can be used in original 5 series BIN (510000 - 559999) now have new 2 series BIN range (222100 - 272099)
            // For the 5 series only need at least 2 digits entered to detect, but for the new 2 series  because of the boundary of it's range, unfortunately it needs 6 digits to detect.
            cardTypeRegExMasterCard: "^5[1-5]|^2(?:2(?:2[1-9]|[3-9]\\d)|[3-6]\\d\\d|7(?:[01]\\d|20))-?\\d{2}",
            cardTypeRegExDiners: "^3[068]",
            cardTypeRegExAmex: "^3[47]",

            // events
            // view flags
            sessionTimeOutRedirectUrl: 'login.aspx',
            paymentOkRedirectUrl: "OnlinePaymentOK.aspx",
            quoteSubmittedRedirectUrl: "CustomPage.aspx?CustomPage=QuoteSubmitted",
            usingAddressValidation: false,
            showNumericCardExpiry: false,
            // view text defaults
            textButtonAccountPayment: 'Submit Order',
            textButtonCreditCard: 'Finalise Order',
            textButtonPaypal: 'Process Order With PayPal',
            textButtonBpay: 'Submit Order',
            textButtonWeWillCallYou: 'Submit Order',
            textButtonEft: 'Submit Order',
            textButtonDefault: 'Submit Order',
            textButtonApproval: 'Submit Order',
            textButton3rdParty: 'Process Order',
            textButtonThirdPartyInstallments: 'Process Order',
            textErrorGettingPaymentOptions: "There was an error retrieving your payment options, please try again later",
            textPleaseSelectPrompt: "Please Select...",
            textSelectMonth: 'Select Month',
            textSelectYear: 'Select Year',
            textErrorNoApprovalTypeSelected: "Please select an approval type",
            textErrorNoBankReceiptInput: "Please input your EFT Receipt",
            invalidCreditCardInformation: "Your credit card information is invalid",
            giftCardBalanceNotZeroMessage: "Your gift card balance is not zero",
            textErrorNotAcknowledgedFreightQuote: "Please acknowledge that you wish to receive a freight quote",
            textErrorNoWeWillCallYouNumber: "Please input the number that we should call you on",
            processPaymentUnsuccessfulMessage: "",
            // widget settings
            paymentProviderMode: PAYMENTPROVIDERMODESTANDARD,
            // This can be used when need to show details for some other order other than the users current order e.g. order searching, quotes etc.
            // Note: Currently it has only been implemented here for retreival and display in a read only fashion (e.g. can be used in checkout summary not 
            // in checkout details entry or editing views). If this needs to be changed bear in mind that any functions in here that alter the order will 
            // likely need changes for this.
            orderNoOverride: 0,
            // view Template
            viewTemplate: '', // treat like its an id
            itemViewTemplate: null
        },

        events: [DATABINDING, DATABOUND, OPTIONSRENDERED, PAYMENTUNSUCCESSFUL],

        viewModel: null,

        view: null,

        // private property
        _viewAppended: false,
        _itemViewAppended: false,

        // Standard Methods
        initialise: function (el, o) {
            // WARNING: this is not an MVVM widget, thus we initialize here
            var widget = this;

            // Register Widget so we can determine when they are all completed loading
            $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadRegistration, { name: widget.name }); // MAF USE ONLY

            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
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
                if (!widget._itemViewAppended) {
                    widget.view += widget._getDefaultItemViewTemplate();
                }
                widget.element.html(widget.view);
            }
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);
        },

        initialised: function() {
            this.wireupEvents();
        },

        wireupEvents: function() {
            var widget = this;

            // Subscribe to Approval Widget events
            //

            $.cv.css.bind($.cv.css.eventnames.approvalConfirmed, $.proxy(widget.viewModel.approvalConfirmed, widget.viewModel));

            // Note: the following two are handled by the same method as we just 
            // want to re-load anyway, We can adjust the handlers for this as needed.
            $.cv.css.bind($.cv.css.eventnames.approvalError,        $.proxy(widget.viewModel.approvalConfirmed, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.approvalNotSpecified, $.proxy(widget.viewModel.approvalConfirmed, widget.viewModel));

            // Subscribe to Other Events
            //

            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.orderUpdated, widget.viewModel));
            
            // Listen to made visible and selection events of freight quote submit chosen on freightCarrier widget so can hide this display as not relevant to pay for order 
            // in that case, or to trigger validation error at submission if not freight quote visible but not selected / acknowledged . When submit will submit as quote 
            // instead of noraml payment submission.
            $.cv.css.bind($.cv.css.eventnames.freightQuoteSelected,          $.proxy(widget.viewModel.freightQuoteSelected,          widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.freightQuoteInstructsVisisble, $.proxy(widget.viewModel.freightQuoteInstructsVisisble, widget.viewModel));

            $.cv.css.bind($.cv.css.eventnames.addressBeingEdited,       $.proxy(widget.viewModel.addressBeingEdited,       widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressValidationUpdated, $.proxy(widget.viewModel.addressValidationUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.processingGiftCard,       $.proxy(widget.viewModel.processingGiftCard,       widget.viewModel));

            if (widget.options.isAccountPaymentPage) {
                $.cv.css.bind($.cv.css.eventnames.showingAccountPaymentSummary, $.proxy(widget.viewModel.showingAccountPaymentSummary, widget.viewModel));
            }

            $.cv.css.bind($.cv.css.eventnames.continueToPayment, $.proxy(widget.viewModel.continueToPaymentSelected, widget.viewModel));

            widget.trigger(DATABOUND);
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

        submitOrder: function () {
            var widget = this;
            widget.viewModel.submitOrder();
        },

        // private function
        _getViewModel: function () {
            var widget = this;

            var init = function () {
                $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadStarted, { name: widget.name }); // MAF USE ONLY

                viewModel.set("accountPayment", false);
                viewModel.set("paypal", false);
                viewModel.set("bpay", false);
                viewModel.set("weWillCallYou", false);
                viewModel.set("eft", false);
                viewModel.set("quote", false);
                viewModel.set("thirdParty", false);
                viewModel.set("thirdPartyInstallments", false);
                viewModel.set("creditCard", false);
                viewModel.set("zeroDollar", false);

                // Get the payment options for order that the widget is using. It could be either the users current 
                // order or some other order if have a orderNoOverride set e.g. order approval, payment for accepted quotes etc.
                var d1;
                if (widget.options.isAccountPaymentPage) {
                    d1 = $.cv.css.paymentProcessor.getPaymentOptionsForAccountPayment();
                } else {
                    var order = $.cv.util.queryStringValue("Order");
                    if (order != null && order.length > 0) {
                        widget.options.orderNoOverride = order;
                    }
                    d1 = widget.options.orderNoOverride === 0
                                ? $.cv.css.paymentProcessor.getPaymentOptionsForCurrentOrder()
                                : $.cv.css.paymentProcessor.getPaymentOptionsForSelectedOrder({ orderNo: widget.options.orderNoOverride });
                }

                $.when(d1).done(function (msg) {
                    var data = msg.data;
                    if (msg.errorMessage === null || msg.errorMessage.length == 0) {
                        viewModel.set("paymentOptions", data);

                        if (data.length > 0) {
                            var approvalPayment = $.grep(viewModel.get("paymentOptions"), function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.approval) > -1 || item.Key == widget.options.paymentTypes.approvalConfigRequired); });
                            // for approvals only show the approval option
                            if (approvalPayment.length > 0) {
                                viewModel.set("approval", true);
                                viewModel.selectApprovalPayment();
                                if (approvalPayment[0].Key == widget.options.paymentTypes.approvalConfigRequired) {
                                    viewModel.set("approvalConfigRequired", true);
                                    viewModel.set("approvalRequired", true);
                                } else {
                                    if (approvalPayment.length == 1)
                                        viewModel.set("approvalType", approvalPayment[0].Key);
                                }
                            } else {
                                viewModel.set("approval", false);
                                var cardOptions = $.grep(viewModel.get("paymentOptions"), function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.card) > -1); });
                                var nonCardOptions = $.grep(viewModel.get("paymentOptions"), function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.card) == -1); });
                                var cardsAvailable = cardOptions.length > 0 ? 1 : 0;
                                if (cardsAvailable && (widget.options.paymentProviderMode == PAYMENTPROVIDERMODEWAY || widget.options.paymentProviderMode == PAYMENTPROVIDERMODEWAYV3)) {
                                    getPaymentProviderDetails();
                                    ewayCreateAccessCode(false, 0);
                                }

                                // If quote is not in the payment options set so it is not shown. It will get eanbled further down if it came back in options.
                                // Shouldn't rely on widget options to enable it.
                                viewModel.set("quote", false);

                                // if only a single option is available default the selction to this option
                                var isSingleOption = (cardsAvailable + nonCardOptions.length) == 1;
                                $.each(data, function (idx, item) {
                                    switch (item.Key) {
                                        case widget.options.paymentTypes.account:
                                            viewModel.set("accountPayment", true);
                                            if (isSingleOption)
                                                viewModel.selectAccountPayment();
                                            break;
                                        case widget.options.paymentTypes.paypal:
                                            viewModel.set("paypal", true);
                                            if (isSingleOption)
                                                viewModel.selectPaypal();
                                            break;
                                        case widget.options.paymentTypes.bpay:
                                            viewModel.set("bpay", true);
                                            if (isSingleOption)
                                                viewModel.selectBpay();
                                            break;
                                        case widget.options.paymentTypes.weWillCallYou:
                                            viewModel.set("weWillCallYou", true);
                                            if (isSingleOption)
                                                viewModel.selectWeWillCallYou();
                                            break;
                                        case widget.options.paymentTypes.eft:
                                            viewModel.set("eft", true);
                                            viewModel.set("eftReceiptNumber", item.ReceiptNumber);
                                            if (isSingleOption)
                                                viewModel.selectEft();
                                            break;
                                        case widget.options.paymentTypes.quote:
                                            viewModel.set("quote", true);
                                            if (isSingleOption)
                                                viewModel.selectQuote();
                                            break;

                                        case widget.options.paymentTypes.thirdParty:
                                            viewModel.set("thirdParty", true);
                                            if (isSingleOption)
                                                viewModel.select3rdParty();
                                            break;

                                        case widget.options.paymentTypes.thirdPartyInstallments:
                                            viewModel.set("thirdPartyInstallments", true);
                                            if (isSingleOption)
                                                viewModel.selectThirdPartyInstallments();
                                            break;

                                        case widget.options.paymentTypes.zero:
                                            viewModel.set("zeroDollar", true);
                                            if (isSingleOption) {
                                                viewModel.selectZero();
                                            }
                                            break;

                                        default:
                                            if (item.Key.indexOf(widget.options.paymentTypes.card) > -1) {
                                                viewModel.set("creditCard", true);
                                                if (isSingleOption)
                                                    viewModel.selectCreditCard();
                                            }
                                    }
                                });
                            }
                            // bind the options to a data source so it can be viewed as a select list, radio button list etc
                            widget.options.dataSource = viewModel.get("paymentOptions");
                            setDataSource();
                        } else {
                            $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadFinished, { name: widget.name });
                        }
                    } else {
                        $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadFinished, { name: widget.name });
                    }
                }).fail(function (msg) {
                    $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadFinished, { name: widget.name });
                    viewModel.setMessage(widget.options.textErrorGettingPaymentOptions, $.cv.css.messageTypes.error);
                });
            };

            var setDataSource = function () {
                widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);

                if (widget.options.autoBind) {
                    widget.dataSource.fetch(function () {
                        $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadFinished, { name: widget.name });
                    });
                }
                viewModel.updateItemList();
            };

            var getPaymentProviderDetails = function () {
                var d1 = $.cv.css.paymentProcessor.getPaymentProviderDetails(), titles = [], cardHolderTitle = "";
                $.when(d1).done(function (msg) {
                    if (!msg.errorMessage || msg.errorMessage.length == 0) {
                        $.each(msg.data, function (idx, item) {
                            if (item != "")
                                titles.push({ value: item, text: item });
                            else
                                titles.push({ value: item, text: widget.options.textPleaseSelectPrompt });
                        });
                        if (viewModel.get("cardHolderTitle").length > 0)
                            cardHolderTitle = viewModel.get("cardHolderTitle");
                        viewModel.set("cardHolderTitleDataSource", titles);
                        // timing thing, if the eway access code call returns before the provide details call the field could be disabled and the value not properly updated
                        if (cardHolderTitle.length > 0 && viewModel.get("cardDetailsRemembered")) {
                            viewModel.set("cardDetailsRemembered", false);
                            // set it back to nothing, then reset it to fire off the change event
                            viewModel.set("cardHolderTitle", "");
                            viewModel.set("cardHolderTitle", cardHolderTitle);
                            viewModel.set("cardDetailsRemembered", true);
                        }
                    }
                }).fail(function (msg) {
                    // TODO: should there be an error message displayed here?
                    //viewModel.setMessage(widget.options.textErrorGettingPaymentOptions, $.cv.css.messageTypes.error);
                });
            };

            var ewayCreateAccessCode = function (clearRememberedPaymentInfo, orderNoForAccessCode) {
                var customer = null;
                var method = null;

                orderNoForAccessCode = orderNoForAccessCode || 0;

                // WARNING(jwwishart) CSS uses the cssWebServicesAjax, MAF will fall back to
                // the paymentProcessor. I.e. use whichever method we can get our hands on.
                // One of them MUST be available. I.E. The method() call ought never fail. If it does
                // method being null is not the real problem :o)
                if ($.cssWebServicesAjax && $.cssWebServicesAjax.eWayCreateAccessCode) {
                    method = $.cssWebServicesAjax.eWayCreateAccessCode;
                } else if ($.cv.css.paymentProcessor && $.cv.css.paymentProcessor.ewayCreateAccessCode) {
                    method = $.cv.css.paymentProcessor.ewayCreateAccessCode;
                }

                method({ 
                    clearRememberedPaymentInfo: clearRememberedPaymentInfo,
                    orderNoForAccessCode: orderNoForAccessCode,
                    isAccountPayment: widget.options.isAccountPaymentPage
                }).done(function (response) {
                    var data = response.d || response.data; // Responses for: Web Services || Dynamic Service

                    if (!data.IsError) {
                        if (data && data.Response && data.Response.Customer && data.Response.Customer.TokenCustomerID != null) {
                            customer = data.Response.Customer;
                            viewModel.setCardDetails(
                                false,
                                true,
                                customer.Title,
                                customer.CardName,
                                customer.CardNumber.substring(0, 4),
                                customer.CardNumber.substring(4, 8),
                                customer.CardNumber.substring(8, 12),
                                customer.CardNumber.substring(12, 16),
                                customer.CardExpiryMonth,
                                customer.CardExpiryYear,
                                "",
                                customer.CardNumber,
                                "");
                        } else {
                            viewModel.clearCardDetails();
                        }
                    } else {
                        viewModel.setMessage(data.Message, $.cv.css.messageTypes.error);
                    }
                }).fail(function (msg) {
                    // TODO: should there be an error message displayed here?
                    //viewModel.setMessage(widget.options.textErrorGettingPaymentOptions, $.cv.css.messageTypes.error);
                });
            };

            var getDataView = function () {
                // check if ds is initialised
                var array = [];
                var cardAlreadyAdded = false;
                if (!widget.dataSource)
                    return array;
                $.each(widget.dataSource.view(), function (idx, item) {
                    // add standard commands
                    item.Index = idx;
                    var key = item.Key;
                    if (key.indexOf(widget.options.paymentTypes.card) > -1)
                        key = widget.options.paymentTypes.card;
                    // only add once occurance of credit card to the option list
                    if (!cardAlreadyAdded) {
                        // allow the labels and values to be customised on the data source options list
                        item[widget.options.paymentOptionTextField] = widget.options.paymentTypeLabels[key];
                        item[widget.options.paymentOptionValueField] = widget.options.paymentTypeValues[key];
                        array.push(item);
                    }
                    if (key.indexOf(widget.options.paymentTypes.card) > -1)
                        cardAlreadyAdded = true;
                });
                return array;
            };

            var currentSurchargeType = "";
            var currentSurcharge = 0;
            var checkAgainst = [
                "CardAny",
                "CardAmex",
                "CardDinersClub",
                "CardMasterCard",
                "CardVisa",
                "BPay",
                "EFT",
                "PayPal",
                "3rdParty",
                "Call",
                "UserCall"
            ];

            var clearSurcharge = function() {
                widget.viewModel.set("cardChargeInfo", { CreditCardChargeAmount: 0, CreditCardChargeAmountExTax: 0, ChargePercent: 0 });
                currentSurchargeType = "";

                var params = {
                    ChargeAmount: 0,
                    ChargeAmountExTax: 0,
                    ChargePercent: 0
                };
                $.cv.css.trigger($.cv.css.eventnames.accountPaymentSurchargeChanged, params);
            };

            var setSurcharge = function (currentSelection) {
                if (currentSelection) {
                    //Has It Changed?
                    if (currentSelection.toLowerCase() != currentSurchargeType.toLowerCase()) {
                        // Set it so we dont spam it
                        currentSurchargeType = currentSelection;
                        // Check all against possible
                        var indexToCheck = -1;
                        for (var index = 0; index < checkAgainst.length; index++) {
                            if (checkAgainst[index].toLowerCase() == currentSelection.toLowerCase()) {
                                indexToCheck = index;
                                break;
                            }
                        }

                        var check = new $.Deferred();
                        if (widget.viewModel.isAccountPaymentPage) {
                            if (indexToCheck !== -1) {
                                check = $.cv.css.accounts.getAccountPaymentSurcharge({ paymentMethod: checkAgainst[indexToCheck], receiptNumber: widget.viewModel.get("eftReceiptNumber") });
                            } else {
                                check.resolve({
                                    data: { CreditCardChargeAmount: 0, CreditCardChargeAmountExTax: 0, ChargePercent: 0 },
                                    errorMessage: null
                                });
                            }
                        } else {
                            check = indexToCheck != -1
                                ? $.cv.css.orders.applyPaymentSurcharge({ paymentMethod: checkAgainst[indexToCheck], orderNo: widget.options.orderNoOverride })
                                : $.cv.css.orders.removePaymentSurcharge();
                        }

                        check.done(function(response) {
                            if (indexToCheck != -1) {
                                var result = widget.viewModel.isAccountPaymentPage
                                    ? response.data
                                    : response.data.result[0];

                                widget.viewModel.set('cardChargeInfo', result);
                                if (response.data.errorMessage != null && response.data.errorMessage != "") {
                                    widget.viewModel.setMessage(response.data.errorMessage, $.cv.css.messageTypes.error);
                                }
                            } else {
                                widget.viewModel.set('cardChargeInfo', null);
                                if (response.errorMessage != null && response.errorMessage != "") {
                                    widget.viewModel.setMessage(response.errorMessage, $.cv.css.messageTypes.error);
                                }
                            }

                            if (widget.viewModel.isAccountPaymentPage) {
                                var params = indexToCheck !== -1
                                    ? {
                                        ChargeAmount: response.data.CreditCardChargeAmount,
                                        ChargeAmountExTax: response.data.CreditCardChargeAmountExTax,
                                        ChargePercent: response.data.ChargePercent
                                    }
                                    : {
                                        ChargeAmount: 0,
                                        ChargeAmountExTax: 0,
                                        ChargePercent: 0
                                    };
                                $.cv.css.trigger($.cv.css.eventnames.accountPaymentSurchargeChanged, params);
                            } else {
                                $.cv.css.trigger($.cv.css.eventnames.orderChanged, { orderChangedBySurcharge: true });
                            }

                            currentSurcharge = indexToCheck != -1 ? 1 : 0;
                        });
                    }
                }
            };

            var viewModel = kendo.observable({

                // Properties for UI elements
                paymentSuccessful: false, // states on validation failure to update UI (used in mobile)

                paymentUnsuccessful: false,

                isProcessing: false,

                isAccountPaymentPage: false,
                paymentOptionsVisible: widget.options.paymentOptionsVisible,
                unallocatedPaymentAmount: 0,
                bPayRefNum: "",

                isUnallocatedPayment: function() {
                    return viewModel.get("unallocatedPaymentAmount") > 0;
                },

                message: '',

                currentSelectedOption: widget.options.currentSelectedOption,

                itemList: getDataView(),

                dataSource: widget.options.dataSource,

                approvalType: "",

                creditCardType: "",

                cardHolderTitle: "", // eway

                cardHolderTitleDataSource: [], // eway

                cardHolderName: "",

                cardChargeInfo: {},

                cardNumber1: "",

                cardNumber2: "",

                cardNumber3: "",

                cardNumber4: "",

                cardNumber: "",

                cardExpiryMonth: "",

                cardExpiryYear: "",

                cardSecurityCode: "",

                showingAccountPaymentSummary: function (msg) {
                    this.set("isAccountPaymentPage", msg.IsAccountPaymentPage);
                    this.set("paymentOptionsVisible", msg.IsPaymentOptionsVisible);
                    this.set("unallocatedPaymentAmount", msg.UnallocatedPaymentAmount);
                    this.set("eftReceiptNumber", msg.ReceiptNumber);
                    this.set("bPayRefNum", msg.BPayRefNum);

                    if (msg.IsUnallocatedPayment) {
                        this.set("accountPayment", false);
                        this.set("creditCard", false);
                        this.set("paypal", false);
                        this.set("bpay", false);
                        this.set("weWillCallYou", false);
                        this.set("eft", false);
                        this.set("approval", false);
                        this.set("quote", false);
                        this.set("thirdParty", false);

                        this.selectUnallocatedPayment();
                    }
                },

                rememberPayment: false, // eway

                cardDetailsRemembered: false, // eway

                isEWayProcessing: false,

                eWayFieldsEnabled: function () {
                    var enabled = true;
                    if (this.get("cardDetailsRemembered"))
                        enabled = false;
                    if (this.get("isEWayProcessing"))
                        enabled = true;
                    if (this.get("isDisabled"))
                        enabled = false;
                    return enabled;
                },

                eWayFieldsReadOnly: function () {
                    var readOnly = false;
                    if (this.get("isEWayProcessing"))
                        readOnly = true;
                    return readOnly;
                },

                eWayAccessCode: "", // eway

                // Expose method on VS for derived widgets to use
                eWayCreateAccessCode: ewayCreateAccessCode,

                totalPaymentBalanceAfterEnteredGiftCards: -1,

                eftReceiptNumber: "",

                addressBeingEdited: function () {
                    if (widget.options.usingAddressValidation) {
                        this.set("isDisabled", true);
                    }
                },

                isDisabled: widget.options.usingAddressValidation,
                addressValidationUpdated: function (data) {
                    this.set("isDisabled", !data.valid);
                },

                // UI Element state

                isGiftCardBalanceZero: function () {
                    return this.get("totalPaymentBalanceAfterEnteredGiftCards") == 0;
                },

                clearExistingMessages: true,

                accountPayment: widget.options.accountPayment,

                creditCard: widget.options.creditCard,

                paypal: widget.options.paypal,

                bpay: widget.options.bpay,

                weWillCallYou: widget.options.weWillCallYou,

                eft: widget.options.eft,

                approval: widget.options.approval,

                quote: widget.options.quote,

                thirdParty: widget.options.thirdParty,

                thirdPartyInstallments: widget.options.thirdPartyInstallments,

                approvalConfigRequired: false,
                approvalRequired: false,

                paymentOptions: {},

                validationPreventingCheckout: false,

                hasOptions: false,

                hasMultipleOptions: function () {
                    var optionsCount = 0;
                    if (this.get("accountPayment"))
                        optionsCount++;
                    if (this.get("creditCard"))
                        optionsCount++;
                    if (this.get("paypal"))
                        optionsCount++;
                    if (this.get("bpay"))
                        optionsCount++;
                    if (this.get("weWillCallYou"))
                        optionsCount++;
                    if (this.get("eft"))
                        optionsCount++;
                    if (this.get("approval"))
                        optionsCount++;
                    if (this.get("quote"))
                        optionsCount++;
                    if (this.get("thirdParty"))
                        optionsCount++;
                    return optionsCount > 1;
                },

                hasCardHolderTitles: function () {
                    return this.get("cardHolderTitleDataSource").length > 0;
                },

                accountPaymentSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.account];
                },

                creditCardSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.card];
                },

                paypalSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.paypal];
                },

                bpaySelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.bpay];
                },

                weWillCallYouSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.weWillCallYou];
                },

                eftSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.eft];
                },

                approvalSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.approval];
                },

                thirdPartySelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.thirdParty];
                },

                thirdPartyInstallmentsSelected: function () {
                    return this.get("currentSelectedOption") == widget.options.paymentTypeValues[widget.options.paymentTypes.thirdPartyInstallments];
                },

                creditCardTypeValid: function () {
                    return (this.get("creditCardType") != "");
                },

                cardHolderNameValid: function () {
                    return this.get("cardHolderName") != "";
                },

                cardNumberValid: function () {
                    // cardNumberFull() can return an actual number, ensure it is a string.
                    var cardNumber = this.cardNumberFull().toString();

                    return cardNumber.length == this.creditCardDigitsRequired();
                },

                cardExpiryMonthValid: function () {
                    return this.get("cardExpiryMonth") != "";
                },

                cardExpiryYearValid: function () {
                    return this.get("cardExpiryYear") != "";
                },

                cardSecurityCodeValid: function () {
                    return this.get("cardSecurityCode") != "";
                },

                setCardDetails: function (
                    rememberPayment,
                    cardDetailsRemembered,
                    cardHolderTitle,
                    cardHolderName,
                    cardNumber1,
                    cardNumber2,
                    cardNumber3,
                    cardNumber4,
                    cardExpiryMonth,
                    cardExpiryYear,
                    cardSecurityCode,
                    cardNumber,
                    creditCardType)
                {
                    this.set("rememberPayment", rememberPayment);
                    this.set("cardDetailsRemembered", cardDetailsRemembered);

                    this.set("cardHolderTitle", cardHolderTitle);
                    this.set("cardHolderName", cardHolderName);
                    this.set("cardNumber1", cardNumber1);
                    this.set("cardNumber2", cardNumber2);
                    this.set("cardNumber3", cardNumber3);
                    this.set("cardNumber4", cardNumber4);

                    var month = cardExpiryMonth;
                    if (month && month.toString().length == 1) {
                        month = "0" + month.toString();
                    }
                    this.set("cardExpiryMonth", month);

                    var year = cardExpiryYear;
                    if (year && year.toString().length == 1) {
                        year = "0" + year.toString();
                    }
                    this.set("cardExpiryYear", year);

                    this.set("cardSecurityCode", cardSecurityCode);
                    this.set("cardNumber", cardNumber);
                    this.set("creditCardType", creditCardType);

                    if (cardDetailsRemembered === true) {
                        this.setCreditCardType();
                    }

                    // Reset success state
                    this.set("paymentSuccessful", false);
                    this.set("paymentUnsuccessful", false);

                    widget.signal('refreshWidgets'); // MAF
                },

                clearCardDetails: function () {
                    this.setCardDetails(false, false, "", "", "", "", "", "", "", "", "", "", "");
                },

                // functions for UI events

                hasGiftCards: false,

                orderUpdated: function (data) {
                    if (data && $.cv.util.hasValue(data.orderNoOverride)) {
                        widget.options.orderNoOverride = data.orderNoOverride;

                        init();
                    }

                    var order = this.getCurrentOrder(widget.options.displayingOrderInformation);
                    if (order != null && order.TotalPaymentBalanceAfterEnteredGiftCards != undefined) {
                        this.set("totalPaymentBalanceAfterEnteredGiftCards", order.TotalPaymentBalanceAfterEnteredGiftCards);

                        var giftCardCount = 0;
                        $.each(order.GiftCards || [], function () { giftCardCount++; });

                        this.set("hasGiftCards", giftCardCount > 0);

                        if (this.isGiftCardBalanceZero()) {
                            viewModel.selectCreditCard();
                        }
                    } else {
                        this.set("totalPaymentBalanceAfterEnteredGiftCards", -1);
                    }

                    if (!data || (data && data.orderChangedBySurcharge != undefined && !data.orderChangedBySurcharge)) {
                        // only get into here if it was not the set surcharge method that trigger the order update
                        // don't go into a continuous loop
                        currentSurchargeType = "";
                        if (!this.creditCardSelected()) {
                            setSurcharge(this.get("currentSelectedOption"));
                        } else {
                            setSurcharge(this.get("creditCardType"));
                        }
                    }
                },

                getCurrentOrder: function (loadIfNull) {
                    // Get the order that the widget is using that server call retrieved and placed in local storage. It could be either 
                    // the users current  order or some other order if have a orderNoOverride set e.g. order approval, payment for accepted quotes etc.
                    var order = widget.options.orderNoOverride === 0
                        ? $.cv.css.localGetCurrentOrder(loadIfNull)
                        : $.cv.css.localGetSelectedOrder(widget.options.orderNoOverride, "", loadIfNull);
                    return order;
                },

                submitButtonText: function () {
                    switch (this.get("currentSelectedOption")) {
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.account]:
                            return widget.options.textButtonAccountPayment;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.card]:
                            return widget.options.textButtonCreditCard;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.paypal]:
                            return widget.options.textButtonPaypal;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.bpay]:
                            return widget.options.textButtonBpay;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.weWillCallYou]:
                            return widget.options.textButtonWeWillCallYou;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.eft]:
                            return widget.options.textButtonEft;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.approval]:
                            return widget.options.textButtonApproval;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.thirdParty]:
                            return widget.options.textButton3rdParty;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.thirdPartyInstallments]:
                            return widget.options.textButtonThirdPartyInstallments;
                        default:
                            return widget.options.textButtonDefault;
                    }
                },

                // Timeouts...
                redirectToUrl: function (fallbackUrl, params, includeInBrowserHistory, is3rdParty) {
                    if ($.cv.ajax.settings.timeoutRedirectUrl == "")
                        $.cv.util.redirect(fallbackUrl, params, !includeInBrowserHistory, is3rdParty);
                    else
                        $.cv.util.redirect($.cv.ajax.settings.timeoutRedirectUrl, params, !includeInBrowserHistory, is3rdParty);
                },

                // Successful payments...
                redirect: function (uri, params, includeInBrowserHistory, is3rdParty) {
                    $.cv.util.redirect(uri, params, !includeInBrowserHistory, is3rdParty);
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                clearMessage: function () {
                    this.set("clearExistingMessages", true);
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: widget.name, clearExisting: this.get("clearExistingMessages") });
                },

                updateItemList: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("hasOptions", dataView.length > 0);
                    widget.trigger(OPTIONSRENDERED);
                    $.cv.css.trigger($.cv.css.eventnames.paymentOptionsRendered);
                },

                approvalConfirmed: function () {
                    var _this = this;
                    _this.refreshDatasource();
                },

                freightQuoteSelected: function (opts) {
                    var _this = this;
                    _this.set("isFreightQuoteSelected", opts.isSelected);

                    if ($.cv.util.hasValue(opts.refreshPaymentOptionsDataSoure) === true
                         && opts.refreshPaymentOptionsDataSoure === true) {
                        _this.refreshDatasource();
                    }
                },

                processingGiftCard: function (opts) {
                    var _this = this;

                    _this.set("isDisabled", opts.isProcessingGiftCard);
                },

                freightQuoteInstructsVisisble: function (opts) {
                    this.set("isFreightQuoteInstructsVisisble", opts.isVisible);
                },

                refreshDatasource: function () {
                    this.set("accountPayment", widget.options.accountPayment);
                    this.set("creditCard", widget.options.creditCard);
                    this.set("paypal", widget.options.paypal);
                    this.set("bpay", widget.options.bpay);
                    this.set("weWillCallYou", widget.options.weWillCallYou);
                    this.set("eft", widget.options.eft);
                    this.set("approval", widget.options.approval);
                    this.set("approvalConfigRequired", false);
                    this.set("quote", widget.options.quote);
                    this.set("thirdParty", widget.options.thirdParty);
                    init();
                },

                approvalTypesDataSource: function () {
                    var payOptions = this.get("paymentOptions");
                    var typesAvailable = [];
                    var ds = [];
                    if (payOptions != null)
                        typesAvailable = $.grep(payOptions, function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.approval) > -1); });
                    if (typesAvailable.length > 1) {
                        ds.push({ text: "Select Type", value: "" });
                        $.each(typesAvailable, function (idx, item) {
                            if (widget.options.approvalPromptOverrides[item.Key] != undefined)
                                ds.push({ text: widget.options.approvalPromptOverrides[item.Key] != "" ? widget.options.approvalPromptOverrides[item.Key] : item.Value, value: item.Key });
                            else
                                ds.push({ text: item.Value, value: item.Key });
                        });
                    }
                    return new kendo.data.ObservableArray(ds);
                },

                hasMultipleApprovalTypes: function () {
                    return this.approvalTypesDataSource().length > 0;
                },

                creditCardTypesDataSource: function () {
                    var payOptions = this.get("paymentOptions");
                    var cardsAvailable = [];
                    var ds = [];
                    if (payOptions != null)
                        cardsAvailable = $.grep(payOptions, function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.card) > -1); });
                    ds.push({ text: "Select Type", value: "", key: "" });
                    $.each(cardsAvailable, function (idx, item) {
                        if (widget.options.cardPromptOverrides[item.Value] != undefined)
                            ds.push({ text: widget.options.cardPromptOverrides[item.Value] != "" ? widget.options.cardPromptOverrides[item.Value] : item.Value, value: item.Value, key: item.Key });
                        else
                            ds.push({ text: item.Value, value: item.Value, key: item.Key });
                    });
                    return new kendo.data.ObservableArray(ds);
                },

                thirdPartyCreditCardTypesDataSource: function () {
                    var payOptions = this.get("paymentOptions");
                    var cardsAvailable = [];
                    var ds = [];
                    if (payOptions != null)
                        cardsAvailable = $.grep(payOptions, function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.thirdParty) > -1); });
                    ds.push({ text: "Select Type", value: "", key: "" });
                    $.each(cardsAvailable, function (idx, item) {
                        if (widget.options.cardPromptOverrides[item.Value] != undefined)
                            ds.push({ text: widget.options.cardPromptOverrides[item.Value] != "" ? widget.options.cardPromptOverrides[item.Value] : item.Value, value: item.Value, key: item.Key });
                        else
                            ds.push({ text: item.Value, value: item.Value, key: item.Key });
                    });
                    return new kendo.data.ObservableArray(ds);
                },

                creditCardDigitsRequired: function () {
                    return this.get("creditCardType") == AMEX ? widget.options.amexNumberOfDigits : widget.options.nonAmexNumberOfDigits;
                },

                cardNumberFull: function () {
                    if (this.get("cardNumber") != "")
                        return this.get("cardNumber");
                    else
                        return this.get("cardNumber1") + this.get("cardNumber2") + this.get("cardNumber3") + this.get("cardNumber4");
                },

                setCreditCardType: function () {
                    var _this = this;
                    var cardNumber = this.cardNumberFull();

                    // Start without knowing the credit card type
                    var cardType = "";
                    var isFound = false;

                    // First check for Visa
                    var regexCardType = new RegExp(widget.options.cardTypeRegExVisa);


                    if (regexCardType.test(cardNumber)) {
                        cardType = VISA;
                        setSurcharge(cardType);
                        isFound = true;
                    }

                    // Then check for MasterCard
                    if (!isFound) {
                        regexCardType = new RegExp(widget.options.cardTypeRegExMasterCard);

                        if (regexCardType.test(cardNumber)) {
                            cardType = MASTERCARD;
                            setSurcharge(cardType);
                            isFound = true;
                        }
                    }

                    // Then check for Amex
                    if (!isFound) {
                        regexCardType = new RegExp(widget.options.cardTypeRegExAmex);

                        if (regexCardType.test(cardNumber)) {
                            cardType = AMEX;
                            setSurcharge(cardType);
                            isFound = true;
                        }
                    }

                    // Then check for Diners
                    if (!isFound) {
                        regexCardType = new RegExp(widget.options.cardTypeRegExDiners);

                        if (regexCardType.test(cardNumber)) {
                            cardType = DINERSCLUB;
                            setSurcharge(cardType);
                            isFound = true;
                        }
                    }

                    var paymentType = $.grep(_this.get("paymentOptions"), function (item, idx) { return (item.Key.indexOf(widget.options.paymentTypes.card) > -1 && item.Key == cardType); });
                    if (paymentType.length == 0) {
                        cardType = "";
                        clearSurcharge();
                    }
                    _this.set("creditCardType", cardType);
                },

                cardExpiryMonthPrompts: widget.options.cardExpiryMonthPrompts,

                cardExpiryMonthsDataSource: function () {
                    var p = this.get("cardExpiryMonthPrompts").split(",");
                    var ds = [];
                    ds.push({ text: widget.options.textSelectMonth, value: "" });
                    for (i = 1; i <= p.length; i++) {
                        var s = i + "";
                        while (s.length < 2) s = "0" + s;
                        ds.push({
                            text: widget.options.showNumericCardExpiry ? s : p[i - 1],
                            value: s
                        });
                    }
                    return new kendo.data.ObservableArray(ds);
                },

                cardExpiryYearDataSource: function () {
                    var ds = [];
                    var y = widget.options.cardYearsToShow > 0 ? widget.options.cardYearsToShow : 10;
                    var currentYear = new Date().getFullYear();
                    ds.push({ text: widget.options.textSelectYear, value: "" });
                    for (i = 0; i < y; i++) {
                        var year = currentYear + i;
                        ds.push({
                            text: widget.options.showNumericCardExpiry ? (year.toString()).substr(2, 2) : year,
                            value: (year.toString()).substr(2, 2)
                        });
                    }
                    return new kendo.data.ObservableArray(ds);
                },

                newPaymentMethodSelected: function () {
                    this.clearMessage();
                },

                selectAccountPayment: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.account]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectCreditCard: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.card]);
                    this.setCreditCardType();

                    widget.signal('refreshWidgets'); // MAF
                },

                selectPaypal: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.paypal]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectBpay: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.bpay]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectWeWillCallYou: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.weWillCallYou]);
                    var deliveryPhone = this.getCurrentOrder().SoDelPhone;
                    if ($.cv.util.hasValue(deliveryPhone)) {
                        this.set("weWillCallYouNumber", deliveryPhone);
                    }
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectEft: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.eft]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectZero: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.zero]);
                },

                selectApprovalPayment: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.approval]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                submitOrderKeyUp: function (event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();
                        this.submitOrder();
                    }
                },

                selectQuote: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.quote]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                select3rdParty: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.thirdParty]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectThirdPartyInstallments: function () {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.thirdPartyInstallments]);
                    setSurcharge(this.get("currentSelectedOption"));
                },

                selectUnallocatedPayment: function() {
                    this.newPaymentMethodSelected();
                    this.set("currentSelectedOption", widget.options.paymentTypeValues[widget.options.paymentTypes.unallocatedPayment]);
                    
                    var paymentTabs = $("#payment-tabs");
                    if (paymentTabs.length > 0) {
                        if ($.cv.util.hasValue(paymentTabs.data("kendoTabStrip"))) {
                            paymentTabs.data("kendoTabStrip").activateTab($("#payment-tab-unallocated-payment"));
                        } else {
                            paymentTabs.kendoTabStrip().data("kendoTabStrip").activateTab($("#payment-tab-unallocated-payment"));
                        }
                    }
                },

                submitOrder: function () {
                    // Final validation of order first
                    var vm = this;

                    vm.set('paymentUnsuccessful', false);
                    vm.clearMessage();

                    if (!_.isEmpty($.cv.css.pageValidationErrors)) {
                        vm.processPageValidationErrors();
                    }

                    if (_.isEmpty($.cv.css.pageValidationErrors)) {
                        if (widget.options.isAccountPaymentPage) {
                            vm.doAccountPaymentPagePayment();
                        } else {
                            vm.validateForCheckout();
                        }
                    }
                },

                doAccountPaymentPagePayment: function () {
                    var vm = this;
                    vm.set("isProcessing", true);

                    var paymentOption = this.get("currentSelectedOption");
                    switch (paymentOption) {
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.card]:
                            this.submitOrderPayment();
                            break;

                        case widget.options.paymentTypeValues[widget.options.paymentTypes.eft]:
                            this.submitEFTPayment();
                            break;

                        case widget.options.paymentTypeValues[widget.options.paymentTypes.bpay]:
                            this.submitBpayPayment();
                            break;

                        case widget.options.paymentTypeValues[widget.options.paymentTypes.unallocatedPayment]:
                            this.submitUnallocatedPayment();
                            break;
                    }
                },

                // Triggers call to validate the order to see if it is ok for checkout...
                // we will show relevant messages in the widget if needed.
                validateForCheckout: function(options) {
                    var vm = this,
                        opts = $.extend({
                            processPayment: true
                        }, options);

                    vm.set("isProcessing", true);

                    // Get the order that the widget is using from server. It could be either the users current 
                    // order or some other order if have a orderNoOverride set e.g. order approval, payment for accepted quotes etc.
                    var d1 = widget.options.orderNoOverride === 0
                        ? $.cv.css.getCurrentOrder()
                        : $.cv.css.getOrder({ orderNo: widget.options.orderNoOverride, isLocalSetSelectedOrder: true });

                    d1.done(function() {
                        // Get the order that the widget is using that server call retrieved and placed in local storage. It could be either 
                        // the users current  order or some other order if have a orderNoOverride set e.g. order approval, payment for accepted quotes etc.
                        var order = widget.options.orderNoOverride === 0
                            ? $.cv.css.localGetCurrentOrder(false)
                            : $.cv.css.localGetSelectedOrder(widget.options.orderNoOverride, "", false);

                        // Bail! No order!
                        if (!order._objectKey) return;

                        vm.set("validationPreventingCheckout", false);

                        $.cv.css.orders.validateForCheckout({ 
                            _objectKey: order._objectKey, 
                            _preparingForProcessPayment: true 
                        }).done(function(response) {
                                var data = response.data,
                                    params = {};

                                // Reload order and lines to pick up charge lines added to the order 
                                // like small order fee etc... (done originally for MAF order complete)
                                // Make sure to get the order that the widget is using from server. It could be either the users current 
                                // order or some other order if have a orderNoOverride set e.g. order approval, payment for accepted quotes etc.
                                var d2 = widget.options.orderNoOverride === 0
                                        ? $.cv.css.getCurrentOrder()
                                        : $.cv.css.getOrder({ orderNo: widget.options.orderNoOverride }),

                                    d3 = widget.options.orderNoOverride === 0
                                        ? $.cv.css.getCurrentOrderLines()
                                        : $.cv.css.getOrderLines({ orderNo: widget.options.orderNoOverride, isLocalSetSelectedOrder: true });

                                $.when(d2, d3).done(function() {
                                    // Ensure stuff updates itself with latest order totals etc due
                                    // to ValidateForCheckout potentially adjusting the order (done originally for MAF order complete)
                                    $.cv.css.trigger($.cv.css.eventnames.orderChanged).done(function() {
                                        if (!data.sessionHasTimedOut) {
                                            vm.displayValidationMessages(data);

                                            // If no errors
                                            if (!vm.get("validationPreventingCheckout") && opts.processPayment === true) {
                                                // Once pre submit validation is complete... process the payment...
                                                $.cv.css.trigger($.cv.css.eventnames.preOrderSubmit).done(function() {
                                                    vm.processPaymentOption();
                                                });
                                            } else {
                                                vm.set("isProcessing", false);
                                            }
                                        } else {
                                            vm.redirectToUrl(widget.options.sessionTimeOutRedirectUrl, params, !widget.options.includeInBrowserHistory);
                                        }
                                    });
                                });
                            }).fail(function(response) {
                                vm.set("isProcessing", false);

                                if (response.errorMessage != null) {
                                    vm.setMessage(response.errorMessage, $.cv.css.messageTypes.error);
                                } else {
                                    vm.setMessage(widget.options.textCheckoutErrorDefaultMessage, $.cv.css.messageTypes.error);
                                }
                            });
                    }).fail(function(response) {
                        vm.set("isProcessing", false);

                        if (response.errorMessage != null) {
                            vm.setMessage(response.errorMessage, $.cv.css.messageTypes.error);
                        }
                    });
                },

                // build message array from object passed in
                buildLineValidationMessageArray: function (obj) {
                    var lineValidationErrors = new Array();
                    lineValidationErrors = [];
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            var el = {};
                            el["lineMessages"] = obj[key];
                            lineValidationErrors.push(el);
                        }
                    }
                    return lineValidationErrors;
                },

                displayValidationMessages: function (data) {
                    var _this = this;
                    _this.clearMessage();

                    var lineValidationErrors = _this.buildLineValidationMessageArray(data.lineValidationErrors);
                    if (data.headerValidateNotOk || data.linesValidateNotOk)
                        _this.set("validationPreventingCheckout", true);
                    if (data.headerValidationErrors.length > 0 || lineValidationErrors.length > 0) {
                        _this.set("clearExistingMessages", false);
                        $.each(data.headerValidationErrors, function (idx, item) {
                            if (item.preventsCheckOut) {
                                _this.setMessage(item.errorMessage, $.cv.css.messageTypes.error);
                            } else {
                                if (widget.options.showValidationMessagesNotPreventingCheckout)
                                    _this.setMessage(item.errorMessage, $.cv.css.messageTypes.warning);
                            }
                        });
                        $.each(lineValidationErrors, function (idx, item) {
                            $.each(item["lineMessages"], function (idx, lineItem) {
                                if (lineItem.errorMessage != "") {
                                    if (lineItem.preventsCheckOut) {
                                        _this.setMessage(lineItem.lineSeq + ', ' + lineItem.productCode + ': ' + lineItem.errorMessage, $.cv.css.messageTypes.error);
                                    } else {
                                        if (widget.options.showValidationMessagesNotPreventingCheckout)
                                            _this.setMessage(lineItem.lineSeq + ', ' + lineItem.productCode + ': ' + lineItem.errorMessage, $.cv.css.messageTypes.warning);
                                    }
                                }
                            });
                        });
                        _this.set("clearExistingMessages", true);
                    }
                },

                processPaymentOption: function () {
                    // TODO: add in other payment options
                    // If freight quote visible (i.e. other options won't be) handle this (it is not part of currentSelectedOption)
                    if (this.get("isFreightQuoteInstructsVisisble")) {
                        this.submitQuote(true);
                        return;
                    }
                    
                    if (this.get("totalPaymentBalanceAfterEnteredGiftCards") === 0) {
                        this.submitGiftCardPayment();
                        return;
                    }
                    
                    var paymentOption = this.get("currentSelectedOption");
                    switch (paymentOption) {
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.account]:
                            this.submitAccountPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.card]:
                            this.submitOrderPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.paypal]:
                            this.submitPaypalPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.approval]:
                            this.submitApprovalPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.bpay]:
                            this.submitBpayPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.eft]:
                            this.submitEFTPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.zero]:
                            this.submitZeroOrderPayment();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.quote]:
                            this.submitQuote(false);
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.weWillCallYou]:
                            this.submitWeWillCallYou();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.thirdParty]:
                            this.submit3rdParty();
                            break;
                        case widget.options.paymentTypeValues[widget.options.paymentTypes.thirdPartyInstallments]:
                            this.submitThirdPartInstallmentsy();
                            break;
                    }
                },
                
                submit3rdParty: function () {
                    var opts = { paymentType: widget.options.paymentTypes.thirdParty, paymentInfo: {} };
                    this.processPayment(opts);
                },

                submitThirdPartInstallmentsy: function () {
                    var opts = { paymentType: widget.options.paymentTypes.thirdPartyInstallments, paymentInfo: {} };
                    this.processPayment(opts);
                },

                submitWeWillCallYou: function () {
                    var opts = {};
                    if (this.validateWeWillCallYou()) {
                        opts = { paymentType: widget.options.paymentTypes.weWillCallYou, paymentInfo: { PhoneNumber: this.get("weWillCallYouNumber") } };
                        this.processPayment(opts);
                    }
                },

                validateWeWillCallYou: function () {
                    var valid = false;
                    if (this.get("currentSelectedOption").toUpperCase() == widget.options.paymentTypeValues.CALL.toUpperCase()
                        && ($.cv.util.isNullOrWhitespace(this.get("weWillCallYouNumber")) == false)) {
                        valid = true;
                    } else {
                        this.setMessage(widget.options.textErrorNoWeWillCallYouNumber, $.cv.css.messageTypes.error);
                        this.set("isProcessing", false);
                    }
                    return valid;
                },

                submitQuote: function (isFreightQuote) {
                    var _this = this, processPaymentUnsuccessfulMessage = "";

                    // If freight quote visible but not acknowledged / selected need to not continue.
                    if (isFreightQuote && !_this.get("isFreightQuoteSelected")) {
                        var message = widget.options.textErrorNotAcknowledgedFreightQuote;
                        _this.setMessage(message, $.cv.css.messageTypes.error);
                        $.cv.util.notify(_this, message, $.cv.css.messageTypes.error);
                        return;
                    }

                    var opts = [];
                    _this.set("isProcessing", true);
                    var d1 = $.cv.css.orders.submitQuote(opts);
                    $.when(d1).done(function (msg) {
                        var data = msg.data;
                        if (!data.sessionHasTimedOut) {
                            if (data.success) {
                                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrder);
                                $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrderLines);
                                // set viewmodel to indicate success
                                _this.set("paymentSuccessful", true);

                                // Redirect ----
                                // Don't use $.cv.util.redirect(), instead use internal
                                // redirect view model method as it can be overridden. It IS
                                // overridden in cv.mobile.ui.paymentOptions so that we don't
                                // redirect away from SPA.
                                if (widget.options.quoteSubmittedRedirectUrl !== "") {
                                    _this.redirect(widget.options.quoteSubmittedRedirectUrl, {}, widget.options.includeInBrowserHistory);
                                }
                            } else {
                                var defaultMessageSetting = _this.get("clearExistingMessages");
                                _this.set("paymentUnsuccessful", true);
                                _this.set("clearExistingMessages", true);
                                if (data.message && data.message.length > 0) {
                                    _this.setMessage(data.message, $.cv.css.messageTypes.error);
                                    if (widget.options.processPaymentUnsuccessfulMessage == "") {
                                        processPaymentUnsuccessfulMessage = processPaymentUnsuccessfulMessage.length > 0 ? processPaymentUnsuccessfulMessage + ", " + data.message : data.message;
                                    }
                                    widget.trigger(PAYMENTUNSUCCESSFUL, { message: processPaymentUnsuccessfulMessage.length > 0 ? processPaymentUnsuccessfulMessage : widget.options.processPaymentUnsuccessfulMessage });
                                    _this.set("clearExistingMessages", defaultMessageSetting);
                                }
                                _this.set("isProcessing", false);
                            }
                        } else {
                            _this.redirectToUrl(data.sessionTimeOutRedirectUrl, {}, !widget.options.includeInBrowserHistory);
                        }
                    }).fail(function (msg) {
                        _this.set("isProcessing", false);
                        if (msg.errorMessage != null)
                            _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                    });
                },
                
                submitBpayPayment: function () {
                    var opts = {
                        paymentType: widget.options.paymentTypes.bpay,
                        paymentInfo: { }
                    };

                    if (this.get("isAccountPaymentPage")) {
                        opts.paymentInfo.ReceiptNumber = this.get("eftReceiptNumber");
                    }

                    this.processPayment(opts);
                },

                validateEFTInformation: function () {
                    var valid = false;
                    if (this.get("currentSelectedOption").toUpperCase() == widget.options.paymentTypes.eft.toUpperCase()
                        && (widget.options.eftBankReceiptNumberDisabled || (this.get("bankReceiptNumber") !== "" && typeof this.get("bankReceiptNumber") !== "undefined"))) {
                        valid = true;
                    } else {
                        this.setMessage(widget.options.textErrorNoBankReceiptInput, $.cv.css.messageTypes.error);
                        this.set("isProcessing", false);
                    }
                    return valid;
                },

                submitEFTPayment: function () {
                    if (this.validateEFTInformation()) {
                        var opts = {
                            paymentType: widget.options.paymentTypes.eft,
                            paymentInfo: {
                                BankReceiptNumber: this.get("bankReceiptNumber")
                            }
                        };

                        if (this.get("isAccountPaymentPage")) {
                            opts.paymentInfo.ReceiptNumber = this.get("eftReceiptNumber");
                        }

                        this.processPayment(opts);
                    }
                },

                submitGiftCardPayment: function () {
                    var opts = { paymentType: widget.options.paymentTypes.giftCard, paymentInfo: {} };
                    this.processPayment(opts);
                },

                submitAccountPayment: function () {
                    var opts = { paymentType: widget.options.paymentTypes.account, paymentInfo: {} };
                    this.processPayment(opts);
                },

                submitPaypalPayment: function () {
                    var opts = { paymentType: widget.options.paymentTypes.paypal, paymentInfo: {} };
                    this.processPayment(opts);
                },

                validateApprovalInformation: function () {
                    var valid = true;
                    if (this.hasMultipleApprovalTypes() && this.get("approvalType") == "") {
                        this.setMessage(widget.options.textErrorNoApprovalTypeSelected, $.cv.css.messageTypes.error);
                        valid = false;
                    }
                    return valid;
                },

                submitApprovalPayment: function () {
                    if (this.validateApprovalInformation()) {
                        var opts;
                        if (this.hasMultipleApprovalTypes())
                            opts = { paymentType: this.get("approvalType"), paymentInfo: {} };
                        else
                            opts = { paymentType: widget.options.paymentTypes.approval, paymentInfo: {} };
                        this.processPayment(opts);
                    } else {
                        this.set("isProcessing", false);
                    }
                },

                submitZeroOrderPayment: function () {
                    this.processPayment({ paymentType: "ZERO", paymentInfo: {} });
                },

                submitUnallocatedPayment: function() {
                    var opts = {
                        paymentType: widget.options.paymentTypes.unallocatedPayment,
                        paymentInfo: {
                            UnallocatedPaymentAmount: this.get("unallocatedPaymentAmount"),
                            ReceiptNumber: this.get("eftReceiptNumber")
                        }
                    };
                    this.processPayment(opts);
                },

                clearRememberedPaymentInfo: function () {
                    ewayCreateAccessCode(true);
                },

                validateCreditCardInformation: function () {
                    var valid = true;
                    var message = "";
                    if (!this.creditCardTypeValid())
                        message += ",Card Type";
                    if (!this.cardHolderNameValid())
                        message += ",Name On Card";
                    if (!this.cardNumberValid())
                        message += ",Credit Card Number (incorrect number of digits)";
                    if (!this.cardExpiryMonthValid())
                        message += ",Expiry Month";
                    if (!this.cardExpiryYearValid())
                        message += ",Expiry Year";
                    if (!this.cardSecurityCodeValid())
                        message += ",Security Code";
                    if (message.length > 0) {
                        message = "The following card details have errors: " + message.substr(1);
                        valid = false;
                        this.setMessage(message, $.cv.css.messageTypes.error);
                    }
                    return valid;
                },

                submitOrderPayment: function () {
                    // TODO: process credit card payments
                    var _this = this,
                        opts = {},
                        cardName = _this.get("creditCardType").replace(/CARD/, ""),
                        submitOrderPaymentUnsuccessfulMessage = "",
                        isGiftCardBalanceZero = this.isGiftCardBalanceZero(),
                        validCreditCardInformation = true;

                    if (!isGiftCardBalanceZero) {
                        validCreditCardInformation = this.validateCreditCardInformation();
                    }

                    if (isGiftCardBalanceZero || validCreditCardInformation) {
                        if (widget.options.paymentProviderMode == PAYMENTPROVIDERMODESTANDARD) {
                            opts = {
                                paymentType: widget.options.paymentTypes.card,
                                paymentInfo: {
                                    CardName: cardName,
                                    CardHolderName: _this.get("cardHolderName"), // Any Name
                                    CardNumber: _this.cardNumberFull(), //"4111111111111111", // This is DPS Test Card Number - Payment Express 
                                    CardExpiryMonth: _this.get("cardExpiryMonth"), // Any For DPS Test
                                    CardExpiryYear: _this.get("cardExpiryYear"),
                                    CardSecurityCode: _this.get("cardSecurityCode")
                                }
                            };
                        } else if (widget.options.paymentProviderMode == PAYMENTPROVIDERMODEWAY || widget.options.paymentProviderMode == PAYMENTPROVIDERMODEWAYV3) {
                            opts = {
                                paymentType: widget.options.paymentTypes.card,
                                paymentInfo: {
                                    CardDetailProcessingMode: EWAYPROCESSINGMODE,
                                    CardName: cardName,
                                    CreateTokenID: _this.get("rememberPayment"),
                                    CardHolderTitle: _this.get("rememberPayment") ? this.get("cardHolderTitle") : ""
                                }
                            };
                        }

                        if (this.get("isAccountPaymentPage")) {
                            opts.paymentInfo.ReceiptNumber = this.get("eftReceiptNumber");
                        }

                        // eway years need to be 2 digits
                        this.processPayment(opts);
                    } else {
                        if (this.get("hasGiftCards") && this.get("totalPaymentBalanceAfterEnteredGiftCards") != "-1" && !this.isGiftCardBalanceZero()) {
                            submitOrderPaymentUnsuccessfulMessage = widget.options.giftCardBalanceNotZeroMessage;
                        }
                        if (!validCreditCardInformation) {
                            submitOrderPaymentUnsuccessfulMessage = submitOrderPaymentUnsuccessfulMessage.length > 0 ? submitOrderPaymentUnsuccessfulMessage + ", " + widget.options.invalidCreditCardInformation : widget.options.invalidCreditCardInformation;
                        }
                        this.set("paymentUnsuccessful", true);
                        widget.trigger(PAYMENTUNSUCCESSFUL, { message: submitOrderPaymentUnsuccessfulMessage });
                        if (!validCreditCardInformation) {
                            if (!widget.options.triggerMessages) {
                                _this.setMessage(submitOrderPaymentUnsuccessfulMessage, $.cv.css.messageTypes.error);
                            } else {
                                widget.options.triggerMessages = false;
                                _this.setMessage(submitOrderPaymentUnsuccessfulMessage, $.cv.css.messageTypes.error);
                                widget.options.triggerMessages = true;
                            }
                        } else {
                            _this.setMessage(submitOrderPaymentUnsuccessfulMessage, $.cv.css.messageTypes.error);
                        }
                        _this.set("isProcessing", false);
                    }
                },

                processPageValidationErrors: function () {
                    var widgetElement = "[data-role='{0}']", widget;
                    $.each(_.values($.cv.css.pageValidationErrors), function (idx, item) {
                        $(widgetElement.format(item.toLowerCase())).each(function () {
                            widget = $(this).data(item);
                            if (widget) {
                                var cached = widget.viewModel.get('clearWidgetMessages');
                                widget.viewModel.set('clearWidgetMessages', true);
                                widget.viewModel.setMessage("");
                                widget.viewModel.set('clearWidgetMessages', cached);
                                if ($.isFunction(widget.validateInputFields))
                                    widget.validateInputFields(true);
                            }
                        });
                    });
                },

                processPayment: function (opts) {
                    var _this = this, processPaymentUnsuccessfulMessage = "";
                    _this.set("isProcessing", true);

                    opts.paymentInfo.IsAccountPayment = _this.get("isAccountPaymentPage");
                    
                    // If the widget is using an order other than the users current if have a orderNoOverride set then need to pass it though e.g. payment for an accepted quote etc, approval order.
                    if (typeof opts.paymentInfo.OrderNo === "undefined" || opts.paymentInfo.OrderNo === null) {
                        opts.paymentInfo.OrderNo = widget.options.orderNoOverride;
                    }

                    $.cv.css.paymentProcessor.processPayment(opts).done(function (msg) {
                        var data = msg.data;
                        if (!data.sessionHasTimedOut) {
                            if (opts.paymentType.indexOf(widget.options.paymentTypes.thirdPartyInstallments) < 0
                                && (opts.paymentType.indexOf(widget.options.paymentTypes.card) < 0 
                                    || opts.paymentType.indexOf(widget.options.paymentTypes.giftCard) >= 0 
                                    || opts.paymentType.indexOf(widget.options.paymentTypes.approval) === 0
                                    || (opts.paymentType.indexOf(widget.options.paymentTypes.card) === 0 
                                        && widget.options.paymentProviderMode !== PAYMENTPROVIDERMODEWAY 
                                        && widget.options.paymentProviderMode !== PAYMENTPROVIDERMODEWAYV3))) {
                                if (data.Status === 0) {
                                    // Remove from local storage details of the order that the widget is using from server. It could be either the users current 
                                    // order or some other order if have a orderNoOverride set e.g. order approval, payment for accepted quotes etc.
                                    $.cv.css.removeLocalStorage(widget.options.orderNoOverride === 0
                                                                    ? $.cv.css.localStorageKeys.currentOrder
                                                                    : $.cv.css.localStorageKeys.selectedOrder);

                                    $.cv.css.removeLocalStorage(widget.options.orderNoOverride === 0
                                                                    ? $.cv.css.localStorageKeys.currentOrderLines
                                                                    : $.cv.css.localStorageKeys.selectedOrderLines);

                                    // set viewmodel to indicate success
                                    _this.set("paymentSuccessful", true);

                                    // Redirect ----
                                    // Don't use $.cv.util.redirect(), instead use internal
                                    // redirect view model method as it can be overridden. It IS
                                    // overridden in cv.mobile.ui.paymentOptions so that we don't
                                    // redirect away from SPA.
                                    if (data.IsRedirect && data.RedirectUrl != "") {
                                        _this.redirect(data.RedirectUrl, {}, widget.options.includeInBrowserHistory, data.PaymentType == "3RDPARTY");
                                    } else {
                                        _this.redirect(widget.options.paymentOkRedirectUrl, {}, widget.options.includeInBrowserHistory);
                                    }
                                } else {
                                    var defaultMessageSetting = _this.get("clearExistingMessages");
                                    _this.set("paymentUnsuccessful", true);
                                    _this.set("clearExistingMessages", true);
                                    $.each(data.Messages, function (idx, item) {
                                        _this.setMessage(item, $.cv.css.messageTypes.error);
                                        if (widget.options.processPaymentUnsuccessfulMessage == "") {
                                            processPaymentUnsuccessfulMessage = processPaymentUnsuccessfulMessage.length > 0 ? processPaymentUnsuccessfulMessage + "," + item : item;
                                        }
                                    });
                                    widget.trigger(PAYMENTUNSUCCESSFUL, { message: processPaymentUnsuccessfulMessage.length > 0 ? processPaymentUnsuccessfulMessage : widget.options.processPaymentUnsuccessfulMessage });
                                    _this.set("clearExistingMessages", defaultMessageSetting);
                                    _this.set("isProcessing", false);
                                }
                            } else if (opts.paymentType.indexOf(widget.options.paymentTypes.thirdPartyInstallments) >= 0) {
                                _this.set("isThirdPartyInstallmentsProcessing", true);
                                var orderToken;

                                // Get AfterPay information passed back.
                                for (var i in data.AdditionalResultData) {
                                    if (data.AdditionalResultData[i].Key === "AfterPay_OrderToken")
                                        orderToken = data.AdditionalResultData[i].Value;
                                }
                                if (orderToken) {
                                    // Set access code field
                                    _this.set("afterPayOrderToken", orderToken);
                                    
                                    // Init the AfterPay object This will show a loading spinner until you call 'show'
                                    AfterPay.init({
                                        redirectOnly: true,
                                        relativeCallbackURL: data.RedirectUrl
                                    });

                                    // Call 'show' with the token, to open the AfterPay light box
                                    AfterPay.show({ token: orderToken });
                                } else {
                                    _this.set("isThirdPartyInstallmentsProcessing", false);
                                    _this.set("isProcessing", false);
                                }
                            } else {
                                widget.signal('_ewayPostProcessing', _this /* vm */, data);
                            }
                        } else {
                            _this.redirectToUrl(data.sessionTimeOutRedirectUrl, {}, !widget.options.includeInBrowserHistory);
                        }
                    }).fail(function (msg) {
                        _this.set("isProcessing", false);
                        if (msg.errorMessage != null)
                            _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                    });
                },

                continueToPaymentSelected: function() {
                    this.triggerSelectedOption();
                },

                triggerSelectedOption: function () {
                    $.cv.css.trigger($.cv.css.eventnames.selectedPaymentOptionChanged, viewModel.get("currentSelectedOption"));
                }

            });

            viewModel.bind("change", function (e) {
                if ((e.field == "cardNumber" || e.field == "cardNumber1") && 
                    widget.options.autoSelectCardType && 
                    viewModel.get("currentSelectedOption") === widget.options.paymentTypeValues[widget.options.paymentTypes.card]) {
                        viewModel.setCreditCardType();
                }

                if (e.field === "currentSelectedOption") {
                    viewModel.triggerSelectedOption();
                }
            });

            init();

            return viewModel;
        },

        _ewayPostProcessing: function (vm, data) {
            var widget = this;
            if (data.Status === 0) { // ok 
                vm.set("isEWayProcessing", true);

                var accessCode;
                var postBackUrl;

                // Get eWay information passed back.
                for (var i in data.AdditionalResultData) {
                    if (data.AdditionalResultData[i].Key === "eWay_AccessCode")
                        accessCode = data.AdditionalResultData[i].Value;

                    if (data.AdditionalResultData[i].Key === "eWay_PostbackUrl")
                        postBackUrl = data.AdditionalResultData[i].Value;
                }

                if (accessCode && postBackUrl) {
                    // Set access code field
                    vm.set("eWayAccessCode", accessCode);

                    // Set post back uri and submit
                    var form = $("form:first");
                    form.attr("action", postBackUrl);
                    form.submit();
                } else {
                    vm.set("isEWayProcessing", false);
                    vm.set("isProcessing", false);
                }
            } else {
                // Error
                var defaultMessageSetting = vm.get("clearExistingMessages");
                vm.set("paymentUnsuccessful", true);
                vm.set("clearExistingMessages", true);
                $.each(data.Messages, function (idx, item) {
                    vm.setMessage(item, $.cv.css.messageTypes.error);
                    if (widget.options.processPaymentUnsuccessfulMessage === "") {
                        processPaymentUnsuccessfulMessage = processPaymentUnsuccessfulMessage.length > 0 ? processPaymentUnsuccessfulMessage + "," + item : item;
                    }
                });
                widget.trigger(PAYMENTUNSUCCESSFUL, { message: processPaymentUnsuccessfulMessage.length > 0 ? processPaymentUnsuccessfulMessage : widget.options.processPaymentUnsuccessfulMessage });
                vm.set("clearExistingMessages", defaultMessageSetting);
                vm.set("isProcessing", false);
            }
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";

            return html;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.itemTemplateId + "'>";
            html += "<div>";
            html += "";
            html += "</div></script>";
            return html;
        }

    }

    // register the widget

    $.cv.ui.widget(paymentOptionsWidget);

})(jQuery);
