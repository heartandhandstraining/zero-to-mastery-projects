;
/* Name: metadatasummary
* Author: Chad Paynter
* Created: 20130527
* Description: Displays product metadata (also known as product features) for the products shown on productdisplay page
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*          --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.data.kendo.js
*          /Scripts/cv.ajax.js
*          /Scripts/cv.css.js
* Params:  
*          sessionTimeOutRedirectUrl - redirect if session timeout and no cv.ajax setting defined
*/
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        WIDGETINITIALISED = "widgetInitialised",
        LISTUPDATED = "listUpdated",
        ITEMCHANGE = "itemchange";

    var metaDataSummary = {

        // Standard Variables

        // widget name
        name: "metaDataSummary",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: null,
            // viewModel flags
            autoBind: true,
            showAll: false,
            useNameValues: false,
            nameFilter: "",
            redirectOnFilter: true,
            allowCombinations: false,
            refreshOnItemChange: false,
            filterOnItemChange: true,
            redirectOnRemoveAllFilters: true,
            redirectOnPriceFilter: false,
            // events
            // view flags
            bindDataSource: true,
            filterJoinOperator: 'OR',
            sessionTimeOutRedirectUrl: '',
            triggerMessages: false,
            textErrorGettingFilters: "There was an error getting the current product features",
            mandatoryFilters: "",
            singleOptionFilters: "",
            sliderSmallStepCount: 10,
            sliderLargeStepMultiplier: 2,
            includePleaseSelect: false,
            pleaseSelectFeatureName: "Please Select...",

            // widget settings
            textCurrentFilterHeading: 'Current Filter',
            textCurrentFilterInstructions: 'Choose the filter below.',
            textAvailableFilterHeading: 'Filter the results',
            mandatoryFiltersNotSelected: "Please select a value for the filter: {0}",

            // view Template
            viewTemplate: null,
            itemViewTemplate: null
        },

        events: [DATABINDING, DATABOUND, LISTUPDATED, WIDGETINITIALISED],

        viewModel: null,

        view: null,

        // MVVM Support

        items: function () {
            return this.element.find("tbody").children();
        },

        // for supporting changing the datasource via MVVM
        setDataSource: function (dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
            // redraw the datasource items
            this.refresh();
        },

        // private property
        _viewAppended: false,
        _itemViewAppended: false,


        // Standard Methods
        initialise: function (el, o) {

            var widget = this;

            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                // setup view
                widget._viewAppended = true;
                if (!widget.options.itemViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.itemViewTemplate = widget.name + "-item-template-" + kendo.guid();
                    widget._itemViewAppended = true;
                }
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                // add the itemView (not parsed)
                if (!widget.options._itemViewAppended) {
                    widget.view += widget._getDefaultItemViewTemplate();
                }
                widget.element.html(widget.view);
            }
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);
            // dataSource default should be []
            widget._dataSource();
            // if autobound, refresh is called when the DS is fetched
            widget.trigger(WIDGETINITIALISED);
        },

        _dataSource: function () {
            var widget = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource
            if (widget.dataSource && widget._refreshHandler) {
                widget.dataSource.unbind(CHANGE, widget._refreshHandler);
            }
            else {
                widget._refreshHandler = $.proxy(widget.refresh, widget);
            }

            // returns the datasource OR creates one if using array or configuration object
            widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);

            // bind to the change event to refresh the widget
            widget.dataSource.bind(CHANGE, widget._refreshHandler);

            if (widget.options.autoBind) {
                widget.dataSource.fetch();
            }
        },

        refresh: function (e) {
            var widget = this;
            // don't refresh recursively
            if (widget.refreshing)
                return;
            if (e.action == ITEMCHANGE && !widget.options.refreshOnItemChange)
                return;
            widget.viewModel.dataSource = widget.options.dataSource;
            widget.refreshing = true;
            widget.viewModel.updateItemList();
            widget.refreshing = false;
        },

        destroy: function () {
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
        _getViewModel: function () {
            var widget = this;

            var generateEncodedString = function (array) {
                var newFilterArrayEncoded = [];
                $.each(array, function (idx1, item1) {
                    var filterEncoded = [];
                    $.each(this.split(":"), function (idx2, item2) {
                        filterEncoded.push(encodeURIComponent(item2));
                    });
                    newFilterArrayEncoded.push(filterEncoded.join(":"));
                });
                return newFilterArrayEncoded.join("%C3%B1");
            };

            var initDataSource = function () {
                // make dynamic service call
                if (!widget.options.dataSource || widget.options.dataSource == null) {
                    var d1 = $.Deferred();
                    if (!widget.options.useNameValues) {
                        d1 = $.cv.css.getAvailableProductFeatureValues({ mode: widget.options.showAll ? "showAll" : "" });
                    } else {
                        d1 = $.cv.css.getProductFeatureNameValuesWithFilter({ nameFilter: widget.options.nameFilter });
                    }
                    $.when(d1).done(function (msg) {
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                if (msg.data) {
                                    // set mode
                                    if (msg.data.Mode != undefined) {
                                        viewModel.set("filterMode", msg.data.Mode);
                                    }
                                    var featureFilters = $.cv.css.metaData.getMetaDataArray(widget, msg);
                                    if (featureFilters && widget.options.includePleaseSelect) {
                                        _.each(featureFilters, function (featureFilter) {
                                            if (featureFilter.Data) {
                                                featureFilter.Data.unshift({
                                                    featureName: widget.options.pleaseSelectFeatureName,
                                                    featureNameID: widget.options.pleaseSelectFeatureName
                                                });
                                                featureFilter.selectedFilter = featureFilter.Data[0];
                                            }
                                        });
                                    }

                                    widget.options.dataSource = featureFilters;

                                }
                            } else
                                widget.viewModel.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                        } else {
                            widget.viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, false);
                        }
                        setDataSource();
                        // indicate loading done for placeholder loading icon
                        viewModel.set("contentLoading", false);
                    }).fail(function () {
                        viewModel.setMessage(widget.options.textErrorGettingFilters, $.cv.css.messageTypes.error);
                        viewModel.set("contentLoading", false);
                    });
                }
            };

            var setDataSource = function () {
                widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);

                if (widget.options.autoBind) {
                    widget.dataSource.fetch();
                }
                viewModel.updateItemList();

                $(".sidebarSlideToggleContent").hide();

                $(".sidebarSlideToggleHeader").on('click', function () {
                    $(this).next().slideToggle("medium");
                    $(this).next().find(".upArrow").toggle();
                    $(this).next().find(".downArrow").toggle();
                });
            };

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                var array = [];
                var view = widget.dataSource.view();
                $.each(view, function (idx, item) {
                    // add standard commands
                    array.push(item);
                });
                return array;
            };

            var finalAndItems = [];
            // build filters - =Name:eq:Width,Value:eq:12
            var activeFilters = $.cv.util.getFilterFeatures();
            _.each(activeFilters, function (unionItems) {
                if (_.isArray(unionItems[0])) {
                    _.each(unionItems, function (orItems) {
                        orItems[1].Key = orItems[0].Value;
                        finalAndItems.push(orItems[1]);

                    });
                } else {
                    unionItems[1].Key = unionItems[0].Value;
                    finalAndItems.push(unionItems[1]);
                }
            });
            activeFilters = finalAndItems;

            var viewModel = kendo.observable({

                // Properties for UI elements
                dataSource: widget.options.dataSource,
                
                updateItemList: function () {
                    viewModel.set('contentLoading', true);
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("showAvailableFilterPane", dataView.length > 0);
                    widget.trigger(LISTUPDATED, { count: dataView.length });
                },

                itemList: getDataView(),

                message: '',

                clearMessage: function () {
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'metaDataSummary', clearExisting: true });
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                clearExistingMessages: true,

                // filters
                mandatoryFilters: $.cv.util.isNullOrWhitespace(widget.options.mandatoryFilters) ? [] : widget.options.mandatoryFilters.split(","),
                singleOptionFilters: $.cv.util.isNullOrWhitespace(widget.options.singleOptionFilters) ? [] : widget.options.singleOptionFilters.split(","),
                showAvailableFilterPane: true,
                hasFilterOptions: true,
                ActiveFilters: activeFilters,
                hasActiveFilters: activeFilters.length > 0,
                removeFilter: function () {
                    $.cv.css.metaData.setupFilter(widget, this.Key, this.Value, widget.viewModel.get("filterMode"));
                },
                removeFilters: function (filters) {
                    $.cv.css.metaData.removeUriFilters(widget, filters);
                },
                isSingleSelectionFilter: function(filter) {
                    return _.indexOf(this.get("singleOptionFilters"), filter) !== -1;
                },
                unselectedMandatoryFields: function (filters) {
                    var unselectedField = "";
                    // This finds the first value then exists the loop
                    _.every(this.get("mandatoryFilters"), function (mandatoryItem) {
                        var selected = _.find(filters, function(item) {
                            return item.featureKey === mandatoryItem;
                        }) != undefined;
                        if (!selected) {
                            unselectedField = mandatoryItem;
                        }
                        return selected;
                    });
                    return unselectedField;
                },
                applyFilters: function () {
                    viewModel.clearMessage();
                    var filters = $.cv.css.metaData.getSelectedFilters(this);
                    var unselectedMandatoryFields = this.unselectedMandatoryFields(filters);
                    if ($.cv.util.isNullOrWhitespace(unselectedMandatoryFields)) {
                        $.cv.css.metaData.applyFilters(widget, filters);
                    } else {
                        viewModel.setMessage(widget.options.mandatoryFiltersNotSelected.format(unselectedMandatoryFields), $.cv.css.messageTypes.error);
                    }
                },
                setFilter: function () {
                    $.cv.css.metaData.setupFilter(widget, this.Key, this.Value, this.get("filterMode"), true);
                },
                filterMode: "",
                isClearingAll: false,
                removeAllFilters: function () {
                    this.set("isClearingAll", true);
                    if (widget.options.redirectOnRemoveAllFilters) {
                        $.cv.util.redirect(null, { FilterFeature: "", PageProduct: "1" }, false);
                    } else {
                        var filters = $.cv.css.metaData.getSelectedFilters(this);
                        $.each(filters, function(idx, filter) {
                            if (filter.get("isSelected")) {
                                filter.set("isSelected", false);
                            }
                        });
                        $.cv.css.metaData.generateNewUri(widget, []);
                        this.set("isClearingAll", false);
                    }
                },
                currentFilters: [],
                currentFilterValue: "",

                // labels
                textCurrentFilterHeading: widget.options.textCurrentFilterHeading,
                textCurrentFilterInstructions: widget.options.textCurrentFilterInstructions,
                textAvailableFilterHeading: widget.options.textAvailableFilterHeading,

                //  TIMEOUTS
                redirectToTimeoutUrl: function (fallbackUrl, params, includeInBrowserHistory) {
                    if ($.cv.ajax.settings.timeoutRedirectUrl == "")
                        $.cv.util.redirect(fallbackUrl, params, !includeInBrowserHistory);
                    else
                        $.cv.util.redirect($.cv.ajax.settings.timeoutRedirectUrl, params, !includeInBrowserHistory);
                },

                // appearance
                contentLoading: false,

                isExpanded: true,
                toggleExpanded: function () {
                    this.set("isExpanded", !this.get("isExpanded"));
                }
            });

            initDataSource();

            viewModel.bind("change", function (e) {
                if (e.field == "itemList" && e.action && e.action == "itemchange" && widget.options.filterOnItemChange) {
                    var itemArr = e.items;
                    if (itemArr && itemArr.length > 0) {
                        var item = itemArr[0];
                        if (item.Feature != undefined && item.selectedFilter != undefined) {
                            if (item.selectedFilter.featureName !== widget.options.pleaseSelectFeatureName) {
                                $.cv.css.metaData.setupFilter(widget,
                                                              item.Feature,
                                                              item.selectedFilter.featureName,
                                                              viewModel.get("filterMode"),
                                                              true);
                            }
                        }
                    }
                }
            });

            return viewModel;
        },


        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";
            return html;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.itemTemplateId + "'>";
            html += "";
            html += "</script>";
            return html;
        }

    }
    // register the widget

    $.cv.ui.widget(metaDataSummary);

})(jQuery);