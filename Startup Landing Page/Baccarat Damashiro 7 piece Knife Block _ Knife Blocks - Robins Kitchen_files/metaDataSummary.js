;
(function ($, undefined) {
  $.cv = $.cv || {};
  $.cv.metaDataSummaryCustom = $.cv.metaDataSummaryCustom  || {};
  
  $.cv.metaDataSummaryCustom.strFilter = "";
  
  $.cv.metaDataSummaryCustom.buildMobileFilter = function() {
    var mobileFilter = "";
    var mobileRangeFilter = "";
    var mobileSearchFilter = "";
    var url = $.url.setUrl(window.location.href.toLowerCase());
    var _rangeFrom = $($("input[name='PriceRangeFrom']")[0]);
    var _rangeTo = $($("input[name='PriceRangeTo']")[0]);
    var params = {};
    if (_rangeFrom.val() != _rangeFrom.attr("min") || _rangeTo.val() != _rangeTo.attr("max")) {
      mobileRangeFilter = "(PriceValue:ge:" + _rangeFrom.val() + ",PriceValue:le:" + _rangeTo.val() + ")"
    }
    $(".mobile-filter-item select:not(#CategoryFilter,[name='PriceRangeFrom'],[name='PriceRangeTo'])").each(function() {
      var _this = $(this);
      if (_this.val() != "") {
        mobileFilter = mobileFilter.length > 0 ? mobileFilter + "," : mobileFilter;
        mobileFilter += "(" + _this.attr("filtername") + ":eq:" + _this.val() + ")";
      }
    });
    if (mobileRangeFilter.length > 0) {
      mobileFilter = mobileFilter.length > 0 ? mobileFilter + "," + mobileRangeFilter : mobileRangeFilter;
    }
    if (typeof $.url.param("productsearch") != "undefined") {
      mobileSearchFilter = url.param("productsearch");
    }
    if (mobileFilter.length > 0) {
      params["filterProduct"] = mobileFilter;
      if(mobileSearchFilter.length > 0) {
        params["ProductSearch"] = mobileSearchFilter;
      }
      $.cv.util.redirect($.url.attr("path"),params,false);
    } else {
      if ($.url.param("filterProduct") != undefined) {
        $.cv.util.redirect($.url.attr("path"),{},false);
      }
    }
  };
  
  $.cv.metaDataSummaryCustom.reloadParameters = function() {
    //var url = $.url.setUrl(window.location.href.toLowerCase());
    var url = $.url.setUrl(window.location.href);
    if ($.url.param("filterProduct") != undefined) {
        var filterProduct = $.url.param("filterProduct");
        
        var filters = new Array();
        filters = filterProduct.split(",");
        
        // price slider
        var minValue = -1;
        var maxValue = -1;
        
        // for each filter
        for (i=0;i<filters.length;i++) {            
            
            filters[i] = filters[i].replace('(', '').replace(')', '');
            
            var innerFilter = '';
            innerFilter = filters[i].split("|"); // split out the OR conditions
            
            for (j=0;j<innerFilter.length;j++) {
                var innerFilter2 = '';
                innerFilter2 = innerFilter[j].split(':'); // this last one always for 3 conditions
                                    
                if (innerFilter2[0] == "PriceValue" && innerFilter2[1] == "ge") {
                    minValue = parseInt(innerFilter2[2]);
                } else if (innerFilter2[0] == "PriceValue" && innerFilter2[1] == "le") {
                    maxValue = parseInt(innerFilter2[2]);
                };
                                    
                $('input[name="' + innerFilter2[0] + '"][value="' + decodeURIComponent(innerFilter2[2]) + '"]').attr('checked', 'checked');
                $('select[name="' + innerFilter2[0] + '"]').val(decodeURIComponent(innerFilter2[2]));
                
                // special handling of colour swatches
                if (innerFilter2[0] == 'Colour1') {
                    var Colour = decodeURIComponent(innerFilter2[2]);                        
                    $("img[class='ColourSwatch'][alt='" + Colour + "']").attr('src', '/images/swatches/' + Colour + '-tick.png');
                }                    
            }                            
        }
            
        if (minValue > -1 && maxValue > -1 ) {
          $("#price-slider").slider( "values", [minValue,maxValue] );
          $("#sidebarRangeSliderValues").val("$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1));
          var mobileMinValue = Math.floor($("#PriceRangeFrom").val());
          var mobileMaxValue = Math.ceil($("#PriceRangeTo").val());
          $('input[name="PriceRangeFrom"]').val(minValue);
          $('input[name="PriceRangeTo"]').val(maxValue);
        } 
        
        $.cv.metaDataSummaryCustom.buildMetaFilterSearch(0);

    }
  };
  
  $.cv.metaDataSummaryCustom.redirect = function (dataType, parameterValue) {
      var redirectLink = '';
      //var url = $.url.setUrl(window.location.href.toLowerCase());
      var url = $.url.setUrl(window.location.href);
      redirectLink = window.location.href.split("?")[0];
      
      var queryString = new Array();
      var queryCount = 0; 
      
      if (dataType == "Sorting") {
          queryString[queryCount] = parameterValue;
          queryCount++; 
      } else if (typeof $.url.param("SortProduct") != "undefined") {
          queryString[queryCount] = 'SortProduct=' + url.param("SortProduct");
          queryCount++; 
      }
      
      if (dataType == "Paging") {
          queryString[queryCount] = parameterValue;
          queryCount++; 
      } else if (typeof $.url.param("PageSizeProduct") != "undefined") {
          queryString[queryCount] = 'PageSizeProduct=' + url.param("PageSizeProduct");
          queryCount++; 
      }
      
      if (dataType == "Template") {
          queryString[queryCount] = parameterValue;
          queryCount++; 
      } else if (typeof $.url.param("Template") != "undefined") {
          queryString[queryCount] = 'Template=' + url.param("Template");
          queryCount++; 
      }
          
      if (typeof $.url.param("ProductSearch") != "undefined") {
          queryString[queryCount] = 'ProductSearch=' + url.param("ProductSearch");
          queryCount++; 
      }
      
      if (dataType == 'MetaData') {
          if (parameterValue.length > 0) {
              queryString[queryCount] = 'filterProduct=' + parameterValue;
              queryCount++;
          }
      } else {
          if (typeof $.url.param("filterProduct") != "undefined") {
              queryString[queryCount] = 'filterProduct=' + url.param("filterproduct");
              queryCount++;
          }
      }    
                                                                  
      redirectLink = '';
      
      for (i=0; i<queryString.length; i++) {
          if (i == 0) {
              redirectLink = redirectLink + '?' + queryString[i];
          } else {
              redirectLink = redirectLink + '&' + queryString[i];
          }
      }
      
      if (redirectLink.length == 0) {
          $(location).attr('href', window.location.href.split("?")[0])
      } else {
          $(location).attr('href', redirectLink);    
      }
  };
  
  $.cv.metaDataSummaryCustom.buildQueryString = function (lfFilter){        
      if (lfFilter != '') {
          lfFilter = lfFilter + ','
      }
      return lfFilter        
  };
  
  $.cv.metaDataSummaryCustom.buildQueryStringGroup = function (lfFilter, operator){        
      if (lfFilter != '') {
          lfFilter = lfFilter + operator
      } else {
          lfFilter = '(' + lfFilter
      }
      
      return lfFilter        
  };
  
  $.cv.metaDataSummaryCustom.buildSearchFilterByInput = function (inputName, dbFieldName, compareOperator) {
      // build the whole array 
      var tmpFilter = '';            
          
      $("input[type=checkbox][name='" + inputName + "']").filter(':checked').each(function (y) {
          if ($(this).val().toUpperCase() != 'ALL') {                
              tmpFilter = $.cv.metaDataSummaryCustom.buildQueryStringGroup(tmpFilter, "|") + dbFieldName + ":" + compareOperator + ":" + encodeURIComponent($(this).val()) + "";			
          }
      });
      
      if (tmpFilter.substring(0,1) == '(') {
          tmpFilter = tmpFilter + ')'
      }
      
      if (tmpFilter != '') {
          $.cv.metaDataSummaryCustom.strFilter = $.cv.metaDataSummaryCustom.buildQueryString($.cv.metaDataSummaryCustom.strFilter) + tmpFilter;
      }
  };
  
  $.cv.metaDataSummaryCustom.buildMetaFilterSearch = function(alwaysUseEqual) {
    // identified the checked items
    $.cv.metaDataSummaryCustom.strFilter = '';
        
    $(".filter-checklist").each(function () {
        var filterName = $(this).attr('filterName');
    
        if (filterName != undefined) {
            if (
                (filterName.toUpperCase() == 'PRODUCTCOLOUR' || filterName.toUpperCase() == 'MDHIVIS')
                && alwaysUseEqual == 0
                ) {
                $.cv.metaDataSummaryCustom.buildSearchFilterByInput(filterName, filterName, 'lk');
            } else {
                $.cv.metaDataSummaryCustom.buildSearchFilterByInput(filterName, filterName, 'eq');
            }
        }
    });
    
    // special handling of Price Range Slider
    if (isNaN($("#price-slider").slider("values", 0)) == false
        && isNaN($("#price-slider").slider("values", 1)) == false
        && isNaN(parseInt($("#PriceRangeFrom").val())) == false
        && isNaN(parseInt($("#PriceRangeTo").val())) == false) {
        
        var priceRangeFrom = Math.floor($("#PriceRangeFrom").val());
        var priceRangeTo = Math.ceil($("#PriceRangeTo").val());
        var priceRangeFromSearchValue = $("#price-slider").slider("values", 0);
        var priceRangeToSearchValue = $("#price-slider").slider("values", 1);
        
        if (!(priceRangeFrom == priceRangeFromSearchValue && priceRangeTo == priceRangeToSearchValue)) {
            // price doesn't equal
            var tmpFilter = '';
            tmpFilter = $.cv.metaDataSummaryCustom.buildQueryStringGroup(tmpFilter, ",") + "PriceValue" + ":" + "ge" + ":" + priceRangeFromSearchValue.toString() + "";
            tmpFilter = $.cv.metaDataSummaryCustom.buildQueryStringGroup(tmpFilter, ",") + "PriceValue" + ":" + "le" + ":" + priceRangeToSearchValue.toString() + "";			
            
             if (tmpFilter.substring(0,1) == '(') {
                tmpFilter = tmpFilter + ')'
            }
            
            if (tmpFilter != '') {
                $.cv.metaDataSummaryCustom.strFilter = $.cv.metaDataSummaryCustom.buildQueryString($.cv.metaDataSummaryCustom.strFilter) + tmpFilter;
            }
        }            
    }
    
    // replace last comma
    if ($.cv.metaDataSummaryCustom.strFilter.substring($.cv.metaDataSummaryCustom.strFilter.length - 1, $.cv.metaDataSummaryCustom.strFilter.length) == ',') {
        $.cv.metaDataSummaryCustom.strFilter = $.cv.metaDataSummaryCustom.strFilter.substring(0, $.cv.metaDataSummaryCustom.strFilter.length - 1)                    
    }
  };
  
  $.cv.metaDataSummaryCustom.clear = function() {
    var filterName = $(this).attr('filterName');            
    if (filterName == "PriceValue") {
      $("#price-slider").slider( "values", [Math.floor($("#PriceRangeFrom").val()),Math.ceil($("#PriceRangeTo").val())] );
      $("#sidebarRangeSliderValues").val("$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1));
    } else {
        $("input[filterName='" + filterName + "']").each(function () {
            $(this).removeAttr('checked');
        });
    }
    $.cv.metaDataSummaryCustom.buildMetaFilterSearch(0);
    $.cv.metaDataSummaryCustom.redirect('MetaData', $.cv.metaDataSummaryCustom.strFilter);
  };
  
  $.cv.metaDataSummaryCustom.clearAllFilters = function() {
    var path = $.url.attr("path");
    var url = $.url.setUrl(window.location.href.toLowerCase());
    var params = {};
    if (typeof $.url.param("productsearch") != "undefined") {
      params["ProductSearch"] = url.param("productsearch");
    }
    $.cv.util.redirect(path,params,false);
  };
  
 $.cv.metaDataSummaryCustom.setSummaryEvents = function() {
  $(".expandable-content").hide();
      $(".expandable-header.filter-1").click(function(){
        var _this = $(this);
       _this.next(".expandable-content").slideToggle(function() {
     _this.find(".downArrow").toggle();
      _this.find(".upArrow").toggle();
        //$(this).next(".expandable-content").show();
        });
       
    });
      $(".expandable-header.expandable.clear").click(function(){
        var _this = $(this);
       _this.next(".expandable-content").slideToggle(function() {
     _this.find(".downArrow").toggle();
      _this.find(".upArrow").toggle();
        //$(this).next(".expandable-content").show();
        });
       
    });
    $(".expandable-header .expandable .price-range").click(function(){
        var _this = $(this);
       _this.next(".expandable-content").slideToggle(function() {
     _this.find(".downArrow").toggle();
      _this.find(".upArrow").toggle();
        //$(this).next(".expandable-content").show();
        });
       
    });
    

     /* $(".meta-data-input").click(function() {
      $.cv.metaDataSummaryCustom.buildMetaFilterSearch(0);
      $.cv.metaDataSummaryCustom.redirect('MetaData', $.cv.metaDataSummaryCustom.strFilter);
    });*/

    // Range Slider
    $("#price-slider").slider({
        range: true,
        min: Math.floor($("#PriceRangeFrom").val()),
        max: Math.ceil($("#PriceRangeTo").val()),
        values: [ Math.floor($("#PriceRangeFrom").val()), Math.ceil($("#PriceRangeTo").val()) ],
        slide: function( event, ui ) {
            $("#sidebarRangeSliderValues").val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
        }
    });

    $("#sidebarRangeSliderValues").val("$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1));
    $("a.SidebarApplyButton").click(function (event) {
        $.cv.metaDataSummaryCustom.buildMetaFilterSearch(0);
        $.cv.metaDataSummaryCustom.redirect('MetaData', $.cv.metaDataSummaryCustom.strFilter);
    });
    
    // mobile filter
    
    $("select[name='CategoryFilter']").change(function() {
      var _this = $(this);
      if (_this.val() != "") {
        $.cv.util.redirect(_this.val(),{},false);
      }
    });
    
    $("#btn-mobile-apply-filter").bind("click",$.cv.metaDataSummaryCustom.buildMobileFilter);
    
    $(".filter-clear").bind("click",$.cv.metaDataSummaryCustom.clear);
    
    $(".btn-no-results-clear").bind("click",$.cv.metaDataSummaryCustom.clearAllFilters);  
    
    $.cv.metaDataSummaryCustom.reloadParameters();
  };

})(jQuery);