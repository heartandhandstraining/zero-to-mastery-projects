// closure for $.cv.css.recentlyViewedProduct plugin 
;
(function ($, undefined) {

    // Setup base 'namespaces'
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.recentlyViewedProduct = $.cv.css.recentlyViewedProduct || {};


    /* local storage */

    $.cv.css.recentlyViewedProduct.localGetRecentlyViewedProducts = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.recentlyViewedProducts);
    };

    $.cv.css.recentlyViewedProduct.localSetRecentlyViewedProducts = function (products) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.recentlyViewedProducts, products);
    };

    $.cv.css.recentlyViewedProduct.localRemoveRecentlyViewedProducts = function (products) {
        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.recentlyViewedProducts);
    };

    $.cv.css.recentlyViewedProduct.getRecentlyViewedProduct = function (options) {
        var opts = $.extend({
            productCodeList: "",
            maxNumberOfProducts: 0,
            success: $.noop
        }, options);
        return $.cv.ajax.call("recentlyviewedproducts/GetRecentlyViewedProducts", {
            parameters: opts,
            success: opts.success
        });
    };

    /* local storage END */


    /* Public methods */

    /* Public methods END */

})(jQuery);