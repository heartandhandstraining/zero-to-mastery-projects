// Closure for $.cv.css.stockAvailabilityNotify plugin.
;

(function ($, undefined) {
    // Check we have everything we need.
    $.cv = $.cv || {};

    // $.cv.css.orderTemplate object definition.
    $.cv.css = $.cv.css || {};
    $.cv.css.stockAvailabilityNotify = $.cv.css.stockAvailabilityNotify || {};

    //
    // Register to receive a notification when specified products are back in stock.
    //
    $.cv.css.stockAvailabilityNotify.notifyMe = function (options) {
        var opts = $.extend({
            productCodes: "",
            notifyEmailAddress: "",
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("stockAvailabilityNotify/notifyMe", {
            parameters: {
                productCodes: opts.productCodes,
                notifyEmailAddress: opts.notifyEmailAddress
            },
            success: opts.success
        });

        return p;
    };

    //
    // Get a list of all the notifications registered for the current user.
    //
    $.cv.css.stockAvailabilityNotify.getNotificationsForCurrentUser = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("stockAvailabilityNotify/getNotificationsForCurrentUser", {
            parameters: {
            },
            success: opts.success
        });

        return p;
    };

    //
    // Remove a notification registered for the current user.
    //
    $.cv.css.stockAvailabilityNotify.removeNotify = function (options) {
        var opts = $.extend({
            productCodes: "",
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("stockAvailabilityNotify/removeNotify", {
            parameters: {
                productCodes: opts.productCodes
            },
            success: opts.success
        });

        return p;
    };
})(jQuery);
