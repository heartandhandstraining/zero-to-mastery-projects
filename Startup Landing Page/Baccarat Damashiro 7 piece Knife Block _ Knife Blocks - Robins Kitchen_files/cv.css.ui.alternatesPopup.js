/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.2-vsdoc.js" />
/// <reference path="http://cdn.kendostatic.com/2012.3.1315/js/kendo.web.min.js" />

/*
Name: cv.css.ui.alternatesPopup.js
Author: Sean Craig

Dependencies:
    * jQuery
    * FancyBox
    * Kendo

Params:
	|| Option || Type || Default Value || Notes ||
*/

;

(function ($, undefined) {
    var STOCKLINE = "SN";

    var alternatesSubstituteWidget = {
        name: "alternatesPopup",
        extend: "mvvmwidget",

        extendEvents: [],

        options: {
            popupId: "",
            carouselId: "",
            alwaysShowButton: false
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this;

            $.cv.css.bind($.cv.css.eventnames.showAlternatesPopup, $.proxy(widget.viewModel.showPopup, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.hideAlternatesPopup, $.proxy(widget.viewModel.hidePopup, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.cartLinesRendered, $.proxy(widget.viewModel.cartLinesRendered, widget.viewModel));
        },

        _getViewModel: function () {
            var widget = this;

            var viewModel = $.extend(kendo.observable(widget.options), {
                isContentLoading: false,
                destroyLineItem: false,

                hidePopup: function() {
                    widget.viewModel.set("destroyLineItem", true);
                    $.fancybox.close();
                },

                showPopup: function (item) {
                    $.fancybox.open(
                    {
                        href: "#" + widget.options.popupId,
                        topRatio: "0.25",
                        padding: 0,
                        beforeClose: function() {
                            if (widget.viewModel.get("destroyLineItem")) {
                                item.execCommand_destroy(); // Remove order line that was substituted.
                            }
                        },
                        afterClose: function() {
                            widget.viewModel.set("destroyLineItem", false);
                        },
                        beforeShow: function() {
                            var data = $("#" + widget.options.carouselId).data("owlCarousel");
                            if (data) {
                                data.destroy();
                            }
                            $("#" + widget.options.carouselId).html("");

                            $("#" + widget.options.carouselId).data("originalProductCode", item.StockCode);

                            widget.viewModel.set("isContentLoading", true);
                        },
                        afterShow: function() {
                            $.cv.css.orders.alternatesForProduct({ productCode: item.StockCode }).done(function (response) {
                                widget.viewModel.set("isContentLoading", false);

                                // Set the HTML inside the popup window.
                                $("#" + widget.options.carouselId).html(response.data);

                                // Kendo'ify the numeric textboxes.
                                $("#" + widget.options.carouselId + " .form-number").each(function () {
                                    $.cv.util.kendoNumericTextBox(this);
                                });

                                // Resize FancyBox popup window.
                                $.fancybox.update();

                                // Setup carousel.
                                $.cv.css.owlCarousel.bindProductCarousel($("#" + widget.options.carouselId));

                                // Init Kendo widgets.
                                kendo.init($("#" + widget.options.carouselId));
                            });
                        }
                    });
                },

                cartLinesRendered: function () {
                    // AlternatesPopupAlwaysDisplayButton  AvailableForOneQty   AlternatesCount  Button
                    // True                                N/A                  > 0              Show
                    // True                                N/A                  = 0              Hide
                    // False                               > 0                  N/A              Hide
                    // False                               = 0                  > 0              Show
                    // False                               > 0                  N/A              Hide
                    // False                               = 0                  = 0              Hide

                    // See if there are any alternate products available on the order.
                    $.cv.css.orders.alternatesCountForOrderLines().done(function (response) {
                        $.each(response.data, function (index, item) {
                            var showButton = (widget.options.alwaysShowButton && item.AlternatesCount > 0) ||
                                (!widget.options.alwaysShowButton && item.AvailableForOneQty === 0 && item.AlternatesCount > 0);

                            if (showButton) {
                                $.cv.css.trigger($.cv.css.eventnames.showAlternatesButton, item);
                            }
                        });
                    });
                }
            });

            viewModel.bind("change", function(e) {
                if (e.field === "quantity") {
                    console.log("viewModel.quantity = " + viewModel.get("quantity"));
                }
            });

            return viewModel;
        }
    }

    // Register the widget.
    $.cv.ui.widget(alternatesSubstituteWidget);
})(jQuery);
