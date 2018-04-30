/**
    Widget:
        Overlay

    Author:
        Tod Lewin: 2015-12-12
        Call: 75943
**/

;

(function ($) {
    var WIDGET_NAME = "overlay";

        var widgetDefinition = {
            name: WIDGET_NAME,
            extend: "mvvmwidget",
            extendEvents: [],

            // default widget options
            options: {
                // viewModel defaults
                clearExistingMessages: true,
                showMessages: true,
                alwaysDisplay: false,

                // viewModel flags
                autoBind: true,
                triggerMessages: true,

                // events
                // view flags
                // view text defaults

                // widget settings
                viewTemplate: null,

                //overlay options
                padding: 10,
                margin: 20,
                modal: false,
                cyclic: false,
                scrolling: "auto",
                width: 560,
                height: 340,
                autoScale: true,
                autoDimensions: true,
                centreOnScroll: false,
                hideOnOverlayClick: true,
                hideOnContentClick: false,
                overlayOpacity: 0.3,
                overlayColor: "#666",
                titleShow: true,
                titlePosition: "outside",
                titleFormat: null,
                transitionIn: "fade",
                transitionOut: "fade",
                speedIn: 300,
                speedOut: 300,
                changeSpeed: 300,
                changeFade: "fast",
                easingIn: "swing",
                easingOut: "swing",
                showCloseButton: true,
                showNavArrows: true,
                enableEscapeButton: true,
                onStart: null,
                onCancel: null,
                onComplete: null,
                onCleanup: null,
                onClosed: null,
                type: "inline",
                removeTarget: false,
                hideTarget: true,
                templateName: "",
                headingIcon: "",
                headerContent: "",
                headerFromTemplate: true,
                footerContent: "<button id=\x22overlayConfirmButton\x22 class=\x22btn cv-confirm\x22>Confirm</button><button id=\x22overlayCancelButton\x22 class=\x22btn cv-cancel\x22>Cancel</button>",
                footerFromTemplate: false,
                overlayTemplate: "",
                overlayWrapperTemplate: "<div id=\x22{0}-overlay\x22 class=\x22overlay\x22>{1}{2}{3}</div>",
                overlayHeaderTemplate: "<header id=\x22{0}-overlay-header\x22 class=\x22overlay-header ico-header {1}\x22>{2}</header>",
                overlayContentTemplate: "<section id=\x22{0}-overlay-content\x22 class=\x22overlay-content\x22>{1}</section>",
                overlayFooterTemplate: "<footer id=\x22{0}-overlay-footer\x22 class=\x22overlay-footer\x22>{1}</footer>"
            },

        initialise: function(el, o) {
            var widget = this;

            $.cv.css.bind($.cv.css.eventnames.showOverlay,
                $.proxy(widget.viewModel.showOverlay,
                    widget.viewModel));

            widget._initialiseOverlay();
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function() {
            var widget = this;
        },

        _initialiseOverlay: function () {
            var widget = this;
            var vm = widget.viewModel;
            var templateName = vm.get("templateName");

            //Check to see if we have a target template name to work with
            //This is the jQuery selector or class or identifier attribute for a html tag output to the view
            //Where a class is used and more than one target exists then the first target is used
            //The target is removed from the DOM during initialisation if the remove from target flag is set so if this is not the intended
            //target then you need to be more specific with your class or us and id attribute
            if ($.cv.util.hasValue(templateName)) {

                //get the target as a jquery object. Treat the template name as a selector in its own right
                //initially to allow a custom selector to be passed directly in. If this does not return a result then 
                //treat the template name as an identifier and if this does not return a result then treat the 
                //template name as a class attribute.
                var overlayTarget = $(templateName);

                if (overlayTarget.length <= 0) {
                    overlayTarget = $("#" + templateName);
                }

                if (overlayTarget.length <= 0) {
                    overlayTarget = $("." + templateName + ":first");
                }

                //if we have a target element then initialise the header footer and content.
                //We don't check the inner content of the target. If there is no content then the overlay is formed from 
                //whatever is in the header, content and footer templates.
                if (overlayTarget.length > 0) {
                    
                    //Header
                    var overlayHeader = widget._initialiseHeader(overlayTarget);
                    //Footer
                    var overlayFooter = widget._initialiseFooter(overlayTarget);
                    //Content
                    var overlayContent = widget._initialiseContent(overlayTarget);
                    
                    //If we were able to initialise header footer and content then format
                    //the overlay template and save to the viewModel ready for use.
                    if ($.cv.util.hasValue(overlayHeader) && $.cv.util.hasValue(overlayContent) && $.cv.util.hasValue(overlayFooter)) {
                        var overlayTemplate = vm.get("overlayWrapperTemplate").format(templateName,
                                                                                      overlayHeader,
                                                                                      overlayContent,
                                                                                      overlayFooter);

                        vm.set("overlayTemplate", overlayTemplate);
                    }

                    overlayTarget.remove();
                }
            }
        },

        _initialiseHeader: function(overlayTemplate) {
            if ($.cv.util.hasValue(overlayTemplate)) {
                var widget = this;
                var vm = widget.viewModel;
                var templateName = vm.get("templateName");

                //get the header from the overlay template if one exists.
                //This needs to be done regardless of whether we will be using it or not
                //as it needs to be removed.
                var targetHeader = overlayTemplate.find("header:first-of-type");

                var headerContent = "";
                if (vm.get("headerFromTemplate") === true) {
                    if (targetHeader.length > 0) {
                        //get the content from the header to be used to form the final overlay header.
                        headerContent = targetHeader.html();
                    }
                } else {
                    headerContent = vm.get("headerContent");
                }

                //remove the header section irrespective of whether we use it or not
                //It should no longer be considered and futher processing (i.e. content)
                targetHeader.remove();

                //Now that we have our header content, either passed in from the options or from the 
                //target template itself, create a validator (similar to string.Format in c#)
                //Using the overlayHeaderTemplate from the widget options. 
                return vm.get("overlayHeaderTemplate").format(templateName,
                                                              vm.get("headingIcon"),
                                                              headerContent);
            }

            return undefined;
        },

        _initialiseContent: function(overlayTemplate) {
            if ($.cv.util.hasValue(overlayTemplate)) {
                var widget = this;
                var vm = widget.viewModel;
                var templateName = vm.get("templateName");

                //this gets fun because we need the existing html including the selected element and not just the
                //inner html. This is because this may contain binding information that we want to use in the overlay.
                //to get around this we create a wrapper around our target which we can use to select the inner html of
                //whcih is the html content we are after.
                overlayTemplate.wrap("<span id=" + templateName + "-temporary-content-wrapper></span>");

                return vm.get("overlayContentTemplate").format(templateName,
                                                               overlayTemplate.parent().html());
            }

            return undefined;
        },

        _initialiseFooter: function(overlayTemplate) {
            if ($.cv.util.hasValue(overlayTemplate)) {
                var widget = this;
                var vm = widget.viewModel;
                var templateName = vm.get("templateName");

                //get the footer from the overlay template if one exists.
                //This needs to be done regardless of whether we will be using it or not
                //as it needs to be removed.
                var targetFooter = overlayTemplate.find("footer:last-of-type");

                var footerContent = "";
                if (vm.get("footerFromTemplate") === true) {
                    if (targetFooter.length > 0) {
                        //get the content from the header to be used to form the final overlay header.
                        footerContent = targetFooter.html();
                    }
                } else {
                    footerContent = vm.get("footerContent");
                }

                 //remove the footer section irrespective of whether we use it or not
                //It should no longer be considered and futher processing (i.e. content)
                targetFooter.remove();

                //Now that we have our footer content, either passed in from the options or from the 
                //target template itself, create a validator (similar to string.Format in c#)
                //Using the overlayFooterTemplate from the widget options. 
                return vm.get("overlayFooterTemplate").format(templateName,
                                                              footerContent);
            }

            return undefined;
        },

        _getViewModel: function() {
            var widget = this;
            var opts = widget.options;

            var vm = kendo.observable($.extend({}, opts, {
                // UI Element state
                isInitialLoad: true,
                isDisabled: false,
                message: "",
                
                // functions for UI events
                clearMessage: function () {
                    var clearExistingMessages = this.get("clearExistingMessages");
                    this.set("clearExistingMessages", true);
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'deliveryMethod', clearExisting: this.get("clearExistingMessages") });
                    this.set("clearExistingMessages", clearExistingMessages);
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                //handler for the showOverlay event. If this widget is configured to show the specified overlay then this method
                //takes action to show it otherwise ignores the event.
                showOverlay: function (msg) {
                    var vm = this;
                    var templateName = vm.get("templateName");

                    //check for the template that this overlay instance is meant to handle.
                    if ($.cv.util.hasValue(templateName) && $.cv.util.hasValue(msg) && msg.templateName === templateName) {
                        $.fancybox({type: "inline",
                                    modal: vm.get("modal"),
                                    content: vm.get("overlayTemplate")
                        });

                        kendo.init("#" + templateName + "-overlay");

                        var overlayTemplate = $("#" + templateName + "-overlay");

                        overlayTemplate.find(".cv-confirm").on("click", function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $.fancybox.close();
                            $.cv.css.trigger($.cv.css.eventnames.overlayClosed, {
                                templateName: vm.get("templateName"),
                                action: "confirmed"
                            });
                        });
                        overlayTemplate.find(".cv-cancel").on("click", function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $.fancybox.close();
                            $.cv.css.trigger($.cv.css.eventnames.overlayClosed, {
                                templateName: vm.get("templateName"),
                                action: "cancelled"
                            });
                        });
                    }
                }
            }));

            return vm;
        }
    };

    // Register
    $.cv.ui.widget(widgetDefinition);
})(jQuery);
