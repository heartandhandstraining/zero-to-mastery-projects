// closure for $.cv.css.orderApproval plugin 

;

(function ($, undefined) {
    // Check we have everything we need
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};

    // $.cv.css.orderApproval object definition
    $.cv.css.orderApproval = $.cv.css.orderApproval || {};
    

    $.cv.css.orderApproval.getOrdersForApproval = function (options) {
        var opts = $.extend({
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderApproval/GetOrdersForApproval', {
            parameters: {},
            success: opts.success
        });
    };

    $.cv.css.orderApproval.approveOrder = function (options) {
        if ($.type(options) !== 'object') {
            var orderNo = options;
            options = {
                orderNo: orderNo
            };
        }

        var opts = $.extend({
            orderNo: 0,
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderApproval/ApproveOrder', {
            parameters: { orderNo: opts.orderNo },
            success: opts.success
        });
    };

    $.cv.css.orderApproval.rejectOrder = function (options) {
        var opts = $.extend({
            orderNo: 0,
            rejectionReason: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderApproval/RejectOrder', {
            parameters: {
                orderNo: opts.orderNo,
                rejectionReason: opts.rejectionReason
            },
            success: opts.success
        });
    };


    /* IMPORTANT: Relies on DynamicService config file being present and set-up on server to expose endpoints.
     * Example one used for these functions is setup in CSS 3.60 ff (/DynamicServices/orderApproval.config).  
     */
    
    // getApproverOptions function 
    // Gets SalesOrderApproverHeader Type containing available approval details available for current user's current order
    $.cv.css.orderApproval.getApproverOptions = function (options) {
        var opts = $.extend({
            doNotClearExisting: false,
            success: $.noop
        }, options);

        return $.cv.ajax.call('orderApproval/GetOrderApprovalOptions', {        
            parameters:  { 
                doNotClearExisting: opts.doNotClearExisting // probably best to pass false for most approval types so can remove any existing ones and set up blank ones (depends on type)
            },
            success: opts.success
        });
    };
        
    // setApproverOptions function 
    // Sets SalesOrderApproval details for current user's current order using specified selections.
    // Returns an result indicating success and a message detailing any error.
    $.cv.css.orderApproval.setApproverOptions = function (options) {
        var opts = $.extend({        
            approverOrGroupIds: '', // Comma separated list of selected ApprovalOption ids (start at 0). Just pass one if not able to sselect multiple options. Pass empty when not able to have a choice but it gets set automatically
            success: $.noop
        }, options);
        
        return $.cv.ajax.call('orderApproval/SetApproverOptions', {        
            parameters:  { 
                approverOrGroupIds: opts.approverOrGroupIds            
            },
            success: opts.success
        });
    };
      
    // validateOrderApproval function 
    // Validates that approval is correctly set for current user's current order.
    // Returns an result indicating success and a message detailing any error.
    $.cv.css.orderApproval.validateOrderApproval = function (options) {
        var opts = $.extend({ 
            success: $.noop
        }, options);
        
        return $.cv.ajax.call('orderApproval/ValidateOrderApproval', { 
            success: opts.success
        });
    };

})(jQuery);
