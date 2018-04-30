/// <reference path="/Scripts/jquery-1.8.2.min.js" />

/*
Name: cv.css.ui.payPalExpress.js
Author: Sean Craig

Dependencies:
    <script type="text/javascript" src="/Scripts/jquery-1.8.2.min.js"></script>
    <script type="text/javascript" src="/Scripts/cv.widget.kendo.js"></script>
    <script type="text/javascript" src="/Scripts/cv.util.js"></script>
    <script type="text/javascript" src="/Scripts/cv.css.orders.js"></script>
    <script type="text/javascript" src="/Scripts/widgets/cv.ui.mvvmwidget.js"></script>

Optional:

Params:
    Option | Type | Default Value | Notes
    freightPostbackButtonId | string | "" | Set this to "PostbackButton" in PayPalExpressPageTemplate template (i.e. when selecting freight).
    validateOrder | bool | true | Whether or not the order is to be validated before redirecting to PayPal.
    triggerMessages | bool | true | Whether or not to trigger the displaying of error messages.
    redirectUrl | string | "/PayPalExpress.aspx?step=checkout" | Only override this if you were told to.
    checkoutButtonHtml | string | "<input type='image' name='checkout' src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-medium.png' border='0' align='top' alt='Check out with PayPal' data-bind='click: checkout' />" |  Only override this if you were told to.

*/

;

(function ($, undefined) {
    var payPalExpressWidget = {
        name: "payPalExpress",
        extend: "mvvmwidget",

        extendEvents: [],

        options: {
            freightPostbackButtonId: "",
            validateOrder: true,
            triggerMessages: true,
            displayButton: true,
            clickAndCollectEnabled: false,
            redirectUrl: "/PayPalExpress.aspx?step=checkout",
            checkoutButtonHtml: "<button type='button' name='checkout' class='checkout-paypal' data-bind='click: checkout'><img src='/Themes/BPDTHEME01/theme-base/img/cv-cart/payment/paypal-button.png' alt='Checkout with PayPal Express'></button>",
            cartRedirectionTarget: "/cart"
        },

        initialise: function (el, o) {
            var widget = this;

            $.cv.css.bind($.cv.css.eventnames.checkoutWithPayPalExpress, $.proxy(widget.viewModel.checkout, widget.viewModel));
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function() {
            var widget = this;
        },

        buildLineValidationMessageArray: function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return obj[key];
                }
            }
            return [];
        },
        
        _getViewModel: function() {
            var widget = this;

            var viewModel = $.extend(kendo.observable(widget.options), {
                clearExistingMessages: true,

                isProcessing: false,
                messageCount: 0,

                checkout: function (params) {
                    var vm = this;

                    if (params && params.e) {
                        params.e.preventDefault();
                    }

                    vm.set("isProcessing", true);

                    var validationDeferred = $.Deferred();

                    if (vm.get("validateOrder") === true) {
                        // Get the current order.
                        $.cv.css.getCurrentOrder().done(function(orderResponse) {
                            var order;
                            if (!$.cv.util.isNullOrWhitespace(orderResponse) && !$.cv.util.isNullOrWhitespace(orderResponse.data) && !$.cv.util.isNullOrWhitespace(orderResponse.data[0])) {
                                order = orderResponse.data[0];
                            } else {
                                // We can't get an instance of the current order so not possible to proceed.
                                vm.setMessage("Order is invalid - your session may have timed out", $.cv.css.messageTypes.error);
                                validationDeferred.reject();
                                return;
                            }

                            // Validate the order.
                            $.cv.css.orders.validateForCheckout({ _objectKey: order._objectKey }).done(function(response) {
                                var data = response.data;
                                var lineValidationErrors = widget.buildLineValidationMessageArray(data.lineValidationErrors);

                                vm.clearMessage();

                                // Check for a session timeout. If we do then reject the validation deferred.
                                // This will cause a redirection to the cart which will ultimately cause the user to be asked to log in.
                                if ($.cv.util.isNullOrWhitespace(data) || data.sessionHasTimedOut === true) {
                                    validationDeferred.reject();
                                }

                                $.each(data.headerValidationErrors, function(idx, item) {
                                    if (item.preventsCheckOut) {
                                        vm.setMessage(item.errorMessage, $.cv.css.messageTypes.error);
                                        validationDeferred.reject();
                                    }
                                });

                                $.each(lineValidationErrors, function(idx, item) {
                                    if (item.preventsCheckOut) {
                                        vm.setMessage(item.errorMessage, $.cv.css.messageTypes.error);
                                        validationDeferred.reject();
                                    }
                                });

                                // There are no validation errors on the lines or header so validation passes and we can resolve the validation deferred.
                                // This will cause the PayPal Express widget to proceed to checkout.
                                validationDeferred.resolve();
                            });
                        });
                    } else {
                        validationDeferred.resolve();
                    }

                    // If we can check out the order, redirect to PayPal or finish the order if we're selecting freight.
                    $.when(validationDeferred).done(function () {
                        // First need to remove from local storage details of the order that the widget is using so next time it gets fresh one.
                        // NOTE: We do this so that any other window does not use the local storage for this order and instead must get fresh information
                        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrder);
                        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrderLines);

                        if (vm.get("freightPostbackButtonId") === "") {
                            // Redirect to PayPal.
                            $.cv.util.redirect(vm.get("redirectUrl"), {}, false);
                        } else {
                            // We're back from PayPal and have selected freight.
                            
                            // Will now trigger a postback where server side code will handle the payment submission to paypal's express api
                            // and then submit order and redirect to landing page.
                            $("#" + vm.get("freightPostbackButtonId")).click();
                        }
                    }).fail(function () {
                        //When either of the deferreds in the When clause are rejected the fail clause is fired. 

                        //Either the click and collect deffered was rejected or the validation deferred was rejected
                        //We reject the click and collect deferred as a result of needing to get a click and collect delivery option
                        //we reject the validation deferred when we determine that order validation failed and we don't want the user to checkout
                        //even if they have a delivery method selected.
                        //We need to check which deferred was rejected.

                        if (validationDeferred.state() === "rejected") {
                            // irrespective of the click and collect deferred state we have an issue with order validation
                            // it's also possible that the user's session has timed out, in which case no validation messages will have been set
                            // if no validation messages have been set, redirect to the cart

                            var msgCount = vm.get("messageCount");
                            if (msgCount === 0) {
                                $.cv.util.redirect(vm.get("cartRedirectionTarget"), {}, false);
                            }
                        }

                        //In the case of the case of the click and collect deferred being rejected we don't need to do anything.
                    });
                },

                clearMessage: function () {
                    var vm = this;

                    vm.set("clearExistingMessages", true);
                    if (widget.options.triggerMessages) {
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: "", source: "orderSummary", clearExisting: vm.get("clearExistingMessages") });
                    }
                    // reset message count
                    vm.set("messageCount", 0);
                },

                setMessage: function (message, type) {
                    var vm = this;
                    $.cv.util.notify(vm, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                    // increment message count
                    vm.set("messageCount", vm.get("messageCount") + 1);
                }
            });

            return viewModel;
        }
    };

    // Register the widget.
    $.cv.ui.widget(payPalExpressWidget);
})(jQuery);
