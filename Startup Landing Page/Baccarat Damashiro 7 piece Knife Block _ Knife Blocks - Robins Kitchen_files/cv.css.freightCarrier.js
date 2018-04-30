/// <reference path="jquery-1.8.3.js" />

/**
 * Author: Chad Paynter
 * Date: 2013-03-06
 * Description: To get freight options and set freight
 * Dependencies
 * - jQuery
 * - cv.css.js
**/

;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.freightCarrier = $.cv.css.freightCarrier || {};

    $.cv.css.freightCarrier.getFreightForCurrentOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('freightcarrier/getfreightforcurrentorder', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.freightCarrier.getFreightEstimateForCurrentOrder = function (options) {
        var opts = $.extend({
            postCode: '',
            countryCode: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('freightcarrier/getFreightEstimateForCurrentOrder', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.freightCarrier.setFreightForCurrentOrder = function (options) {
        var opts = $.extend({
            freightOptionIDs: [],
            warehouseCode: null,
            ownCarrierAccount: null,
            success: function (msg) { }
        }, options);

        var result = $.Deferred();

        var pr = $.cv.ajax.call('freightcarrier/setfreightforcurrentorder', {
            parameters: { freightOptionIDs: opts.freightOptionIDs, warehouseCode: opts.warehouseCode, ownCarrierAccount: opts.ownCarrierAccount }
        }).done(function(response) {
            if (opts.success)
                opts.success(response);
            //call getCurrentOrder which will update the $.cv.css.localSetCurrentOrder object and trigger the 'orderChanged' event 
            var p1 = $.cv.css.getCurrentOrder();
            var p2 = $.cv.css.getCurrentOrderLines();
            $.when(p1, p2).always(function(order) {
                $.cv.css.trigger($.cv.css.eventnames.orderChanged, order[0].data[0]);
                result.resolve(response);
            });
        });

        return result.promise();
    };

    $.cv.css.freightCarrier.validateFreightForCurrentOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('freightcarrier/validatefreightforcurrentorder', {
            parameters: { },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    }
})(jQuery);