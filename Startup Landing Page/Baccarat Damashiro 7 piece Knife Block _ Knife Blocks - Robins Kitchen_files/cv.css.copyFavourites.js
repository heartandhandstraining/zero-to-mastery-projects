// Closure for $.cv.css.copyFavourites plugin.
;

(function ($, undefined) {
    // Check we have everything we need.
    $.cv = $.cv || {};

    // $.cv.css.copyFavourites object definition.
    $.cv.css = $.cv.css || {};
    $.cv.css.copyFavourites = $.cv.css.copyFavourites || {};

    //
    // Copy favourites.
    //
    $.cv.css.copyFavourites.doCopy = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);

        var p = $.cv.ajax.call("copyFavourites/doCopy", {
            parameters: {
                copyType: opts.copyType,
                from: opts.from,
                to: opts.to
            },
            success: opts.success
        });

        return p;
    };
})(jQuery);
