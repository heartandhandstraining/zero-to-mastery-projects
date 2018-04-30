/*
* Name: product search
* Author: Aidan Thomas
* Date Created: 2013/01/04
* Description: product search widget 
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js (built with jquery-1.7.1.min.js)
*          kendo.web.js (kendo.web.min.js v2012.2.710)
*
*          --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.data.kendo.js
*          /Scripts/cv.util.js    
* Parameters:
*          suggestionsDataSource
*          searchPageUrl: 
*          searchQueryStringKey: query string key to get search detail from
*          searchOnChange: trigger search on change
*          change: chang event
*          useSuggestions: show suggestsions from suggestions data source
*          textFieldPrompt: search field promp
*          searchButtonText: 
*          viewTemplate: kendo template id for the view
*/
;
(function ($, undefined) {

    var CHANGE = 'change',
        WIDGETINITIALISED = "widgetInitialised";

    var productsearch = {
        // Standard Variables

        // widget name
        name: "productSearch",

        // default widget options
        options: {
            // viewModel defaults
            suggestionsDataSource: [],
            searchSuggestions: true,
            productSuggestions: false,
            searchPageUrl: '/ProductDisplay.aspx',
            searchPageUrlPriorPurchase: '',
            priorPurchaseSearchTicked: false,
            searchPageUrlUserFavourites: "/ProductDisplay.aspx?UserFavourites=true",
            searchQueryStringKey: 'ProductSearch',
            categoryFilterParam: "FilterProduct",
            productSearchFilterElement: "[data-role='productsearchfilter']",
            productSearchFilterData: "productSearchFilter",
            productFilterField: "", // Can be comma separated (to search multiple fields).
            productFilterType: "",
            categoryFilters: [],
            categoryFilter: "",
            // viewModel flags
            searchOnChange: false,
            includeInBrowserHistory: true,
            retainCurrentSearchStringKey: 'RetainCurrentSearch',
            retainCurrentSearch: true,
            // events
            change: null,
            // view flags
            useSuggestions: false,
            useSearchAndProductSuggestions: false,
            allowEmptySearch: true,
            triggerMessages: true,
            clearExistingMessages: true,
            bindAutoComplete: false,
            isProductFilterSearch: false,
            // view text defaults
            textFieldPrompt: 'Product Search :',
            searchButtonText: 'Go',
            pleaseEnterASearchValue: "Please enter a search value",
            // view Template
            viewTemplate: '', // treat like its an id
            includeHeadingsAsDataItems: true,
            searchSuggestionHeadingPositionSelector: 'li:has(span.search-item):first',
            productSuggestionHeadingPositionSelector: 'li:has(span.product-item):first',
            searchSuggestionsHeadingTemplateId: '', // treat like an id
            productSuggestionsHeadingTemplateId: '' // treat like an id
        },

        events: [CHANGE, WIDGETINITIALISED],

        viewModel: null,

        view: null,

        // private property
        _viewAppended: false,


        // Standard Methods
        initialise: function(el, o) {
            var widget = this;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                if (!widget.options.viewTemplate) {
                    widget.options.viewTemplate = widget._getDefaultViewTemplate();
                }
                var viewTemplate = kendo.template(widget.options.viewTemplate);
                widget.view = viewTemplate(widget.options);
                $(el).append(widget.view);
                widget._viewAppended = true;
            }
            // now MMVM bind
            widget.viewModel = widget._getViewModel();
            var target = $(widget.element).children(":first");
            kendo.bind(target, widget.viewModel);
            // Required for backward compatibility where customers not on BPD have implemented their own custom version of this event handling
            if (widget.options.bindAutoComplete) {
                widget._autoCompleteBinding();
            }
            widget.trigger(WIDGETINITIALISED);
        },

        destroy: function() {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended) {
                $.cv.util.destroyKendoWidgets(widget.element);
                widget.element.empty();
            }
        },

        // private function
        _autoCompleteBinding: function() {
            var widget = this;
            widget.autoCompleteInput = $(widget.element).find("input[data-text-field='SearchKey']");
            widget.searchButton = $(widget.element).find("button");
            widget.kendoAutoComplete = widget.autoCompleteInput.data("kendoAutoComplete");
            // Need to to do this when using the autocomplete as it overrides this event
            widget.autoCompleteInput.keydown(function (event) {
                if (event.which === 13) {
                    // prevent the default methods for the enter key, helps stop the form submitting when there is a input of type submit on the page somewhere
                    event.preventDefault();
                    event.stopPropagation();
                    widget.searchButton.click();
                }
            });
            if ($.cv.util.hasValue(widget.kendoAutoComplete)) {
                widget.kendoAutoComplete.bind("select", widget.viewModel._autoCompleteSelected);
            }
        },

        _getViewModel: function() {
            var widget = this;

            var init = function() {
                var productFilter = $.cv.util.queryStringValue(widget.options.categoryFilterParam);
                if (productFilter != undefined && productFilter.toLowerCase().indexOf("categorycode") !== -1) {
                    var filterArray = productFilter.split(":"),
                        categoryCode = filterArray.length > 2 ? filterArray[2] : "";
                    viewModel.set("categoryFilter", categoryCode);
                }
            };

            // setup default dataSource calling service
            if (widget.options.useSuggestions && (widget.options.suggestionsDataSource === []) || widget.options.suggestionsDataSource.length == 0) {
                if (widget.options.useSearchAndProductSuggestions) {
                    widget.options.suggestionsDataSource = $.cv.data.dataSource({
                        method: 'search/predictiveSearchJson2',
                        params: function(data, type) {
                            return {
                                searchTerm: data.filter.filters[0].value,
                                searchSuggestions: widget.options.searchSuggestions,
                                productSuggestions: widget.options.productSuggestions,
                                isPriorPurchase: viewModel.get("priorPurchaseSearchTicked"),
                                filter: 'SearchKey',
                                includeHeadings: widget.options.includeHeadingsAsDataItems
                            };
                        }
                    });
                } else {
                    widget.options.suggestionsDataSource = $.cv.data.dataSource({
                        method: 'search/predictiveSearchJson',
                        params: function (data, type) {
                            return {
                                searchTerm: data.filter.filters[0].value,
                                filter: 'SearchKey'
                            };
                        }
                    });
                }
            }

            // pull the current search value out of the url query string
            var value = $.cv.util.queryStringValue(widget.options.retainCurrentSearchStringKey);
            if ($.cv.util.isNullOrWhitespace(value) === false) {
                widget.options.retainCurrentSearch = (value.toLowerCase() === "true");
            }
            if (widget.options.retainCurrentSearch) {
                var currentSearch = $.cv.util.queryStringValue(widget.options.searchQueryStringKey);
                if (!$.cv.util.isNullOrWhitespace(currentSearch) && currentSearch === "%") {
                    currentSearch = "";
                }
            }

            var viewModel = kendo.observable({

                isSearching: false,

                suggestionsDataSource: widget.options.suggestionsDataSource,

                priorPurchaseSearchTicked: widget.options.priorPurchaseSearchTicked,

                categoryFilters: widget.options.categoryFilters,

                categoryFilter: widget.options.categoryFilter,

                searchPageUrlUserFavourites: widget.options.searchPageUrlUserFavourites,

                searchText: currentSearch ? (currentSearch.length != 0 ? (widget.options.useSuggestions ? { SearchTermValue: currentSearch, SearchKey: currentSearch } : currentSearch) : null) : null,

                searchInputKeyUp: function(event) {
                    if (event.which == 13) {
                        // prevent the default methods for the enter key, helps stop the form submitting when there is a input of type submit on the page somewhere
                        event.preventDefault();
                        event.stopPropagation();
                        this.search();
                    }
                },

                searchInputBound: function(e) {
                    var $list = $(e.sender.list);

                    // add search suggestions heading (if applicable)
                    if (widget.options.searchSuggestions === true && !$.cv.util.isNullOrWhitespace(widget.options.searchSuggestionHeadingPositionSelector)
                        && !$.cv.util.isNullOrWhitespace(widget.options.searchSuggestionsHeadingTemplateId)) {
                        $list.find(widget.options.searchSuggestionHeadingPositionSelector).prepend($('#' + widget.options.searchSuggestionsHeadingTemplateId).html());
                    }

                    // add product suggestions heading (if applicable)
                    if (widget.options.productSuggestions === true && !$.cv.util.isNullOrWhitespace(widget.options.productSuggestionHeadingPositionSelector)
                        && !$.cv.util.isNullOrWhitespace(widget.options.productSuggestionsHeadingTemplateId)) {
                        $list.find(widget.options.productSuggestionHeadingPositionSelector).prepend($('#' + widget.options.productSuggestionsHeadingTemplateId).html());
                    }
                },

                getProductSearchFilter: function() {
                    var filter = "";
                    $(widget.options.productSearchFilterElement).each(function() {
                        var productSearchFilterWidget = $(this).data(widget.options.productSearchFilterData);
                        if (productSearchFilterWidget)
                            filter = productSearchFilterWidget.buildFilter();
                    });
                    return filter;
                },

                getCategoryFilter: function () {
                    return "CategoryCode:sw:" + this.get("categoryFilter");
                },

                useProductFilterSearch: function () {
                    return widget.options.isProductFilterSearch &&
                        !$.cv.util.isNullOrWhitespace(widget.options.productFilterField) &&
                        !$.cv.util.isNullOrWhitespace(widget.options.productFilterType);
                },

                // Gives the ability to automatically run the search when an option is selected from the autoselect drop down
                _autoCompleteSelected: function (e) {
                    widget.kendoAutoComplete.unbind("close", widget.viewModel._autoCompleteClosed);
                    widget.kendoAutoComplete.bind("close", widget.viewModel._autoCompleteClosed);
                },

                _autoCompleteClosed: function (e) {
                    widget.kendoAutoComplete.unbind("close", widget.viewModel._autoCompleteClosed);
                    widget.viewModel.search();
                },

                search: function () {

                    var params = {}, searchValue, filter;
                    
                    // if using suggestions pull the search value out of the autocomplete value otherwise just get it from the input
                    if (this.get("searchText") != null) {
                        if (widget.options.useSuggestions) {
                            searchValue = (this.get("searchText").SearchTermValue != null && this.get("searchText").SearchTermValue != '') ? this.get("searchText").SearchTermValue : this.get("searchText").SearchKey;
                            if (!searchValue) {
                                searchValue = this.get("searchText");
                            }
                        } else {
                            searchValue = this.get("searchText");
                        }
                    } else {
                        searchValue = '';
                        params["AttemptedEmptySearch"] = encodeURIComponent("true");
                    }
                    if ($.trim(searchValue).length == 0 && !widget.options.allowEmptySearch) {
                        $.cv.util.notify(this, widget.options.pleaseEnterASearchValue, $.cv.css.messageTypes.error, {
                            triggerMessages: widget.options.triggerMessages,
                            clearExisting: widget.options.clearExistingMessages,
                            source: widget.name
                        });
                    } else {
                        this.set("isSearching", true);
                        if (!this.useProductFilterSearch()) {
                            var searchUserFavourites = false;
                            params[widget.options.searchQueryStringKey] = encodeURIComponent(searchValue);
                            if (this.get("categoryFilter").length > 0) {
                                if (this.get("categoryFilter").toLowerCase() !== "userfavourites=true") {
                                    params[widget.options.categoryFilterParam] = this.getCategoryFilter();
                                } else {
                                    searchUserFavourites = true;
                                }
                            }
                            filter = this.getProductSearchFilter();
                            if (filter.length > 0)
                                params["FilterFeature"] = filter;
                            if (searchValue != null) {
                                if (this.get("priorPurchaseSearchTicked")) {
                                    $.cv.util.redirect(widget.options.searchPageUrlPriorPurchase, params, !widget.options.includeInBrowserHistory);
                                } else if (searchUserFavourites) {
                                    $.cv.util.redirect(widget.options.searchPageUrlUserFavourites, params, !widget.options.includeInBrowserHistory);
                                }
                                else {
                                    $.cv.util.redirect(widget.options.searchPageUrl, params, !widget.options.includeInBrowserHistory);
                                }                               
                            } else {
                                this.set("isSearching", false);
                            }
                        } else {
                            var filterFieldArray = widget.options.productFilterField.split(",");
                            var filterProductParams = [];
                            $.each(filterFieldArray, function(filterIndex, filterItem) {
                                filterProductParams.push("{0}:{1}:{2}".format(filterItem, widget.options.productFilterType, searchValue));
                            });

                            params[widget.options.searchQueryStringKey] = encodeURIComponent("%");
                            params["searchAll"] = encodeURIComponent("true");
                            params["FilterProduct"] = filterProductParams.join("|");
                            $.cv.util.redirect(widget.options.searchPageUrl, params, !widget.options.includeInBrowserHistory);
                        }
                    }
                }
            });

            if (widget.options.searchOnChange) {
                viewModel.bind('change', function(e) {
                    if (e.field == "searchText") {
                        widget.trigger(CHANGE, e);
                        viewModel.search();
                    }
                });
            }
            init();
            return viewModel;
        },

        _getDefaultViewTemplate: function() {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "<div>"
                + "<label>" + widget.options.textFieldPrompt + "</label>";
            if (widget.options.useSuggestions) {
                html += "<input type='text' data-role='autocomplete' data-text-field='SearchKey' data-bind='source: suggestionsDataSource, value: searchText' data-value-update='keyup' />";
            } else {
                html += "<input type='text' data-bind='value: searchText, events: {keyup: searchInputKeyUp}' data-value-update='keyup' />";
            }
            html += "<button data-bind='click: search'>" + widget.options.searchButtonText + "</button>"
                + "</div>";
            return html;
        }
    };

    // register the widget

    $.cv.ui.widget(productsearch);

})(jQuery);
