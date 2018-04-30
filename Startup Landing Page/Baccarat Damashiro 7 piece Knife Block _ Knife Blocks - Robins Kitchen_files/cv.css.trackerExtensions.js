;

(function ($) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.tracker = $.cv.css.tracker || {};
    $.cv.css.tracker.trackerExtensionMethods = $.cv.css.tracker.trackerExtensionMethods || {};
    var tracker = $.cv.css.tracker;
    
    tracker.proxy.postCall($.cv.css.tracker.transactionProducts, "push", 1, function (data) {
       var eventReady = {
          event: "transReady"
       }
       if($.cv.util.hasValue(data) && $.cv.util.hasValue(data.ecommerce) && $.cv.util.hasValue(data.ecommerce.purchase) && $.cv.util.hasValue(data.ecommerce.purchase.actionField) && $.cv.util.hasValue(data.ecommerce.purchase.actionField.revenue)) {
        eventReady["transactionTotal"] = data.ecommerce.purchase.actionField.revenue;
       }
       tracker.push(eventReady);
    });

}(jQuery));