/// <reference path="jquery-1.8.3.js" />
/*
 * cv.css.paymentProcessor.js
 * Author: Chad Paynter
 * Date: 05/03/2013
 * Description: cv.css plugin for calls to CSS dynamic services
 * Dependencies:
 * jquery - In Script folder or http://jquery.com/
 * cv.ajax -  In Script folder cv.ajax.js
 * cv.util - In Script folder cv.util.js
 */
;
(function ($, undefined) {
    // Check we have everything we need
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.paymentProcessor = $.cv.css.paymentProcessor || {};

    $.cv.css.paymentProcessor.processPayment = function (options) {
        var opts = $.extend({
            paymentType: '',
            paymentInfo: {},
            isPaymentGateway: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('paymentprocessor/processpayment', {
            parameters: {
                paymentType: opts.paymentType,
                paymentInfo: opts.paymentInfo,
                isPaymentGateway: opts.isPaymentGateway
            },
            success: function (msg) {
                // If we have a successful payment then execute analytics script if present.
                if (msg.data && msg.data.PaymentSuccessful && msg.data.AdditionalResultData) {
                    var func = undefined;
                    // trigger submitted event
                    $.cv.css.trigger($.cv.css.eventnames.orderSubmitted);

                    for (var i in msg.data.AdditionalResultData) {
                        if (msg.data.AdditionalResultData[i].Key == 'googleAnalyticsEcommerceScript') {
                            func = msg.data.AdditionalResultData[i].Value;
                            break;
                        }
                    }

                    if (func && func.length > 0) {
                        try {
                            // Tag Manager - dataLayer.push() object check
                            if (func.length > 2 && func[0] === '{' && func[1] === "\"" && dataLayer) {
                                dataLayer.push(JSON.parse(func));
                            } else {
                                // Should generate global cssGoogleAnalyticsPageTracker() function
                                eval(func);

                                // Track order if tracker present
                                if (window.cssGoogleAnalyticsPageTracker) {
                                    cssGoogleAnalytics_TrackOrder();
                                }
                            }
                        } catch (e) {
                            // Eat error where func is actually just a script
                            // block instead of a function to execute.
                        }
                    }
                }
                else {
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged, true);
                }

                if (opts.success) {
                    opts.success(msg);
                }
            }
        });
    };

    $.cv.css.paymentProcessor.getPaymentOptionsForCurrentOrder = function (options) {
        var opts = $.extend({
            cardsOnly: false,
            isPaymentGateway: false,
            isAccountPayment: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('paymentprocessor/getpaymentoptions', {
            parameters: {
                cardsOnly: opts.cardsOnly,
                isPaymentGateway: opts.isPaymentGateway,
                isAccountPayment: opts.isAccountPayment,
                orderNo: 0
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.paymentProcessor.getPaymentOptionsForAccountPayment = function (options) {
        var opts = $.extend({
            isAccountPayment: true,
            success: function (msg) { }
        }, options);
        return $.cv.css.paymentProcessor.getPaymentOptionsForCurrentOrder(opts);
    };

    $.cv.css.paymentProcessor.getPaymentOptionsForSelectedOrder = function (options) {
        var opts = $.extend({
            orderNo: 0,
            cardsOnly: false,
            isPaymentGateway: false,
            isAccountPayment: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('paymentprocessor/getpaymentoptions', {
            parameters: {
                orderNo: opts.orderNo,
                cardsOnly: opts.cardsOnly,
                isPaymentGateway: opts.isPaymentGateway,
                isAccountPayment: opts.isAccountPayment
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.paymentProcessor.getPaymentProviderDetails = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('paymentprocessor/getPaymentProviderDetails', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.paymentProcessor.ewayCreateAccessCode = function (options) {
        var opts = $.extend({
            clearRememberedPaymentInfo: false,
            orderNoForAccessCode: 0, // Non-Deposit Scenario
            isAccountPayment: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('paymentprocessor/ewayCreateAccessCode', {
            parameters: {
                clearRememberedPaymentInfo: opts.clearRememberedPaymentInfo,
                orderNoForAccessCode: opts.orderNoForAccessCode,
                isAccountPayment: opts.isAccountPayment
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

})(jQuery);