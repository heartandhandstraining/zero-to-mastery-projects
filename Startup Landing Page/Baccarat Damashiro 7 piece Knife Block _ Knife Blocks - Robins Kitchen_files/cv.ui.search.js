/*
    Search Widget


    Operates in 2 modes

    1. using a dataSource object passed in.

    2. Datasource is server based controlled by querystrings

    Pass in a table.
    Changing the page will redirect to the curret url with filterXXX=Y where XXX is the table and Y is the filter string



 */

;

(function ($, undefined) {

    var CHANGE = "change";

    var STARTSWITH = 'startswith',
        CONTAINS = 'contains';

    var search = {

        name: "search",

        options: {
            // viewModel defaults
            defaultSearchType: STARTSWITH,
            dataSource: [],
            // viewModel flags
            searchFields: 'Description',
            table: '',
            autoBind: true,
            includeInBrowserHistory: true,
            // events
            // view flags
            includeSearchTypeSelection: true,
            // view text defaults
            textSearchTitle: 'Search',
            textContainsLabel: 'Contains',
            textStartsWithLabel: 'Starts With',
            // view Template
            viewTemplate: null
        },

        view: null,

        viewModel: null,

        initialise: function (el, o) {
            var widget = this;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                var viewTemplate = null;
                if (widget.options.viewTemplate) {
                    viewTemplate = widget.options.viewTemplate;
                } else {
                    viewTemplate = kendo.template(widget._getDefaultViewTemplate());
                }
                widget.view = viewTemplate(widget.options);
            }
            if (widget.options.table) {
                widget.refresh();
            } else if (widget.options.dataSource) {
                widget._dataSource();
                // refresh called by datasource Change event
            }
        },

        refresh: function () {
            var widget = this;
            if (!widget.viewModel) {
                $(widget.element).html(widget.view);
                widget._viewAppended = true;
                widget.viewModel = widget._getViewModel();
                var target = $(widget.element).children(":first");
                kendo.bind(target, widget.viewModel);
            } else {
                // update viewModel based on changed data
                widget.viewModel.updateProperties();
            }
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

        // for supporting changing the datasource via MVVM
        setDataSource: function (dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
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
            } else {
                //                widget.refresh();
            }

        },

        _getViewModel: function () {
            var widget = this;

            var getQSFilterPart = function (part) {
                var qf = $.cv.util.queryStringValue("filter" + widget.options.table);
                if (qf) {
                    var qf1 = qf.substring(1, qf.length - 1).split(',');
                    var qf2 = qf1[0].split(':');
                    return qf2[part];
                }
                return null;
            }

            var initSearchText = function () {
                if (widget.options.table) {
                    var filterPart = getQSFilterPart(2);
                    return filterPart ? filterPart : '';
                } else {
                    // return filter from the dataSource
                    var f = widget.dataSource.filter();
                    if (!f || !f.filters || f.filters.length == 0) {
                        return '';
                    } else {
                        return f.filters[0].value.toString();
                    }
                }
            }

            var initSearchType = function () {
                if (widget.options.table) {
                    var filterPart = getQSFilterPart(1);
                    if (filterPart) {
                        return filterPart == "sw" ? STARTSWITH : CONTAINS;
                    }
                }
                return widget.options.defaultSearchType;
            }


            var viewModel = kendo.observable($.extend(self.options, {

                searchText: initSearchText(),

                searchTextKeyUp: function (e) {
                    if (e.which == 13) {
                    	e.preventDefault();
                    	this.search();
                    }
                },

                searchType: initSearchType(),

                updateProperties: function () {
                    // nothing in the viewmodel to update!
                },

                getFilter: function () {
                    var filter = widget.options.table ? '' : [];
                    var fields = widget.options.searchFields.split(',');
                    var stype = this.get("searchType");
                    var stext = $.trim(this.get("searchText"));
                    $.each(fields, function (idx, field) {
                        var op;
                        if (widget.options.table) {
                            if (filter.length > 0) {
                                filter += ",";
                            }
                            op = stype == CONTAINS ? "lk" : "sw";
                            filter += "(" + field + ":" + op + ":" + stext + ")";
                        } else {
                            op = stype == CONTAINS ? "contains" : "startswith";
                            var f = {
                                field: field,
                                operator: op,
                                value: stext
                            }
                            filter.push(f);
                        }
                    });
                    return filter;
                },

                search: function () {
                    // select "currentPage"
                    // redirect if using tablename or ds.page() if using datasource
                    if (widget.options.table) {
                        var params = {};
                        params["filter" + widget.options.table] = this.getFilter();
                        $.cv.util.redirect(window.location.href, params, !widget.options.includeInBrowserHistory);
                    } else if (widget.dataSource && widget.dataSource.filter) {
                        var f = this.getFilter();
                        widget.dataSource.filter({
                            logic: "or",
                            filters: f
                        });
                    }
                },

                clearSearch: function() {
                    this.set("searchText", "");
                }
            }));

            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            var html = "<div class=\"search\">"
                + "<div class=\"row clearfix\">"
                + "<label>#= textSearchTitle #</label>"
                + "<input type=\"text\" data-bind=\"value: searchText, events: {keyup: searchTextKeyUp}\" />"
                + "<input type=\"button\" data-bind=\"click: search\" />"
                + "</div>";
            if (widget.options.includeSearchTypeSelection) {
                html += "<div class=\"row clearfix\">"
                    + "<input type=\"radio\" name=\"searchRadio\" value=\"" + CONTAINS + "\" data-bind=\"checked: searchType\" />"
                    + "<label class=\"radio-label\">#= textContainsLabel #</label>"
                    + "<input type=\"radio\" name=\"searchRadio\" value=\"" + STARTSWITH + "\" data-bind=\"checked: searchType\" />"
                    + "<label class=\"radio-label\">#= textStartsWithLabel #</label>"
                    + "</div>";
            }
            html += "</div>";
            return html;
        }

    };


    $.cv.ui.widget(search);

})(jQuery);
