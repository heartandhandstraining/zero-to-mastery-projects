;
(function ($, undefined) {
  $.cv = $.cv || {};
  $.cv.productCustom = $.cv.productCustom || {};
  
  $.cv.productCustom.updateProductModal = function(message) {
    if (!$.fancybox.isOpen) {
			$("#modal-atc").find(".atc-message").remove();
			$("#modal-atc").find(".modal-atc").prepend(message);
			$.fancybox.open({
				href: "#modal-atc",
				topRatio: '0.25'
			});
		} else {
			$("#modal-atc").find(".modal-atc").prepend(message);
		}
  };
  
  $.cv.productCustom.giftCardAdded = function (message, productCode) {
    var giftCardMessage = "";
    var qty = 0;
    if (message.length > 0) {
      if (message.toString().toLowerCase().indexOf("added to cart") != -1) {
        var orderDef = $.cv.css.getCurrentOrder();
        orderDef.done(function() {
          $.cv.css.trigger($.cv.css.eventnames.orderChanged);
        });
        qty = $(message).find("[valueType='qty']").text();
        giftCardMessage = "<span class='atc-message'>{0} x <b>{1}</b> has been added to your cart.</span>".format(qty, productCode);
      } else {
        giftCardMessage = "<span class='atc-message error'>Error adding product {0}.<br />{1}</span>".format(productCode, message);
      }
      $.cv.productCustom.updateProductModal(giftCardMessage);
    }
  };
	
	$.cv.productCustom.reviewSubmitted = function() {
		$(".write-review").slideUp();
		$("#product-review-thankyou").slideDown();
	};
	
	$.cv.productCustom.getProductDescription = function(productCode) {
		var productDescription = $("[data-product-code='" + productCode + "']:first").find(".title:first a").text();
		if (productDescription == undefined || productDescription.length == 0) {
			productDescription = $("h1.product-title:first").text();
		}
		if (productDescription == undefined || productDescription.length == 0) {
			productDescription = productCode;
		}
		return productDescription;
	};

})(jQuery);