;
(function ($, undefined) {
  $.cv = $.cv || {};
  $.cv.userFavouritesCustom = $.cv.userFavouritesCustom || {};
  
  $.cv.userFavouritesCustom.removeFavourite = function(productCode) {
    $(".product[data-product-code='" + productCode + "']").find(".remove").addClass($.cv.css.isProcessingClass);
    var productCodes = [];
    productCodes.push(productCode);
    var remProm = $.cv.css.userFavourites.removeFavourites({productCodes: productCodes});
    remProm.done(function (response) {
      $(".product[data-product-code='" + productCode + "']").find(".remove").removeClass($.cv.css.isProcessingClass);
      if (response.data == "True") {
        $(".product[data-product-code='" + productCode + "']").remove();
      }
    });
  }
  
})(jQuery);