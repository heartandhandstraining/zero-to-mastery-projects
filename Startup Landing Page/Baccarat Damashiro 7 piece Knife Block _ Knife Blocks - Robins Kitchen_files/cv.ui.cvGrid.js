/* Name: cvGrid
* Author: Aidan Thomas
* Created: 20130220
* 
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.util.js      
* Params:  
*       viewTemplate: kendo template id to show the grid in
*       itemViewTemplate: kendo template for each row item
*          all standard kendogrid params
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        SELECTED = "selected",
        POSITIONBOTTOM = 'bottom',
        POSITIONTOP = 'top',
        POSITIONBOTH = 'both';


    var cvGridWidget = {

        // Standard Variables

        // widget name
        name: "cvGrid",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            columns: null,
            // viewModel flags
            autoBind: true,
            // events
            selected: null,
            // view flags
            selectOnRowClick: false,
            searchFields: null,
            searchPosition: POSITIONTOP,
            pageable: false,
            pagerPosition: POSITIONBOTTOM,
            // view text defaults
            // view Template
            viewTemplate: null,
            //itemViewTemplate: null
            itemTemplateId: null
        },

        events: [DATABINDING, DATABOUND, SELECTED],

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
                // setup grid view
                widget._viewAppended = true;
                if (!widget.options.itemTemplateId) {
                    // generate an item template name and flag it to be created
                    widget.options.itemTemplateId = widget.name + "-item-template-" + kendo.guid();
                    widget._itemViewAppended = true;
                }
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                // add the itemView (not parsed)
                if (widget._itemViewAppended) {
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

        refresh: function () {
            var widget = this;
            widget.viewModel.dataSource = widget.options.dataSource;
            widget.viewModel.updateItemList();
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
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var addCommand = function (item, command) {
                if (command.click && command.name) {
                    item["execCommand_" + command.name] = function () {
                        $.proxy(command.click, item)(item, widget);
                    };
                }
            };

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                $.each(widget.dataSource.view(), function (idx, item) {
                    // add standard commands
                    item.execCommand_destroy = function () {
                        widget.dataSource.remove(item);
                        widget.dataSource.sync();
                    };
                    item.execCommand_select = function () {
                        widget.trigger(SELECTED, item);
                    };
                    $.each(widget.options.columns, function (idx, c) {
                        if (c.command) {
                            if ($.isArray(c.command)) {
                                $.each(c.command, function (i2, command) {
                                    addCommand(item, command);
                                });
                            } else {
                                addCommand(item, c.command);
                            }
                        }
                    });
                });
                return widget.dataSource.view();
            };

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements
                dataSource: widget.options.dataSource,

                isProcessing: false,

                updateItemList: function () {
                    this.set("itemList", getDataView());
                },

                itemList: getDataView(),

                sortBy: function (field) {
                    var sort = widget.options.dataSource.sort();
                    var newdir = "asc";
                    if (sort && sort.length > 0 && sort[0].field == field && sort[0].dir == "asc") {
                        newdir = "desc";
                    }
                    widget.options.dataSource.sort({
                        field: field,
                        dir: newdir
                    });
                }
            }));

            $.each(widget.options.columns, function (idx, c) {
                if (c.sortable) {
                    viewModel["sort" + c.field] = function () {
                        viewModel.sortBy(c.field);
                    };
                }
            });

            return viewModel;
        },

        _getColumnHeading: function (c) {
            if (c.headerTemplate) {
                return c.headerTemplate;
            }
            if (!c.title && !c.field) {
                return "&nbsp;";
            }
            var heading = c.title ? c.title : c.field;
            if (c.sortable) {
                return "<a href='javascript:$.noop()' data-bind='click: sort" + c.field + "'>" + heading + "</a>";
            }
            return heading;
        },

        _getViewTemplate: function () {
            var widget = this;
            return widget._getDefaultViewTemplate();
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "<div>";
            html += widget._getDefaultSearchTopTemplate();
            html += widget._getDefaultPagerTopTemplate();
            html += widget._getDefaultTableTemplate();
            html += widget._getDefaultPagerBottomTemplate();
            html += widget._getDefaultSearchBottomTemplate();
            html += "</div>";
            return html;
        },

        // pager/search templates
        _getDefaultTableTemplate: function () {
            var widget = this;
            var html = "<div class='cv-ui-element-table-area'><table class='twelve hover-blue'><thead><tr>";
            $.each(widget.options.columns, function (idx, c) {
            	html += "<th " + widget._getColumnAttributes(idx, c) + ">" + widget._getColumnHeading(c) + "</th>";
            });
            html += "</tr></thead>";
            // add the item template
            html += "<tbody data-bind='source: itemList' data-template='" + widget.options.itemTemplateId + "'>";
            html += "</tbody></table></div>";
            return html;
        },
        
        _getColumnAttributes: function (idx, column) {
        	var text = "";

        	var hasClass = false;

	        if (column.attributes) {
		        $.each(column.attributes, function(key, value) {
			        text += " " + key + "=\"" + value + "\"";

			        if (key == "class") {
				        hasClass = true;
			        }
		        });
	        }

        	if (idx == 0 && !hasClass) {
        		text = " class=\"padding-left\"" + text;
        	}
	        
        	if (column.width) {
        		text += " width=\"" + column.width + "\"";
        	}

	        return text;
        },
        
        _getDefaultSearchTopTemplate: function () {
            var widget = this;
            if (widget.options.searchFields && (widget.options.searchPosition == POSITIONBOTH || widget.options.searchPosition == POSITIONTOP)) {
                return "<div data-role='search' data-search-fields='#= searchFields#' data-bind='source: dataSource'></div>";
            }
            return "";
        },

        _getDefaultSearchBottomTemplate: function () {
            var widget = this;
            if (widget.options.searchFields && (widget.options.searchPosition == POSITIONBOTH || widget.options.searchPosition == POSITIONBOTTOM)) {
                return "<div data-role='search' data-search-fields='#= searchFields#' data-bind='source: dataSource'></div>";
            }
            return "";
        },

        _getDefaultPagerTopTemplate: function () {
            var widget = this;
            if (widget.options.pageable && (widget.options.pagerPosition == POSITIONBOTH || widget.options.pagerPosition == POSITIONTOP)) {
                return "<div data-role='pager' data-bind='source: dataSource' data-auto-bind='#= widget.options.autoBind #'></div>";
            }
            return "";
        },

        _getDefaultPagerBottomTemplate: function () {
            var widget = this;
            if (widget.options.pageable && (widget.options.pagerPosition == POSITIONBOTH || widget.options.pagerPosition == POSITIONBOTTOM)) {
            	return "<div data-role='pager' data-bind='source: dataSource' data-auto-bind='#= widget.options.autoBind #'></div>";
            }
            return "";
        },

        _getCommandHtml: function (command) {
        	var html = "<a href='javascript:$.noop()' data-bind='click: execCommand_" + command.name + "'>";
            html += (command.text ? command.text : command.name);
            html += "</a>";
            return html;
        },
        
        _getAttributes: function (o)
        {
        	var attributes = "";

        	if (o.attributes)
        	{
        		$.each(o.attributes, function (key, value)
        		{
        			attributes += " " + key + "=\"" + value + "\"";
        		});
        	}

        	return attributes;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.itemTemplateId + "'>";
            if (widget.options.selectOnRowClick) {
                html += "<tr data-bind='click: execCommand_select'>";
            }
            else {
                html += "<tr>";
            }
            $.each(widget.options.columns, function (idx, c) {
            	html += "<td" + widget._getColumnAttributes(idx, c) + ">";
                if (c.template) {
                    html += c.template;
                } else if (c.format && c.field) {
                    html += "#= kendo.format('" + c.format + "'," + c.field + ") #";
                } else if (c.field) {
                    html += "#= " + c.field + "#";
                } else if (c.command) {
                    if ($.isArray(c.command)) {
                        $.each(c.command, function (idx, command) {
                            html += widget._getCommandHtml(command);
                        });
                    } else {
                        html += widget._getCommandHtml(c.command);
                    }
                } else {
                    html += "&nbsp;";
                }
                html += "</td>";
            });
            html += "</tr></script>";
            return html;
        }

    };

    // register the widget
    $.cv.ui.widget(cvGridWidget);

})(jQuery);
