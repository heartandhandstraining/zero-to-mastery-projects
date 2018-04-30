/// <reference path="jquery-1.8.3.js" />

/**
 * Author: Chad Paynter
 * Date: 2013-04-04
 * Description: To get delivery options and set delivery address
 * Dependencies
 * - jQuery
 * - cv.css.js
**/

;
(function($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.user = $.cv.css.user || {};

    $.cv.css.user.registerUserFieldData = function(options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/registeruser', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.user.getUserRegistrationFieldDataForRole = function (options) {
        var opts = $.extend({
            roleName: "",
            useCurrentRoleIfEmptyRoleName: true,
            success: function () { }
        }, options);
        return $.cv.ajax.call('user/getUserRegistrationFieldDataForRole', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    // called for public user registration
    $.cv.css.user.registerUser = function(options) {
        var opts = $.extend({
            setCustAndRole: false,
            sendEmail: false,
            b2bRegRole: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/registeruser-create-validate', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.user.changeUserPassword = function (options) {
        var opts = $.extend({
            username: '',
            newPassword: '',
            newPasswordConfirm: '',
            notifyEmail: '',
            success: function (msg) { },
            error: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/checkandchangepassword', {
            parameters: { username: opts.username, newPassword: opts.newPassword, newPasswordConfirm: opts.newPasswordConfirm, notifyEmail: opts.notifyEmail },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            },
            error: function (msg) {
                if (opts.error)
                    opts.error(msg.responseText ? msg.responseText : '');
            }
        });
    };

    $.cv.css.user.retrieveUserPassword = function (options) {
        var opts = $.extend({
            username: '',
            success: function (msg) { },
            error: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/retrievepassword', {
            parameters: { username: opts.username },
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            },
            error: function (msg) {
                if (opts.error)
                    opts.error(msg.responseText ? msg.responseText : '');
            }
        });
    };
    
    $.cv.css.user.getCurrentUser = function (options) {
        var result = $.Deferred();

        var opts = $.extend({
            success: $.noop,
            triggerEvents: true
        }, options);

        var serviceCallOptions = {
            parameters: {},
            sucess: opts.success
        
        };

        if ($.cv.css.crm) {
            serviceCallOptions.converters = {
                'text json': $.cv.css.crm._usersCurrentCrmRecordCleanupConverter
            };
        }

        var userLoaded = $.cv.ajax.call('user/currentuser', serviceCallOptions);

        userLoaded.done(function (response) {
            // Successful Load... do some special stuff.
            if (!response.errorMessage || response.errorMessage.length == 0) {
                $.cv.css.localSetUser(response.data[0]);

                // add in user settings
                if (response.data[0].RecordsPerPage) {
                    $.cv.css.localSetPageSize(response.data[0].RecordsPerPage);
                }

                if (opts.triggerEvents === false) {
                    if (opts.success) {
                        opts.success(response);
                    }

                    result.resolve(response);
                } else {
                    $.cv.css.trigger($.cv.css.eventnames.userChanged, response.data[0])
                     .done(function () {
                         if (opts.success) {
                             opts.success(response);
                         }

                         result.resolve(response);
                     });
                }
            } else {
                // No additional work to do...
                result.resolve(response);
            }
        });

        return result.promise();
    };

    // Set user details for current user
    $.cv.css.user.setCurrentUser = function (options) {
        var opts = $.extend({
            success: function (msg) { },
            data: null,
            serviceName: 'user/currentuser',
            triggerUserChanged: true
        }, options);
        var existingSuccess = opts.success;
        opts.success = function (msg) {
            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                $.cv.css.localSetUser(msg.data[0]);
                if (opts.triggerUserChanged)
                    $.cv.css.trigger($.cv.css.eventnames.userChanged, msg.data[0]);
                if (existingSuccess)
                    existingSuccess(msg);
            }
        };
        return $.cv.css.updateObject(opts);
    };

    $.cv.css.user.setCurrentUserRecordsPerPage = function (recordsPerPage) {
        return $.cv.ajax.call('user/setCurrentUserRecordsPerPage', {
            parameters: {
                recordsPerPage: recordsPerPage
            },
            success: $.noop
        });
    };

    $.cv.css.user.setUserStatus = function (options) {
        var opts = $.extend({
            userStatus: null,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/setUserStatus', {
            parameters: { userStatus: opts.userStatus },
            success: function (msg) {
                if (!msg.errorMessage || msg.errorMessage.length === 0) {
                    if (opts.success)
                        opts.success(msg);
                }
            }
        });
    };

    $.cv.css.user.getUserMaintenanceData = function (options) {
        var opts = $.extend({
            jsonFieldGroupName: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/currentuserdetails', {
            parameters: { jsonFieldGroupName: opts.jsonFieldGroupName },
            success: function (msg) {
                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                    if (opts.success)
                        opts.success(msg);
                }
            }
        });
    };

    $.cv.css.user.setCurrentUserDetails = function (options) {
        var opts = $.extend({
            success: function (msg) { },
            updateData: null,
            jsonFieldGroup: "",
            serviceName: 'user/currentuserdetails'
        }, options);
        var data = {};
        data["jsonFieldGroup"] = opts.jsonFieldGroup;
        data["updateData"] = opts.updateData;
        data["_objectKey"] = opts.updateData._objectKey;
        opts["data"] = data;
        var existingSuccess = opts.success;
        opts.success = function(msg) {
            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                if (existingSuccess)
                    existingSuccess(msg);
            }
        };
        return $.cv.css.updateObject(opts);
    };

    $.cv.css.user.getCurrentUsersCustomersWithFinanceFilter = function (options) {
        var opts = $.extend({
            selectedCustomer: "",
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/getCurrentUsersCustomersWithFinanceFilter', {
            parameters: { selectedCustomer: opts.selectedCustomer },
            success: $.noop
        });
    };
    
    $.cv.css.user.maxNumberOfInvoicesAllowedAsAttachment = function () {
        return $.cv.ajax.call('user/maxNumberOfInvoicesAllowedAsAttachment', {
            parameters: {},
            success: $.noop
        });
    };

    $.cv.css.user.myAddress = function (options) {
        var opts = $.extend({
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/myAddress', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.user.setDefaultDeliveryAddress = function (options) {
        var opts = $.extend({
            addressKey: "",
            isDefaultCustomerAddress: false,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/setDefaultDeliveryAddress', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.user.updateMyAddress = function (options) {
        var opts = $.extend({
            deliveryAddress: null,
            billingAddress: null,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/updateMyAddress', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };
    
    $.cv.css.user.setIncTax = function (options) {
        var opts = $.extend({
            isIncTax: true,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call("user/setIncTax", {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };

    $.cv.css.user.setBrowserLocalStorageAccess = function (options) {
        var opts = $.extend({
            canAccessBrowserLocalStorage: true,
            success: function (msg) { }
        }, options);
        return $.cv.ajax.call('user/setBrowserLocalStorageAccess', {
            parameters: opts,
            success: function (msg) {
                if (opts.success)
                    opts.success(msg);
            }
        });
    };
    
})(jQuery);
