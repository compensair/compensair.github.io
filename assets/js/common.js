function getPageParams(sUrl) {
    function retrieveParam(string, param) {
        var paramPosition = string.indexOf(param+'=');
        if (paramPosition > -1) {
            var afterCode = string.substr(paramPosition);
            if (afterCode.indexOf('&')>0) {
                return afterCode.substr(0, afterCode.indexOf('&'));
            } else {
                return afterCode;
            }
        } else {
            return '';
        }
    }
    var result = '';
    var sPageURL = sUrl.substring(sUrl.indexOf('?') + 1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        var param = retrieveParam(sUrl, sParameterName[0]);
        if (param !== '') {
            if (result !== '') result += '&';
            result += param;
        }
    }
    return result;
}

function getCompensairApiUrl(entity, action) {
    var actionSlash = action !== '' ? action + '/' : '';
    var paramsSlash = getPageParams(window.location.search) !== "" ? '?' + getPageParams(window.location.search) : '';
    return window.location.protocol + "//" + window.location.host + '/api/v1/' + entity + '/' + actionSlash + paramsSlash;
}

/******************
 WORKING WITH SESSION STORAGE
 ******************/
var resetSessionStorage = function () {
    for (var i = window.sessionStorage.length - 1; i >= 0; i--) {
        window.sessionStorage.removeItem(window.sessionStorage.key(i));
    }
}

var storageSetItem = function (key, value) {
    if (typeof sessionStorage === 'object') {
        try {
            sessionStorage.setItem('localStorage', 1);
            sessionStorage.removeItem('localStorage');

            return window.sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            if (typeof window.xstore !== 'object') {
                console.error(e);
                window.xstore = {};
            }

            return window.xstore[key] = value;
        }
    } else {
        console.log('else!');
    }
}

var storageGetItem = function (key) {
    if (typeof sessionStorage === 'object') {
        try {
            sessionStorage.setItem('localStorage', 1);
            sessionStorage.removeItem('localStorage');

            return JSON.parse(window.sessionStorage.getItem(key));
        } catch (e) {
            console.error(e);
            return window.xstore[key];
        }
    } else {
        console.log('else!');
    }
}

var storageToObject = function () {
    if (typeof sessionStorage === 'object') {
        try {
            sessionStorage.setItem('localStorage', 1);
            sessionStorage.removeItem('localStorage');
            var result = {};
            for (var i = window.sessionStorage.length - 1; i >= 0; i--) {
                var key = window.sessionStorage.key(i);
                if (window.sessionStorage.getItem(key) !== undefined && window.sessionStorage.getItem(key) != null && window.sessionStorage.getItem(key) !== "undefined") {
                    try {
                        result[key] = JSON.parse(window.sessionStorage.getItem(key));
                    } catch (e) {
                        result[key] = window.sessionStorage.getItem(key);
                    }
                }
            }
            return result;
        } catch (e) {
            console.error(e);
            return window.xstore;
        }
    } else {
        console.log('else!');
    }
}

var saveToSessionStorage = function (object) {
    for (prop in object)
        if (object.hasOwnProperty(prop)) {
            try {
                if ('signature' == prop) {
                    storageSetItem(prop, object[prop]['_url']);
                } else {
                    storageSetItem(prop, object[prop]);
                }
            } catch (e) {

                console.error(e);
                console.error(prop);
                console.error(object[prop]);
            }
        }
}

var sessionStorageToObject = function () {
    return storageToObject();
};

var firstToUpper = function(word, brackets, comma, noSpace) {
    try {
        if (word == "" || word == undefined) {
            return "";
        } else {
            var res = "";
            var wordArray = word.split(/\s+/);
            for (var i=0; i<wordArray.length; i++) {
                res = res + wordArray[i].charAt(0).toUpperCase() + wordArray[i].slice(1) + ' ';
            }
            word = res;
            word = word.trim();
            if (brackets) {
                word = "("+word+")";
            }
            if (comma) {
                word = word+",";
            }
            if (noSpace) {
                return word
            } else {
                return word + " ";
            }
        }
    }
    catch (err) {
        notiDev('Catch: Failed to perform firstToUpper function.', err.toString());
    }
};

var a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};

function transliterate(word){
    return word.split('').map(function (char) {
        return a[char] || char;
    }).join("");
}

// USING JQUERY BELOW
var transliterateAsYouType = function(classy, additionalFormatting) {
    if (typeof additionalFormatting === 'undefined') {
        additionalFormatting = 'firstToUpper';
    }
    $(document).on('keyup', classy, function(e) {
        var val = $(this).val();
        if (val.substr(val.length-1) === " ") {
            var translit = transliterate(val);
            if (additionalFormatting === 'firstToUpper') {
                translit = firstToUpper(translit.toLowerCase());
            }
            if (additionalFormatting === 'allToUpper') {
                translit = translit.toUpperCase();
            }
            $(this).val(translit);
            $(document).off('change', classy);
            transliterateAsYouType(classy, additionalFormatting);
        }
    });
    $(document).on('change', classy, function(e) {
        var translit = transliterate($(this).val());
        if (additionalFormatting === 'firstToUpper') {
            translit = firstToUpper(translit.toLowerCase());
        }
        if (additionalFormatting === 'allToUpper') {
            translit = translit.toUpperCase();
        }
        $(this).val(translit);
        $(document).off('change', classy);
        transliterateAsYouType(classy, additionalFormatting);
    });
};

var nextPage = function () {
    try {
        var texty = $('.heading').text();
        if (texty.indexOf(textItems_applicationHeading) > -1) {
            var reg = /\((\d)\/\d*\)/;
            if (reg.exec(texty) != null) {
                var num = parseInt(reg.exec(texty)[1]);
                var newNum = num + 1;
                var newNumTen = newNum * 100 / 9
                $('.heading').text(textItems_applicationHeading + ' (' + newNum + '/9)');
                $('.heading-progress').css('width', newNumTen + '%');
            }
        }

        var cur = $('.envisioned');
        var next = cur.next();

        var curHeight = parseInt(cur.outerHeight());
        var next = cur.next();
        var nextHeight = next.outerHeight();

        cur.addClass('subvisioned');
        cur.removeClass('envisioned');

        setTimeout(function () {
            next.addClass('envisioned');
            next.removeClass('provisioned');
            $('.cform-container').height(nextHeight + 50);

            setTimeout(function () {
                $('.cform-container').height(next.outerHeight() + 50);
                var windowHeight = parseInt($(window).height());
                var bodyHeight = parseInt($('body').height());
                var diff = windowHeight - bodyHeight;
                var maxDiff = Math.max(diff, 0);
                $('.cform-container').height($('.cform-container').height() + maxDiff);
                $(".envisioned .focus-button").attr("tabindex", -1).focus();
                $('html,body').animate({scrollTop: 0});
            }, 500);
        }, 100);
    } catch (err) {
        notiDev('Catch: Next page failed.', err.toString());
    }
};

var callApi = function (url, data, method) {
    if (typeof method === 'undefined') {
        method = 'POST';
    }
    return $.ajax({
        'url': url,
        'method': method,
        'data': data
    }).then(function(result) {
        return result;
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(jqXHR.responseText);
        console.error(textStatus);
        console.error(errorThrown);
    });
};

var underscoreToCamelCase = function(str) {
    return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

// Text validation block

function dashToCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
}

function textValidateScroll() {
    var container = $('.cform-container');
    var curHeight = parseInt(container.outerHeight());
    var newHeight = curHeight + 20;
    container.css('height', newHeight + 'px');
    $('html,body').animate({scrollTop: 0});
}

function testEmailValidity(email) {
    return /\@\w+\.\w+/.test(email);
};

function addErrorToField(obj, key, errorKey, dontScroll) {
    var element = $('.cform-' + key);
    element.parent().addClass('cform-error cform-' + key + '-error');
    if (errorKey === 'errors_minlength') {
        element.parent().attr('data-content', errors_minlength(element.attr('minlength')));
    } else if (errorKey === 'errors_maxlength') {
        element.parent().attr('data-content', errors_maxlength(element.attr('maxlength')));
    } else {
        element.parent().attr('data-content', jQuery.i18n.prop(errorKey));
    }
    obj.err[key] = "empty";
    if (!dontScroll) {
        textValidateScroll();
    }
    return obj;
}

var textValidate = function (key, obj, dontScroll) {
    try {
        if (typeof dontScroll === 'undefined') {
            dontScroll = false;
        }
        var element = $('.cform-' + key);
        var val = '';
        if (element.parent().hasClass('dropdown-container')) {
            val = element.attr('id');
            obj.save[key + 'String'] = element.val();
        }
        else if (element.is('select')) {
            val = element.children(":selected").attr("id");
        }
        else if ($.inArray(key, ['arrival', 'marrival', 'departure', 'airline', 'country']) != -1) {
            val = element.attr('id');
            obj.save[key+'String'] = element.val();
        }
        else {
            val = element.val();
        }
        val = $.trim(val);
        if (val === "") {
            obj = addErrorToField(obj, key, 'errors_' + dashToCamelCase(key), dontScroll);
        } else {
            if (
                (
                    key === "email" ||
                    key === "email1" ||
                    key === "partnerEmail"
                ) && !testEmailValidity(val)) {
                obj = addErrorToField(obj, key, 'errors_' + dashToCamelCase(key), dontScroll);
            } else if (
                key === "name" &&
                !/.+\s.+/.test(val)
            ) {
                obj = addErrorToField(obj, key, 'errors_' + dashToCamelCase(key), dontScroll);
            } else if (
                key === "name" && (
                    val.indexOf('.') > 0 ||
                    val.indexOf(',') > 0 ||
                    val.indexOf(',') > 0 ||
                    val.indexOf('.') > 0 ||
                    val.indexOf('|') > 0 ||
                    val.indexOf('/') > 0 ||
                    val.indexOf(';') > 0 ||
                    val.indexOf(':') > 0 ||
                    val.indexOf('&') > 0
                )
            ) {
                obj = addErrorToField(obj, key, 'errors_' + dashToCamelCase(key), dontScroll);
                element.parent().attr('data-content', formats_nameSymbols);
                obj.err[key] = "nameSymbols";
            } else if (
                key === "name" &&
                val.toLowerCase().indexOf('mrs') >= 0
            ) {
                obj = addErrorToField(obj, key, 'errors_' + dashToCamelCase(key), dontScroll);
                element.parent().attr('data-content', formats_nameTitles);
                obj.err[key] = "nameTitles";
            } else if (element.attr('required-language') === "cyrillic" && !/^[а-яА-ЯЁё\s-\']*$/.test(val)) {
                obj = addErrorToField(obj, key, 'errors_should_be_cyrillic', dontScroll);
            } else if (element.attr('required-language') === "latin" && !/^[a-zA-Z\s-\']*$/.test(val)) {
                obj = addErrorToField(obj, key, 'errors_should_be_latin', dontScroll);
            } else {
                if (key === "email1") {
                    var mailbox = element.val().substring(element.val().indexOf('@')+1);
                    if ($('.cform-email1-suggestion').length > 0) {
                        obj.save.mailboxType = 'Mistaken';
                    } else if (emailDomains.indexOf(mailbox) < 0) {
                        obj.save.mailboxType = 'Custom';
                    }
                }
                if (key === 'name' && /test\s/i.test(val)) {
                    obj.save.test = true;
                }
                element.parent().removeClass('cform-error cform-' + key + '-error');
                obj.save[key] = val;
            }
        }
        return obj;
    } catch (err) {
        notiDev('Text validation failed.', err.toString());
    }
};

$(document).ready(function () {

    // Get the modal
    var modal = document.getElementById("language-modal");

// Get the button that opens the modal
    var btn = document.getElementById("modal-btn");

// Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    };

// When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    };


// When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});