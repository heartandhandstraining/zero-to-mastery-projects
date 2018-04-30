/**
 * Author: Chad Paynter
 * Date: 2013-04-22
 * Description: To get category data
 * Dependencies
 * - jQuery
 * - cv.css.js
 *
**/ 
;
(function($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.category = $.cv.css.category || {};
    
    $.cv.css.category.categorySearch = function(options) {
        var opts = $.extend({
            categoryCode: '',
            skip: 0,
            take: 10,
            sortOrder: '',
            contractFilter: '',
            success: function (msg) { }
        }, options);

        if (opts.categoryCode.length > 0) {
            return $.cv.ajax.call('productcategory/subcategories', {
                parameters: { categoryCode: opts.categoryCode, skip: opts.skip, take: opts.take, sort: opts.sortOrder, contractFilter: opts.contractFilter },
                success: opts.success
            });
        } else {
            return $.cv.ajax.call('productcategory/toplevel', {
                parameters: { skip: opts.skip, take: opts.take, sort: opts.sortOrder},
                success: opts.success
            });
        }
    };

    $.cv.css.category.cousinesAndSiblings = function (options) {
        var opts = $.extend({
            categoryCode: '',
            contractFilter: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call('productcategory/cousinesAndSiblings', {
            parameters: { categoryCode: opts.categoryCode, contractFilter: opts.contractFilter },
            success: opts.success
        });
    };

    $.cv.css.category.categoryProducts = function(options) {
        var opts = $.extend({
            categoryCode: '',
            skip: 0,
            take: 10,
            sort: '',
            sortOrder: '', // <- Dont use this it should have been sort to match the dynamic service code requirements
            contractFilter: ''
        }, options);
        return $.cv.ajax.call('productcategory/categoryproducts', {
            parameters: {
                categoryCode: opts.categoryCode,
                skip: opts.skip,
                take: opts.take,
                sort: opts.sortOrder ? opts.sortOrder : opts.sort,
                contractFilter: opts.contractFilter
            },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };
    
    $.cv.css.category.categoryProductsStocktake = function(options) {
        var opts = $.extend({
            categoryCode: '',
            skip: 0,
            take: 10,
            sort: '',
            sortOrder: '', // <- Dont use this it should have been sort to match the dynamic service code requirements
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('productcategory/categoryproductsstocktake', {
            parameters: {
                categoryCode: opts.categoryCode,
                skip: opts.skip,
                take: opts.take,
                sort: opts.sortOrder ? opts.sortOrder : opts.sort
            },
            success: opts.success,
            converters: {
                'text json': $.cv.css.product._productResponseCleanupConverter
            }
        });
    };

    $.cv.css.category.getCategoryBreadcrumbInformation = function (options) {
        var opts = $.extend({
            categoryCode: '',
            success: $.noop
        }, options);

        return $.cv.ajax.call('productcategory/GetCategoryBreadcrumbInformation', {
            parameters: opts,
            success: opts.success
        });
    };

    $.cv.css.category.getClusterLinesForCategory = function (options) {
        var opts = $.extend({
            categoryCode: "",
            getOnlyProductLines: true,
            success: $.noop
        }, options);

        return $.cv.ajax.call('productcategory/getClusterLinesForCategory', {
            parameters: opts,
            success: opts.success
        });
    };

})(jQuery);