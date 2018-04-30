/*
    See confluence page: 
*/

;
(function ($, undefined) {

    var VIEW_MODEL_BOUND = 'viewModelBound';

    var priceFilterWidget = {

        // Standard Variables

        // widget name
        name: "priceFilter",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            minValue: 0,
            maxValue: 0,
            selectedMinValue: 0,
            selectedMaxValue: 0,
            // viewModel flags
            autoBind: true,
            filterApplied: false,
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true
            // view text defaults
        },

        extendEvents: [
            VIEW_MODEL_BOUND
        ],

        // MVVM Support

        viewModelBound: function () {
            var widget = this;
            $.cv.css.bind($.cv.css.eventnames.priceFilterRedirect, $.proxy(widget.viewModel.redirectWithProductFilters, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.priceFilterSliderChange, $.proxy(widget.viewModel.setSelectedValues, widget.viewModel));
            widget.trigger(VIEW_MODEL_BOUND);
        },

        // private functions
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var removeFilter = function () {
                var filter = $.cv.util.queryStringValue("FilterProduct"),
                    filterStart = 0,
                    newFilter = "";
                if (filter != undefined && filter.toLowerCase().indexOf("integratedprice") != -1) {
                    filterStart = filter.toLowerCase().indexOf("integratedprice");
                    newFilter = filter.substring(0, filterStart - 1) + filter.substring(filter.indexOf(")", filterStart) + 1);
                }
                newFilter = newFilter.replace(/^[,\|]+/, "").replace(/[,\|]+$/, ""); // remove any starting or trailing commas or pipes
                return newFilter;
            };

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements

                isApplying: false,

                isClearing: false,

                // Private properties

                // UI Element state

                isProcessing: false,
                isExpanded: true,
                toggleExpanded: function () {
                    this.set("isExpanded", !this.get("isExpanded"));
                },
                // functions for UI events

                /*
                    This redirects to the filter passed in
                */
                redirectToFilter: function (filter) {
                    $.cv.util.redirect(null, { FilterProduct: filter }, false);
                },

                /*
                    This sets the filter
                */
                filter: function () {
                    this.set("isApplying", true);
                    var newFilter = this.buildFilter();
                    this.redirectToFilter(newFilter);
                },

                /*
                    This clears the filter
                */
                clearFilter: function () {
                    this.set("isClearing", true);
                    var newFilter = removeFilter();
                    this.redirectToFilter(newFilter);
                },

                /*
                    This is to be bound to the range slider change event to that the vm can be updated with the changed data
                */
                setSelectedValues: function (data) {
                    if (data && data.values && data.values.length == 2) {
                        this.set("selectedMinValue", data.values[0]);
                        this.set("selectedMaxValue", data.values[1]);
                    }
                },

                buildFilter: function() {
                    var filter = removeFilter();
                    if (filter.length > 0) {
                        filter += ",";
                    }
                    filter += "(IntegratedPrice:ge:" + this.get("selectedMinValue") + ",IntegratedPrice:le:" + this.get("selectedMaxValue") + ")";
                    return filter;
                },
                
                redirectWithProductFilters: function (data) {
                    var priceFilter = "";
                    if (!data.clearAll) {
                        priceFilter = this.buildFilter();
                    }
                    if (this.get("selectedMaxValue") !== this.get("maxValue")) {
                        data.filterToSet.FilterProduct = priceFilter;
                    }
                    $.cv.util.redirect(null, data.filterToSet, false);
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
    $.cv.ui.widget(priceFilterWidget);

})(jQuery);