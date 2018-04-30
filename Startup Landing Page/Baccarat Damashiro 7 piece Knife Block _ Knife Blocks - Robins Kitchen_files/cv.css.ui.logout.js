/*
    See confluence page: http://confluence.commercevision.com.au/x/h4X-B
*/

;
(function ($, undefined) {

    var logoutWidget = {

        // Standard Variables

        // widget name
        name: "logout",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            // viewModel flags
            autoBind: true,
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,
            // view text defaults
            errorLoggingOut: "There was an error logging you out, please refresh the page and try again",
            logoutRedirectUrl: "",
            loginPopupId: "",
            fieldSelector: ""
        },

        // MVVM Support

        // private functions
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements
                
                // Priovate properties

                // UI Element state

                isProcessing: false,

                // functions for UI events

                showLoginModal: function () {
                    $.fancybox.open({
                        href: "#" + viewModel.get("loginPopupId"),
                        topRatio: "0.25",
                        minWidth: "320",
                        padding: "0",
                        parent: "form:first",
                        afterShow: function () {
                            var field = $(viewModel.get("fieldSelector"));
                            jQuery(field).focus();
                        }
                    });

                },

                /*
                    This gets the products attribute combinations
                */
                logout: function () {
                    var vm = this;
                    if (!vm.get("isProcessing")) {
                        vm.set("isProcessing", true);
                        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                        $.cv.css.logout({
                            logoutRedirectUrl: $.cv.util.isNullOrWhitespace(widget.options.logoutRedirectUrl) ? "/" : widget.options.logoutRedirectUrl
                        }).done(function (data) {
                            if (data && data.length > 0) {
                                $.cv.util.notify(widget.viewModel, vm.get("errorLoggingOut"), $.cv.css.messageTypes.error);
                                vm.set("isProcessing", false);
                            }
                        }).fail(function (data) {
                            $.cv.util.notify(widget.viewModel, vm.get("errorLoggingOut"), $.cv.css.messageTypes.error);
                            vm.set("isProcessing", false);
                        });
                    }
                }

            }));

            viewModel.bind("change", function (e) {
                
            });

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            // future widgets will not use view templates
        }

    };

    // register the widget
    $.cv.ui.widget(logoutWidget);

})(jQuery);