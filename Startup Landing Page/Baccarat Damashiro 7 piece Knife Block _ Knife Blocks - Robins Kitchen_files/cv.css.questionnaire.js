;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.questionnaire = $.cv.css.questionnaire || {};

    $.cv.css.questionnaire.questionnaireFields = function (options) {
        var opts = $.extend({
            questionnaireCode: "",
            success: $.noop
        }, options);

        return $.cv.ajax.call('questionnaire/questionnaireFields', {
            parameters: {
                questionnaireCode: opts.questionnaireCode               
            },
            queryStringParam: window.location.search,
            success: opts.success
        });
    };

})(jQuery);