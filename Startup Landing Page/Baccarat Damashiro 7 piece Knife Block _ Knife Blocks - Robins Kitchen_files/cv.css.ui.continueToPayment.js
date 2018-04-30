/*
    See confluence page: 
*/

;
(function ($, undefined) {

    var continueToPaymentWidget = {

        // Standard Variables

        // widget name
        name: "continueToPayment",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            validationWidgets: "deliveryAddress,freightCarrier,orderCompleteFields,deliveryMethod",
            step1Container: "#cv-zone-checkout-step1-container",
            step2Container: "#cv-zone-checkout-step2-container",
            step2Hash: "step2",
            scrollToElement: "#cv-zone-layout",
            // viewModel flags
            autoBind: true,
            usingAddressValidation: false,
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,
            // view text defaults
            errorLoggingOut: "There was an error logging you out, please refresh the page and try again"
        },

        initialise: function (el, o) {
            var widget = this,
                vm = widget.viewModel;
            $(widget.element).click(function () {
                vm.continueOrder();
            });
            if (widget.options.usingAddressValidation) {
                vm._setIsDisabled(true);
            }
            $.cv.css.bind($.cv.css.eventnames.addressValidated, $.proxy(widget.viewModel._validationUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.freightValidated, $.proxy(widget.viewModel._validationUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.updateFreightStatusChanged, $.proxy(widget.viewModel._setInProcessing, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.orderCompleteFieldsValidated, $.proxy(widget.viewModel._validationUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.deliveryMethodValidated, $.proxy(widget.viewModel._validationUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressBeingEdited, $.proxy(widget.viewModel._addressBeingEdited, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressValidationUpdated, $.proxy(widget.viewModel.addressValidationUpdated, widget.viewModel));
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
                
                // Private properties

                _validationWidgets: widget.options.validationWidgets.split(","),

                // UI Element state

                isProcessing: false,

                isDisabled: widget.options.usingAddressValidation,

                // functions for UI events

                // Private methods

                _hasValidationErrors: function () {
                    var errorsExist = false;
                    $.each(this.get("_validationWidgets"), function (idx, item) {
                        if (_.contains(_.keys($.cv.css.pageValidationErrors), item)) {
                            errorsExist = true;
                        }
                    });
                    return errorsExist;
                },

                _processPageValidationErrors: function () {
                    var widgetElement = "[data-role='{0}']", widget, promises = [];
                    $.each(this.get("_validationWidgets"), function (idx, item) {
                        $(widgetElement.format(item.toLowerCase()) + ":not([data-is-view-only='true'])").each(function () {
                            widget = $(this).data(item);
                            if (widget) {
                                if ($.isFunction(widget.validateInputFields))
                                    promises.push(widget.validateInputFields(true));
                            }
                        });
                    });
                    return $.when.apply($, promises);
                },

                _setInProcessing: function (isInProcessing) {
                    var vm = this;
                    vm._setIsProcessing(isInProcessing);
                },

                _validationUpdated: function () {
                    var vm = this;
                    vm._setIsProcessing(false);
                },

                _addressBeingEdited: function (data) {
                    var vm = this;
                    if (widget.options.usingAddressValidation) {
                        vm._setIsDisabled(true);
                    }
                    if (!vm.get("isDisabled")) {
                        vm._setIsProcessing(true);
                    }
                },

                addressValidationUpdated: function (data) {
                    var vm = this;
                    vm._setIsDisabled(!data.valid);
                },

                _setIsProcessing: function (isProcessing) {
                    var vm = this;
                    vm.set("isProcessing", isProcessing);
                    if (isProcessing) {
                        $(widget.element).addClass($.cv.css.isProcessingClass);
                    } else {
                        $(widget.element).removeClass($.cv.css.isProcessingClass);
                    }
                },

                _setIsDisabled: function (isDisabled) {
                    var vm = this;
                    vm.set("isDisabled", isDisabled);
                    if (isDisabled) {
                        $(widget.element).addClass("disabled");
                    } else {
                        $(widget.element).removeClass("disabled");
                    }
                },

                // Public methods

                /*
                    This processes the click event
                */
                continueOrder: function () {
                    var vm = this;
                    if (!vm.get("isDisabled")) {
                        if (!vm.get("isProcessing")) {
                            vm._setIsProcessing(true);
                            vm._processPageValidationErrors().done(function () {
                                if (!vm._hasValidationErrors()) {
                                    window.location.hash = widget.options.step2Hash;
                                    $(widget.options.step1Container).fadeOut("fast");
                                    $(widget.options.step2Container).fadeIn("fast");
                                    $("html,body").animate({ scrollTop: $(widget.options.scrollToElement).offset().top }, "fast");
                                    $.cv.css.trigger($.cv.css.eventnames.continueToPayment);
                                }
                                vm._setIsProcessing(false);
                            });
                        } else {
                            vm._processPageValidationErrors();
                        }
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
    $.cv.ui.widget(continueToPaymentWidget);

})(jQuery);