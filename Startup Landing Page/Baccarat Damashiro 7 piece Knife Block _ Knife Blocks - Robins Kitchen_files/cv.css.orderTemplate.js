// closure for $.cv.css.orderTemplate plugin 
;
(function ($, undefined) {
    // Check we have everything we need
    $.cv = $.cv || {};

    // $.cv.css.orderTemplate object definition
    $.cv.css = $.cv.css || {};
    $.cv.css.orderTemplate = $.cv.css.orderTemplate || {};

    /////////////////////////////
    /* OrderTemplate - START  */

    /* IMPORTANT: Relies on DynamicService config file being present and set-up on server to expose endpoints. 
     * Example one used for these functions is setup in CSS 3.59 ff (/DynamicServices/orderTemplate.config).  
     */

    // getOrderTemplatesForUser function 
    // Gets ProntoSalesOrder Recordset Type of Order Templates for current user.
    $.cv.css.orderTemplate.getOrderTemplatesForUser = function (options) {
        var opts = $.extend({
            skip: 0,
            take: 10,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orderTemplate/GetOrderTemplatesForUser', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.createNewTemplateForUser = function (options) {
        var opts = $.extend({
            saveMode: "",
            templateName: "",
            isCompanyTemplate: false,
            isRoleTemplate: false,
            templateType: "order",
            selectedTemplate: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderTemplate/CreateNewTemplateForUser", {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.saveChanges = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: "",
            changes: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderTemplate/SaveChanges', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.addAllProductsToCart = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: "",
            lineQtys: "",
            lineUpdates: "",
            success: function (msg) {
                var lines = [];
                if (msg.data) {
                    var data = msg.data.result;
                    $.each(data, function (idx, item) {
                        if (item) {
                            lines.push(item);
                        }
                    });
                }
                $.cv.css.localUpdateCurrentOrderLines(lines);
                //call getCurrentOrder which will update the $.cv.css.localSetCurrentOrder object and trigger the 'orderChanged' event 
                var p1 = $.cv.css.getCurrentOrder();
                if (opts.triggerGetLines) {
                    var p2 = $.cv.css.getCurrentOrderLines();
                } else {
                    var p2 = $.Deferred();
                    p2.resolve();
                }
                $.when(p1, p2).always(function () {
                    $.cv.css.trigger($.cv.css.eventnames.orderChanged, opts.productCode);
                });
            }
        }, options);

        return $.cv.ajax.call('orderTemplate/AddAllProductsToCart', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.getTemplateOrder = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: '',
            restrictToParValueOrders: false,
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderTemplate/GetTemplateOrder", {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.loadOrderTemplateProducts = function (options) {
        var opts = $.extend({
            orderNo: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orderTemplate/LoadOrderTemplateProducts', {
            parameters: { soOrderNo: opts.orderNo },
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.loadOrderTemplateLines = function (options) {
        var opts = $.extend({
            orderNo: 0,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('orderTemplate/LoadOrderTemplateLines', {
            parameters: { soOrderNo: opts.orderNo },
            success: opts.success
        });
    };

    // createTemplateFromCurrentOrder function 
    // Attempts to create template order from current order.
    $.cv.css.orderTemplate.createTemplateFromCurrentOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orderTemplate/CreateTemplateFromCurrentOrder', {
            parameters: {
                templateName: opts.templateName,
                allcust: opts.allcust != null ? opts.allcust : false, // true or false to allow use for all customers.
                allreps: opts.allreps != null ? opts.allreps : false, // true or false  to apply to all reps. must be a rep.
                custTemplate: opts.custTemplate != null ? opts.custTemplate : false, // true or false to apply to all users for the customer.
                globalCustomerMask: opts.globalCustomerMask != null ? opts.globalCustomerMask : '', // can provide a global cust mask.
                roleTemplate: opts.roleTemplate != null ? opts.roleTemplate : false, // true or false to restrict use the role.
                excludeLines: opts.excludeLines != null ? opts.excludeLines : true // true or false to prevent order lines from current order passing through.
            },
            success: opts.success
        });
    };

    // alterExistingTemplate function 
    // Attempts to alter specified existing template.
    $.cv.css.orderTemplate.alterExistingTemplate = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orderTemplate/AlterExistingTemplate', {
            parameters: {
                templateName: opts.templateName,
                overwrite: opts.overwrite != null ? opts.overwrite : false, // true or false to delete existing lines first.
                custTemplate: opts.custTemplate != null ? opts.custTemplate : false, // true or false to apply to all users for the customer.
                changeRole: opts.changeRole != null ? opts.changeRole : false, // true or false to change the role to be current role.
                roleTemplate: opts.roleTemplate != null ? opts.roleTemplate : false, // true or false to restrict use the role.
                excludeLines: opts.excludeLines != null ? opts.excludeLines : false // true or false to prevent order lines from current order passing through.
            },
            success: opts.success
        });
    };

    // OBSOLETE: use addLineToTemplateOrder() as it returns all out parameters etc...
    // addItemToTemplateOrder function 
    // Attempts to alter specified existing template
    $.cv.css.orderTemplate.addItemToTemplateOrder = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('orderTemplate/AddItemToTemplateOrder', {
            parameters: {
                productCode: opts.productCode, // the prodCode to add.
                quantity: opts.quantity, // qty to add
                orderNo: opts.orderNo, // the orderno of the template
                unusedErrorMessage: ''
            },
            success: opts.success
        });
    };

    // Adds a product to a template order
    $.cv.css.orderTemplate.addLineToTemplateOrder = function (options) {
        var opts = $.extend({
            orderNo: 0,
            productCode: "",
            quantity: "-1",
            setQtyAutomatically: false,

            success: $.noop
        }, options);
        return $.cv.ajax.call('orderTemplate/AddLineToTemplateOrder', {
            parameters: {
                orderNo: opts.orderNo,
                productCode: opts.productCode,
                quantity: opts.quantity,
                setQtyAutomatically: opts.setQtyAutomatically
            },

            success: opts.success
        });
    };

    $.cv.css.orderTemplate.getCostCentreCodes = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderTemplate/GetCostCentreCodes", {
            parameters: {},
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.deleteOrderTemplate = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderTemplate/DeleteOrderTemplate", {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.removeAllLines = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderTemplate/removeAllLines', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.orderTemplate.repriceOrder = function (options) {
        var opts = $.extend({
            soOrderNo: 0,
            soBoSuffix: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call("orderTemplate/Reprice", {
            parameters: opts,
            success: opts.success
        });
    };

    /* OrderTemplate - End  */
    ///////////////////////////

})(jQuery);
