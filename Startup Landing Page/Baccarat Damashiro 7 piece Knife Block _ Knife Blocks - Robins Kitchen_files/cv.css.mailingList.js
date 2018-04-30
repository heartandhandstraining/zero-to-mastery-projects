/**
 *	cv.css.mailingList.js
**/

;

(function ($, undefined) {

    // Setup base 'namespaces'
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.mailingList = $.cv.css.mailingList || {};


    $.cv.css.mailingList.subscribe = function (options) {
        var opts = $.extend({
            listID: '',
            emailAddress: '',
            options: {},
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('mailingList/Subscribe', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.mailingList.unsubscribe = function (options) {
        var opts = $.extend({
            listID: '',
            emailAddress: '',
            options: {},
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('mailingList/Unsubscribe', {
            parameters: opts,
            success: opts.success
        });
    };


})(jQuery);