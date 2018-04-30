
/**
 *
 * Author: Justin Wishart
 * Date: 2013-08-05
 * Description: 
 *      Gift Card add and remove client side API
 *
**/

;

(function ($) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.giftCard = $.cv.css.giftCard || {};


    // Service Methods
    //

    $.cv.css.giftCard.addGiftCard = function (options) {
        var opts = $.extend({
            cardNumber: '',
            pinNumber: '',
            useAllAmount: false,
            amountToUse: 0,
            success: function (msg) { }
        }, options);
        
        return $.cv.ajax.call('giftCard/addGiftCard', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.giftCard.removeGiftCard = function (options) {
        var opts = $.extend({
            cardNumber: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('giftCard/removeGiftCard', {
            parameters: opts,
            success: opts.success
        });
    };

})(jQuery);