// closure for $.cv.css.catalogue plugin 
;
(function ($, undefined) {

    // Setup base 'namespaces'
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.catalogue = $.cv.css.catalogue || {};


    /* local storage */

    $.cv.css.catalogue.localGetUserCatalogue = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.currentCatalogue);
    };

    $.cv.css.catalogue.localSetUserCatalogue = function (catalogue) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.currentCatalogue, catalogue);
    };

    $.cv.css.catalogue.localRemoveUserCatalogue = function (catalogue) {
        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentCatalogue);
    };

    $.cv.css.catalogue.localGetUserCatalogues = function () {
        return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.userCatalogues);
    };

    $.cv.css.catalogue.localSetUserCatalogues = function (catalogues) {
        $.cv.css.setLocalStorage($.cv.css.localStorageKeys.userCatalogues, catalogues);
    };

    $.cv.css.catalogue.localRemoveUserCatalogues = function (catalogues) {
        $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.userCatalogues);
    };

    /* local storage END */

    /* Public methods */

    $.cv.css.catalogue.getUserCatalogues = function (options) {
        var opts = $.extend({
            skip: 0,
            take: 500,
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('catalogue/usercatalogues', {
            parameters: {skip: opts.skip, take: opts.take},
            success: function (msg) {
                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                    $.cv.css.catalogue.localSetUserCatalogues(msg.data);
                }
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.catalogue.getCurrentUserCatalogue = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.css.catalogue._getUserCatAjax(opts);
    };

    $.cv.css.catalogue._getUserCatAjax = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        return $.cv.ajax.call('catalogue/currentusercatalogue', {
            parameters: {},
            success: function (msg) {
                // if no error set datat to localstorage
                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                    $.cv.css.catalogue.localSetUserCatalogue(msg.data);
                }
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.catalogue.setUserCatalogue = function (options) {
        var opts = $.extend({
            catalogueCode: '',
            success: function (msg) { }
        }, options);

        var result = $.Deferred();

        $.cv.ajax.call('catalogue/setusercatalogue', {
            parameters: {
                catalogueCode: opts.catalogueCode
            },

            success: function (msg) {
                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                    $.cv.css.catalogue._getUserCatAjax(opts).done(function () {
                        // Trigger catalogue changed event
                        $.cv.css.trigger($.cv.css.eventnames.catalogueChanged, msg.data);

                        if (opts.success) {
                            opts.success(msg);
                        }

                        result.resolve(msg);
                    });
                } else {
                    if (opts.success) {
                        opts.success(msg);
                    }

                    result.resolve(msg);
                }
            }
        });

        return result.promise();
    };

    /* Public methods END */

})(jQuery);