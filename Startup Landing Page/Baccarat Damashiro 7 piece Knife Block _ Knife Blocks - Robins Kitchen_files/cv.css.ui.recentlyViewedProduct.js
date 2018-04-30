/* Name: recently viewed product
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
*           numberOfProducts:
*           autoBind: 
*           hideIfEmpty: 
*           listTitle: 
*           viewTemplate: kendo template id for the main view
*           itemViewTemplate: kendo template id for each item
*/
;
(function ($, undefined) {

    var CHANGE = "change",
        LISTUPDATED = "listUpdated";


    var recentlyViewedProduct = {

        // Standard Variables

        // widget name
        name: "recentlyViewedProduct",
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            numberOfProducts: 4,
            carouselId: "",
            useZone: false,
            isEmptyExcludingSelf: true,
            // viewModel flags
            autoBind: true,
            // events
            // view flags
            hideIfEmpty: true,
            // view text defaults
            listTitle: "Items Recently Viewed",
            // view Template
            viewTemplate: null, // Treat these as IDs, remove the last one.
            itemViewTemplate: null,
            noData: true,
            // widget settings
            hideWhenNoItems: false
        },

        extendEvents: [LISTUPDATED],

        viewModel: null,

        view: null,

        // MVVM Support

        items: function () {
            return this.element.children();
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

        beforeShow: function () {
            var widget = this;
            var data = $("#" + widget.options.carouselId).data("owlCarousel");
            if (data) {
                data.destroy();
            }
            $("#" + widget.options.carouselId).html("");
        },

        afterShow: function () {
            var widget = this;
            var products = $.cv.css.recentlyViewedProduct.localGetRecentlyViewedProducts();
            if (products != null && products.length > 0) {
                this.options.noData = false;
                var productCodes = [];
                for (var i = 0; i < products.length; i++) {
                    productCodes.push(products[i].productCode);
                }
                var d1 = $.cv.css.recentlyViewedProduct.getRecentlyViewedProduct({
                    productCodes: productCodes,
                    maxNumberOfProducts: widget.options.numberOfProducts
                });
                $.when(d1).done(function (response) {
                    widget.viewModel.set("isContentLoading", false);
                    if ($.cv.util.hasValue(response.data)) {
                        if (response.data.result.length > 0) {
                            // Set the HTML inside the popup window.
                            $("#" + widget.options.carouselId).html(response.data.result);

                            // Kendo'ify the numeric textboxes.
                            $("#" + widget.options.carouselId + " .form-number").each(function() {
                                $.cv.util.kendoNumericTextBox(this);
                            });

                            // Setup carousel.
                            $.cv.css.owlCarousel.bindProductCarousel($("#" + widget.options.carouselId));

                            // Init Kendo widgets.
                            kendo.init($("#" + widget.options.carouselId));
                        }
                        if (response.data.productImpressions.length > 0) {
                            $.cv.css.trigger($.cv.css.eventnames.recentlyViewedProductsSet, { productImpressions: response.data.productImpressions, isJson: true });
                        }
                    }
                });
            }
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

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                $.each(widget.dataSource.view(), function (idx, item) {
                    item.Index = idx;
                });
                return widget.dataSource.view();
            }

            var initDS = function () {
                var products = $.cv.css.recentlyViewedProduct.localGetRecentlyViewedProducts();
                if (products == null)
                    products = [];
                if (typeof productViewProduct != 'undefined') {
                    findAndRemove(products, 'productCode', productViewProduct.productCode);
                    products = trimList(products);
                    if (widget.options.useZone) {
                        widget.beforeShow();
                        widget.afterShow();
                    }
                    if (products.length == 0) {
                        viewModel.set("isEmptyExcludingSelf", true);
                    } else {
                        viewModel.set("isEmptyExcludingSelf", false);
                    }
                    if (products.length < widget.options.numberOfProducts) {
                        products = $.merge([productViewProduct], products);
                        widget.options.dataSource = products;
                        if (products.length == 0) {
                            viewModel.set("isEmpty", true);
                        } else {
                            viewModel.set("isEmpty", false);
                        }
                    }
                    else {
                        widget.options.dataSource = products;
                        if (products.length == 0) {
                            viewModel.set("isEmpty", true);
                        } else {
                            viewModel.set("isEmpty", false);
                        }
                        products = $.merge([productViewProduct], products);
                    }
                    $.cv.css.recentlyViewedProduct.localSetRecentlyViewedProducts(products);
                }
                else {
                    if (widget.options.useZone) {
                        widget.beforeShow();
                        widget.afterShow();
                    }
                    products = trimList(products);
                    widget.options.dataSource = products;
                    if (products.length == 0) {
                        viewModel.set("isEmpty", true);
                        viewModel.set("isEmptyExcludingSelf", true);

                    } else {
                        viewModel.set("isEmpty", false);
                        viewModel.set("isEmptyExcludingSelf", false);
                    }
                }
                viewModel.set("hideWhenNoItems", widget.options.hideWhenNoItems);
                if (!widget.options.useZone) {
                    $.cv.css.trigger($.cv.css.eventnames.recentlyViewedProductsSet, { productImpressions: products, isJson: false });
                }
            }

            var findAndRemove = function (array, property, value) {
                $.each(array, function (index, result) {
                    if (result[property] === value) {
                        //Remove from array
                        array.splice(index, 1);
                        return false;
                    }
                });
            }

            var trimList = function (products) {
                if (products.length > 0 && !widget.options.useZone) {
                    $.each(products, function (index, product) {
                        if (!product["itemUrl"]) {
                            $.cv.css.recentlyViewedProduct.localRemoveRecentlyViewedProducts(products);
                            products = [];
                            return false;
                        }
                    });
                }

                if (products.length > widget.options.numberOfProducts) {
                    products.splice(widget.options.numberOfProducts);
                }

                return products;
            }

            var viewModel = kendo.observable({

                // Properties for UI elements
                dataSource: widget.options.dataSource,

                updateItemList: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    widget.trigger(LISTUPDATED, { count: dataView.length });
                },

                itemList: getDataView(),

                isEmpty: true,

                hideWidgetWhenNoItems: function () {
                    return (this.get("isEmptyExcludingSelf") && this.get("hideWhenNoItems"));
                },

                isContentLoadingOrIsEmpty: function () {
                    return this.get("isContentLoading") || this.get("isEmpty");
                }
            });

            initDS();

            if (this.options.useZone) {
                viewModel.set("isContentLoading", !this.options.noData);
                viewModel.set("noData", this.options.noData);
            }

            return viewModel;
        },


        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = ""
                + "# if(hideIfEmpty) { #"
                + "<section class='sidebar-toppurchases' data-bind='invisible: isEmpty'>"
                + "# } else { #"
                + "<section class='sidebar-toppurchases'>"
                + '# } #'
                //+ "<section class='sidebar-toppurchases'>"
                    + "<h4>" + widget.options.listTitle + "</h4>"
                    + "<ul class='toppurchases-grid clearfix' data-bind='source: itemList' data-template='" + widget.options.itemTemplateId + "'>"
                    + "</ul>"
                + "</section>"
            return html;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = ""
                + "<script type='text/x-kendo-template' id='" + widget.options.itemTemplateId + "'>"
                    + "<li>"
                        + "# if (data.SEOUrl != '') { #"
                            + "<a href='/Product#= data.SEOUrl #'>"
                        + "# } else { #"
                            + "<a href='/ProductDisplay.aspx?Product=#= data.productCode #'>"
                        + '# } #'
                            + "# if (data.picture1 != '' && data.picture1 != 'NoImage.gif') { #"
                                + "<img src='/images/ProductImages/#= data.picture1 #' />"
                            + "# } else {#"
                                + "<img src='/images/TemplateImages/placeholder/placeholder-product-100x100.png' />"
                            + '# } #'
                            + "<span>#= description #</span>"
                        + "</a>"
                    + "</li>"
                + "</script>";
            return html;
        }

    }
    // register the widget

    $.cv.ui.widget(recentlyViewedProduct);

})(jQuery);