/// <reference path="jquery-1.8.3.js" />

/**
 * Author: Tod Lewin
 * Date: 2015-07-21
 * Description: To get and set Third Party Delivery
 * Dependencies
 * - jQuery
 * - cv.css.js
**/

;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.thirdPartyDelivery = $.cv.css.thirdPartyDelivery || {};

    $.cv.css.thirdPartyDelivery.getThirdPartyDelivery = function (options) {
        var opts = $.extend({
            deliveryMethod: '',
            thirdPartyDeliveryChargePrompt: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('thirdpartydelivery/getthirdpartydelivery', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };
})(jQuery);