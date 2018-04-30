;
(function ($, undefined) {
  $.cv = $.cv || {};
  $.cv.ordersCustom = $.cv.ordersCustom || {};
  $.cv.ordersCustom.verifying = false;
  $.cv.ordersCustom.verified = false;
  $.cv.ordersCustom.quantityChangedMessages = [];
  $.cv.ordersCustom.quantityChangedMessagesEvent = function() {
    $.cv.css.unbind($.cv.css.eventnames.orderChanged, $.cv.ordersCustom.quantityChangedMessages);
    var deletionMessage = "";
    var deletionMessages = [];
    $.each($.cv.ordersCustom.quantityChangedMessages, function() {
      var lineSeq = this.lineSeq;
      var row = $(".cart-row[data-line-seq='" + lineSeq + "']");
      if (row.length > 0) {
        row.find(".error-message.line-auto-updated").html(this.errorMessage).css({"display":"block"});
      } else {
        deletionMessage = deletionMessage.length > 0 ? (deletionMessage + "," + this.errorMessage) : this.errorMessage;
        deletionMessages.push({lineSeq: lineSeq});
      }
    });
    if (deletionMessage.length > 0) {
      $.each(deletionMessages, function(idx,msg) {
        $.cv.ordersCustom.quantityChangedMessages = _.filter($.cv.ordersCustom.quantityChangedMessages, function (item) { return msg.lineSeq.toString() != item.lineSeq.toString(); });
      });
      var found = false;
      $("#message-container .alert-message-text").each(function(idx,item) {
        if ($(item).text() == deletionMessage) {
          found = true;
        }
      });
      if (!found) {
        $.cv.css.trigger($.cv.css.eventnames.message, { message: deletionMessage, type: $.cv.css.messageTypes.error, source: 'orderLines', clearExisting: false });
      }
    }
    $.cv.ordersCustom.quantityChangedMessages = [];
  }
  $.cv.ordersCustom.verifyAvailableQuantity = function () {
    if (!$.cv.ordersCustom.verifying) {
      $.cv.ordersCustom.verifying = true;
      var tmpProductCode = '';                
      var tmpAvailableQty = 0;                
      var tmpConditionCode = '';
      var tmpStockType = '';
      var tmpLineSeq = 0;
      var tmpProductDescription  = '';
      var tmpOrderedQty = 0;
      var validationMessage = '';
      var tmpMessage = "";
      var lines = [];
      var deleteLines = [];
      var errorMessages = [];
      var lineMessages = [];
      var widgetLineMessages = [];
      var giftcardMessage = "";
  
      $(".cart-row").each(function() {
        var _this = $(this);
        if (typeof _this.data("productCode") !== 'undefined' && _this.data("productCode") !== false) {
          tmpProductCode = _this.data("productCode");
          tmpAvailableQty = _this.data("availableQty");
          tmpConditionCode = _this.data("conditionCode");
          tmpStockType = _this.data("stockType");
          tmpLineSeq = _this.data("lineSeq");
          tmpProductDescription = _this.find(".title").text();
          tmpOrderedQty = _this.find(".col-3 input[type='number']").val();
          giftcardMessage = _this.find(".giftcard-message-entry textarea").length > 0 ? _this.find(".giftcard-message-entry textarea").val() : "";
          if (parseFloat(tmpAvailableQty) < 0 && tmpStockType != 'Z') {                
            // adjust to maximum available
            var adjQty = 0;
            adjQty = parseFloat(tmpOrderedQty) + parseFloat(tmpAvailableQty);
            
            if (adjQty < 0) { adjQty = 0 }
            
            if (tmpConditionCode.toUpperCase() == 'O') {
              tmpMessage = 'The quantity ordered for ' + tmpProductDescription + ' could only be partially fulfilled. Back orders are unavailable for this product. Quantity ordered changed to ' + adjQty;
            } else if (adjQty > 0) {
              tmpMessage = 'The quantity ordered for ' + tmpProductDescription + ' could only be partially fulfilled. Back orders are unavailable for this product. Quantity ordered changed to ' + adjQty;
            } else if (adjQty == 0) {
              tmpMessage = 'The quantity ordered for ' + tmpProductDescription + ' could not be fulfilled. Back orders are unavailable for this product. Quantity ordered changed to ' + adjQty;
            }
            if (isNaN(adjQty.toString())) {
              adjQty = 0;
              //$(this).find(".cart-item-remove").click();
            }
            //$(this).find("input[name='" + tmpProductCode + "']").val(adjQty).change();
            _this.find(".col-3 input[type='number']").val(adjQty).change();
            if (adjQty <= 0) {
              deleteLines.push({ sequence: tmpLineSeq.toString(), LineSeq: tmpLineSeq.toString()});
            }
            lines.push({ sequence: tmpLineSeq.toString(), quantity: adjQty.toString(), costCentreCode: "", note: giftcardMessage, discount: "-1.0", price: "-1.0" })
            lineMessages.push({lineSeq: tmpLineSeq.toString(), errorMessage: tmpMessage, preventsCheckOut: false, productCode: tmpProductCode.toString(), errorType: $.cv.css.messageTypes.error})
          }
        }
      });
      if (lines.length > 0) {
        if (lineMessages.length > 0) {
          $.cv.ordersCustom.quantityChangedMessages = lineMessages;
          //$.cv.css.bind($.cv.css.eventnames.orderChanged, $.cv.ordersCustom.quantityChangedMessagesEvent);
        }
        //$.cv.css.orders.updateCurrentOrderLineBulk({ batchData: lines, triggerOrderRefresh: true });
        $(".cart[data-role='orderlines']").each(function() {
            var linesWidget = $(this).data("orderLines");
            if(linesWidget) {
              var updatesDef = linesWidget.updateLinesFlaggedForUpdate(false,false);
              var deletesDef = linesWidget.deleteLinesFlaggedForDelete(false,false);
              $.when(updatesDef,deletesDef).done(function() {
                $.cv.ordersCustom.quantityChangedMessagesEvent();
                $.cv.ordersCustom.verifying = false;
                var currentOrderDef = $.cv.css.getCurrentOrder();
                currentOrderDef.done(function() {
                  $("[data-role='ordersummary']").orderSummary();
                  linesWidget.refreshLines();
                  //linesWidget.displayLineMessages([{lineMessages: lineMessages}], []);
                  if(deleteLines.length > 0) {
                    $.cv.ordersCustom.removeLinesFromStorage(deleteLines);
                  }
                  $.cv.ordersCustom.quantityChangedMessages = lineMessages;
                  $.cv.ordersCustom.quantityChangedMessagesEvent();
                });
              });
              //linesWidget.updateAllLines();
            }
        });
      }
    }
  };
  $.cv.ordersCustom.removeLinesFromStorage = function(deleteLines) {
    var currentOrderLines = $.cv.css.localGetCurrentOrderLines();
    $.each(deleteLines, function(idx,item) {
      $.each(deleteLines, function (idx, line) {
          if (_.filter(currentOrderLines, function (item) { return line.LineSeq.toString() == item.LineSeq.toString(); }).length > 0) {
              currentOrderLines = _.filter(currentOrderLines, function (item) { return line.LineSeq.toString() != item.LineSeq.toString(); });
              //currentOrderLines = _.union(currentOrderLines, line);
          }
      });
    });
    currentOrderLines = _.sortBy(currentOrderLines, function (item) { return item.LineSeq; });
    $.cv.css.localSetCurrentOrderLines(currentOrderLines);
  };
})(jQuery);