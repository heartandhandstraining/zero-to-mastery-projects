/*
* Name: catalogue select
* Author: Aidan Thomas 
* Date Created: 2013/01/04
* Description: databound list with template
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js (built with jquery-1.7.1.min.js)
*          kendo.web.js (kendo.web.min.js v2012.2.710)
*
*          --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.data.kendo.js
*          /Scripts/cv.ajax.js    
* Parameters:
*          viewTemplate: kendo template id for the view if not a child dataview
*       	globalCatalogueAccess: 
*            currentCatalogue:
*            catalogues:
*            catalogueOptionsTextField: 
*            catalogueOptionsValueField: 
*            globalCatalogueValue: 
*            currentCatalogueNotListedCatalogueValue:
*            reloadOnChange: 
*            catalogueListPrompt:
*            globalCatalogueText:
*            currentCatalogueNotListedCatalogueText:
*            successfulChangeCatalogueText: 
*            errorChangingCatalogueText: 
*/
;

// TODO: call method to return user catalogues
// TODO: call method to set user catalogue and call CATALOGUECHANGED event then refresh page

(function ($, undefined) {

    var CATALOGUECHANGED = 'cataloguechanged',
        ISINITIALLOAD = true;

    var catalogueSelectWidget = {

        // Standard Variables

        // widget name
        name: "catalogueSelect",

        // default widget options
        options: {
            // viewModel defaults
            globalCatalogueAccess: '',
            currentCatalogue: '',
            catalogues: '',
            catalogueOptionsTextField: "Description",
            catalogueOptionsValueField: "CatalogueCode",
            globalCatalogueValue: '',
            currentCatalogueNotListedCatalogueValue: 'NONE',
            reloadOnChange: true,
            usingKendoDropdown: false,
            reloadOnChangePage: '/home.aspx',
            // viewModel flags

            // events

            // view flags
            // view text defaults
            catalogueListPrompt: 'My Catalogues',
            globalCatalogueText: 'Global',
            currentCatalogueNotListedCatalogueText: 'Please Select...',
            successfulChangeCatalogueText: 'Your catalogue was successfully changed.',
            errorChangingCatalogueText: 'There was an error changing your catalogue, please try again or try another catalogue.',
            // view Template
            viewTemplate: null // treat like its an id
        },

        events: [CATALOGUECHANGED],

        viewModel: null,

        view: null,

        // private property
        _viewAppended: false,

        // Standard Methods
        initialise: function (el, o) {
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
            var viewModel = widget._getViewModel();
            var target = $(widget.element).children(":first");
            kendo.bind(target, viewModel);
            $.cv.css.bind($.cv.css.eventnames.accountChanged, $.proxy(viewModel.resetCatalogueList, viewModel));
            $.cv.css.bind($.cv.css.eventnames.userChanged, $.proxy(viewModel.resetCatalogueList, viewModel));
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

        _getViewModel: function () {
            var widget = this;

            var initCatalogues = function() {
                var d1 = $.Deferred();
                var catalogues = '';
                if (widget.options.catalogues.length == 0) {
                    catalogues = $.cv.css.catalogue.localGetUserCatalogues();
                    if (catalogues != null)
                        d1.resolve(catalogues);
                    else {
                        var d2 = $.cv.css.catalogue.getUserCatalogues();
                        $.when(d2).done(function (msg) {
                            d1.resolve(msg.data);
                        });
                    }
                }
                else {
                    d1.resolve(widget.options.catalogues);
                }
                $.when(d1).done(function(data) {
                    viewModel.set("catalogues", data);
                });
            }
            
            var initCatalogueDS = function() {
                var catalogueList = viewModel.get('catalogues');
                var cDS = '';
                if(catalogueList && catalogueList.length > 0) {
                    if (typeof catalogueList == 'object') {
                        cDS = catalogueList;
                        if (checkAppendGlobal(cDS)) {
                            var globalCatalogue = {};
                            globalCatalogue[widget.options.catalogueOptionsTextField] = widget.options.globalCatalogueText;
                            globalCatalogue[widget.options.catalogueOptionsValueField] = widget.options.globalCatalogueValue;
                            cDS = $.merge([globalCatalogue], cDS);
                        }
                        if(checkAppendCatalogueNotListed(cDS)) {
                            var notListedCatalogue = {};
                            notListedCatalogue[widget.options.catalogueOptionsTextField] = widget.options.currentCatalogueNotListedCatalogueText;
                            notListedCatalogue[widget.options.catalogueOptionsValueField] = widget.options.currentCatalogueNotListedCatalogueValue;
                            cDS = $.merge([notListedCatalogue], cDS);
                        }
                    }
                    else {
                        cDS = catalogueList.split(",");
                        if (checkAppendGlobal(cDS)) {
                            var globalCatalogue = widget.options.globalCatalogueText;
                            cDS = $.merge([globalCatalogue], cDS);
                        }
                        if (checkAppendCatalogueNotListed(cDS)) {
                            var notListedCatalogue = widget.options.currentCatalogueNotListedCatalogueText;
                            cDS = $.merge([notListedCatalogue], cDS);
                        }
                    }
                }
                else {
                    var noCatalogues = {};
                    noCatalogues[widget.options.catalogueOptionsTextField] = '';
                    noCatalogues[widget.options.catalogueOptionsValueField] = '';
                    cDS = $.merge([noCatalogues], cDS);
                }
                viewModel.set('cataloguesDataSource', cDS);
                if (widget.options.currentCatalogue.length > 0)
                    viewModel.set('currentCatalogue', widget.options.currentCatalogue);
                ISINITIALLOAD = false;
            }

            var checkAppendGlobal = function (catalogues) {
                if ((widget.options.globalCatalogueAccess.toLowerCase() == 'full' || widget.options.globalCatalogueAccess.toLocaleLowerCase() == 'viewonly') && !catalogueCodeExistsInCatalogueList(catalogues, widget.options.globalCatalogueText))
                    return true;
                else {
                    if (widget.options.currentCatalogue == '' && !catalogueCodeExistsInCatalogueList(catalogues, widget.options.globalCatalogueText))
                        return true;
                    else
                        return false;
                }
            }

            var checkAppendCatalogueNotListed = function (catalogues) {
                if (!catalogueCodeExistsInCatalogueList(catalogues, widget.options.currentCatalogue) && widget.options.currentCatalogue != widget.options.globalCatalogueValue && !catalogueCodeExistsInCatalogueList(catalogues, widget.options.currentCatalogueNotListedCatalogueValue) && !catalogueCodeExistsInCatalogueList(catalogues, widget.options.currentCatalogueNotListedCatalogueText))
                    return true;
                else
                    return false;
            }

            var catalogueCodeExistsInCatalogueList = function (catalogues, catVal) {
                var exists = false;
                $.each(catalogues, function (index, catalogue) {
                    if (typeof catalogue == 'object')
                        var value = catalogue[widget.options.catalogueOptionsValueField];
                    else
                        var value = catalogue;
                    if (catVal == value) {
                        exists = true;
                        // break out of the each loop
                        return false;
                    }
                });
                return exists;
            }
            
            var initEmptyCatalogueDS = function() {
                var noCatalogues = {};
                noCatalogues[widget.options.catalogueOptionsTextField] = '';
                noCatalogues[widget.options.catalogueOptionsValueField] = '';
                return noCatalogues;
            }


            var viewModel = kendo.observable({

                currentCatalogue: '',

                catalogues: widget.options.catalogues,
                
                cataloguesDataSource: initEmptyCatalogueDS(),

                isProcessing: false,
                canRedirect: !widget.options.usingKendoDropdown,

                hasCatalogues: function () {
                    if (this.get('catalogues') && this.get('catalogues').length > 0)
                        return true;
                    else
                        return false;
                },

                catalogueSelected: function () {
                    // select "currentCatlogue"
                    // refresh page
                    var vm = this;
                    var catalogueCode = vm.currentCatalogue;

                    if (catalogueCode !== widget.options.currentCatalogueNotListedCatalogueValue &&
                        catalogueCode !== widget.options.currentCatalogue) {
                        if (catalogueCode == widget.options.globalCatalogueText)
                            catalogueCode = widget.options.globalCatalogueValue;
                        vm.set("isProcessing", true);
                        var d1 = $.cv.css.catalogue.setUserCatalogue({ catalogueCode: catalogueCode });
                        $.when(d1).done(function () {
                            vm.set("widgetMessage", widget.options.successfulChangeCatalogueText);
                            widget.trigger(CATALOGUECHANGED);
                            // you can have orders linked to catalogues so need to refresh the order data when switching catalogues, just need to clear the current order, the lines will be retrieved by the orderLines widget
                            $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrder);
                            if (widget.options.reloadOnChange && vm.get("canRedirect") === true) {
                                $.cv.util.redirect(widget.options.reloadOnChangePage, null, false);
                            }

                        }).fail(function () {
                            vm.set("widgetMessage", widget.options.errorChangingCatalogueText);
                            vm.set("isProcessing", false);
                        });
                    }
                },

                dropdownlistSelect: function () {
                    // Kendo fires off a "select" event when the user selects a different option in the drop-down list.
                    // We only want to redirect when the user changes the catalogue.
                    this.set("canRedirect", true);
                },

                resetCatalogueList: function () {
                    $.cv.css.catalogue.localSetUserCatalogues(null);
                },

                widgetMessage: '',

                clearWidgetMessage: function () {
                    this.set("widgetMessage", "");
                }
            });

            viewModel.bind("change", function (e) {
                if (e.field == "currentCatalogue" && !ISINITIALLOAD) {
                    viewModel.catalogueSelected();
                }
                if (e.field == "catalogues") {
                    initCatalogueDS();
                }
            });
            
            initCatalogues();
            
            return viewModel;

        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = ""
                + "<div class='row clearfix'>"
                    + "<div class='row-left' data-bind='visible: hasCatalogues'>" + widget.options.catalogueListPrompt + "</div>"
                    + "<div class='row-right'>"
                        + "# if ($.isArray(catalogues)) { #"
                            + "<select data-bind='source: cataloguesDataSource, value: currentCatalogue' data-text-field='Description' data-value-field='CatalogueCode'></select>"
                        + "# } else { #"
                            + "<select data-bind='source: cataloguesDataSource, value: currentCatalogue'></select>"
                        + "# } #"
                    + "</div>"
                + "</div>";

            return html;
        }
    };

    $.cv.ui.widget(catalogueSelectWidget);

})(jQuery);
