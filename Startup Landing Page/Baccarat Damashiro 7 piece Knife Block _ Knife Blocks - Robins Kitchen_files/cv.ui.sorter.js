/* Name: Sorter Widget
* Author: Aidan Thomas
* Created: 20130220
* 
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/cv.util.js
* Params:  
*           dataSource:
*           table: 
*           sortBy: 
*           includePleaseSelect: 
*           pleaseSelectText: 
*           sortOptions: 
*           sortOptionsTextField: 
*           sortOptionsValueField: 
*           includeInBrowserHistory: 
*/
/* 
    Operates in 2 modes

    1. Using a dataSource object passed in.

    In this case the pageSize and recordCount and currentPage is determined from the datasource
    Changing the sorting will set the sort order on the dataSource object

    2. Datasource is server based controlled by querystrings

    Pass in a table sorting as options.
    currentSort is determined from the querystring (or = blank if no querystring SortXXX present)
    Changing the sort will redirect to the current url with SortXXX=Y where XXX is the table and Y is the current sort
    
    Dependencies
    scripts/cv.util.js

 */

;

// TODO: pass through select values (data-value-field) and select text (data-text-fields) so that the display of the select box can be different to the values
// TODO: test datasource sorting

(function ($, undefined) {

    var CHANGE = "change",
        SORTOPTIONSRENDERED = "sortOptionsRendered";

    var sorter = {

        name: "sorter",

        options: {
            dataSource: [],
            table: '',
            sortBy: '',
            includePleaseSelect: true,
            pleaseSelectText: 'Please Select...',
            sortOptions: 'ProductCode,Description',
            //sortOptions: [{text: 'Product Code', value: 'ProductCode'},{text: 'Description', value: 'Description'}],
            sortOptionsTextField: "text",
            sortOptionsValueField: "value",
            includeInBrowserHistory: true,
            // view Template
            viewTemplate: null,
            itemViewTemplate: null,
            isSortByColumn: false
},

        events: [CHANGE, SORTOPTIONSRENDERED],

        view: null,
        viewModel: null,

        initialise: function (el, o) {
            var self = this;
            //var view = null;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                self.view = internalView.html();
            } else {
                //var viewTemplate = null;
                widget._viewAppended = true;
                if (!widget.options.itemViewTemplate) {
                    // generate an page list template name and flag it to be created
                    widget.options.itemViewTemplate = widget.name + "-item-template-" + kendo.guid();
                    //widget.view += widget._getDefaultPageTemplate();
                    widget._itemViewAppended = true;
                }

                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);

                // add the itemView (not parsed)
                if (widget._itemViewAppended) {
                    widget.view += widget._getDefaultPageTemplate();
                }
                widget.element.html(widget.view);
            }
            // now MMVM bind
            self.viewModel = self._getViewModel();
            var target = $(self.element).children(":first");
            kendo.bind(target, self.viewModel);
            if (self.options.table) {
                self.options.dataSource = null;
                self.refresh();
            } else if (self.options.dataSource) {
                self._dataSource();
                // refresh called by datasource Change event
            }

            $.cv.css.bind($.cv.css.eventnames.sortByOrderTemplateColumn, $.proxy(self.viewModel.sortBySelectedColumn, self.viewModel));
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

        refresh: function () {
            var widget = this;
            widget.viewModel.dataSource = widget.options.dataSource;
            widget.viewModel.updateProperties();
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
            }
        },
        
        _getViewModel: function() {
            var widget = this;

            var initCurrentSort = function () {
                if (widget.options.dataSource) {
                    var dssort = widget.options.dataSource.sort();
                    var sortField = '';
                    var sortDirection = "";
                    if (dssort && dssort.length > 0) {
                        sortField = dssort[0].field;
                        sortDirection = dssort[0].dir;
                    }
                    if (sortField.length > 0 && sortDirection != undefined && sortDirection.length > 0) {
                        sortField += (" " + sortDirection);
                    }
                    removePleaseSelect(sortField);
                    return sortField;
                }
                var sort = $.cv.util.queryStringValue("Sort" + widget.options.table);
                if (!sort || sort.length == 0) {
                    if (widget.options.sortBy != '') {
                        return widget.options.sortBy;
                    } else {
                        if (widget.options.includePleaseSelect) {
                            return widget.options.pleaseSelectText;
                        } else {
                            sort = '';
                        }
                    }
                }
                setIsCurrentSort(sort);
                return sort;
            };

            var setIsCurrentSort = function (sort) {
                var ds = widget.viewModel.get("sortOptionsDataSource");
                $.each(ds, function (idx, item) {
                    if (item[widget.options.sortOptionsValueField] == sort) {
                        item.set("isCurrentSort", true);
                    }
                });
            };

            var removePleaseSelect = function (sortField) {
                if (widget.viewModel && widget.viewModel != undefined && sortField.length > 0) {
                    var ds = widget.viewModel.get("sortOptionsDataSource");
                    if (!widget.options.includePleaseSelect) {
                        ds = _.filter(ds, function (item) {
                            return item[widget.options.sortOptionsValueField] != "";
                        });
                        widget.viewModel.set("sortOptionsDataSource", ds);
                    }
                }
            };
			
            var initDS = function () {
                if ($.isArray(widget.options.sortOptions)) {
                    var so = widget.options.sortOptions;
                    var pleaseSelect = {};
                    pleaseSelect[widget.options.sortOptionsTextField] = widget.options.pleaseSelectText;
                    pleaseSelect[widget.options.sortOptionsValueField] = "";
                } else {
                    var so = widget.options.sortOptions.split(",");
                    var pleaseSelect = widget.options.pleaseSelectText;
                }
                if (widget.options.includePleaseSelect || (!widget.options.includePleaseSelect && initCurrentSort() == '')) {
                    so = $.merge([pleaseSelect], so);
                }
                $.each(so, function (idx, item) {
                    item.sort = function () {
                        widget.viewModel.set("currentSort", item[widget.options.sortOptionsValueField]);
                    }
                });
                return so;
            };

            var viewModel = kendo.observable({

                currentSort: initCurrentSort(),

                direction: "",

                updateProperties: function () {
                    // Don't want to trigger "sort" on the DS from this function, so don't use this.set
                    this.set("skipSort", true);
                    this.set("currentSort", initCurrentSort());
                    this.set("skipSort", false);
                    widget.trigger(SORTOPTIONSRENDERED);
                },

                skipSort: false,
				
				sortOptions: widget.options.sortOptions,
				
				sortOptionsDataSource: initDS(),

                sortSelected: function () {
                    // select "currentSort"
                    // redirect if using tablename or ds.sort() if using datasource
                    if (!widget.options.isSortByColumn) {
                        var currentSort = this.get("currentSort"),
                            lastWord = currentSort.split(" ").pop(),
                            direction = (lastWord.toLowerCase() == "asc" || lastWord.toLowerCase() == "desc") ? lastWord.toLowerCase() : "asc";
                        if (lastWord.toLowerCase() == "asc" || lastWord.toLowerCase() == "desc" && widget.options.dataSource) {
                            currentSort = currentSort.substring(0, currentSort.lastIndexOf(" "));
                        }
                        this.set("direction", (lastWord.toLowerCase() == "asc" || lastWord.toLowerCase() == "desc") ? lastWord : "");
					    if (widget.options.dataSource) {
					        if (currentSort) {
					            widget.options.dataSource.sort({ field: currentSort, dir: direction });
					        }
					    } else {
					        var params = {};
						    if (currentSort != widget.options.pleaseSelectText)
						        params["Sort" + widget.options.table] = currentSort;
						    else
						        params["Sort" + widget.options.table] = '';
						    params["Page" + widget.options.table] = 1;
						    $.cv.util.redirect(window.location.href, params, !widget.options.includeInBrowserHistory);
					    }
                    }
                },

                sortBySelectedColumn: function (data) {
                    if (widget.options.dataSource && data ) {
                        this.set("currentSort", data.sortColumn + " " + data.sortDirection);
                        this.set("direction", data.sortDirection);
                        widget.options.dataSource.sort({ field: data.sortColumn, dir: data.sortDirection });
                    }
                }
            });

            // Causing a loop - this is calling sortSelected, which "sorts" the datasource, causing a ds.change event, calling refresh, calling updateProperties, sets currentSort, back to step 1...
            viewModel.bind("change", function (e) {
                if (e.field == "currentSort") {
                    if (!viewModel.get("skipSort"))
                        viewModel.sortSelected();
                }
            });

            return viewModel;

        },

        _getDefaultViewTemplate: function () {
        }

    };


    $.cv.ui.widget(sorter);

})(jQuery);