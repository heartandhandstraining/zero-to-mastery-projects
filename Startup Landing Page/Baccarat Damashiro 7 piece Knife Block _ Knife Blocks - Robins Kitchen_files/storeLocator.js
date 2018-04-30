;
(function ($, undefined) {
  $.cv = $.cv || {};
  $.cv.storeLocatorCustom = $.cv.storeLocatorCustom || {};
  
  $.cv.storeLocatorCustom.setAddressEvents = function(productCode) {
    $("#location-search-postcode").change(function() {
      $("#location-search-suburb").val("");
      $("#location-search-state").val("");
    });
    
    $("#location-search-suburb,#location-search-state").change(function() {
      console.log($("#location-search-postcode").val());
      $("#location-search-postcode").val("");
    });
  }
  
})(jQuery);