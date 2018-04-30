/*
 *  
 * Author: Chad Paynter
 * Date: 08/05/2013
 * Name: selectcode
 * Description: Allow input of a trade docket with submit taking user to checkout

    Requires:
    Scripts/jquery-1.8.3.js
    Scripts/kendo.core.js
    Scripts/kendo.data.js
    Scripts/kendo.binder.js
    Scripts/cv.js
    Scripts/cv.css.js (For CSS Related Widgets)
    Scripts/cv.util.js
    Scripts/cv.widget.kendo.js

    options:
        showValue - show the value of the item rather than the default text of the item
 */
;
(function ($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        keys = kendo.keys,
        ns = ".kendoComboBox",
        support = kendo.support,
        placeholderSupported = support.placeholder,
        FOCUS = "focus",
        FOCUSED = "k-state-focused",
        STATE_SELECTED = "k-state-selected",
        STATE_FILTER = "filter",
        STATE_ACCEPT = "accept",
        STATE_REBIND = "rebind",
        NULL = null;

    var selectCodeWidget = {
        // widget name
        name: "SelectCode",
        extend: "ComboBox", // extend existing combobox widget

        options: {
            showValue: false // by default this control shows the text int he input, not the value
        },

        initialise: function (element, options) {
            var that = this;


            // that.ns = ns;
            // initialize the widget by calling init on the extended class
            // kendo.ui.ComboBox.fn.init.call(that, element, options);
            that.ns = ns;

            // Added focus trigger
            that.input.on("focus" + ns, function () {
                that.trigger(FOCUS);
            });
        },

        value: function (value) {
            var that = this,
                idx;

            if (value !== undefined) {
                if (value !== null) {
                    value = value.toString();
                }

                that._valueCalled = true;

                // CHANGED: This was causing old value to appear in input when dropdown opened
                //if (value && that._valueOnFetch(value)) {
                //    return;
                //}



                idx = that._index(value);

                if (idx > -1) {
                    that.select(idx);
                    that.text(value); // CHANGED:  JDF Added this
                } else {
                    that.current(NULL);
                    that._custom(value);
                    that.text(value);
                    that._placeholder();
                }

                that._old = that._accessor();
                that._oldIndex = that.selectedIndex;
            } else {
                return that._accessor();
            }
        },

        _keydown: function (e) {
            var that = this,
                key = e.keyCode;

            that._last = key;

            clearTimeout(that._typing);

            // CHANGED: dont process the select kep up or down if the dropdown is not open
            if (!that.popup.visible() && (key == keys.UP || key == keys.DOWN)) {
                e.preventDefault();
                return;
            }

            if (key != keys.TAB && !that._move(e)) {
                if (that.dataSource && that.dataSource._data){
                    that.dataSource._data.isSearching = true;
                }
                that._search();
            }
        },

        _select: function (li) {
            var that = this,
                text,
                value,
                data = that._data(),
                idx = that._highlight(li);

            that.selectedIndex = idx;

            if (idx !== -1) {
                if (that._state === STATE_FILTER) {
                    that._state = STATE_ACCEPT;
                }

                that._current.addClass(STATE_SELECTED);

                data = data[idx];
                text = that._text(data);
                value = that._value(data);

                // CHANGED: implement which field to show
                if (that.options.showValue) {
                    that._prev = that.input[0].value = value;
                } else {
                    that._prev = that.input[0].value = text;
                }
                that._accessor(value !== undefined ? value : text, idx);
                that._placeholder();

                if (that._optionID) {
                    that._current.attr("aria-selected", true);
                }
            }
        },

        //CHANGED: function added
        _adjustListWidth: function () {
            var list = this.list,
                WIDTH = "width",
                width = list[0].style.width,
                wrapper = this.wrapper,
                computedStyle, computedWidth;

            if (!list.data(WIDTH) && width) {
                return;
            }

            //computedStyle = window.getComputedStyle ? window.getComputedStyle(wrapper[0], null) : 0;
            //computedWidth = computedStyle ? parseFloat(computedStyle.width) : wrapper.outerWidth();

            //if (computedStyle && (browser.mozilla || browser.msie)) { // getComputedStyle returns different box in FF and IE.
            //    computedWidth += parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
            //}

            width = 300; //computedWidth - (list.outerWidth() - list.width());

            list.css({
                fontFamily: wrapper.css("font-family"),
                width: width
            })
            .data(WIDTH, width);

            return true;
        },

        // JDF 27/3/14 - standard _aria() function in kendo combobox gets an error in IE 11/10 running IE7 compatibility mode
        _aria: function () {
        },

        _input: function () {
            var that = this,
                element = that.element.removeClass("k-input")[0],
                tabIndex = element.tabIndex,
                accessKey = element.accessKey,
                wrapper = that.wrapper,
                SELECTOR = "input.k-input",
                input, DOMInput,
                name = element.name || "";

            if (name) {
                name = 'name="' + name + '_input" ';
            }

            input = wrapper.find(SELECTOR);

            if (!input[0]) {
                wrapper.append('<span tabindex="-1" unselectable="on" class="k-state-default" style="background-color: transparent"><input ' + name + 'class="k-input" type="text" autocomplete="off"/></span>')
                       .append(that.element);

                input = wrapper.find(SELECTOR);
            }

            DOMInput = input[0];
            DOMInput.tabIndex = tabIndex;
            DOMInput.style.cssText = element.style.cssText;

            if (element.maxLength > -1) {
                DOMInput.maxLength = element.maxLength;
            }

            input.addClass(element.className)
                 .val(element.value)
                 .css({
                     width: "100%",
                     height: element.style.height
                 })
                 .show();

            if (placeholderSupported) {
                input.attr("placeholder", that.options.placeholder);
            }

            if (accessKey) {
                element.accessKey = "";
                input[0].accessKey = accessKey;
            }

            that._focused = that.input = input;
            that._inputWrapper = $(wrapper[0].firstChild);
            that._arrow = wrapper.find(".k-icon")
                                 .attr({
                                     "role": "button",
                                     "tabIndex": -1
                                 });

            if (element.id) {
                that._arrow.attr("aria-controls", that.ul[0].id);
            }
        }
    };

    $.cv.ui.widget(selectCodeWidget);
})(jQuery);