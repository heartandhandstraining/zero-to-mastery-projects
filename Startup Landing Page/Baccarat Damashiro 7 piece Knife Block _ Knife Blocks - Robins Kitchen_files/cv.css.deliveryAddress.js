/// <reference path="jquery-1.8.3.js" />

/**
 * Author: Chad Paynter
 * Date: 2013-03-06
 * Description: To get delivery options and set delivery address
 * Dependencies
 * - jQuery
 * - cv.css.js
**/

;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.deliveryAddress = $.cv.css.deliveryAddress || {};

    $.cv.css.deliveryAddress.getDeliveryAddressesForCurrentUser = function (options) {
        var opts = $.extend({
            customerFieldNameForDefaultAddressName: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/deliveryaddressesforcurrentuser', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.getDeliveryAddressForCurrentOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/getdeliveryaddressforcurrentorder', {
            parameters: {},
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.setDeliveryAddressForCurrentOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/getdeliveryaddressforcurrentorder-update-validate', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.validateCurrentOrderDeliveryAddress = function (options) {
        var opts = $.extend({
            validateDeliveryRestriction: false,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/validateCurrentOrderDeliveryAddress', {
            parameters: { validateDeliveryRestriction: opts.validateDeliveryRestriction },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.setDeliveryAddressFieldForCurrentOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/getdeliveryaddressforcurrentorder-update', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.updateDeliveryAddressForCurrentOrder = function (options) {
        var opts = $.extend({
            updatedAddressDetails: null,
            selectAddressMoniker: '',
            validateMissingFields: true,
            selectedAddressId: "",
            preserveGuestDetails: false,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/UpdateDeliveryAddressForCurrentOrder', {
            parameters: {
                updatedAddressDetails: opts.updatedAddressDetails,
                selectAddressMoniker: opts.selectAddressMoniker,
                validateMissingFields: opts.validateMissingFields,
                selectedAddressId: opts.selectedAddressId,
                preserveGuestDetails: opts.preserveGuestDetails
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    // Validates suburb and postcode to see whether the system considers
    // them a valid combination.
    // 
    // @suburb string - the suburb name to validate
    // @postcode string - the postcode to validate
    // @country string - the country to validate 
    //      Default: defaults to "Australia" if not set.
    // @returns bool - true if the combination is valid, false if not.
    $.cv.css.deliveryAddress.validateSuburbAndPostCode = function (options) {
        var opts = $.extend({
            suburb: '',
            postcode: '',
            country: '', // Server Defaults to "Australia" if not set!

            success: $.noop
        }, options);

        return $.cv.ajax.call('deliveryaddress/ValidateSuburbAndPostCode', {
            parameters: opts,

            success: opts.success,

            converters: {
                'text json': $.cv.util._booleanResponseConverter
            }
        });
    };

    $.cv.css.deliveryAddress.updateBillingAddressForCurrentOrder = function (options) {
        var opts = $.extend({
            updatedBillingAddressDetails: null,
            selectedAddressId: "",
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/UpdateBillingAddressForCurrentOrder', {
            parameters: {
                updatedBillingAddressDetails: opts.updatedBillingAddressDetails,
                selectedAddressId: opts.selectedAddressId
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.setDeliveryAddressByName = function (options) {
        var opts = $.extend({
            deliveryAddressName: '',
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/SetDeliveryAddressByName', {
            parameters: {
                deliveryAddressName: opts.deliveryAddressName
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.setDeliveryAddressAttentionTo = function (options) {
        var opts = $.extend({
            name: null,
            phone: null,
            setToDefault: false,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/setDeliveryAddressAttentionTo', {
            parameters: {
                name: opts.name,
                phone: opts.phone,
                setToDefault: opts.setToDefault
            },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.saveAddress = function (options) {
        var opts = $.extend({
            saveForUser: false,
            saveDeliveryInstructions: false,
            address: null,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/SaveAddress', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.getDeliveryAddressForSelectedOrder = function (options) {
        var opts = $.extend({
            orderNo: '',
            orderSuffix: '',
            validateDeliveryAddressRulests: true,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/getdeliveryaddressforselectedorder', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.clearWarehouseAndDeliveryAddressOnOrder = function (options) {
        var opts = $.extend({
            orderNo: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/ClearWarehouseAndDeliveryAddressOnOrder', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.deliveryAddress.setDeliveryMethodClickAndCollectOnOrder = function (options) {
        var opts = $.extend({
            deliveryMode: "",
            orderNo: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('deliveryaddress/setDeliveryMethodClickAndCollectOnOrder', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

})(jQuery);