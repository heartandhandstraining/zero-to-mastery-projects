/**
 * Author: Chad Paynter
 * Date: 2013-04-22
 * Description: To get product data
 * Dependencies
 * - jQuery 
 * - cv.css.js
 *
**/
;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.product = $.cv.css.product || {};

    $.cv.css.product._productResponseCleanupConverter = function (response) {
        var result = jQuery.parseJSON(response);
        var data = result.data;

        if (data && data.length > 0) {
            for (var rowIndex in data) {
                var row = data[rowIndex];

                // CustomerProductInfo is only ever 1 record so just set the field
                // to the first entry of the array so it acts like a property returning
                // an object
                if (row.CustomerProductInfo && row.CustomerProductInfo.length == 1) {
                    row.CustomerProductInfo = row.CustomerProductInfo[0];
                }
            }
        }

        return result;
    };

    $.cv.css.product.attributeproduct = function (options) {
        var opts = $.extend({
            productCode: '',
            attributes: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/attributeproduct', {
            parameters: { productCode: opts.productCode, attributes: opts.attributes },
            success: opts.success
        });
    };

    $.cv.css.product.getAllAttributeCombinations = function (options) {
        var opts = $.extend({
            productCode: '',
            includeDisabledEntries: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/getAllAttributeCombinations', {
            parameters: { productCode: opts.productCode, includeDisabledEntries: opts.includeDisabledEntries },
            success: opts.success
        });
    };

    $.cv.css.product.productSearch = function (options) {
        // clear campaign if set 
        $.cv.css.setCurrentCampaign(null);

        var opts = $.extend({
            searchString: '',
            searchType: '',
            contractFilter: '',
            skip: 0,
            take: 10,
            sort: '',
            success: function (msg) { }
        }, options);

        // Can't just use the skip/take as argument placeholders in the dynamic service method
        // definition... :o(
        opts.skipArg = opts.skip;
        opts.takeArg = opts.take;

        return $.cv.ajax.call('products/productsearch', {
            parameters: {
                searchString: opts.searchString,
                searchType: opts.searchType,
                contractFilter: opts.contractFilter,
                skip: opts.skip,
                take: opts.take,
                sort: opts.sort,
                skipArg: opts.skipArg,
                takeArg: opts.takeArg
            },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };

    $.cv.css.product.productSearchWithFeaturesFilter = function (options) {
        var opts = $.extend({
            filter: "",
            featureFilter: "",
            categoryFilter: "",
            isPaged: false,
            pageSize: -1,
            pageNumber: 1,
            success: function (msg) { }
        }, options.isPaged ? {
            skip: 0,
            take: 20
        } : {}, options);

        var params = $.extend({}, {
            filter: opts.filter,
            featureFilter: opts.featureFilter,
            categoryFilter: opts.categoryFilter,
            isPaged: opts.isPaged,
            // NOTE: pageSize is a reserved parameter keyword. This is adjusted to pageSizeArg
            // to ensure this is not treated as a reserved parameter
            pageSizeArg: opts.pageSize,
            pageNumber: opts.pageNumber
        }, options.isPaged ? {
            skip: opts.skip,
            take: opts.take
        } : {});
        return $.cv.ajax.call('products/GetProductWithFeaturesFilter', {
            parameters: params,
            success: opts.success
        });
    };
    
    $.cv.css.product.productSearchExact = function (options) {
        var opts = $.extend({
            searchType:"exact",
            searchString: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/productSearchExact', {
            parameters: {
                searchString: opts.searchString,
                searchType: opts.searchType
            },
            success: opts.success
        });
    };

    $.cv.css.product.productSearchFastAdd = function (options) {
        // clear campaign if set 
        $.cv.css.setCurrentCampaign(null);

        var opts = $.extend({
            searchString: '',
            skip: 0,
            take: 10,
            sort: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/productsearchfastadd', {
            parameters: {
                searchString: opts.searchString,
                skip: opts.skip,
                take: opts.take, 
                sort: opts.sort
            },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };

    $.cv.css.product.getProductDetail = function (options) {
        var opts = $.extend({
            productCode: '',
            validMode: 0,
            isAttributeSelection: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/getdetail', {
            parameters: {
                productCode: opts.productCode,
                validMode: opts.validMode,
                isAttributeSelection: opts.isAttributeSelection
            },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };
    
    $.cv.css.product.getProductDetailNoPrices = function (options) {
        var opts = $.extend({
            productCode: "",
            validMode: 0,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call("products/getDetailNoPrices", {
            parameters: {
                productCode: opts.productCode,
                validMode: opts.validMode,
                _disableLivePricing: true
            },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };
    
    $.cv.css.product.getPriceForQty = function (options) {
        var opts = $.extend({
            productCode: '',
            quantity: '',
            includeQuantityBreaks: false,
            success: function (msg) { }
        }, options);

        var serviceName = opts.includeQuantityBreaks ? "products/priceForProductWithQtyBreaks" : "products/priceForProduct";

        return $.cv.ajax.call(serviceName, {
            parameters: { productCode: opts.productCode, quantity: opts.quantity },
            success: opts.success
        });
    };
    
    $.cv.css.product.getProductDetailStocktake = function (options) {
        var opts = $.extend({
            productCode: '',
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('products/getdetailstocktake', {
            parameters: { productCode: opts.productCode },
            success: opts.success
        });
    };

    $.cv.css.product.calculatePriceFromGPOrMarkupCode = function (options) {
        var opts = $.extend({
            productCode: '',
            gpOrMarkupCode: '',
            quantity: 1,
            success: $.noop
        }, options);

        return $.cv.ajax.call('products/CalculatePriceFromGPOrMarkupCode', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.product.getInfiniteScrollingProducts = function (options) {
        var opts = $.extend({
            pageNumber: 1,
            pageSize: 12,
            rawUrl: "",
            templateName: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call("products/GetInfiniteScrollingProducts", {
            parameters: {
                pageNumber: opts.pageNumber,
                // NOTE: pageSize is a reserved parameter keyword. This is adjusted to pageSizeArg
                // to ensure this is not treated as a reserved parameter
                pageSizeArg: opts.pageSize,
                rawUrl: opts.rawUrl,
                templateName: opts.templateName
            },
            success: opts.success
        });
    };

    $.cv.css.product.findNearestPickupStoresForProduct = function (options) {
        var opts = $.extend({
            productCode: '',
            numberOfStores: 3,
            includeCurrentStore: true,
            success: $.noop
        }, options);

        return $.cv.ajax.call('products/findNearestPickupStoresForProduct', {
            parameters: {
                productCode: opts.productCode,
                numberOfStores: opts.numberOfStores,
                includeCurrentStore: opts.includeCurrentStore
            },
            success: opts.success
        });
    };

    $.cv.css.product.getProducts = function (options) {
        var opts = $.extend({
            productCodes: [],
            success: $.noop
        }, options);

        return $.cv.ajax.call('products/getProducts', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.product.getRenderedProductListItemZonedTemplate = function (options) {
        var opts = $.extend({
            productCode: "",
            campaignCode: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call("products/getRenderedProductListItemZonedTemplate", {
            parameters: opts,
            success: opts.success
        });
    };

})(jQuery);
