/* Name: order lines
* Author: John Farnea
* Created: 20130220 
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/cv.ajax.js
* Params:  
*       dataSource: 
*       table: 
*       recordCount: 
*       pageSize: 
*       pageSizes: 
*       autoBind: 
*       viewTemplate: 
*       includeInBrowserHistory: 
*/
/*
    Pager Widget

    Operates in 2 modes

    1. using a dataSource object passed in.

    In this case the pageSize and recordCount and currentPage is determined from the datasource
    Changing pages will set the new page on the dataSource object, also changing pageSize will set the pageSize on the dataSource

    2. Datasource is server based controlled by querystrings

    Pass in a table, pageSize and recordCount as options.
    currentPage is determined from the querystring (or = 1 if no querystring PageXXX present)
    Changing the page will redirect to the curret url with PageXXX=Y where XXX is the table and Y is the current page

 */

;

// TODO: fix default array not being correctly replcaed for pageSizes

(function ($, undefined)
{
    var CHANGE = "change";

    var pager = {

        // widget name
        name: "pager",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            table: '',
            recordCount: '',
            pageSize: 10,
            pageSizes: "5,10,25,50",
            pageNumberLinksPerPage: 10,
            includeInBrowserHistory: true,
            arrowClass: "arrow",
            arrowUnavailableClass: "unavailable",
            // viewModel flags
            autoBind: true,
            callPageSize: true,
            // events
            // view text defaults
            firstPageText: "<span class='cv-ui-type-font-entypo'style='font-size: 32px; line-height: 8px'>Ç</span>",
            previousPageText: "<span class='cv-ui-type-font-entypo'style='font-size: 32px; line-height: 8px'>Å</span>",
            previous10Text: "…",
            next10Text: "…",
            nextPageText: "<span class='cv-ui-type-font-entypo'style='font-size: 32px; line-height: 8px'>Ä</span>",
            lastPageText: "<span class='cv-ui-type-font-entypo'style='font-size: 32px; line-height: 8px'>É</span>",
            noItemsToDisplayText: "No items to display",
            // view Template
            viewTemplate: null,
            pageTemplate: "",
            alwaysShowTotalDisplayed: false
        },

        view: null,
        viewModel: null,

        initialise: function (el, o)
        {
            var widget = this;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view"))
            {
                widget.view = internalView.html();
            } else
            {
                //var viewTemplate = null;
                widget._viewAppended = true;
                if (!widget.options.pageTemplate)
                {
                    // generate an page list template name and flag it to be created
                    widget.options.pageTemplate = "pageTemplate"; //widget.name + "-page-template-" + kendo.guid();
                    //widget.view += widget._getDefaultPageTemplate();
                    widget._itemViewAppended = true;
                }
                
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                
                // add the itemView (not parsed)
                if (widget._itemViewAppended)
                {
                    widget.view += widget._getDefaultPageTemplate();
                }
                widget.element.html(widget.view);
            }
            widget.viewModel = widget._getViewModel();
            
            // bind view to viewModel
            var target = $(widget.element).children(":first");
            kendo.bind(target, widget.viewModel);
            if (widget.options.table)
            {
                widget.refresh();
            } else if (widget.options.dataSource)
            {
                widget._dataSource();
                // refresh called by datasource Change event
            }
        },

        destroy: function ()
        {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended)
            {
                $.cv.util.destroyKendoWidgets(widget.element);
                widget.element.empty();
            }
        },

        refresh: function ()
        {
            var widget = this;
            widget.viewModel.dataSource = widget.options.dataSource;
            widget.viewModel.updateProperties();
        },


        // for supporting changing the datasource via MVVM
        setDataSource: function (dataSource)
        {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        _dataSource: function ()
        {
            var widget = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource
            if (widget.dataSource && widget._refreshHandler)
            {
                widget.dataSource.unbind(CHANGE, widget._refreshHandler);
            }
            else
            {
                widget._refreshHandler = $.proxy(widget.refresh, widget);
            }

            // returns the datasource OR creates one if using array or configuration object
            widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);
            // set the page size to the option passed in, this allows the pager to control the page size
            if (widget.options.callPageSize || widget.dataSource._pageSize !== widget.options.pageSize) {
                widget.dataSource.pageSize(parseInt(widget.options.pageSize));
            }

            // bind to the change event to refresh the widget
            widget.dataSource.bind(CHANGE, widget._refreshHandler);

            if (widget.options.autoBind)
            {
                widget.dataSource.fetch();
            } else
            {
                //                widget.refresh();
            }
        },

        _getViewModel: function ()
        {
            var widget = this;

            var initCurrentPage = function ()
            {
                if (widget.options.table)
                {
                    var page = $.cv.util.queryStringValue("Page" + widget.options.table);
                    if (!page || page.length == 0)
                        return 1;
                    var pageInt = parseInt(page);
                    if (isNaN(pageInt))
                        return 1;
                    else
                        return pageInt;
                }
                if (widget.options.dataSource)
                {
                    if (widget.options.dataSource.page)
                    {
                        return widget.options.dataSource.page();
                    }
                }
                return 1;
            };

            var initPageSize = function ()
            {
                if (widget.options.table)
                {
                    var size = $.cv.util.queryStringValue("PageSize" + widget.options.table);
                    if (!size || size.length == 0)
                    {
                        return isNaN(widget.options.pageSize) ? 10 : widget.options.pageSize;
                    }
                    var sizeInt = parseInt(size);
                    if (isNaN(sizeInt))
                        return 10;
                    else
                        return sizeInt;
                }
                if (widget.options.dataSource)
                {
                    if (widget.options.dataSource.page)
                    {
                        return widget.options.dataSource.pageSize();
                    }
                    else
                    {
                        // ensure the page size is set to the option passed in if the data source has not yet been initialised
                        return isNaN(widget.options.pageSize) ? 10 : widget.options.pageSize;
                    }
                }
                return 10;
            };

            var initRecordCount = function ()
            {
                if (widget.options.table)
                {
                    return widget.options.recordCount;
                } else if (widget.options.dataSource && widget.options.dataSource.total)
                {
                    return widget.options.dataSource.total();
                }
                return 0;
            };

            var getUnavailable = function (currentClass, isUnavailable)
            {
                var result = currentClass;
                if (isUnavailable)
                {
                    result += currentClass.length > 0 ? " " : "";
                    result += widget.options.arrowUnavailableClass;
                }
                return result;
            };

            var viewModel = kendo.observable({

                currentPage: initCurrentPage(),

                pageSize: initPageSize(),

                recordCount: initRecordCount(),

                updateProperties: function ()
                {
                    this.set("currentPage", initCurrentPage());
                    this.set("pageSize", initPageSize());
                    this.set("recordCount", initRecordCount());
                },

                currentPageStartRecord: function ()
                {
                    var cp = this.get("currentPage");
                    var ps = this.get("pageSize");
                    var rc = this.get("recordCount");
                    if (rc == 0)
                        return 0;
                    else
                        return (cp - 1) * ps + 1;
                },

                currentPageEndRecord: function ()
                {
                    var cp = this.get("currentPage");
                    var ps = this.get("pageSize");
                    var rc = this.get("recordCount");

                    var pe = (ps * cp) + this.get("infiniteScrollingRecordsLoaded");
                    return pe > rc ? rc : pe;
                },

                firstPage: function ()
                {
                    // select the first page
                    this.set("currentPage", 1);
                },

                previousPage: function ()
                {
                    if (this.onFirstPage()) {
                        return;
                    }
                    // select the previous page
                    this.set("currentPage", this.get("currentPage") - 1);
                },

                nextPage: function () {
                    if (this.onLastPage()) {
                        return;
                    }
                    // select the next page
                    this.set("currentPage", this.get("currentPage") + 1);
                },

                lastPage: function ()
                {
                    // select the last page
                    this.set("currentPage", this.pageCount());
                },

                gotoPage: function (page)
                {
                    if (!isNaN(page))
                    {
                        this.set("currentPage", page);
                    }
                },

                pageSelected: function ()
                {
                    // select "currentPage"
                    // redirect if using tablename or ds.page() if using datasource
                    if (widget.options.table)
                    {
                        var params = {};
                        params["Page" + widget.options.table] = this.get("currentPage");
                        params["PageSize" + widget.options.table] = this.get("pageSize");
                        $.cv.util.redirect(window.location.href, params, !widget.options.includeInBrowserHistory);
                    } else if (widget.options.dataSource && widget.options.dataSource.page)
                    {
                        // only change the page of the data source if it isn't already the current page (prevents an unnecessary service call)
                        if (widget.options.dataSource._page !== this.get("currentPage")) {
                            widget.options.dataSource.page(this.get("currentPage"));
                        }

                    }
                },

                onFirstPage: function ()
                {
                    return this.get("currentPage") == 1 || this.get("recordCount") == 0;
                },

                onLastPage: function ()
                {
                    var cp = this.get("currentPage");
                    var pc = this.pageCount();
                    return cp == pc || this.get("recordCount") == 0;
                },


                pageSizes: widget.options.pageSizes,

                pageSizeDataSource: function ()
                {
                    var ps = this.get("pageSizes");
                    // issue in the declaritive declaration when trying to override the page sizes, need to pass in an array i.e. [20,40,60,80]
                    if(typeof ps === "string")
                        return new kendo.data.ObservableArray(ps.split(","));
                    else
                        return new kendo.data.ObservableArray(ps);
                },

                pageDataSource: function ()
                {
                    var pa = [];

                    if (this.get("recordCount") == 0)
                    {
                        pa.push({ cssClass: "", pageText: widget.options.noItemsToDisplayText, page: 0 });
                    }
                    else
                    {
                        var pageLinks = widget.options.pageNumberLinksPerPage;
                        var cp = this.get("currentPage");
                        var pc = this.pageCount();
                        var pageLinkCount = pageLinks > 0 ? (pc < pageLinks ? pc : pageLinks) : pc; // Number of page number links to show.

                        var startPage = 1;
                        if (cp > pageLinkCount)
                        {
                            startPage = (Math.floor((cp - 1) / pageLinkCount) * pageLinkCount) + 1;
                        }
                        var endPage = startPage + pageLinkCount - 1;
                        if (endPage > pc)
                        {
                            endPage = pc;
                        }

                        if (widget.options.firstPageText != "")
                            pa.push({ cssClass: getUnavailable(widget.options.arrowClass, cp == 1), pageText: widget.options.firstPageText, page: 1 });
                        if (widget.options.previousPageText != "")
                            pa.push({ cssClass: getUnavailable(widget.options.arrowClass, cp == 1), pageText: widget.options.previousPageText, page: cp - 1 < 1 ? 1 : cp - 1 });

                        if (cp > pageLinkCount)
                        {
                            pa.push({ cssClass: "", pageText: widget.options.previous10Text, page: startPage - 1 });
                        }

                        for (var p = startPage; p <= endPage; p++)
                        {
                            var cssClass = p == cp ? "current" : "";
                            pa.push({ cssClass: cssClass, pageText: p, page: p });
                        }

                        if (endPage < pc)
                        {
                            pa.push({ cssClass: "", pageText: widget.options.next10Text, page: startPage + pageLinkCount });
                        }

                        if (widget.options.nextPageText != "")
                            pa.push({ cssClass: getUnavailable(widget.options.arrowClass, cp == pc), pageText: widget.options.nextPageText, page: cp + 1 > pc ? pc : cp + 1 });
                        if (widget.options.lastPageText != "")
                            pa.push({ cssClass: getUnavailable(widget.options.arrowClass, cp == pc), pageText: widget.options.lastPageText, page: pc });

                        $.each(pa, function (idx, item)
                        {
                            item.selectPage = function () { widget.viewModel.gotoPage(this.page); };
                        });
                    }
                    return new kendo.data.ObservableArray(pa);
                },

                pageCount: function ()
                {
                    var sz = this.get("pageSize");
                    var pages = Math.floor(this.get("recordCount") / sz);
                    if (this.get("recordCount") % sz != 0)
                    {
                        pages += 1;
                    }
                    return pages;
                },

                hasNoPages: function() {
                    return this.pageCount() == 0;
                },

                hasMultiplePages: function () {
                    return this.pageCount() > 1;
                },

                // Infinite scrolling.
                hasInfiniteScrolling: false,
                infiniteScrollingPageSize: 12,
                infiniteScrollingRecordsLoaded: 0,

                infiniteScrollingInit: function(pageSize) {
                    this.set("hasInfiniteScrolling", true);
                    this.set("infiniteScrollingPageSize", pageSize);
                    this.set("showTotalProductsDisplayed", widget.options.alwaysShowTotalDisplayed);
                },

                infiniteScrollingPageLoaded: function (data) {
                    var recordsLoaded = data.recordsLoaded;
                    this.set("infiniteScrollingRecordsLoaded", this.get("infiniteScrollingRecordsLoaded") + recordsLoaded);
                },

                showTotalProductsDisplayed: true
            });

            viewModel.bind("change", function (e)
            {
                if (e.field == "currentPage")
                {
                    viewModel.pageSelected();
                }
                if (e.field == "pageSize")
                {
                    if (!widget.options.table)
                    {
                        widget.options.dataSource.pageSize(parseInt(viewModel.pageSize));
                    }
                    var currentPage = viewModel.get("currentPage");
                    if (currentPage != 1)
                    {
                        viewModel.set("currentPage", 1); // which fires a pageSelected
                    } else
                    {
                        viewModel.pageSelected();
                    }
                }
            });

            // Infinite scrolling events.
            $.cv.css.bind($.cv.css.eventnames.infiniteScrollingInit, $.proxy(viewModel.infiniteScrollingInit, viewModel));
            $.cv.css.bind($.cv.css.eventnames.infiniteScrollingPageLoaded, $.proxy(viewModel.infiniteScrollingPageLoaded, viewModel));

            return viewModel;

        },

        _getDefaultViewTemplate: function ()
        {
            var html =
			[
				'	<div data-view="true"><div>',
				'		<div class="row">',
				'			<div class="two columns">',
				'				<span class="cv-ui-elements-resultsreturned"><span data-bind="text: recordCount"></span> Records, <span data-bind="text: pageCount"></span> Pages</span>',
				'			</div>',
				'			<div class="four columns">',
				'				<select data-bind="source: pageSizeDataSource, value: pageSize" style="width: auto"></select> per page',
				//'				<form class="custom">', // This is horrible and doesn't work in Chrome.
				//'					<select style="display: none" data-bind="source: pageSizeDataSource, value: pageSize"></select>',
				//'					<div class="custom dropdown">',
				//'						<a href="\\#" class="current" data-bind="text: pageSize"></a>',
				//'						<a href="\\#" class="selector"></a>',
				//'						<ul data-bind="source: pageSizeDataSource"></ul>',
				//'					</div>',
				//'				</form>',
				'			</div>',
				'			<div class="six columns">',
				'				<ul class="pagination cv-ui-elements-pagination" data-bind="source: pageDataSource" data-template="pageTemplate"></ul>',
				'			</div>',
				'		</div>',
				'	</div></div>'
			].join("\n");

            return html;
        },

        _getDefaultPageTemplate: function ()
        {
            var html =
			[
				'<script type="text/x-kendo-template" id="pageTemplate">',
				'	<li data-bind="attr: { class: cssClass }"><a href="javascript:$.noop()" alt="" data-bind="html: pageText, click: selectPage"></a></li>',
				'</script>'
			].join("\n");

            return html;
        }
    };


    $.cv.ui.widget(pager);

})(jQuery);
