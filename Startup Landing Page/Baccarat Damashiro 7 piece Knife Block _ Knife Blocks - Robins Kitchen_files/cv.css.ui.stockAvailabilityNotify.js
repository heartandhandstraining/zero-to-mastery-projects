/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.2-vsdoc.js" />
/// <reference path="http://cdn.kendostatic.com/2012.3.1315/js/kendo.web.min.js" />

/*
Name: cv.css.ui.stockAvailabilityNotify.js
Author: Sean Craig

Dependencies:
    * jQuery
    * FancyBox
    * Kendo

Params:
	|| Option || Type || Default Value || Notes ||
	| popupId | string | null | The ID of the HTML element to use for the popup window. |
	| notifyEmailAddress | string | null | The initial notification email address. |

	| notifyEmailAddressId | string | null | The ID of the HTML element to use for the notification email address. Required if viewTemplate is not null. |
	| emailAddress | string | null | The email address of the current user. If null, the current user's email address is used. |
	| customerCode | string | null | The customer code of the current user. If null, the current user's customer code is used. |
	| roleName | string | null | The role name of the current user. If null, the current user's role name is used. |
*/

;

(function ($, undefined) {
    var ON_BEFORE_NOTIFICATION_ADDED = "onBeforeNotificationAdded";
    var ON_AFTER_NOTIFICATION_ADDED = "onAfterNotificationAdded";
    var ON_BEFORE_NOTIFICATION_REMOVED = "onBeforeNotificationRemoved";
    var ON_AFTER_NOTIFICATION_REMOVED = "onAfterNotificationRemoved";

    var STOCKLINE = "SN";

    var stockAvailabilityNotifyWidget = {
        name: "stockAvailabilityNotify",
        extend: "mvvmwidget",

        extendEvents: [ON_BEFORE_NOTIFICATION_ADDED, ON_AFTER_NOTIFICATION_ADDED, ON_BEFORE_NOTIFICATION_REMOVED, ON_AFTER_NOTIFICATION_REMOVED],

        options: {
            popupId: null,
            triggerMessages: true,
            showNotificationList: false,

            notifyEmailAddress: "",

            invalidEmailAddressMessage: "Email Address is invalid",
            notificationRequestSavedMessage: "Notification request saved successfully",
            removeNotificationSuccessMessage: "Notification removed successfully",
            removeNotificationFailMessage: "Notification removal failed"
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this;

            // Subscribe to messages.
            $.cv.css.bind($.cv.css.eventnames.stockAvailabilityNotifyShowPopup, $.proxy(widget.viewModel.showPopup, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.stockAvailabilityNotifyRemove, $.proxy(widget.viewModel.remove, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.cartItemsChanged, $.proxy(widget.viewModel.cartItemsChanged, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.cartItemsChanged, widget.viewModel));

            if (widget.options.showNotificationList === true) {
                widget.viewModel._loadItems();
            }
        },

        _getViewModel: function () {
            var widget = this;

            var viewModel = $.extend(kendo.observable(widget.options), {
                emailAddressErrorMsg: "",
                productCodes: "",
                visibleProductCodes: "",

                itemList: [],
                isLoadingItems: false,
                hasNotifications: true,
                changeCallback: null,
                data: null,

                showPopup: function (params, eventArgs) {
                    if (params) {
                        if (params.productCodes && params.productCodes.length > 0) {
                            widget.viewModel.set("productCodes", params.productCodes);
                        } else {
                            widget.viewModel.cartItemsChanged();
                        }
                        widget.viewModel.set("changeCallback", params.onChange);
                        widget.viewModel.set("data", params.data);
                    } else {
                        widget.viewModel.cartItemsChanged();
                        widget.viewModel.set("changeCallback", null);
                        widget.viewModel.set("data", null);
                    }

                    widget.viewModel.set("visibleProductCodes", widget.viewModel.get("productCodes").replace(/\|\|/g, ", "));

                    $.fancybox.open(
					{
					    href: "#" + widget.viewModel.get("popupId"),
					    padding: 0
					});
                },

                remove: function(params, eventArgs) {
                    widget.viewModel.set("changeCallback", params.onChange);
                    widget.viewModel._removeNotify(params.productCodes);
                },

                confirmClick: function () {
                    var isValid = widget.viewModel._validatePopup();
                    if (!isValid) {
                        return;
                    }

                    var parameters =
					{
					    productCodes: widget.viewModel.get("productCodes"),
					    notifyEmailAddress: widget.viewModel.get("notifyEmailAddress")
					};

                    widget.trigger(ON_BEFORE_NOTIFICATION_ADDED, parameters);

                    $.cv.css.stockAvailabilityNotify.notifyMe(parameters).done(function() {
                        widget.trigger(ON_AFTER_NOTIFICATION_ADDED, parameters);

                        widget.viewModel._callback(true);
                        $.fancybox.close();

                        $.cv.css.trigger($.cv.css.eventnames.removeLineFromCartAfterSelectingNotifyWhenInStock, widget.viewModel.get("data"));

                        // Show 'success' message.
                        $.cv.util.notify(widget.viewModel, widget.options.notificationRequestSavedMessage, $.cv.css.messageTypes.success, {
                            triggerMessages: widget.options.triggerMessages,
                            source: widget.name
                        });
                    });
                },

                dataChanged: function () {
                    widget.viewModel._validatePopup();
                },

                cartItemsChanged: function() {
                    var lines = $.cv.css.localGetCurrentOrderLines();

                    var productCodesOutOfStock = [];
                    if (lines) {
                        $.each(lines, function (index, line) {
                            if (line.LineType === STOCKLINE && line.Product[0].AvailableForOneQty <= 0) {
                                productCodesOutOfStock.push(line.StockCode);
                            }
                        });
                    }

                    widget.viewModel.set("productCodes", productCodesOutOfStock.join("||"));
                },

                removeNotify: function (e) {
                    var productCodes = $(e.target).data("productCode");
                    widget.viewModel._removeNotify(productCodes);
                },

                _removeNotify: function (productCodes) {
                    widget.trigger(ON_BEFORE_NOTIFICATION_REMOVED, productCodes);

                    $.cv.css.stockAvailabilityNotify.removeNotify({ productCodes: productCodes }).done(function (data) {
                        var ok = data.data.toLowerCase() === "true";

                        widget.trigger(ON_AFTER_NOTIFICATION_REMOVED, productCodes);
                        $.fancybox.close();

                        if (ok) {
                            widget.viewModel._callback(false);
                            widget.viewModel._loadItems();

                            $.cv.util.notify(widget.viewModel, widget.options.removeNotificationSuccessMessage, $.cv.css.messageTypes.success, {
                                triggerMessages: widget.options.triggerMessages,
                                source: widget.name
                            });
                        } else {
                            $.cv.util.notify(widget.viewModel, widget.options.removeNotificationFailMessage, $.cv.css.messageTypes.error, {
                                triggerMessages: widget.options.triggerMessages,
                                source: widget.name
                            });
                        }
                    });
                },

                _callback: function(flag) {
                    var callback = widget.viewModel.get("changeCallback");
                    if (callback != null) {
                        callback(flag);
                    }
                },

                _validatePopup: function () {
                    var pattern = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
                    var isEmailAddressValid = pattern.test(widget.viewModel.get("notifyEmailAddress"));
                    widget.viewModel.set("emailAddressErrorMsg", isEmailAddressValid ? "" : widget.options.invalidEmailAddressMessage);

                    return isEmailAddressValid;
                },

                _loadItems: function () {
                    widget.viewModel.set("isLoadingItems", true);

                    $.cv.css.stockAvailabilityNotify.getNotificationsForCurrentUser().done(function (data) {
                        widget.viewModel.set("itemList", data.data);
                        widget.viewModel.set("isLoadingItems", false);
                        widget.viewModel.set("hasNotifications", data.data.length > 0);
                    });
                }
            });

            return viewModel;
        }
    }

    // Register the widget.
    $.cv.ui.widget(stockAvailabilityNotifyWidget);
})(jQuery);
