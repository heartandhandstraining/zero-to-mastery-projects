
;

// cv widget factory for Kendo UI
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.ui = $.cv.ui || {};

    // Custom Format specifier for removing trailing zeroes and decimal point from a number or string value
    var REMOVE_TRAILING_ZEROES_FORMAT = "n0when0";

    // Makes our signal() method available to all widgets.
    kendo.ui['Widget'].prototype.signal = function (name) {
        if (this.isInitialised !== true) {
            throw new Error("You cannot call signal before widgets are initialsed");
        }

        if (this._cv_finalWidget &&
            this._cv_finalWidget[name] &&
            Object.prototype.hasOwnProperty.call(this._cv_finalWidget, name))
        {
            return this[name].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        return null;
    };


    // Widget Registration
    //

    $.cv.ui.widget = function (w) {

        // Cater for no options object - can be if extending
        w.options = w.options || {};
        // Add widget name to options
        w.options.name = w.name;

        // object to extend
        w.extend = w.extend || "Widget";

        // used for calling base widget functions
        w.base = kendo.ui[w.extend].fn;

        // define kendo init function
        w.init = function (el, o) {
            var instance = this;
            var $el = $(el);
            var fixedOptions;

            // Widgets initialized most-derived toward base...
            if (instance._isFinalWidget === undefined) {
                instance._isFinalWidget = true;
            }

            var isFinalWidget = instance._isFinalWidget || false;

            if (window.cvcsswidgetsettings && window.cvcsswidgetsettings[this.options.name]) {
                // we have a setting object
                var settings = window.cvcsswidgetsettings[this.options.name];
                $.each(settings, function (key, item) {
                    if (o != undefined && o != null && o.hasOwnProperty(key)) {
                        // now check for setting      
                        if (o[key] === w.options[key])
                            instance.options[key] = settings[key];
                    } else
                        instance.options[key] = settings[key];
                });
            }

            instance._isFinalWidget = false;
            w.base.init.call(this, el, o);
            instance._isFinalWidget = isFinalWidget;

            if (w.initialise) {
                fixedOptions = $.cv.ui.widget._optionFixer($el, this.options);
                w.initialise.call(this, $el, fixedOptions);
                instance.isInitialised = true;
            }

            // Remove the "kendo" data element prefix
            $el.data(w.name, $el.data("kendo" + w.name));
            $el.data("kendo" + w.name, undefined);
            $el.removeData("kendo" + w.name);

            if (isFinalWidget && instance && instance.initialised) {
                // WARNING(jwwishart) mvvmwidget.signal method needs this
                // to determine the EXACT methods on the most-derived widget (final widget)
                // so as to determine whether it can safely call the method.
                instance._cv_finalWidget = w;

                // Call Initialised on the final widget... This is different to initialise in that
                // initialise is called on all widgets from the base widget up to the most derived 
                // widget, this is only called on the widget once fully initialised.
                instance.initialised();
            }
        };

        // Check for extended events
        if (w.extendEvents) {
            w.events = kendo.ui[w.extend].prototype.events.concat(w.extendEvents);
        }

        // Register the widget
        var widgetfn = kendo.ui[w.extend].extend(w);
        kendo.ui.plugin(widgetfn);

        // Cleanup - Remove the "kendo" default prefix
        $.fn[w.name] = $.fn["kendo" + w.name];
        $.fn["kendo" + w.name] = undefined;
    };

    // looks for numeric option values and checks 
    // whether there is a data- attribute, and will replace
    // with the actual data- attribute if the value looks
    // 
    function optionFixer($el, options) {
        if ($.cv.ui.widget._optionFixer.enabled === true && $el && options) {
            var key,
                newKey,
                value,
                i,
                currentChar,
                attrValue;

            for (key in options) {
                // Skip indexes, ensure not inherited item...
                if (typeof (key) === "number" || !options.hasOwnProperty(key)) {
                    continue;
                }

                value = options[key];

                // Do this stuff if value is actually a number
                if (value != null && typeof (value) === 'number') {
                    // Transform key
                    newKey = "data-";

                    for (i = 0; i < key.length; i += 1) {
                        currentChar = key.charAt(i);

                        if (currentChar === currentChar.toUpperCase()) {
                            newKey += "-" + currentChar.toLowerCase();
                            continue;
                        }

                        newKey += currentChar;
                    }

                    // We have new key data-product-code for example
                    // check attribute.
                    attrValue = $el.attr(newKey);

                    if (attrValue != null && attrValue !== value.toString()) {
                        options[key] = $el.attr(newKey);
                    }
                }
            }
        }

        return options;
    };

    $.cv.ui.widget._optionFixer = optionFixer;
    $.cv.ui.widget._optionFixer.enabled = true;

    (function (k) {
        /**
         * Customer Binding for adding a class to an element in the view based 
         * on object in the View Model
         *
         * Example: (template)
         *   <div data-bind="addClass: HighlightInfo"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          HighlighInfo: {
         *              add: true, // Designates whether the class should be added
         *              cssClass: 'highligh-feature' // Designates the css class to ensure is on the element.
         *          }
         *      }
        **/
        k.data.binders.addClass = k.data.Binder.extend({
            refresh: function () {
                var value = this.bindings["addClass"].get();

                if (value && value.add && value.cssClass) {
                    var $el = $(this.element);

                    if (!$el.hasClass()) {
                        $el.addClass(value.cssClass);
                    }
                }
                if (value && !value.add && value.cssClass) {
                    var $el = $(this.element);

                    if ($el.hasClass(value.cssClass)) {
                        $el.removeClass(value.cssClass);
                    }
                }
            }
        });

        /**
         * Custom Binding for adding a is processing class to an element in the view based 
         * on object in the View Model
         *
         * Example: (template)
         *   <div data-bind="addIsProcessingClass: isProcessing"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          isProcessing: true
         *      }
        **/
        k.data.binders.addIsProcessingClass = k.data.Binder.extend({
            refresh: function () {
                var value = this.bindings["addIsProcessingClass"].get();
                var $el = $(this.element);
                if (value) {
                    if (!$el.hasClass()) {
                        $el.addClass($.cv.css.isProcessingClass);
                    }
                } else {
                    if ($el.hasClass($.cv.css.isProcessingClass)) {
                        $el.removeClass($.cv.css.isProcessingClass);
                    }
                }
            }
        });

        /**
        * This custom binding once bound will apply a desired setting against the viewmodel.
        * This can be used to set values on the viewModel when you dont have access to it.
        * 
        * - EXAMPLE -
        * <div data-role="x">
        * 
        *   SOME SERVER SIDE INJECTION @{
        *       <span data-bind="updateWidgetValue:{forceOrderPackQty:1}">
        *   }
        * 
        * </div>
        * 
        * On pageload this will set forceOrderPackQty to 1 on the x widget.
        **/
        k.data.binders.updateWidgetValue = k.data.Binder.extend({
            init: function (element, bindings, options) {
                k.data.Binder.fn.init.call(this, element, bindings, options);

                var optionsToSet = bindings.updateWidgetValue.path;

                for (var property in optionsToSet) {
                    if (optionsToSet.hasOwnProperty(property)) {
                        var optionValue = optionsToSet[property];

                        // Convert from string if required.
                        if (optionValue === "true") {
                            optionValue = true;
                        } else if (optionValue === "false") {
                            optionValue = false;
                        } else {
                            var optionNumber = kendo.parseFloat(optionValue);
                            if (optionNumber !== null) {
                                optionValue = optionNumber;
                            }
                        }

                        bindings.updateWidgetValue.source.set(property, optionValue);
                    }
                }
            },
            refresh: $.noop
        });


        /**
         * Custom Binding for adding a class to an element in the view based 
         * on object in the View Model.
         * This will append or remove the class not clobber the class names already on the element
         *
         * Example: (template)
         *   <div data-bind="toggleOnClass: { error: titleIsEmpty }"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          titleIsEmpty: true
         *      }
        **/
        k.data.binders.toggleOnClass = k.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                // get list of class names from our complex binding path object
                this._lookups = [];
                for (var key in this.bindings.toggleOnClass.path) {
                    this._lookups.push({
                        key: key,
                        path: this.bindings.toggleOnClass.path[key]
                    });
                }
            },
            refresh: function () {
                var lookup, value;

                for (var i = 0; i < this._lookups.length; i++) {
                    lookup = this._lookups[i];

                    // set the binder's path to the one for this lookup,
                    // because this is what .get() acts on.
                    this.bindings.toggleOnClass.path = lookup.path;
                    value = this.bindings.toggleOnClass.get();

                    // add or remove CSS class based on if value is truthy
                    if (value) {
                        $(this.element).addClass(lookup.key);
                    } else {
                        $(this.element).removeClass(lookup.key);
                    }
                }
            }
        });

        /**
         * Custom Binding for adding a class to an element in the view based 
         * on object in the View Model.
         * This will append or remove the class not clobber the class names already on the element
         *
         * Example: (template)
         *   <div data-bind="toggleOffClass: { error: titleIsEmpty }"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          titleIsEmpty: true
         *      }
        **/
        k.data.binders.toggleOffClass = k.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                // get list of class names from our complex binding path object
                this._lookups = [];
                for (var key in this.bindings.toggleOffClass.path) {
                    this._lookups.push({
                        key: key,
                        path: this.bindings.toggleOffClass.path[key]
                    });
                }
            },
            refresh: function () {
                var lookup, value;

                for (var i = 0; i < this._lookups.length; i++) {
                    lookup = this._lookups[i];

                    // set the binder's path to the one for this lookup,
                    // because this is what .get() acts on.
                    this.bindings.toggleOffClass.path = lookup.path;
                    value = this.bindings.toggleOffClass.get();

                    // add or remove CSS class based on if value is truthy
                    if (!value) {
                        $(this.element).addClass(lookup.key);
                    } else {
                        $(this.element).removeClass(lookup.key);
                    }
                }
            }
        });

        k.data.binders.appendClass = kendo.data.Binder.extend({
            refresh: function () {
                var value = this.bindings["appendClass"].get();
                var $el = $(this.element);
                if (value) {
                    if (!$el.hasClass()) {
                        $el.addClass(value);
                    }
                }
            }
        });

        /**
         * Example: (template)
         *   <span data-bind="date: viewModelValue" data-dateformat="yyyy-MM-dd"></span>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          myDate : new Date(), // i.e. assign the date here....
         *      }
        **/

        // Source: http://jsfiddle.net/korchev/urAPV/1/
        k.data.binders.date = kendo.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                this.dateformat = $(element).data("dateformat");
            },
            refresh: function () {
                var data = this.bindings["date"].get();
                if (data) {
                    var dateObj = new Date(data);
                    if (dateObj != "Invalid Date") {
                        $(this.element).text(kendo.toString(dateObj, this.dateformat));
                    } else {
                        if (typeof data == 'string') {
                            var plus = data.indexOf('+');
                            if (plus == -1) plus = data.indexOf(')');
                            if (data.length > 6 && data.substr(0, 6) == '/Date(' && plus != -1) {
                                dateObj = $.cv.util.toDate(data);
                                $(this.element).text(kendo.toString(dateObj, this.dateformat));
                            }
                        }
                    }
                }
            }
        });

        /**
         * Examples: (template)
         *
         *   <!-- below moneyformat defaults to "c" -->
         *   <span data-bind="money: viewModelValue"></span>
         *   
         *   <!-- below moneyformat is explicity specified -->
         *   <span data-bind="money: viewModelValue" data-moneyformat="c2"></span>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          myMoney : 124.24, // i.e. assign the money value here....
         *      }
        **/
        k.data.binders.money = kendo.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                this.$el = $(element);

                var format = this.$el.data("moneyformat");
                if (!format) {
                    format = "c";
                }

                this.moneyformat = format;
            },
            refresh: function () {
                var data = this.bindings["money"].get();

                if (!data) {
                    data = 0;
                } else if (typeof data == "string") {
                    var num = data.replace(/^\D+/g, '');
                    var parsed;
                    data = isNaN(parsed = parseFloat(num)) ? 0 : parsed;
                }

                var negate = $(this.element).data("moneynegate");
                if (negate && typeof data === "number") {
                    data *= -1;
                }

                this.$el.text(kendo.toString(data, this.moneyformat));
            }
        });

        /**
         * Examples: (template)
         *
         *   <span data-bind="percent: nonDecimalPercent" data-percentmode="nondecimal" data-percentformat="p0"></span>
         *  
         *   output: 10%     // notice no decimal places
         *
         *   <span data-bind="percent: decimalPercent" data-percentmode="decimal" data-percentformat="p"></span>
         *
         *   output: 10.00%  // notice decimal places
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          nonDecimalPercent : 10,  // Non-Decimal Representation - DEFAULT
         *          decimalPercent    : 0.10 // Decimal Representation
         *      }
        **/
        k.data.binders.percent = kendo.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                this.$el = $(element);

                var format = this.$el.data("percentformat");
                if (!format) {
                    format = "p0";
                }

                var mode = this.$el.data("percentmode");
                if (!mode) {
                    mode = "nondecimal";
                }

                this.percentformat = format;
                this.percentmode = mode;
            },
            refresh: function () {
                var data = this.bindings["percent"].get();

                if (!data) {
                    data = 0;
                } else if (typeof data == "string") {
                    var parsed;
                    data = isNaN(parsed = parseFloat(data)) ? 0 : parsed;
                }

                if (this.percentmode.toLowerCase() === 'nondecimal') {
                    data = data / 100; // i.e. 10 to 0.10 for proper formatting below.
                }

                this.$el.text(kendo.toString(data, this.percentformat));
            }
        });


        /**
         * OVERRIDE KENDO TEXT TO SUPPORT GP-MASKING
         *
         * <span data-bind="attr: { data-gp-mask: maskGPData }, text: value"></span>
         * <span data-bind="text: value" data-text-format="Item {0}."></span>
        **/
        k.data.binders.text = kendo.data.Binder.extend({
            refresh: function () {
                var $el = $(this.element),
                    value = this.bindings["text"].get(),
                    maskGPData = $el.attr('data-gp-mask') == 'true';

                var textFormat = $el.data("textFormat");

                if (value == null) {
                    value = "";
                }

                var text;
                if (maskGPData) {
                    var fieldName = this.bindings.text.path;
                    text = $.cv.css.maskGPValue(fieldName, value, kendo);
                } else {
                    text = value;
                }

                if (textFormat) {
                    if (textFormat === REMOVE_TRAILING_ZEROES_FORMAT) {
                        $el.text($.cv.util.removeTrailingZeroes(data));
                    } else {
                        $el.text(kendo.format(textFormat, text));
                    }
                } else {
                    $el.text(text);
                }
            }
        });

        /**
         * Examples: (template)
         *
         *   <!-- below numberformat defaults to "n2" -->
         *   <span data-bind="number: viewModelValue"></span>
         *   
         *   <!-- below numberformat is explicity specified -->
         *   <span data-bind="number: viewModelValue" data-numberformat="n2"></span>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          myNumber : 124.24, // i.e. assign the value here....
         *      }
        **/
        k.data.binders.number = kendo.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                this.$el = $(element);

                var format = this.$el.data("numberformat");
                if (!format) {
                    format = "n2";
                }

                this.numberformat = format;
                this.isInput = this.$el.is('input');
            },
            refresh: function () {
                var data = this.bindings["number"].get();
                var formattedValue;

                if (!data) {
                    data = 0;
                }

                // Format
                if (this.numberformat === REMOVE_TRAILING_ZEROES_FORMAT) {
                    formattedValue = $.cv.util.removeTrailingZeroes(data);
                } else {
                    formattedValue = kendo.toString(data, this.numberformat);
                }

                // Assign text/value
                if (this.isInput) {
                    this.$el.val(formattedValue);
                } else {
                    this.$el.text(formattedValue);
                }
            }
        });

        k.data.binders.tabindex = k.data.Binder.extend({
            refresh: function () {
                var value = this.bindings["tabindex"].get();
                var $el = $(this.element);
                if ($el.attr("tabindex") != value) {
                    $el.attr("tabindex", value);
                }
            }
        });

        k.data.binders.widget.tabindex = k.data.Binder.extend({
            init: function (widget, bindings, options) {
                //call the base constructor
                k.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
            },
            refresh: function () {
                var that = this,
                value = that.bindings["tabindex"].get(); //get the value from the View-Model
                $(that.element).parent().find(".k-input").attr("tabindex", value);
            }
        });


        // this will pull out of the input box the default value and update the viewModel
        k.data.binders.valueWithDefault = k.data.Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                k.data.Binder.fn.init.call(this, element, bindings, options);

                var that = this;
                if (that.element.defaultValue != "") {
                    $(that.element).val(that.element.defaultValue);
                    that.bindings["valueWithDefault"].set(that.element.defaultValue); //update the View-Model
                }
                //listen for the change event of the element
                $(that.element).on("change", function () {
                    that.change(); //call the change function
                });
            },
            refresh: function () {
                var that = this,
                    value = that.bindings["valueWithDefault"].get(); //get the value from the View-Model
                if ((value == "" || value == undefined) && that.element.defaultValue != "") { // if the value is set to empty, default it to the default value
                    that.bindings["valueWithDefault"].set(that.element.defaultValue); //update the View-Model
                }
                else
                    $(that.element).val(value); //update the HTML input element
            },
            change: function () {
                var value = this.element.value;
                this.bindings["valueWithDefault"].set(value); //update the View-Model
            }
        });

        // this will update the viewModel when paste from the mouse or Ctrl + V shortcuts are used
        // you only need to bind this when you have also set the data-value-update= property on an element
        // it will also only work if data-value-update contains keyup
        /**
         * Examples: (template)
         *
         *   <span data-value-update="keyup change" data-bind="paste: true"></span>
         *
        **/
        k.data.binders.paste = kendo.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                $(element).bind("paste", function () {
                    var self = this;
                    setTimeout(function (e) {
                        $(self).keyup();
                    }, 0);
                });
            },
            refresh: function () {

            }
        });

        /**
         * Custom Binding for showing or hiding an element in the view based 
         * on object in the View Model.
         *
         * Example: (template)
         *   <div data-bind="displayAnimation: { slide: showElement }"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          showElement: true
         *      }
        **/
        k.data.binders.displayAnimation = k.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                // get list of display actions from our complex binding path object
                this._lookups = [];

                var $element = $(element);

                // get the speed of the animation
                var speed = $element.data("displaySpeed");
                if (!speed) {
                    speed = "fast";
                }
                var toggleCloseAnimation = $element.data("toggleCloseAnimation");
                if (!toggleCloseAnimation) {
                    toggleCloseAnimation = false;
                }
                for (var key in this.bindings.displayAnimation.path) {
                    this._lookups.push({
                        key: key + "Toggle",
                        path: this.bindings.displayAnimation.path[key],
                        speed: speed,
                        toggleCloseAnimation: toggleCloseAnimation
                    });
                }
            },
            refresh: function () {
                var lookup, value;

                var $element = $(this.element);

                for (var i = 0; i < this._lookups.length; i++) {
                    lookup = this._lookups[i];

                    // set the binder's path to the one for this lookup,
                    // because this is what .get() acts on.
                    this.bindings.displayAnimation.path = lookup.path;
                    value = this.bindings.displayAnimation.get();

                    // toggle element class based on if value is true
                    if (value) {
                        $element.hide()[lookup.key](lookup.speed);
                    } else {
                        if (lookup.toggleCloseAnimation) {
                            if ($element.is(":visible")) {
                                $element.show()[lookup.key](lookup.speed);
                            }
                        } else {
                            $element.hide();
                        }
                    }
                }
            }
        });

        /**
         * Custom Binding for showing or hiding an element in the view based 
         * on object in the View Model.
         *
         * Example: (template)
         *   <div data-bind="displayAnimationInOut: { fade: showElement }"></div>
         *   <div data-bind="displayAnimationInOut: { fade: showElement }" data-animation-delay="200"></div>
         *   <div data-bind="displayAnimationInOut: { fade: showElement }" data-display-speed="slow" data-animation-delay="200"></div>
         *   <div data-bind="displayAnimationInOut: { fade: showElement }" data-animation-complete="animationCompleteMethod"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          showElement: true
         *      }
        **/
        k.data.binders.displayAnimationInOut = k.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                // get list of display actions from our complex binding path object
                this._lookups = [];

                // get the speed of the animation
                var speed = $(element).data("displaySpeed");
                if (!speed) {
                    speed = "fast";
                }
                var animationDelay = $(element).data("animationDelay");
                if (!animationDelay) {
                    animationDelay = $.cv.css.animationDelay;
                }
                // an animation complete method is a call back method that gets called once the fade in / out animation has completed
                var animationComplete = $(element).data("animationComplete");
                for (var key in this.bindings.displayAnimationInOut.path) {
                    this._lookups.push({
                        key: key + "Toggle",
                        path: this.bindings.displayAnimationInOut.path[key],
                        speed: speed,
                        animationDelay: animationDelay,
                        animationComplete: animationComplete
                    });
                }
            },
            refresh: function () {
                var lookup, value;

                for (var i = 0; i < this._lookups.length; i++) {
                    lookup = this._lookups[i];

                    // set the binder's path to the one for this lookup,
                    // because this is what .get() acts on.
                    this.bindings.displayAnimationInOut.path = lookup.path;
                    value = this.bindings.displayAnimationInOut.get();

                    // toggle element class based on if value is true
                    if (value) {
                        var el = this;
                        $(this.element).hide()[lookup.key](lookup.speed).delay(lookup.animationDelay)[lookup.key](lookup.speed, function() {
                            // check to see if the binding has been setup with a callback method
                            if($.cv.util.hasValue(lookup.animationComplete) &&
                                el.bindings.displayAnimationInOut.source[lookup.animationComplete] &&
                                $.isFunction(el.bindings.displayAnimationInOut.source[lookup.animationComplete])) {
                                el.bindings.displayAnimationInOut.source[lookup.animationComplete].call();
                            }
                        });
                    }
                }
            }
        });

        /**
         * Custom Binding for setting the max value on a date or datetime picker
         * Works with data-role="datepicker" or data-role="datetimepicker"
         *
         * Example: (template)
         *   <div data-bind="max: maxDate" data-role="datepicker"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          maxDate: new Date()
         *      }
        **/

        kendo.data.binders.widget.max = kendo.data.Binder.extend({
            init: function (widget, bindings, options) {
                //call the base constructor
                kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
            },
            refresh: function () {
                var value = this.bindings["max"].get(); //get the value from the View-Model
                if ($(this.element).data("kendoDatePicker")) {
                    $(this.element).data("kendoDatePicker").max(value); //update the widget
                }
                if ($(this.element).data("kendoDateTimePicker")) {
                    $(this.element).data("kendoDateTimePicker").max(value); //update the widget
                }
            }
        });

        /**
         * Custom Binding for setting the min value on a date or datetime picker
         * Works with data-role="datepicker" or data-role="datetimepicker"
         *
         * Example: (template)
         *   <div data-bind="min: minDate" data-role="datepicker"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          minDate: new Date()
         *      }
        **/

        kendo.data.binders.widget.min = kendo.data.Binder.extend({
            init: function (widget, bindings, options) {
                //call the base constructor
                kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
            },
            refresh: function () {
                var value = this.bindings["min"].get(); //get the value from the View-Model
                if ($(this.element).data("kendoDatePicker")) {
                    $(this.element).data("kendoDatePicker").min(value); //update the widget
                }
                if ($(this.element).data("kendoDateTimePicker")) {
                    $(this.element).data("kendoDateTimePicker").min(value); //update the widget
                }
            }
        });

        /**
         * Custom binding that executes a ViewModel method only when Enter is 
         * pressed.
         *
         * Example: (template)
         *   <input type="text" data-bind="enterPressed: doSearch" value="mySearchTerm"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          doSearch: function(e) {
         *             // This method will only execute when you press ENTER!
         *          }
         *      }
        **/
        k.data.binders.enterPressed = k.data.binders.widget.enterPressed = kendo.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                var binder = bindings.enterPressed,
                    source = binder.source,
                    path = binder.path;

                // Handle odd cases like the input field is a kendo autocomplete... try and find
                // the ACTUAL element
                if (!$(element).is(":input")) {

                    // enterPressed on a KendoAutoComplete control will have the element
                    // in the element field
                    if (element.element) {
                        element = element.element;
                    }
                }

                $(element).bind($.cv.css.enterPressedEvent, function (e) {
                    if (e.which == 13) {
                        // Prevent any form submission or handling by something up the DOM
                        e.preventDefault();
                        e.stopPropagation();

                        // Execute the ViewModel Method
                        if (source[path] != null && $.type(source[path]) === 'function') {
                            source[path](e);
                        }
                    }
                });
            },
            refresh: $.noop
        });

        /**
         * Custom Binding for adding an attribute to an element in the view based 
         * on object in the View Model.
         * This will add or remove the attribute
         *
         * Example: (template)
         *   <div data-bind="toggleOnAttribute: { required: required }"></div>
         *
         * Example: (view model)
         *      var viewModel = ... {
         *          required: true
         *      }
        **/
        k.data.binders.toggleOnAttribute = k.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                // get list of class names from our complex binding path object
                this._lookups = [];
                for (var key in this.bindings.toggleOnAttribute.path) {
                    this._lookups.push({
                        key: key,
                        path: this.bindings.toggleOnAttribute.path[key]
                    });
                }
            },
            refresh: function () {
                var lookup, value;

                for (var i = 0; i < this._lookups.length; i++) {
                    lookup = this._lookups[i];

                    // set the binder's path to the one for this lookup,
                    // because this is what .get() acts on.
                    this.bindings.toggleOnAttribute.path = lookup.path;
                    value = this.bindings.toggleOnAttribute.get();

                    // add or remove CSS class based on if value is truthy
                    if (value) {
                        $(this.element).attr(lookup.key, lookup.key);
                    } else {
                        $(this.element).removeAttr(lookup.key);
                    }
                }
            }
        });

        /**
         * Custom Binding for adding a class to an element in the view based 
         * on the column count for the standard grid structure
         * The value bound to does not need to be a true / false value, for example it can be an array so it binds after the array is populated
         *
         * Example: (template)
         *   <div data-bind="addColumnCountClass: true"></div>
         *   <div data-bind="addColumnCountClass: viewModelProperty"></div>
        **/
        k.data.binders.addColumnCountClass = k.data.Binder.extend({
            refresh: function () {
                $.cv.util.setColumnCountClass(this.element);
            }
        });

        /**
         * Custom Binding for sorting a grid based 
         * on the column header that was clicked.
         * If the clicked column is the same as the last clicked column, then reverse the sort order
         *
         * Example: (template)
         *   <div data-bind="sort: { sortMethod: methodName, sortBy: columnName }"></div>
        **/
        k.data.binders.sort = k.data.Binder.extend({
            init: function (element, bindings, options) {
                kendo.data.Binder.fn.init.call(this, element, bindings, options);

                var value = this.bindings.sort.path;
                var binding = this.bindings.sort;
                var method = binding.source.get(value.sortMethod);
                var field = value.sortBy;

                $(element).bind("click", function (e) {
                    if ($.cv.util.hasValue(field)) {
                        method.call(binding.source, $(this), field);
                    }
                });


            },
            refresh: $.noop
        });

    })(kendo);

})(jQuery);

