
// WARNING: This file MUST be after cv.css.js as should most files!

;

(function ($) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.tracker = $.cv.css.tracker || {};

    var tracker = $.cv.css.tracker;

    tracker.options = {
        DataLayerName: "dataLayer",
        OnlyTrackLoggedInUser: false,
        QuestionnaireUrl: "/{0}/Thank-you/",
        TransReadyEvent: "transReady",
        CartContentsReadyEvent: "cartContentsReady",
        CartUrl: "/cart",
        CurrencyCode: "AUD",
        CurrentListType: "",
        HidePricing: false,
        ProductPricing: "inc",
        UsingZonedRecentlyViewed: false,
        DebugToConsole: true,
        IsLoggedIn: false,
        DetailImpressionUseFromList: false,
        ListTypes: {
            ProductDetail: "Product Details",
            ProductCategory: "Product List",
            SearchResults: "Search Results",
            RecentlyViewed: "Items Recently Viewed",
            MostPopular: "Most Popular",
            Campaign: "Campaign - {0}",
            CrossSell: "CrossSell",
            UpSell: "UpSell",
            CartFastOrderEntry: "Cart Fast Order",
            QuickOrderEntry: "Quick Order Entry",
            ProductCompare: "Product Compare",
            UserFavourites: "User Favourites",
            PriorPurchases: "Prior Purchases",
            CartLines: "Cart Item"
        },
        DigitalRemarketingPageTypes: {
            Default: "other",
            Home: "home",
            Category: "category",
            Product: "product",
            Cart: "cart",
            Purchase: "purchase"
        },
        TrackingEnabled: {
            EnhancedECommerce: false,
            DigitalRemarketing: false,
            ProductImpressions: true,
            RecentlyViewed: true,
            MostPopular: true,
            Campaigns: true,
            CrossSellUpSell: true,
            User: true,
            Questionnaire: true,
            Cart: true,
            TransactionProducts: true,
            CheckoutOptions: true,
            LoginSuccess: true,
            LogoutSuccess: true,
            ProductClicked: true,
            AddToCart: true,
            RemoveFromCart: true,
            CartUpdated: true,
            ApplyPromoCodeSuccess: true,
            ApplyPromoCodeFail: true,
            RemovePromoCode: true,
            OrderTracking: true,
            TemplateView: true,
            TrackingCartContentsAllPagesLoad: false
        },
        EventNames: {
            LoginSuccess: "login",
            Checkout: "checkout",
            CheckoutOption: "checkoutOption",
            EnhancedECommerce: "enhancedEcomm",
            DigitalRemarketing: "remarketing",
            LogoutSuccess: "logout",
            ProductClicked: "productClick",
            AddToCart: "addToCart",
            RemoveFromCart: "removeFromCart",
            CartUpdated: "cartUpdated",
            ApplyPromoCodeSuccess: "validPromoCode",
            ApplyPromoCodeFail: "invalidPromoCode",
            RemovedPromoCode: "removedPromoCode",
            OrderTracking: "/TrackOrder/ViewOrder/{0}",
            TemplateView: "/OrderTemplates/{0}"
        },
        EventTypes: {
            Impressions: "impression",
            Checkout: "checkout",
            Payment: "payment"
        },
        DefaultProxies: ["loginSuccess", "logoutSuccess", "addToCart", "removeFromCart", "cartUpdated", "applyPromoCodeSuccess", "applyPromoCodeSuccess"],
        PageFlags: {
            IsCart: false,
            IsCheckout: false,
            IsHomePage: false,
            IsSearchPage: false,
            IsProductPage: false,
            IsCategoryPage: false,
            IsOnlinePaymentOk: false,
            IsOrderComplete: false,
            IsLoginPage: false,
            IsProductDisplayPage: false,
            IsUserFavouritesPage: false,
            IsPriorPurchasesPage: false,
            IsProductDisplayCampaignPage: false,
            IsProductDisplayCampaignProductPage: false,
            IsPrintOrderPage: false
        }
    };

    tracker.getDataLayer = function () {
        return window[tracker.options.DataLayerName];
    };

    tracker.push = function (object) {
        if (!$.cv.util.hasValue(object) || _.isEmpty(object)) {
            return;
        }
        var l = tracker.getDataLayer();

        if (l) {
            l.push(object);
        }
    };

    tracker.init = function (obj, currentListType) {
        _.extend(tracker.options, obj, { CurrentListType: currentListType });
        window[tracker.options.DataLayerName] = [];
        tracker.setup.initDefaultProxies();
        tracker.setup.bindEvents();
        tracker.viewOrder.base();
        tracker.viewTemplate.base();
    };

    tracker.setup = {
        initDefaultProxies: function () {
            _.each(tracker.options.DefaultProxies, function (method) {
                if ($.cv.util.hasValue($.cv.css.tracker[method]) &&
                    $.cv.css.tracker[method].hasOwnProperty("base") &&
                    $.cv.util.hasValue(tracker.options.TrackingEnabled[$.cv.util.string.capitaliseFirstLetter(method)]) &&
                    tracker.options.TrackingEnabled[$.cv.util.string.capitaliseFirstLetter(method)]) {
                    $.cv.css.tracker[method].base();
                }
            });
        },
        bindEvents: function () {
            tracker.checkout.bindCheckoutEvents();
            tracker.productImpressions.bindInfiniteScrollingProducts();
            tracker.productImpressions.bindQuickViewProducts();
            tracker.productClick.bindProductClicks();
        }
    }

    tracker.proxyWarning = function (message) {
        $.cv.util.consoleMessage({ options: { type: $.cv.css.messageTypes.warning, message: message } });
    };

    tracker.track = function (context, extendOrOverride, fn) {
        if (!$.cv.util.hasValue($.cv.css.tracker[context])) {
            tracker.proxyWarning("There is no {0} method".format(context));
            return;
        }
        if (!_.contains(["extend", "override"], extendOrOverride)) {
            tracker.proxyWarning("Please only specify 'extend' or 'override' as the data manipulation method");
            return;
        }
        if (!_.isFunction(fn)) {
            tracker.proxyWarning("Please provide a valid function that returns data");
            return;
        }
        tracker.proxy.preCall($.cv.css.tracker[context], "push", function () {
            // arguments[0] = pushData, arguments[1] = rawData
            var newData = fn.call(undefined, arguments[1], arguments[0]);
            if (!$.cv.util.hasValue(newData)) {
                tracker.proxyWarning("Your function returns nothing");
            } else {
                if (extendOrOverride === "override") {
                    // As JavaScript passes parameters by value we can't just assign the new object to the argument (this won't update the value)
                    // Instead we need to remove all the properties off the object then extent with the new data
                    for (var property in arguments[0]) {
                        if (arguments[0].hasOwnProperty(property)) {
                            delete arguments[0][property];
                        }
                    }
                }
                _.extend(arguments[0], newData);
            }
        });
    };

    tracker.proxy = {
        preCall: function (context, method, fn) {
            if (!_.isFunction(fn)) {
                tracker.proxyWarning("Pre call is not a function");
                return;
            }
            $.cv.util.proxy(context, method, {
                preCall: fn
            });
        },
        postCall: function (context, method, optsPos, fn) {
            if (!_.isFunction(fn)) {
                tracker.proxyWarning("Post call is not a function");
                return;
            }
            $.cv.util.proxy(context, method, {
                postCall: function () {
                    var promise = arguments[0],
                        postCallParams = tracker.proxy.getPostCallParams(arguments, optsPos);
                    promise.done(function (response) {
                        fn.apply(context, _.union([response], postCallParams));
                    });
                }
            });
        },
        preAndPostCall: function (context, method, optsPos, preFn, postFn) {
            if (!_.isFunction(preFn) || !_.isFunction(postFn)) {
                tracker.proxyWarning("Pre call or Post call is not a function");
                return;
            }
            $.cv.util.proxy(context, method, {
                preCall: preFn,
                postCall: function () {
                    var promise = arguments[0],
                        postCallParams = tracker.proxy.getPostCallParams(arguments, optsPos);
                    promise.done(function (response) {
                        postFn.apply(context, _.union([response], postCallParams));
                    });
                }
            });
        },
        getPostCallParams: function (args, optsPos) {
            var options = args[optsPos],
                lastOption = args[args.length - 1],
                widgetName = "",
                jsWidgetName = "";
            if ($.cv.util.hasValue(lastOption) && _.isObject(lastOption) && $.cv.util.hasValue(lastOption["isProxyMeta"]) && lastOption.isProxyMeta) {
                if ($.cv.util.hasValue(lastOption["widgetName"])) {
                    widgetName = lastOption.widgetName;
                }
                if ($.cv.util.hasValue(lastOption["jsWidgetName"])) {
                    jsWidgetName = lastOption.jsWidgetName;
                }
            }
            return [options, widgetName, jsWidgetName, lastOption];
        }
    };

    tracker.util = {
        pushLargeData: function (context, baseDataMethod, args, dataArray, objKey) {
            var that = this,
                baseObj = baseDataMethod.apply(context, args);

            var base = JSON.parse(JSON.stringify(baseObj));
            _.each(dataArray, function (element, index, list) {
                if (JSON.stringify(base).length + JSON.stringify(element).length < 8000) {
                    var currVal = $.cv.util.getObjectValByString(base, objKey);
                    currVal.push(element);
                    $.cv.util.setObjectValByString(base, objKey, currVal);
                } else {
                    context.push(base, { dataArray: dataArray });
                    base = JSON.parse(JSON.stringify(baseObj));
                    $.cv.util.setObjectValByString(base, objKey, [element]);
                }
            });
            if (!_.isEmpty($.cv.util.getObjectValByString(base, objKey))) {
                context.push(base, { dataArray: dataArray });
            }
        },
        getPrice: function (price) {
            if (!$.cv.util.hasValue(price) || tracker.options.HidePricing) {
                return "0";
            }
            var formattedPrice = price.toString().replace(/[^0-9\.]+/g, "");
            return isNaN(formattedPrice) ? formattedPrice : formattedPrice.toString();
        },
        exOrIncPrice: function (ex, inc) {
            return tracker.options.ProductPricing === "inc" ? inc : ex;
        },
        localGetProductList: function () {
            return $.cv.css.getLocalStorage($.cv.css.localStorageKeys.productFromList);
        },
        localSetProductList: function (list) {
            $.cv.css.setLocalStorage($.cv.css.localStorageKeys.productFromList, list);
        },
        localRemoveProductList: function () {
            $.cv.css.removeLocalStorage($.cv.css.localStorageKeys.productFromList);
        },
        //check if Google Analytics is being blocked
        isAnalyticsEnabled: function () {
            return (window.ga != null && ga.create != null);
        }
    };

    tracker.eventBase = {
        base: null,
        push: function (pushData, rawData) {
            if (tracker.options.DebugToConsole) {
                $.cv.util.consoleMessage({ options: { type: $.cv.css.messageTypes.info, pushData: pushData, source: "tracker" } });
            }
            tracker.push(pushData);
            return $.Deferred().resolve(pushData);
        }
    };

    tracker.pageType = _.extend({}, tracker.eventBase, {
        base: function (products, order) {
            var pushData = {
                event: tracker.options.EventNames.DigitalRemarketing,
                ecomm_pagetype: tracker.options.DigitalRemarketingPageTypes.Default
            }

            if (tracker.options.PageFlags.IsHomePage) {
                pushData.ecomm_pagetype = tracker.options.DigitalRemarketingPageTypes.Home;
            }
            if ((tracker.options.PageFlags.IsCart ||
                tracker.options.PageFlags.IsOnlinePaymentOk ||
                tracker.options.PageFlags.IsOrderComplete) && $.cv.util.hasValue(order) && order.length > 0) {
                order = JSON.parse(order);
                // Get the products off the order
                products = _.map(order[0].StockLines, function (line) {
                    return {
                        ProductCode: line.StockCode
                    }
                });
            }
            if (!_.isArray(products) ||
                !(
                    tracker.options.PageFlags.IsProductPage ||
                    tracker.options.PageFlags.IsCategoryPage ||
                    tracker.options.PageFlags.IsCart ||
                    tracker.options.PageFlags.IsOnlinePaymentOk ||
                    tracker.options.PageFlags.IsOrderComplete)) {
                this.push(pushData, {});
                return;
            }

            //var 
            if (tracker.options.PageFlags.IsProductPage) {
                pushData.ecomm_pagetype = tracker.options.DigitalRemarketingPageTypes.Product;
                pushData.ecomm_prodid = products[0].ProductCode;
                if (!tracker.options.HidePricing) {
                    pushData.ecomm_totalvalue = tracker.util.getPrice(tracker.util.exOrIncPrice(products[0].PriceForOneEx, products[0].PriceForOneInc));
                }
                this.push(pushData, {});
                return;
            } else {
                pushData.ecomm_prodid = _.pluck(products, "ProductCode");
            }
            if (tracker.options.PageFlags.IsCategoryPage) {
                pushData.ecomm_pagetype = tracker.options.DigitalRemarketingPageTypes.Category;
            } else {
                pushData.ecomm_totalvalue = $.cv.util.hasValue(order[0]) ? order[0].OrderTotalAmount : 0;
                if (tracker.options.PageFlags.IsCart) {
                    pushData.ecomm_pagetype = tracker.options.DigitalRemarketingPageTypes.Cart;
                } else if (tracker.options.PageFlags.IsOnlinePaymentOk || tracker.options.PageFlags.IsOrderComplete) {
                    pushData.ecomm_pagetype = tracker.options.DigitalRemarketingPageTypes.Purchase;
                    pushData.google_conversion_value = $.cv.util.hasValue(order[0]) ? order[0].OrderTotalAmount : 0;
                }
            }
            this.push(pushData, { products: products, order: order[0] });
        }
    });

    tracker.productImpressions = _.extend({}, tracker.eventBase, {
        base: function (data, listType) {
            if (!$.cv.util.hasValue(data) || data.length === 0) {
                return;
            }

            tracker.productImpressions.updateProducts(data, listType);

            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.ProductImpressions) {
                return;
            }
            var productImpressions = {
                event: tracker.options.EventNames.EnhancedECommerce,
                event_type: tracker.options.EventTypes.Impressions,
                ecommerce: {
                    currencyCode: tracker.options.CurrencyCode
                }
            };

            if (listType === tracker.options.ListTypes.ProductDetail) {
                var fromList = tracker.util.localGetProductList();
                if (tracker.options.DetailImpressionUseFromList && !$.cv.util.isNullOrWhitespace(fromList)) {
                    listType = fromList;
                }
                tracker.util.localRemoveProductList();
                productImpressions.ecommerce.detail = {
                    actionField: {
                        list: listType
                    },
                    products: [
                    {
                        name: data[0].Description,
                        id: data[0].ProductCode,
                        category: data[0].CategoryHierarchy,
                        brand: data[0].BrandText
                    }]
                }
                if (!tracker.options.HidePricing) {
                    productImpressions.ecommerce.detail.products[0].price = tracker.util.getPrice(tracker.util.exOrIncPrice(data[0].PriceForOneEx, data[0].PriceForOneInc));
                }
            } else {
                tracker.productImpressions.infiniteScrollingOpts.ListType = listType;
                productImpressions.ecommerce.detail = {
                    actionField: {
                        list: listType
                    }
                }
                productImpressions.ecommerce.impressions = _.map(data, function (item) {
                    var product = {
                        name: item.Description,
                        id: item.ProductCode,
                        list: listType,
                        category: item.CategoryHierarchy,
                        brand: item.BrandText,
                        position: item.Index + 1 // index is zero based need to make it start @1
                    };
                    if (!tracker.options.HidePricing) {
                        product.price = tracker.util.getPrice(tracker.util.exOrIncPrice(item.PriceForOneEx, item.PriceForOneInc));
                    }
                    return product;
                });
            }
            this.pushProducts(productImpressions, data);
        },
        getProductImpressionsObject: function (pushData) {
            return {
                event: pushData.event,
                event_type: pushData.event_type,
                ecommerce: {
                    currencyCode: pushData.ecommerce.currencyCode,
                    impressions: []
                }
            };
        },
        pushProducts: function (pushData, rawData) {
            var isProductDetail = $.cv.util.hasValue(pushData) && $.cv.util.hasValue(pushData.ecommerce) && $.cv.util.hasValue(pushData.ecommerce.detail);
            if (isProductDetail) {
                this.push(pushData, rawData);
            } else {
                tracker.productImpressions.pushProductImpressions(pushData);
            }
        },
        pushProductImpressions: function (pushData) {
            tracker.util.pushLargeData(this, this.getProductImpressionsObject, [pushData], pushData.ecommerce.impressions, "ecommerce.impressions");
        },
        bindInfiniteScrollingProducts: function () {
            $.cv.css.bind($.cv.css.eventnames.infiniteScrollingPageLoaded, function (data) {
                if ($.cv.util.isNullOrWhitespace(data.productImpressions)) {
                    return;
                }
                var products = JSON.parse(data.productImpressions);
                tracker.productImpressions.base(products, tracker.productImpressions.infiniteScrollingOpts.ListType);
                if (!tracker.options.PageFlags.IsSearchPage) {
                    tracker.pageType.base(products, []);
                }
            });
        },
        bindQuickViewProducts: function () {
            $.cv.css.bind($.cv.css.eventnames.quickViewProductLoaded, function (data) {
                if ($.cv.util.isNullOrWhitespace(data.productImpressions) || $.cv.util.isNullOrWhitespace(data.widgetElement)) {
                    return;
                }
                var product = JSON.parse(data.productImpressions);
                var listType = data.widgetElement.parentsUntil("[data-list-type]").parent().data("listType");

                if (!$.cv.util.hasValue(listType)) {
                    return;
                }

                var productData = tracker.productImpressions.findProduct(product[0].ProductCode, listType);
                // If this product has already been pushed don't push it again
                if ($.cv.util.hasValue(productData.foundInList) && productData.foundInList) {
                    return;
                }

                // Ensure the quick view product is pushed with the correct index
                if ($.cv.util.hasValue(tracker.productImpressions.products[listType])) {
                    product[0].Index = tracker.productImpressions.products[listType].length;
                }

                tracker.productImpressions.base(product, listType);
                if (!tracker.options.PageFlags.IsSearchPage) {
                    tracker.pageType.base(product, []);
                }
            });
        },
        infiniteScrollingOpts: { ListType: "" },
        updateProducts: function (products, listType) {
            if (tracker.options.TrackingEnabled.ProductClicked) {
                if (!$.cv.util.hasValue(tracker.productImpressions.products[listType])) {
                    tracker.productImpressions.products[listType] = products;
                } else {
                    tracker.productImpressions.products[listType] = _.union(tracker.productImpressions.products[listType], products);
                }
            }
        },
        findProduct: function (productCode, list) {
            var product = null,
                foundInList = true;

            productCode = productCode.toString();

            // Check the product can be found in the list
            if ($.cv.util.hasValue(tracker.productImpressions.products[list])) {
                product = _.find(tracker.productImpressions.products[list], function (item) {
                    return ($.cv.util.hasValue(item.ProductCode) && item.ProductCode.toString() === productCode) ||
                    ($.cv.util.hasValue(item.productCode) && item.productCode.toString() === productCode) ||
                    ($.cv.util.hasValue(item.StockCode) && item.StockCode.toString() === productCode);
                });
            }

            // If the product was not found in the list check if it exists in any list
            if (!$.cv.util.hasValue(product)) {
                foundInList = false;
                _.every(tracker.productImpressions.products, function (products) {
                    product = _.find(products, function (item) {
                        return ($.cv.util.hasValue(item.ProductCode) && item.ProductCode.toString() === productCode) ||
                        ($.cv.util.hasValue(item.productCode) && item.productCode.toString() === productCode) ||
                        ($.cv.util.hasValue(item.StockCode) && item.StockCode.toString() === productCode);
                    });
                    // When you find a value break out and don't process the rest of the lists
                    return !$.cv.util.hasValue(product);
                });
            }
            return $.cv.util.hasValue(product) ? { foundInList: foundInList, product: product } : { foundInList: false, product: {} };
        },
        products: {}
    });

    tracker.recentlyViewedProducts = _.extend({}, tracker.eventBase, {
        base: function (maxNumberOfProducts) {
            if (!$.cv.util.hasValue(maxNumberOfProducts)) {
                return;
            }

            var that = this;
            $.cv.css.bind($.cv.css.eventnames.recentlyViewedProductsSet, function (data) {
                if ($.cv.util.isNullOrWhitespace(data.productImpressions)) {
                    return;
                }
                var products = data.isJson ? JSON.parse(data.productImpressions) : data.productImpressions;
                that.recentlyViewedProductsSet(maxNumberOfProducts, products);
            });

        },
        recentlyViewedProductsSet: function (maxNumberOfProducts, prods) {
            if (!$.cv.util.hasValue(prods) || prods.length === 0) {
                return;
            }
            var products = _.first(prods, maxNumberOfProducts);
            products = _.map(products, function (product, index) {
                product.index = index + 1; // key is zero based need to make it start @1
                return product;
            });
            tracker.productImpressions.updateProducts(products, tracker.options.ListTypes.RecentlyViewed);
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.RecentlyViewed) {
                return;
            }
            var productImpressions = {
                event: tracker.options.EventNames.EnhancedECommerce,
                event_type: tracker.options.EventTypes.Impressions,
                ecommerce: {
                    currencyCode: tracker.options.CurrencyCode
                }
            };
            if (!$.cv.util.hasValue(products) || products.length === 0) {
                return;
            }
            var impressions = _.map(products, function (item, index) {
                var product = {
                    name: !tracker.options.UsingZonedRecentlyViewed ? item.description : item.Description,
                    id: !tracker.options.UsingZonedRecentlyViewed ? item.productCode : item.ProductCode,
                    list: tracker.options.ListTypes.RecentlyViewed,
                    category: !tracker.options.UsingZonedRecentlyViewed ? item.categoryHierarchy : item.CategoryHierarchy,
                    brand: !tracker.options.UsingZonedRecentlyViewed ? item.brandText : item.BrandText,
                    position: !tracker.options.UsingZonedRecentlyViewed ? item.index : (item.Index + 1) // key is zero based need to make it start @1
                };
                if (!tracker.options.HidePricing) {
                    product.price = !tracker.options.UsingZonedRecentlyViewed ? tracker.util.getPrice(tracker.util.exOrIncPrice(item.priceForOneEx, item.priceForOneInc)) : tracker.util.getPrice(tracker.util.exOrIncPrice(item.PriceForOneEx, item.PriceForOneInc));
                }
                return product;
            });
            productImpressions.ecommerce.impressions = impressions;
            this.push(productImpressions, products);
        },
        push: function (pushData, rawData) {
            tracker.productImpressions.pushProductImpressions(pushData);
        }
    });

    tracker.mostPopularProducts = _.extend({}, tracker.eventBase, {
        base: function (maxNumberOfProducts) {
            if (!$.cv.util.hasValue(maxNumberOfProducts)) {
                return;
            }

            var that = this;
            $.cv.css.bind($.cv.css.eventnames.mostPopularProductsSet, function (data) {
                if ($.cv.util.isNullOrWhitespace(data.productImpressions)) {
                    return;
                }
                var products = JSON.parse(data.productImpressions);
                that.mostPopularProductsSet(maxNumberOfProducts, products);
            });

        },
        mostPopularProductsSet: function (maxNumberOfProducts, prods) {
            if (!$.cv.util.hasValue(prods) || prods.length === 0) {
                return;
            }
            var products = _.first(prods, maxNumberOfProducts);
            products = _.map(products, function (product, index) {
                product.index = index + 1; // key is zero based need to make it start @1
                return product;
            });
            tracker.productImpressions.updateProducts(products, tracker.options.ListTypes.MostPopular);
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.MostPopular) {
                return;
            }
            var productImpressions = {
                event: tracker.options.EventNames.EnhancedECommerce,
                event_type: tracker.options.EventTypes.Impressions,
                ecommerce: {
                    currencyCode: tracker.options.CurrencyCode
                }
            };
            if (!$.cv.util.hasValue(products) || products.length === 0) {
                return;
            }
            var impressions = _.map(products, function (item, index) {
                var product = {
                    name: item.Description,
                    id: item.ProductCode,
                    list: tracker.options.ListTypes.MostPopular,
                    category: item.CategoryHierarchy,
                    brand: item.BrandText,
                    position: item.Index + 1 // key is zero based need to make it start @1
                };
                if (!tracker.options.HidePricing) {
                    product.price = tracker.util.getPrice(tracker.util.exOrIncPrice(item.PriceForOneEx, item.PriceForOneInc));
                }
                return product;
            });
            productImpressions.ecommerce.impressions = impressions;
            this.push(productImpressions, products);
        },
        push: function (pushData, rawData) {
            tracker.productImpressions.pushProductImpressions(pushData);
        }
    });

    tracker.productClick = _.extend({}, tracker.eventBase, {
        base: function (product, list, link) {
            if (!$.cv.util.hasValue(product)) {
                return;
            }

            var price = 0,
                name = "",
                id = "",
                category = "",
                brand = "",
                position = null;

            if (list === tracker.options.ListTypes.RecentlyViewed && !tracker.options.UsingZonedRecentlyViewed) {
                price = !tracker.options.HidePricing ? tracker.util.getPrice(tracker.util.exOrIncPrice(product.priceForOneEx, product.priceForOneInc)) : 0;
                name = product.description;
                id = product.productCode;
                category = product.categoryHierarchy;
                brand = product.brandText;
                position = product.index;
            } else if (list === tracker.options.ListTypes.CartLines) {
                price = !tracker.options.HidePricing ? tracker.util.getPrice(product.OrderItemPrice) : 0;
                name = product.Description;
                id = product.StockCode;
                category = product.Product[0].CategoryHierarchy;
                brand = product.Product[0].BrandText;
            } else {
                price = !tracker.options.HidePricing ? tracker.util.getPrice(tracker.util.exOrIncPrice(product.PriceForOneEx, product.PriceForOneInc)) : 0;
                name = product.Description;
                id = product.ProductCode;
                category = product.CategoryHierarchy;
                brand = product.BrandText;
                position = product.Index + 1;
            }

            var pushData = {
                event: tracker.options.EventNames.ProductClicked,
                ecommerce: {
                    click: {
                        actionField: {
                            list: list
                        },
                        products: [
                            {
                                name: name,
                                id: id,
                                category: category,
                                brand: brand
                            }
                        ]
                    }
                },
                eventCallback: function () {
                    document.location = link;
                }
            }
            if (!tracker.options.HidePricing) {
                pushData.ecommerce.click.products[0].price = price;
            }
            if ($.cv.util.hasValue(position)) {
                pushData.ecommerce.click.products[0].position = position;
            }
            tracker.util.localSetProductList(list);
            this.push(pushData, { product: product, list: list, link: link });
        },
        bindProductClicks: function () {
            if (!tracker.options.TrackingEnabled.ProductClicked) {
                return;
            }

            // Push the order lines data into a product impressions array so that the data can be extracted on a product click
            $.cv.css.bind($.cv.css.eventnames.cartLinesRendered, function (data) {
                if ($.cv.util.hasValue(data) && $.cv.util.hasValue(data.lines)) {
                    tracker.productImpressions.products[tracker.options.ListTypes.CartLines] = [];
                    tracker.productImpressions.updateProducts(JSON.parse(JSON.stringify(data.lines)), tracker.options.ListTypes.CartLines);
                }
            });

            $.cv.css.bind($.cv.css.eventnames.documentReady, function () {
                $("[data-list-type]").on("click", "a[data-product-link]", function (event) {
                    var dataPushed = false;
                    var $this = $(this),
                        productCode = $this.data("productLink");
                    var list = $(event.delegateTarget).data("listType");
                    if ($.cv.util.hasValue(list) && $.cv.util.hasValue(tracker.productImpressions.products[list])) {
                        var productData = tracker.productImpressions.findProduct(productCode, list);
                        if ($.cv.util.hasValue(productData.product)) {
                            tracker.productClick.base(productData.product, list, $this.attr("href"));
                            dataPushed = true;
                        }
                    }
                    if (dataPushed) {
                        // only prevent the default method if the data is pushed as the event call back will be fired and do the redirect
                        if (tracker.util.isAnalyticsEnabled()) {
                            event.preventDefault();
                        }
                    }
                });
            });
        }
    });

    tracker.userDetail = _.extend({}, tracker.eventBase, {
        base: function (data) {
            if (!tracker.options.TrackingEnabled.User ||
                !$.cv.util.hasValue(data) ||
                data.length === 0 ||
                (tracker.options.OnlyTrackLoggedInUser && !data[0].IsUserLoggedIn)) {
                return;
            }
            var user = {
                User_ID: data[0].UserId.toString()
            }
            this.push(user, data[0]);
        }
    });

    tracker.questionnaire = _.extend({}, tracker.eventBase, {
        base: function (data) {
            if (!tracker.options.TrackingEnabled.Questionnaire || !$.cv.util.hasValue(data) || !data.IsThankYouPage) {
                return;
            }
            var url = tracker.options.QuestionnaireUrl.format(data.Name);
            this.push({ virtualURL: url }, data);
        }
    });

    tracker.checkout = _.extend({}, tracker.eventBase, {
        bindCheckoutEvents: function () {
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.CheckoutOptions) {
                return;
            }
            var that = this;

            // Step 1 - going to the cart
            // Step 2 - attempting to checkout but need to log in
            // Step 3 - going to the delivery options
            // Step 4 - going to the payment options
            // Step 5 - going to submit the order

            $.cv.css.bind($.cv.css.eventnames.documentReady, function () {
                $("body").on("click", "a[href=\"" + tracker.options.CartUrl + "\"]", function (event) {
                    if (tracker.util.isAnalyticsEnabled()) {
                        event.preventDefault();
                    }

                    that.base(1, function () {
                        document.location = tracker.options.CartUrl;
                    });
                });
            });

            if (tracker.options.PageFlags.IsCart) {
                $.cv.css.bind($.cv.css.eventnames.preOrderSubmit, function (data) {
                    if (!tracker.util.isAnalyticsEnabled()) {
                        that.postOrderSubmit.resolve();
                        $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                        return;
                    }
                    $.cv.css.addRemoveSubmitPromiseObjects("true", "tracker", that.postOrderSubmit.promise());
                    // Getting here the order will have been validated
                    var step;
                    if (tracker.options.IsLoggedIn) {
                        // Navigating to the checkout page, delivery options
                        step = 3;
                    } else {
                        if (data.data.urlRequiresAuthentication) {
                            // Heading to the login page
                            step = 2;
                        } else {
                            // Using guest checkout, render payment step
                            var usingGuestCheckout = $.cv.util.hasValue($.cv.css.localGetUsingGuestCheckout()) ? $.cv.css.localGetUsingGuestCheckout() : false;
                            if (!usingGuestCheckout) {
                                step = 2;
                            } else {
                                // User has previously navigated to the checkout and selected guest checkout
                                step = 4;
                            }
                        }
                    }
                    that.base(step, function () {
                        that.postOrderSubmit.resolve();
                        $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                    });
                });
            }

            var redirectUrl = $.cv.util.queryStringValue("R");
            if (tracker.options.PageFlags.IsCheckout || (tracker.options.PageFlags.IsLoginPage && !$.cv.util.isNullOrWhitespace(redirectUrl) && $.cv.util.string.startsWith(redirectUrl.toLowerCase(), "checkout.aspx"))) {
                tracker.proxy.preCall($.cv.css, "login", function (response, options, widgetName, jsWidgetName, proxyMeta) {
                    // In this circumstance we are only tracking the intention not the actual result, here the intention was to log in
                    that.base(3);
                });
            }

            if (tracker.options.PageFlags.IsCheckout) {
                $.cv.css.bind($.cv.css.eventnames.continueToPayment, that.continueToPayment);
                $.cv.css.bind($.cv.css.eventnames.backToAddress, that.backToAddress);
                $.cv.css.bind($.cv.css.eventnames.preOrderSubmit, function (data) {
                    if (!tracker.util.isAnalyticsEnabled()) {
                        that.postOrderSubmit.resolve();
                        $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                        return;
                    }
                    $.cv.css.addRemoveSubmitPromiseObjects("true", "tracker", that.postOrderSubmit.promise());
                    // Getting here the order will have been validated
                    that.base(5, function () {
                        that.postOrderSubmit.resolve();
                        $.cv.css.trigger($.cv.css.eventnames.widgetPreOrderSubmitComplete);
                    });
                });
            }
            tracker.checkoutOption.bindCheckoutOptionEvents();
        },
        postOrderSubmit: $.Deferred(),
        continueToPayment: function () {
            tracker.checkout.base(4);
        },
        backToAddress: function () {
            tracker.checkout.base(3);
        },
        base: function (step, eventCallback) {
            var stockLines = _.filter($.cv.css.localGetCurrentOrderLines(), function (line) { return $.cv.util.hasValue(line.Product); });
            var products = !$.cv.util.hasValue(stockLines) || stockLines.length === 0 ? [] : _.map(stockLines, function (line, lineIndex) {
                var lineDetail = {
                    id: line.StockCode,
                    name: line.Description,
                    category: line.Product[0].CategoryHierarchy,
                    quantity: line.OrderedQty
                };
                if (!tracker.options.HidePricing) {
                    lineDetail.price = tracker.util.getPrice(line.OrderItemPrice);
                }
                return lineDetail;
            });
            var pushData = {
                event: tracker.options.EventNames.Checkout,
                event_type: tracker.options.EventTypes.Checkout,
                ecommerce: {
                    checkout: {
                        actionField: {
                            step: step
                        },
                        products: products
                    }
                }
            }
            if ($.cv.util.hasValue(eventCallback) && $.isFunction(eventCallback)) {
                pushData.eventCallback = eventCallback;
            }
            this.push(pushData, { step: step });
        }
    });

    tracker.checkoutOption = _.extend({}, tracker.eventBase, {
        base: function (step, option) {
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.CheckoutOptions || !$.cv.util.hasValue(step) || $.cv.util.isNullOrWhitespace(option)) {
                return;
            }
            var pushData = {
                event: tracker.options.EventNames.CheckoutOption,
                event_type: tracker.options.EventTypes.Checkout,
                ecommerce: {
                    checkout_option: {
                        actionField: {
                            step: step,
                            option: option
                        }
                    }
                }
            };
            this.push(pushData, {});
        },
        bindCheckoutOptionEvents: function () {
            var that = this;
            if (tracker.options.PageFlags.IsCheckout) {
                if (tracker.options.IsLoggedIn) {
                    that.bindFreightChanged();
                    $.cv.css.bind($.cv.css.eventnames.continueToPayment, function () {
                        that.bindPaymentOptionChanged();
                    });
                } else {
                    var usingGuestCheckout = $.cv.css.localGetUsingGuestCheckout();
                    if (usingGuestCheckout) {
                        that.bindFreightChanged();
                        that.bindPaymentOptionChanged();
                    }
                    tracker.proxy.preCall($.cv.css.guestCheckout, "toggleUsingGuestCheckout", function () {
                        usingGuestCheckout = $.cv.css.localGetUsingGuestCheckout();
                        var bindEvents = $.cv.util.hasValue(usingGuestCheckout) ? !usingGuestCheckout : true;
                        if (bindEvents) {
                            that.bindFreightChanged();
                            that.bindPaymentOptionChanged();
                            $.cv.css.trigger($.cv.css.eventnames.continueToPayment);
                        } else {
                            // Hiding the address etc
                            tracker.checkout.base(2);
                        }
                    });
                }
            }
        },
        bindFreightChanged: function () {
            if (!tracker.checkoutOption.freightOptionChangeBound) {
                tracker.proxy.postCall($.cv.css.freightCarrier, "setFreightForCurrentOrder", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                    if (response.data.result) {
                        if (!$.cv.util.isNullOrWhitespace(options.warehouseCode)) {
                            tracker.checkoutOption.base(3, "Pickup - {0}".format(options.warehouseCode));
                        } else if (!$.cv.util.isNullOrWhitespace(options.ownCarrierAccount)) {
                            tracker.checkoutOption.base(3, "Own Carrier - {0}".format(options.ownCarrierAccount));
                        } else {
                            var selectedFreight = _.find(proxyMeta.itemList, function (item) { return item.ID.toString() === options.freightOptionIDs[0].toString() });
                            if ($.cv.util.hasValue(selectedFreight)) {
                                tracker.checkoutOption.base(3, selectedFreight.CarrierDescription);
                            }
                        }
                    }
                });
            }
        },
        bindPaymentOptionChanged: function () {
            if (!tracker.checkoutOption.selectedPaymentOptionChangeBound) {
                $.cv.css.bind($.cv.css.eventnames.selectedPaymentOptionChanged, function (data) {
                    tracker.checkoutOption.base(4, data);
                });
            }
        },
        freightOptionChangeBound: false,
        selectedPaymentOptionChangeBound: false
    });

    tracker.transactionProducts = _.extend({}, tracker.eventBase, {
        base: function (data) {
            if (!$.cv.util.hasValue(data) || data.length === 0) {
                return;
            }
            data = JSON.parse(data);
            var pushData = {};
            if (tracker.options.TrackingEnabled.EnhancedECommerce && tracker.options.TrackingEnabled.TransactionProducts) {
                pushData = _.map(data, function (order, index) {
                    return {
                        event: tracker.options.EventNames.EnhancedECommerce,
                        event_type: tracker.options.EventTypes.Payment,
                        ecommerce: {
                            purchase: {
                                actionField: {
                                    id: order.SoOrderNo.toString(),
                                    revenue: order.OrderTotalAmount,
                                    tax: order.OrderTotalTax,
                                    shipping: order.FreightChargeAmount
                                },
                                products: _.map(order.StockLines, function (line, lineIndex) {
                                    var lineDetail = {
                                        id: line.StockCode,
                                        name: line.Description,
                                        category: line.Product[0].CategoryHierarchy,
                                        quantity: parseInt(line.OrderedQtyString),
                                        brand: line.Product[0].BrandText
                                    };
                                    if (!tracker.options.HidePricing) {
                                        lineDetail.price = tracker.util.getPrice(line.OrderItemPrice);
                                    }
                                    return lineDetail;
                                })
                            }
                        }
                    }
                });
                this.push(pushData[0], data);
            } else {
                pushData = _.map(data, function (order, index) {
                    return {
                        transactionId: order.SoOrderNo,
                        transactionTotal: order.OrderTotalAmount,
                        transactionTax: order.OrderTotalTax,
                        transactionShipping: order.FreightChargeAmount,
                        transactionProducts: _.map(order.StockLines, function (line, lineIndex) {
                            return {
                                id: line.LineSeq.toString(),
                                sku: line.StockCode,
                                name: line.Description,
                                price: line.NetItemPrice, // For backwards compatibility, we currently don't check the pricing flag when sending through the transaction details here
                                category: line.Product[0].CategoryHierarchy,
                                quantity: parseInt(line.OrderedQtyString),
                                brand: line.Product[0].BrandText
                            }
                        }),
                        event: tracker.options.TransReadyEvent
                    }
                });
                this.push(pushData, data);
            }
        }
    });

    tracker.cartContentsAllPages = _.extend({}, tracker.eventBase, {
        base: function (data) {
            if (!$.cv.util.hasValue(data) || data.length === 0) {
                return;
            }

            data = JSON.parse(data);
            var pushData = {};

            if (tracker.options.TrackingEnabled.TrackingCartContentsAllPagesLoad ) {
                pushData = _.map(data, function (order) {
                    return {
                        cartContentsId: order.SoOrderNo,
                        cartContentsTotal: order.OrderTotalAmount,
                        cartContentsTax: order.OrderTotalTax,
                        cartContentsShipping: order.FreightChargeAmount,
                        cartContentsProducts: _.map(order.StockLines, function (line) {
                            return {
                                id: line.LineSeq.toString(),
                                sku: line.StockCode,
                                name: line.Description,
                                price: line.NetItemPrice, // For backwards compatibility, we currently don't check the pricing flag when sending through the transaction details here
                                category: line.Product[0].CategoryHierarchy,
                                quantity: parseInt(line.OrderedQtyString),
                                brand: line.Product[0].BrandText,
                                url: line.Product[0].ExternalUrl,
                                imageUrl: line.Product[0].ExternalImageUrl
                            }
                        }),
                        event: tracker.options.CartContentsReadyEvent
                    }
                });
                this.push(pushData[0], data);
            }
        }
    });

    tracker.loginSuccess = _.extend({}, tracker.eventBase, {
        base: function () {
            if ((tracker.options.TrackingEnabled.EnhancedECommerce && tracker.options.TrackingEnabled.CheckoutOptions) || tracker.options.TrackingEnabled.LoginSuccess) {
                var that = this;
                tracker.proxy.postCall($.cv.css, "login", 3, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                    var success = response.data.result === 0 || response.data.result === 15 || response.data.result === 16;
                    if (success) {
                        if (tracker.options.TrackingEnabled.LoginSuccess) {
                            that.push({ event: tracker.options.EventNames.LoginSuccess, widgetName: widgetName }, {});
                        }
                    }
                });
            }
        }
    });

    tracker.logoutSuccess = _.extend({}, tracker.eventBase, {
        base: function () {
            if (!tracker.options.TrackingEnabled.LogoutSuccess) {
                return;
            }
            var that = this;
            tracker.proxy.postCall($.cv.css, "logout", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.push({ event: tracker.options.EventNames.LogoutSuccess, widgetName: widgetName }, {});
            });
        }
    });

    tracker.addToCart = _.extend({}, tracker.eventBase, {
        base: function () {
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.AddToCart) {
                return;
            }
            var that = this;
            tracker.proxy.preCall($.cv.css, "addToCurrentOrder", function () {
                // This call always on calls $.cv.css.orders.addToCurrentOrderBulk so we need to forward on the widget name that called this method
                var postCallParams = tracker.proxy.getPostCallParams(arguments, 0);
                _.extend($.cv.css._proxyMeta, postCallParams[postCallParams.length - 1]);

                // Get the list the product was added from
                var list = "";
                if ($.cv.util.hasValue($.cv.css._proxyMeta) && $.cv.util.hasValue($.cv.css._proxyMeta.widgetElement)) {
                    list = $.cv.css._proxyMeta.widgetElement.closest("[data-list-type]").data("listType");
                }
                if ($.cv.util.isNullOrWhitespace(list)) {
                    list = tracker.options.CurrentListType;
                }
                that.productsAddedToCart.push({ ProductCode: arguments[0].productCode, Guid: $.cv.css.guid(), List: list, proxyMeta: $.cv.css._proxyMeta });
            });
            tracker.proxy.postCall($.cv.css.orders, "addToOrder", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.addedToCart(response, options, widgetName, jsWidgetName, proxyMeta);
            });
            tracker.proxy.postCall($.cv.css.orders, "addToCurrentOrderBulk", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.addedToCart(response, options, widgetName, jsWidgetName, proxyMeta);
            });
        },
        addedToCart: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            var that = this,
                allListProducts = {};

            // If the productsAddedToCart array is not empty the products were added individually
            var listType = $.cv.util.hasValue(proxyMeta) && $.cv.util.hasValue(proxyMeta.widgetElement) ? proxyMeta.widgetElement.closest("[data-list-type]").data("listType") : "";
            if ($.cv.util.isNullOrWhitespace(listType)) {
                listType = tracker.options.CurrentListType;
            }
            var allProducts = _.map(options.batchData, function (product, index) {
                return {
                    ProductCode: product.productCode,
                    Quantity: product.quantity,
                    List: listType,
                    ReturnedLineData: response.data[index].result[0],
                    AddedSuccessfully: response.data[index].editOrderOk
                }
            });

            if (_.isEmpty(allProducts)) {
                return;
            }

            if (!_.isEmpty(that.productsAddedToCart)) {
                // For all the added products see if one matches the batch data so we can get the proxy data and determine the list it was added from
                _.each(allProducts, function (batchProduct) {
                    var singleProduct = _.find(that.productsAddedToCart, function (addedProduct) {
                        return addedProduct.ProductCode === batchProduct.ProductCode;
                    });
                    if ($.cv.util.hasValue(singleProduct)) {
                        batchProduct.List = singleProduct.List;
                        // Pop this single product off the array so it is not processed again if another AJAX call returns
                        that.productsAddedToCart = _.filter(that.productsAddedToCart, function (product) {
                            return product.Guid !== singleProduct.Guid;
                        });
                    }
                });
            }

            _.each(allProducts, function (product) {
                if (product.AddedSuccessfully) {
                    // If it is a new list create a new array to hold the products from this list
                    if (!$.cv.util.hasValue(allListProducts[product.List])) {
                        allListProducts[product.List] = [];
                    }

                    // Find and get the product push object
                    var productPushData = that.getAddedToCartProductObject(product, product.List);
                    if (!_.isEmpty(productPushData)) {
                        allListProducts[product.List].push(productPushData);
                    }
                }
            });

            // Loop through all the different lists and push them separately to the data layer
            _.each(allListProducts, function (productList, listName) {
                that.pushAddToCart(productList, listName);
            });
        },
        productsAddedToCart: [],
        getAddedToCartObject: function (list) {
            return {
                event: tracker.options.EventNames.AddToCart,
                ecommerce: {
                    currencyCode: tracker.options.CurrencyCode,
                    add: {
                        products: []
                    }
                },
                pageType: tracker.options.CurrentListType,
                list: list
            };
        },
        getAddedToCartProductObject: function (product, list) {
            var pushData = {},
                productData = tracker.productImpressions.findProduct(product.ProductCode, list);
            if ($.cv.util.hasValue(productData.product) && !_.isEmpty(productData.product)) {
                pushData = {
                    name: list === tracker.options.ListTypes.RecentlyViewed && !tracker.options.UsingZonedRecentlyViewed ? productData.product.description : productData.product.Description,
                    id: list === tracker.options.ListTypes.RecentlyViewed && !tracker.options.UsingZonedRecentlyViewed ? productData.product.productCode : productData.product.ProductCode,
                    category: list === tracker.options.ListTypes.RecentlyViewed && !tracker.options.UsingZonedRecentlyViewed ? productData.product.categoryHierarchy : productData.product.CategoryHierarchy,
                    quantity: product.Quantity,
                    brand: list === tracker.options.ListTypes.RecentlyViewed && !tracker.options.UsingZonedRecentlyViewed ? productData.product.brandText : productData.product.BrandText
                }
                if (!tracker.options.HidePricing) {
                    pushData.price = list === tracker.options.ListTypes.RecentlyViewed && !tracker.options.UsingZonedRecentlyViewed ? tracker.util.getPrice(tracker.util.exOrIncPrice(productData.product.PriceForOneEx, productData.product.priceForOneInc)) : tracker.util.getPrice(tracker.util.exOrIncPrice(productData.product.PriceForOneEx, productData.product.PriceForOneInc));
                }
            } else {
                // When products have been added to the cart using things like the fast order entry widget
                pushData = {
                    name: product.ReturnedLineData.Description,
                    id: product.ReturnedLineData.StockCode,
                    category: product.ReturnedLineData.Product[0].CategoryHierarchy,
                    quantity: product.Quantity,
                    brand: product.ReturnedLineData.Product[0].BrandText
                }
                if (!tracker.options.HidePricing) {
                    pushData.price = tracker.util.getPrice(product.ReturnedLineData.OrderItemPrice);
                }
            }
            return pushData;
        },
        pushAddToCart: function (productList, listName) {
            tracker.util.pushLargeData(this, this.getAddedToCartObject, [listName], productList, "ecommerce.add.products");
        }
    });

    tracker.removeFromCart = _.extend({}, tracker.eventBase, {
        base: function () {
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.RemoveFromCart) {
                return;
            }
            var that = this;
            tracker.proxy.preAndPostCall($.cv.css, "deleteCurrentOrderLine", 1, function () {
                that.preCallProcessing.apply(that, arguments);
            }, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.removedFromCart(response, options, widgetName, jsWidgetName, proxyMeta);
            });
            tracker.proxy.preAndPostCall($.cv.css.orders, "deleteCurrentOrderLineBulk", 1, function () {
                that.preCallProcessing.apply(that, arguments);
            }, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.removedFromCart(response, options, widgetName, jsWidgetName, proxyMeta);
            });
        },
        preCallProcessing: function () {
            var guid = $.cv.css.guid().toString(),
                    lastOption = arguments[arguments.length - 1];
            if ($.cv.util.hasValue(lastOption) && _.isObject(lastOption) && $.cv.util.hasValue(lastOption["isProxyMeta"]) && lastOption.isProxyMeta) {
                // This should always be true as the proxy util method always includes the proxyMeta
                _.extend(arguments[arguments.length - 1], { deleteGuid: guid });
            }
            this.currentOrderLines[guid] = $.cv.css.localGetCurrentOrderLines();
        },
        removedFromCart: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            var that = this,
                allRemovedLines = [];

            if (!$.cv.util.hasValue(that.currentOrderLines[proxyMeta.deleteGuid])) {
                // No line to get the relevant data from.... It should always exists though
                return;
            }

            var allLines = $.cv.util.hasValue(options.batchData) ? _.map(options.batchData, function (line, index) {
                return {
                    Seq: line.seq,
                    RemovedSuccessfully: response.data[index].deleteLineOk
                }
            }) : [{ Seq: options.seq, RemovedSuccessfully: response.data.deleteLineOk }];

            if (_.isEmpty(allLines)) {
                return;
            }

            // Get the line data from when this call was made and remove is from the stack
            var currentOrderLines = that.currentOrderLines[proxyMeta.deleteGuid];
            that.currentOrderLines = _.omit(that.currentOrderLines, proxyMeta.deleteGuid);

            _.each(allLines, function (line) {
                if (line.RemovedSuccessfully) {
                    var lineRemoved = _.find(currentOrderLines, function (currentLine) {
                        return currentLine.LineSeq.toString() === line.Seq.toString();
                    });

                    // Find and get the product push object
                    var productObj = that.getRemovedFromCartProductObject(lineRemoved);
                    if (!_.isEmpty(productObj)) {
                        allRemovedLines.push(productObj);
                    }
                }

            });

            if (!_.isEmpty(allRemovedLines)) {
                that.pushRemovedFromCart(allRemovedLines);
            }
        },
        getRemovedFromCartObject: function (list) {
            return {
                event: tracker.options.EventNames.RemoveFromCart,
                ecommerce: {
                    currencyCode: tracker.options.CurrencyCode,
                    remove: {
                        products: []
                    }
                },
                list: list
            };
        },
        getRemovedFromCartProductObject: function (line) {
            var pushData = {
                name: line.Description,
                id: line.StockCode,
                category: line.Product[0].CategoryHierarchy,
                quantity: line.OrderedQty
            };
            if (!tracker.options.HidePricing) {
                pushData.price = tracker.util.getPrice(line.OrderItemPrice);
            }
            return pushData;
        },
        pushRemovedFromCart: function (productList) {
            tracker.util.pushLargeData(this, this.getRemovedFromCartObject, [tracker.options.ListTypes.CartLines], productList, "ecommerce.remove.products");
        },
        currentOrderLines: {}
    });

    tracker.cartUpdated = _.extend({}, tracker.eventBase, {
        base: function () {
            if (!tracker.options.TrackingEnabled.EnhancedECommerce || !tracker.options.TrackingEnabled.CartUpdated) {
                return;
            }
            var that = this;
            tracker.proxy.preAndPostCall($.cv.css, "updateCurrentOrderLine", 1, function () {
                that.preCallProcessing.apply(that, arguments);
            }, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.cartUpdate(response, options, widgetName, jsWidgetName, proxyMeta);
            });
            tracker.proxy.preAndPostCall($.cv.css.orders, "updateCurrentOrderLineBulk", 1, function () {
                that.preCallProcessing.apply(that, arguments);
            }, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.cartUpdate(response, options, widgetName, jsWidgetName, proxyMeta);
            });
        },
        preCallProcessing: function () {
            var guid = $.cv.css.guid().toString(),
                    lastOption = arguments[arguments.length - 1];
            if ($.cv.util.hasValue(lastOption) && _.isObject(lastOption) && $.cv.util.hasValue(lastOption["isProxyMeta"]) && lastOption.isProxyMeta) {
                // This should always be true as the proxy util method always includes the proxyMeta
                _.extend(arguments[arguments.length - 1], { deleteGuid: guid });
            }
            this.currentOrderLines[guid] = $.cv.css.localGetCurrentOrderLines();
        },
        cartUpdate: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            var that = this,
                adds = [],
                removes = [];

            if (!$.cv.util.hasValue(that.currentOrderLines[proxyMeta.deleteGuid])) {
                // No line to get the relevant data from.... It should always exists though
                return;
            }

            var allLines = $.cv.util.hasValue(options.batchData) ? _.map(options.batchData, function (line, index) {
                return {
                    Seq: line.sequence,
                    UpdateQty: line.quantity,
                    UpdatedSuccessfully: response.data[index].toString().toLowerCase() === "true"
                }
            }) : [{
                Seq: options.sequence,
                UpdateQty: options.quantity,
                UpdatedSuccessfully: response.data.toString().toLowerCase() === "true"
            }];

            if (_.isEmpty(allLines)) {
                return;
            }

            // Get the line data from when this call was made and remove is from the stack
            var currentOrderLines = that.currentOrderLines[proxyMeta.deleteGuid];
            that.currentOrderLines = _.omit(that.currentOrderLines, proxyMeta.deleteGuid);

            _.each(allLines, function (line) {
                if (line.UpdatedSuccessfully) {
                    var lineUpdated = _.find(currentOrderLines, function (currentLine) {
                        return currentLine.LineSeq.toString() === line.Seq.toString();
                    });

                    // Only deal with numeric values
                    if (isNaN(line.UpdateQty) || isNaN(lineUpdated.OrderedQty)) {
                        return;
                    }

                    var qtyDiff = line.UpdateQty - lineUpdated.OrderedQty;

                    // Only need to track if the quantity has changed
                    if (qtyDiff === 0) {
                        return;
                    }

                    // Find and get the product push object
                    var productObj = that.getUpdatedCartProductObject(lineUpdated, qtyDiff);
                    if (!_.isEmpty(productObj)) {
                        if (qtyDiff > 0) {
                            adds.push(productObj);
                        } else {
                            removes.push(productObj);
                        }
                    }
                }

            });

            if (!_.isEmpty(adds) || !_.isEmpty(removes)) {
                that.pushCartUpdates({ adds: adds, removes: removes });
            }
        },
        getUpdatedCartProductObject: function (line, qtyDiff) {
            var pushData = {
                name: line.Description,
                id: line.StockCode,
                category: line.Product[0].CategoryHierarchy,
                quantity: Math.abs(qtyDiff)
            };
            if (!tracker.options.HidePricing) {
                pushData.price = tracker.util.getPrice(line.OrderItemPrice);
            }
            return pushData;
        },
        pushCartUpdates: function (allUpdatedLines) {
            if (!_.isEmpty(allUpdatedLines.removes)) {
                tracker.util.pushLargeData(this, tracker.removeFromCart.getRemovedFromCartObject, [tracker.options.ListTypes.CartLines], allUpdatedLines.removes, "ecommerce.remove.products");
            }

            if (!_.isEmpty(allUpdatedLines.adds)) {
                tracker.util.pushLargeData(this, tracker.addToCart.getAddedToCartObject, [tracker.options.ListTypes.CartLines], allUpdatedLines.adds, "ecommerce.add.products");
            }
        },
        currentOrderLines: {}
    });

    tracker.promoCodes = _.extend({}, tracker.eventBase, {
        base: function () {
            if (tracker.options.TrackingEnabled.EnhancedECommerce) {
                var that = this;
                if (tracker.options.TrackingEnabled.ApplyPromoCodeSuccess || tracker.options.TrackingEnabled.ApplyPromoCodeFail) {
                    tracker.proxy.postCall($.cv.css.orders, "applyPromoCode", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                        that.promoCodeApplied(response, options, widgetName, jsWidgetName, proxyMeta);
                    });
                }
                if (tracker.options.TrackingEnabled.RemovePromoCode) {
                    tracker.proxy.postCall($.cv.css.orders, "removePromoCode", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                        that.promoCodeRemoved(response, options, widgetName, jsWidgetName, proxyMeta);
                    });
                }
            }
        },
        promoCodeApplied: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            if (response.data.IsValid) {
                if (tracker.options.TrackingEnabled.ApplyPromoCodeSuccess) {
                    this.push(this.getPromoCodeEventObject(tracker.options.EventNames.ApplyPromoCodeSuccess, options.promoCode));
                }
            } else {
                if (tracker.options.TrackingEnabled.ApplyPromoCodeFail) {
                    this.push(this.getPromoCodeEventObject(tracker.options.EventNames.ApplyPromoCodeFail, options.promoCode));
                }
            }
        },
        promoCodeRemoved: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            this.push(this.getPromoCodeEventObject(tracker.options.EventNames.RemovedPromoCode, options.promoCode));
        },
        getPromoCodeEventObject: function (event, promoCode) {
            return {
                event: event,
                promoCode: promoCode
            }
        }
    });

    tracker.viewOrder = _.extend({}, tracker.eventBase, {
        base: function () {
            if (!tracker.options.TrackingEnabled.OrderTracking) {
                return;
            }
            var that = this;
            tracker.proxy.postCall($.cv.css, "getOrderLines", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.orderViewed(response, options, widgetName, jsWidgetName, proxyMeta);
            });
            return;
        },
        orderViewed: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            if (!$.cv.util.isNullOrWhitespace(jsWidgetName) && jsWidgetName === "orderSearch") {
                var orderNumber = (options.orderNo.toString() + options.suffix).trim();
                this.push({ virtualURL: tracker.options.EventNames.OrderTracking.format(orderNumber) }, { options: options });
            }
        }
    });

    tracker.viewTemplate = _.extend({}, tracker.eventBase, {
        base: function () {
            if (!tracker.options.TrackingEnabled.TemplateView) {
                return;
            }
            var that = this;
            tracker.proxy.postCall($.cv.css.orderTemplate, "getTemplateOrder", 1, function (response, options, widgetName, jsWidgetName, proxyMeta) {
                that.templateViewed(response, options, widgetName, jsWidgetName, proxyMeta);
            });
            return;
        },
        templateViewed: function (response, options, widgetName, jsWidgetName, proxyMeta) {
            if (!$.cv.util.isNullOrWhitespace(jsWidgetName) && jsWidgetName === "templateOrders") {
                var templateName = proxyMeta.templateName.toString().trim().replace(/\s+/g, "-");
                this.push({ virtualURL: tracker.options.EventNames.TemplateView.format(templateName) }, { options: options, templateName: proxyMeta.templateName });
            }
        }
    });

}(jQuery));