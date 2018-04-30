$.cv.css.enterPressedEvent = "keydown";
$(document).ready(function () {
    kendo.culture("en-AU");
    /* Turn off HTML5 Field validation */
    $("form:first").attr("novalidate", "novalidate");

    /* Set the URL to redirect to when the session times out */
    $.cv.ajax.setup({ timeoutRedirectUrl: "/session-expired" });

    /* Mobile Menu IE8 */
    if (!$.browser.msie || ($.browser.msie && $.browser.version > 8)) {
        $('#dl-menu').dlmenu();
    }

    /* -------------------------------------------------------------------- *\
       MOBILE MENU
   \* -------------------------------------------------------------------- */
    $(".widget-mobile-menu button").click(function (e) {
        var $body = $("body"),
            $mobileMenu = $(".widget-mobile-menu .mobile-menu"),
            activeClass = "shift-left";

        $mobileMenu.toggleClass(activeClass);
        $body.toggleClass(activeClass);
        $body.find("> .overlay").remove();
        if ($body.hasClass(activeClass)) {
            $body.prepend("<span class=\"overlay\"></span>");
            var $overlay = $body.find("> .overlay");
            var $menuClose = $body.find(".mobile-menu-close");
            var hideMenu = function (event) {
                if ($(event.target).closest(".widget-mobile-menu .mobile-menu .mobile-menu-close").length > 0 || (!$(event.target).closest(".widget-mobile-menu button").length && !$(event.target).closest(".widget-mobile-menu .mobile-menu").length)) {
                    // Only run this click event to hide the menu if the click event didn't bubble up from the mobile menu button or the menu itself
                    $body.removeClass(activeClass);
                    $mobileMenu.removeClass(activeClass);
                    $overlay.remove();
                    $body.unbind("click", hideMenu);
                    $menuClose.unbind("click", hideMenu);
                }
            }
            // bind to the overlay for mobile click events
            $overlay.bind("click", hideMenu);
            // bind to the body for click events anywhere on the page (mobile ignores this when the overlay is present)
            $body.bind("click", hideMenu);
            $menuClose.bind("click", hideMenu);
        }
    });

    /* --------------------------------------------------------------------- *\
        OWL Carousel
         + http://www.owlgraphic.com/owlcarousel/
    \* --------------------------------------------------------------------- */
    
    $("#homepage-gallery-slider").owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        lazyLoad: true,
        autoHeight: true,
        pagination: true,
        autoPlay: 6000, //Set AutoPlay to 3 seconds,
        stopOnHover: true //Stop Scrolling on Hover
    });

    $(".widget-banner-slider:not(#homepage-gallery-slider)").each(function () {
        var withNavigation = $(this).data("showNextPreviousButtons");
        $(this).owlCarousel({
            slideSpeed: 300,
            paginationSpeed: 400,
            singleItem: true,
            lazyLoad: true,
            autoHeight: true,
            pagination: true,
            autoPlay: 6000, //Set AutoPlay to 3 seconds,
            stopOnHover: true, //Stop Scrolling on Hover
            navigation: withNavigation
        });
    });

    $(".widget-banner-slider:not(#homepage-gallery-slider)").owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        lazyLoad: true,
        autoHeight: true,
        pagination: true,
        autoPlay: 6000, //Set AutoPlay to 3 seconds,
        stopOnHover: true //Stop Scrolling on Hover
    });

    $("#news-gallery-slider").owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        lazyLoad: true,
        autoHeight: true
    });

    $(".product-slider").each(function () {
        $.cv.css.owlCarousel.bindProductCarousel(this);
    });

    $("#product-gallery-slider").owlCarousel({
        navigation: false, // Show next and prev buttons
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        afterInit: afterOWLinit, // do some work after OWL init
        afterUpdate: afterOWLinit // update on viewport change
    });

    function afterOWLinit() {
        var owl = this;
        // adding A to div.owl-page
        $('.owl-controls .owl-page').append('<a class="item-link" href="#"/>');

        var pafinatorsLink = $('.owl-controls .item-link');

        /**
         * this.owl.userItems - it's your HTML <div class="item"><img src="http://www.ow...t of us"></div>
         */
        $.each(this.owl.userItems, function (i) {
            var background = !$(this).hasClass("video") ?
                'url("' + $(this).find('img').attr('src') + '") center center no-repeat' : "";
            var additionalClasses = !$(this).hasClass("video") ? "" : $(this).attr("class");
            var tags = $(this).data("tags");
            $(pafinatorsLink[i])
                // i - counter
                // Give some styles and set background image for pagination item
                .css({
                    'background': background
                })
                // set Custom Event for pagination item
                .click(function (e) {
                    e.preventDefault();
                    //owl.trigger('owl.goTo', i);
                    //$("#modal-zoom img").attr("href", self.anchor[0].href);
                    var zoomImage = $($("#product-gallery-slider").find(".owl-item").get(i)).find("img").data("zoomImage");
                    if (zoomImage != undefined) {
                        $("#modal-zoom img").attr("src", $($("#product-gallery-slider").find(".owl-item").get(i)).find("img").data("zoomImage"));
                    }
                })
                // add additional classes for videos so they can be styled
                .addClass(additionalClasses)
                .data("tags", tags);

        });
        $.cv.css.bind($.cv.css.eventnames.productVariantSelected, function (data) {
            //console.log(owl);
            var index = -1;

            var currentProductAttributes = $.map(data.currentProductAttributes, function (item) {
                return item.val.toLowerCase();
            });

            var item = _.find($('#product-gallery-slider .owl-controls .item-link'), function (item, idx) {
                var found = false, tags = $(item).data("tags") !== undefined ? $(item).data("tags").toString().split(",") : [];
                if (tags !== undefined) {
                    var lowerCaseTags = $.map(tags, function (n) { return n.toLowerCase(); });
                    found = _.all(lowerCaseTags, function (item) { return _.contains(currentProductAttributes, item); });
                    index = (found && index === -1) ? idx : index;
                }
                return found;
            });
            if (item != undefined) {
                item.click();
                owl.goTo(index);
            }
        });
    }


    /* -------------------------------------------------------------------- *\
        FITVIDS - Responsive Video
         + http://fitvidsjs.com/
    \* -------------------------------------------------------------------- */
    $(".video").fitVids();


    // CV Template Coupons
    $("#coupons").hide();
    $("#shipping-options").hide();

    $("#coupon-apply").click(function () {
        $("#coupons").fadeIn(600);
    });

    $("#shipping-estimate").click(function () {
        $("#shipping-options").fadeIn(700);
    });


    /* -------------------------------------------------------------------- *\
        FANCYBOX 2 - Modal Windows
         + http://fancyapps.com/fancybox/
    \* -------------------------------------------------------------------- */

    var fancyBoxOptions = {
        topRatio: "0.25",
        minWidth: "320",
        padding: "0"
    };

    $(".modal-window").fancybox(fancyBoxOptions);
    $(".modal-window-noclose")
        .fancybox($.extend({},
            fancyBoxOptions,
            {
                closeBtn: false,
                modal: "modal"
            }));

    $(".modal-window-alternate")
        .fancybox($.extend({},
            fancyBoxOptions,
            {
                wrapCSS: "modal-window-alternate"
            }));
    $(".modal-window-inside-form")
        .fancybox($.extend({},
            fancyBoxOptions,
            {
                parent: "form:first"
            }));

    /* -------------------------------------------------------------------- *\
        SCROLL TO
    \* -------------------------------------------------------------------- */
    $("#goto-review").click(function () {
        $("html,body").animate({ scrollTop: $("#review-area").offset().top }, "fast");
    });

    $("#goto-review-write").click(function () {
        $("html,body").animate({ scrollTop: $("#review-area").offset().top }, "fast", function () {
            $("#write-review").slideDown();
        });
    });

    $(".order-summary-quickview-area").hide();
    $("#order-summary-quickview-click").click(function () {
        var quickView = $(".order-summary-quickview-area");
        if (quickView.is(":hidden")) {
            $(quickView).slideDown("fast", function () {
                $("html,body").animate({ scrollTop: $(".cart-summary").offset().top - $(".cv-header-topbar").height() - $(".sticky-wrapper").height() }, "fast");
            });
        } else {
            $(quickView).slideUp("fast");
        }
    });














    /* -------------------------------------------------------------------- *\
        FILTERS

            !!! I know this is not good code, ok for templates but we need
            to review this for the actual site
    \* -------------------------------------------------------------------- */

    $("#mobile-filter .dropdown-area").hide();
    $("#mobile-filter").click(function () {
        $("#mobile-filter .dropdown-area").slideToggle();
    });

    $("#warranty-content").hide();
    $("#warranty-toggle").click(function () {
        $("#warranty-content").slideToggle();
        $("#warranty-toggle").toggleClass("cv-ico-general-arrow-down5");
    });

    $(".expandable-content").hide();
    $("body").on("click", ".expandable-toggle", function (event) {
        event.stopPropagation();
        $(this).next(".expandable-content").slideToggle();
        $(this).find(".expandable-content:first").slideToggle();
        $(this).toggleClass("cv-ico-general-arrow-down5");
    });
    $(".expandable-toggle > a").click(function (event) {
        var $this = $(this);
        event.stopPropagation();
        if ($this.parent().hasClass("all-expandable")) {
            $(this).parent().click();
            return false;
        } else {
            return true;
        }
    });
    $(".expandable-toggle li.non-expandable").click(function (event) {
        event.stopPropagation();
    });
    $(".expandable-toggle.is-visible").click();

    $("#shipping-content").hide();
    $("#shipping-toggle").click(function () {
        $("#shipping-content").slideToggle();
        $("#shipping-toggle").toggleClass("cv-ico-general-arrow-down5");
    });

    $(".reviews-content").hide();
    $("#reviews-toggle").click(function () {
        $(".reviews-content").slideToggle();
        $("#reviews-toggle").toggleClass("cv-ico-general-arrow-down5");
    });

    $("#write-review").hide();
    $("#write-toggle").click(function () {
        $("#write-review").slideToggle();
    });

    $(".shipping-dates").hide();
    $("#shippingschedule-toggle").click(function () {
        $(".shipping-dates").slideToggle();
    });


    $("#filter-1 .expandable-content").hide();
    $("#filter-1 .expandable-header").click(function () {
        $("#filter-1 .expandable-content").slideToggle();
        $("#filter-1 .expandable-header .downArrow").toggle();
        $("#filter-1 .expandable-header .upArrow").toggle();
    });

    $("#filter-2 .expandable-content").hide();
    $("#filter-2 .expandable-header").click(function () {
        $("#filter-2 .expandable-content").slideToggle();
        $("#filter-2 .expandable-header .downArrow").toggle();
        $("#filter-2 .expandable-header .upArrow").toggle();
    });

    $("#filter-3 .expandable-content").hide();
    $("#filter-3 .expandable-header").click(function () {
        $("#filter-3 .expandable-content").slideToggle();
        $("#filter-3 .expandable-header .downArrow").toggle();
        $("#filter-3 .expandable-header .upArrow").toggle();
    });

    $("#filter-4 .expandable-content").hide();
    $("#filter-4 .expandable-header").click(function () {
        $("#filter-4 .expandable-content").slideToggle();
        $("#filter-4 .expandable-header .downArrow").toggle();
        $("#filter-4 .expandable-header .upArrow").toggle();
    });


    $("#filter-5 .expandable-content").hide();
    $("#filter-5 .expandable-header").click(function () {
        $("#filter-5 .expandable-content").slideToggle();
        $("#filter-5 .expandable-header .downArrow").toggle();
        $("#filter-5 .expandable-header .upArrow").toggle();
    });

    $("#filter-6 .expandable-content").hide();
    $("#filter-6 .expandable-header").click(function () {
        $("#filter-6 .expandable-content").slideToggle();
        $("#filter-6 .expandable-header .downArrow").toggle();
        $("#filter-6 .expandable-header .upArrow").toggle();
    });

    $("#filter-7 .expandable-content").hide();
    $("#filter-7 .expandable-header").click(function () {
        $("#filter-7 .expandable-content").slideToggle();
        $("#filter-7 .expandable-header .downArrow").toggle();
        $("#filter-7 .expandable-header .upArrow").toggle();
    });




    // Expanding Area
    $("#expanding-area").hide();

    $("#expand").click(function () {
        $("#expanding-area").slideDown(400);
        $("#expand").fadeOut(400);
    });


    /* -------------------------------------------------------------------- *\
        LIST / GRID SWITCHING
    \* -------------------------------------------------------------------- */
    // $(".product-list").hide();
    $("#layout-switch-grid").click(function () {
        $("#product-grid").removeClass("detailed-list").addClass("grid");
    });
    $("#layout-switch-list").click(function () {
        $("#product-grid").removeClass("grid").addClass("detailed-list");
    });










    // Cart Row Statuses
    $("#cv-button-update").click(function () {
        $(".product-line-update").fadeIn(600).delay(1800).fadeOut(600);
    });
    $("#cv-button-remove").click(function () {
        $(".product-line-removed").fadeIn(600).delay(1800).fadeOut(600);
        $("#cart-row").delay(2200).fadeOut(600);
    });
    $("#cv-button-fav").click(function () {
        $(".product-line-addtofav").fadeIn(600).delay(1800).fadeOut(600);
    });

    // Cart update
    $("#cart-update").click(function () {
        $(".cart-update").fadeIn(600).delay(1800).fadeOut(600);
    });


    $("#cart-empty").click(function () {
        $(".cart-row").fadeOut(800);
        $(".empty-cart").delay(800).fadeIn(800);
    });


    /* -------------------------------------------------------------------- *\
        KENDO UI
         + http://demos.kendoui.com/web/overview/index.html
    \* -------------------------------------------------------------------- */
    var dataAutocomplete = [
            "Albania",
            "Andorra",
            "Armenia",
            "Austria",
            "Azerbaijan",
            "Belarus",
            "Belgium",
            "Bosnia & Herzegovina",
            "Bulgaria",
            "Croatia",
            "Cyprus",
            "Czech Republic",
            "Denmark",
            "Estonia",
            "Finland",
            "France",
            "Georgia",
            "Germany",
            "Greece",
            "Hungary",
            "Iceland",
            "Ireland",
            "Italy",
            "Kosovo",
            "Latvia",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Macedonia",
            "Malta",
            "Moldova",
            "Monaco",
            "Montenegro",
            "Netherlands",
            "Norway",
            "Poland",
            "Portugal",
            "Romania",
            "Russia",
            "San Marino",
            "Serbia",
            "Slovakia",
            "Slovenia",
            "Spain",
            "Sweden",
            "Switzerland",
            "Turkey",
            "Ukraine",
            "United Kingdom",
            "Vatican City"
    ];

    //create AutoComplete UI component
    $(".product-search-autocomplete").kendoAutoComplete({
        dataSource: dataAutocomplete,
        filter: "startswith"
    });

    //create AutoComplete UI component
    $(".ordertemplate-autocomplete").kendoAutoComplete({
        dataSource: dataAutocomplete,
        filter: "startswith"
    });



    // create DropDownList from input HTML element
    $(".cv-dropdown").kendoDropDownList();

    // NAV THEME 999
    $("[id$='EnquiryType']").kendoDropDownList();
    $("#cvfUserMaintenance select").kendoDropDownList();
    $("#formOrderComplete select").kendoDropDownList();
    $("#formOrderComplete #oc2_TBSoDeliveryDate").kendoDatePicker();

    // create DatePicker from input HTML element
    $(".form-date").kendoDatePicker();

    // create TimePicker from input HTML element
    $("input[type='time']").kendoTimePicker();

    // create DateTimePicker from input HTML element
    $(".form-datetime").kendoDateTimePicker();

    // create NumericTextBox from input HTML element
    $(".form-number").each(function () {
        $.cv.util.kendoNumericTextBox(this);
    });

    // handle click events for kendo numeric text boxes without view models
    $.cv.util.bindNonVmKendoTextBox();

    // create MaskedTextBox from input HTML element
    $(".form-credit-card").kendoMaskedTextBox({
        mask: "0000 0000 0000 0000"
    });


    // create ComboBox from select HTML element
    $(".form-combobox").kendoComboBox();

    // create ComboBox from select HTML element
    var rangeSlider = $(".range-slider");
    var min = rangeSlider.data("min");
    var max = rangeSlider.data("max");
    rangeSlider.kendoRangeSlider({
        min: min,
        max: max,
        largeStep: Math.floor((max - min) / 4)
    });


    // create TabStrip from input HTML element
    $(".cv-tabs").kendoTabStrip({
        animation: {
            open: {
                effects: "fadeIn"
            }
        }
    });

    $("#cv-sortable").kendoSortable({
        hint: function (element) {
            return element.clone().addClass("hint");
        },
        placeholder: function (element) {
            return element.clone().addClass("placeholder").text("Place Here");
        },
        cursorOffset: {
            top: -10,
            left: -230
        }
    });



    /* -------------------------------------------------------------------- *\
        ORDER TEMPLATES SEARCH
    \* -------------------------------------------------------------------- */
    $("#expandable-area").hide();
    $("#expandable-click").click(function () {
        $("#expandable-area").fadeToggle();
        $("#expandable-click").toggleClass("cv-ico-general-arrow-down5");
    });



    /* -------------------------------------------------------------------- *\
        ORDER TRACK SEARCH
    \* -------------------------------------------------------------------- */
    $("#order-track-results").hide();
    $(".search-click").click(function () {
        $("#order-track-results").slideDown();
    });



    /* -------------------------------------------------------------------- *\
       MOBILE FILTER
   \* -------------------------------------------------------------------- */
    $("#mobile-filter-expand").hide();
    $("#mobile-filter-toggle").click(function () {
        $("#mobile-filter-expand").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
        MOBILE SORT
    \* -------------------------------------------------------------------- */

    $("#mobile-sort-expand").hide();
    $("#mobile-sort-toggle").click(function () {
        $("#mobile-sort-expand").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
       CART NOTES
   \* -------------------------------------------------------------------- */
    $("#notes-toggle").hide();
    $("#notes-click").click(function () {
        $("#notes-toggle").slideToggle();
        $("#notes-click").toggleClass('active');
    });

    /* -------------------------------------------------------------------- *\
        CART FAST ORDER
    \* -------------------------------------------------------------------- */
    $("#cart-fast-order-toggle").hide();
    $("#cart-fast-order-click").click(function () {
        $("#cart-fast-order-toggle").slideToggle();
        $("#cart-fast-order-click").toggleClass('active');
    });

    /* -------------------------------------------------------------------- *\
        CART PROMO CODE
    \* -------------------------------------------------------------------- */
    $("#cart-promo-code-toggle").hide();
    $("#cart-promo-code-click").click(function () {
        $("#cart-promo-code-toggle").slideToggle();
        $("#cart-promo-code-click").toggleClass('active');
    });


    /* -------------------------------------------------------------------- *\
        ADD EXAMPLE
    \* -------------------------------------------------------------------- */
    $("#add-example").hide();
    $("#add-example-click").click(function () {
        $("#add-example").slideDown();
    });


    /* -------------------------------------------------------------------- *\
        SHIPPING DIFFERENT
    \* -------------------------------------------------------------------- */
    $("#shipping-toggle").hide();
    $("#shipping-click-yes").click(function () {
        $("#shipping-toggle").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
        CART SUMMARY ADDRESS 1 VIEW
    \* -------------------------------------------------------------------- */
    $("#cart-summary-address1-click").click(function () {
        $("#cart-summary-address1-toggle").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
        CART SUMMARY ADDRESS 2 VIEW
    \* -------------------------------------------------------------------- */
    $("#cart-summary-address2-click").click(function () {
        $("#cart-summary-address2-toggle").slideToggle();
    });


    /* -------------------------------------------------------------------- *\
        ROLE SELECT
    \* -------------------------------------------------------------------- */
    $(".widget-role-select .role-select").click(function () {
        $(".widget-role-select .dropdown-area").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
        CATALOGUE SELECT
    \* -------------------------------------------------------------------- */
    $(".widget-catalogue-select .catalogue-select").click(function () {
        $(".widget-catalogue-select .dropdown-area").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
        MULTI-BUY
    \* -------------------------------------------------------------------- */
    $(".multi-buy").click(function () {
        var product = $(this).data("productCode").toString().replace(/ /, "-");
        $(".qty-breaks[data-product-code='" + product + "']").slideToggle();
    });

    /* -------------------------------------------------------------------- *\
        COMPARE BAR TOGGLE
    \* -------------------------------------------------------------------- */
    $("#compare-toggle").click(function () {
        if ($(this).hasClass("cv-ico-general-arrow-down2")) {
            $("#product-compare-list").animate({
                height: "4px"
            }, 300, function () {
                $("#compare-toggle").removeClass().addClass("cv-ico-general-arrow-up2");
            });
        }
        else if ($(this).hasClass("cv-ico-general-arrow-up2")) {
            $("#product-compare-list").animate({
                height: "150px"
            }, 300, function () {
                $("#compare-toggle").removeClass().addClass("cv-ico-general-arrow-down2");
            });
        }
    });

    $("#compare-full-toggle").click(function () {
        $("#product-compare-list").animate({
            height: $(window).height() - $(".cv-header-topbar").height()
        }, 300, function () {
            $("body").addClass("no-scroll");
            $("#product-compare-list").addClass("expanded-compare-area");
        });
    });

    $(".product-compare-close").click(function () {
        $("#product-compare-list").animate({
            height: "150px"
        }, 300, function () {
            $("body").removeClass("no-scroll");
            $("#product-compare-list").removeClass("expanded-compare-area");
        });
    });

    $("#compare-remove-all").click(function () {
        $("body").removeClass("no-scroll");
    });


    /* -------------------------------------------------------------------- *\
        STICKY ELEMENTS
    \* -------------------------------------------------------------------- */
    var menuSpacing = parseFloat($(".cv-header-topbar").css("height")), secondLevelSticky = menuSpacing + ($(".cv-menus").length > 0 ? parseFloat($(".cv-menus").css("height")) : 0);
    $(".cv-menus").sticky({ topSpacing: menuSpacing });
    $("#sticky-heading").sticky({ topSpacing: secondLevelSticky });
    $(".checkout-heading-navigation").sticky({ topSpacing: secondLevelSticky });

    $.cv.util.fixHtmlEncodingInKendoTemplates();
    kendo.init("body");

    $("#cv-zone-container-1").on("keypress", function (e) {
        if (e.keyCode === 13) {
            // Don't want to do form submits if enter pressed in a input tag for example. But if it is a textarea then need to let it just do a newline / return so
            // bail and don't preventDefault() on the event as still need that event to continue. Also it seems if a silverlight object on the page then enter key
            // pressed in a text are within that (won't be standard dom textarea element) it will just come through as tagname object so also bail out for that.
            if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'object') {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
        }
    });

    /* -------------------------------------------------------------------- *\
    TEXT TOGGLE
    \* -------------------------------------------------------------------- */
    $(document).on('click', ".text-fade-toggle", function (e) {
        var target = $(e.target);
        var categoryBannerTextId = target.attr("data-categoryBannerTextId");
        var categoryBannerTextReadMoreButtonId = target.attr("data-categoryBannerTextReadMoreButtonId");
        $("#" + categoryBannerTextId).toggleClass("expanded");
        $("#" + categoryBannerTextReadMoreButtonId).toggleClass("showing-more");
    });

    /* -------------------------------------------------------------------- *\
        FIX FOR LOCAL STORAGE ON NON CUSTOM CART PAGE
    \* -------------------------------------------------------------------- */
    if ($('#formOrders').length > 0) {
        $('#ordergrid_btnUpdate,#ordergrid_btnEmptyCart').click(function () {
            $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrder);
            $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.currentOrderLines);
        });
    }
    $.cv.css.bind($.cv.css.eventnames.documentReady, function () {
        $.cv.css.setFieldTemplate("[id^=field-template]:first");
    }, true);
    $.cv.css.trigger($.cv.css.eventnames.documentReady, {});
});