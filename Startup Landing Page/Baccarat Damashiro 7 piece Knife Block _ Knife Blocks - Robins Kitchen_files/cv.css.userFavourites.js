
;

(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.userFavourites = $.cv.css.userFavourites || {};

    $.cv.css.userFavourites.defaults = $.cv.css.userFavourites.defaults || {};
    $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite = false;

    $.cv.css.userFavourites.getFavouriteCategories = function (options) {
		var opts = $.extend({
			categoryCharactersToCompare: 0, // Off by default
            success: function (msg) { }
        }, options);
        
        return $.cv.ajax.call('userFavourites/GetFavouriteCategories', {        
            parameters:  { 
				categoryCharactersToCompare: opts.categoryCharactersToCompare
            },
            success: opts.success
        });
    }

    $.cv.css.userFavourites.generateFavourites = function (options) {
        var opts = $.extend({
            months: 12,
            success: function (msg) { }
        }, options);
        
        return $.cv.ajax.call('userFavourites/GenerateFavourites', {        
            parameters:  { 
                months: opts.months
            },
            success: opts.success
        });
    };

     $.cv.css.userFavourites.clearFavourites = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        
        return $.cv.ajax.call('userFavourites/ClearFavourites', {        
            parameters:  { },
            success: opts.success
        });
     };

     $.cv.css.userFavourites.removeFavourites = function (options) {
     	var opts = $.extend({
			productCodes: [],
            success: function (msg) { }
        }, options);
        
        return $.cv.ajax.call('userFavourites/RemoveFavourites', {        
            parameters:  { productCodes: opts.productCodes.join() },
            success: opts.success
        });
     },

     $.cv.css.userFavourites.addFavourite = function (options) {
         var opts = $.extend({
             productCode: '',
             returnMessage: $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite,
            success: function (msg) { }
         }, options);

         if (opts.returnMessage === true) {
             return $.cv.ajax.call('userFavourites/AddFavouriteReturnMessage', {
                 parameters: { productCode: opts.productCode },
                 success: opts.success
             });
         } else {
             return $.cv.ajax.call('userFavourites/AddFavourite', {
                 parameters: { productCode: opts.productCode },
                 success: opts.success
             });
         }
     };

     $.cv.css.userFavourites.getFavourites = function (options) {
         var opts = $.extend({
            skip: 0,
            take: 10,
			categoryCharactersToCompare: 0, // Off by default
            success: function (msg) { }
         }, options);

         return $.cv.ajax.call('userFavourites/GetFavourites', {
         	parameters: {
         		skip: opts.skip,
         		take: opts.take,
				categoryCharactersToCompare: opts.categoryCharactersToCompare
         	},
            success: opts.success
         });
     };

})(jQuery);
