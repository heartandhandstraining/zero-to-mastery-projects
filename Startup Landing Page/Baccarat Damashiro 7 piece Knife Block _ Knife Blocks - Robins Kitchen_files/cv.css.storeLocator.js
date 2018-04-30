// Closure for $.cv.css.storeLocator plugin.
;

(function ($, undefined) {
    // Check we have everything we need.
    $.cv = $.cv || {};

    // $.cv.css.orderTemplate object definition.
    $.cv.css = $.cv.css || {};
    $.cv.css.storeLocator = $.cv.css.storeLocator || {};

    //
    // Find nearest store.
    //
    $.cv.css.storeLocator.findNearestStore = function (options) {
        var opts = $.extend({
            latitude: 0,
            longitude: 0,
            filters: "",
            featureFilter: "",
            maxStores: 0,
            jsonFieldGroupName: "",
            checkStoreAvailabilityClickAndCollect: false,
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("storeLocator/findNearestStore", {
            parameters: {
                latitude: opts.latitude,
                longitude: opts.longitude,
                filters: opts.filters,
                featureFilter: opts.featureFilter,
                maxStores: opts.maxStores,
                jsonFieldGroupName: opts.jsonFieldGroupName,
                checkStoreAvailabilityClickAndCollect: opts.checkStoreAvailabilityClickAndCollect
            },
            success: opts.success
        });

        return p;
    };

    //
    // Get all warehouses that have pickup enabled.
    //
    $.cv.css.storeLocator.getWarehousesForPickup = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("storeLocator/getWarehousesForPickup", {
            parameters: {
            },
            success: opts.success
        });

        return p;
    };

    //
    // Get selected warehouse.
    //
    $.cv.css.storeLocator.getWarehouse = function (options) {
        var opts = $.extend({
            warehouseCode: "",
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("storeLocator/getWarehouse", {
            parameters: {
                warehouseCode: opts.warehouseCode
            },
            success: opts.success
        });

        return p;
    };

    //
    // Get selected suburbs.
    //
    $.cv.css.storeLocator.getSuburbs = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("storeLocator/getSuburbs", {
            parameters: {},
            success: opts.success
        });

        return p;
    };

    //
    // Get suburb helpers by filter.
    //
    $.cv.css.storeLocator.getSuburbHelpers = function (options) {
        var opts = $.extend({
            searchFilter: "",
            incName: false,
            useLikeName: false,
            incState: false,
            useLikeState: false,
            incPostcode: false,
            useLikePostcode: false,
            incCountry: false,
            useLikeCountry: false,
            maxResults: 0,
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("storeLocator/getSuburbHelpers", {
            parameters: {
                searchFilter: opts.searchFilter,
                incName: opts.incName,
                useLikeName: opts.useLikeName,
                incState: opts.incState,
                useLikeState: opts.useLikeState,
                incPostcode: opts.incPostcode,
                useLikePostcode: opts.useLikePostcode,
                incCountry: opts.incCountry,
                useLikeCountry: opts.useLikeCountry,
                maxResults: opts.maxResults
            },
            success: opts.success
        });

        return p;
    };

    //
    // Set usser's current store name
    //
    $.cv.css.storeLocator.setUserCurrentStore = function (options) {
        var opts = $.extend({
            storeName: "",
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("storeLocator/setUserCurrentStore", {
            parameters: {
                storeName: opts.storeName
            },
            success: opts.success
        });

        return p;
    };
})(jQuery);
