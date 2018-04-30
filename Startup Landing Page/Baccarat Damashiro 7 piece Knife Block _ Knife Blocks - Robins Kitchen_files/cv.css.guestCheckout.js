;
(function($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.guestCheckout = $.cv.css.guestCheckout || {};

    $.cv.css.guestCheckout.toggleUsingGuestCheckout = function () {
        var usingGuestCheckout = $.cv.css.localGetUsingGuestCheckout();
        $.cv.css.localSetUsingGuestCheckout($.cv.util.hasValue(usingGuestCheckout) ? !usingGuestCheckout : true);
    };

})(jQuery);