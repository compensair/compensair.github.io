/*
 46 UTM RETRIEVAL AND MANAGEMENT
 285 RETRIEVEING LANGUAGE FROM URL
 298 IFRAME DETECTION
 309 TRANSLITERATING
 319 OBJECT TO STRING CONVERSION
 357 ERROR NOTIFICATION
 461 WORKING WITH API
 517 WORKING WITH SESSION STORAGE
 604 DOCUMENT READY SECTION START
 609 IFRAME STYLING
 635 COMMON DROPDOWN-SPECIFIC FUNCTIONS
 1034 PRIMARY CLEANOUT
 1044 DEPARTURE TRIGGERS
 1169 ARRIVAL TRIGGERS
 1265 MARRIVAL TRIGGERS
 1362 AIRLINE TRIGGERS
 1462 APP FRONT-END FUNCTIONS
 1757 APP FRONT-END TRIGGERS
 2109 VALIDATING AND SAVING FUNCTIONS
 2930 COMPENSATION CALCULATING FUNCTIONS
 3068 SUBMITTING TRIGGERS
 3111 SIGNATURE
 3141 RESTYLING FOR FAQ, RIGHTS
 3152 ADDING COMPANIONS
 3244 POPUP
 3307 FOCUS ON PRIMARY ELEMENT
 3312 MASK DATE IF CANNOT HANDLE
 3332 TRANSLITERATE
 3365 NOTIFY ABOUT WRONG SYMBOLS
 3379 PARTNERS CALCULATOR
 3443 PARTNERS FRONTEND
 3471 UNSLIDER
 3520 LANGUAGE DROPDOWN
 3527 PARTNER PROFILE WIDGET MANAGEMENT
 3545 VISA MANAGEMENT
 3576 TEXT DEPENDENT SCRIPTS START
 3581 DROPZONE
 3663 DOCUMENT READY WITHIN TEXT DEPENDENT
 3669 REVIEWS MANAGEMENT
 3830 VALIDATION
 3979 PARTNERS SAVING
*/

/******************
UTM RETRIEVAL AND MANAGEMENT
******************/
var UtmCookie;

function getDomainAndName() {
    //var regexDomain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img; //without www
    var regexDomain = /^(?:https?:\/\/)?(?:[^@\n]+@)?([^:\/\n?]+)/img;
    results = regexDomain.exec(window.location.host);

    var regexName = /(\w+)\./;
    var resultObj = {};
    resultObj.domain = results[0] === 'www' ? results[1] : results[0];
    resultObj.name = regexName.exec(results[0])[1];

    return resultObj;
}

var trackingUrlParameters = [
    'initial_landing_page',
    'last_referrer',
    'referrer',
    'visits',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'sub_id',
    'part_id',
    'affid',
    'affId',
    'aff_id',
    'clickId',
    'reqid',
    'admitad_uid',
    'click_id',
    'user_id',
    'source_id',
    'WM_id',
    'uid',
    'actionpay',
    'pid', // cj - vivnetworks
    'aid' // cj - vivnetworks
];

UtmCookie = (function () {
    function UtmCookie(options) {
        if (options == null) {
            options = {};
        }
        this._cookieNamePrefix = options.cookieNamePrefix || '_' + getDomainAndName()['name'] + '_';
        this._domain = options.domain || "." + getDomainAndName()['domain'];
        this._sessionLength = options.sessionLength || 1;
        this._cookieExpiryDays = options.cookieExpiryDays || 365;
        this._additionalParams = options.additionalParams || [];
        this._utmParams = trackingUrlParameters;
        this.writeInitialReferrer();
        this.writeLastReferrer();
        this.writeInitialLandingPageUrl();
        this.setCurrentSession();
        if (this.additionalParamsPresentInUrl()) {
            this.writeAdditionalParams();
        }
        if (this.utmPresentInUrl()) {
            this.writeUtmCookieFromParams();
        }
        return;
    }

    UtmCookie.prototype.createCookie = function (name, value, days, path, domain, secure) {
        var cookieDomain, cookieExpire, cookiePath, cookieSecure, date, expireDate;
        expireDate = null;
        if (days) {
            date = new Date;
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expireDate = date;
        }
        cookieExpire = expireDate != null ? '; expires=' + expireDate.toGMTString() : '';
        cookiePath = path != null ? '; path=' + path : '; path=/';
        cookieDomain = domain != null ? '; domain=' + domain : '';
        cookieSecure = secure != null ? '; secure' : '';
        document.cookie = this._cookieNamePrefix + name + '=' + escape(value) + cookieExpire + cookiePath + cookieDomain + cookieSecure;
    };

    UtmCookie.prototype.readCookie = function (name) {
        var c, ca, i, nameEQ;
        nameEQ = this._cookieNamePrefix + name + '=';
        ca = document.cookie.split(';');
        i = 0;
        while (i < ca.length) {
            c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
            i++;
        }
        return null;
    };

    UtmCookie.prototype.eraseCookie = function (name) {
        this.createCookie(name, '', -1, null, this._domain);
    };

    UtmCookie.prototype.getParameterByName = function (name) {
        var regex, regexS, results;
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        regexS = '[\\?&]' + name + '=([^&#]*)';
        regex = new RegExp(regexS);
        results = regex.exec(window.location.search);
        if (results) {
            return decodeURIComponent(results[1].replace(/\+/g, ' '));
        } else {
            return '';
        }
    };

    UtmCookie.prototype.additionalParamsPresentInUrl = function () {
        var j, len, param, ref;
        ref = this._additionalParams;
        for (j = 0, len = ref.length; j < len; j++) {
            param = ref[j];
            if (this.getParameterByName(param)) {
                return true;
            }
        }
        return false;
    };

    UtmCookie.prototype.utmPresentInUrl = function () {
        var j, len, param, ref;
        ref = this._utmParams;
        for (j = 0, len = ref.length; j < len; j++) {
            param = ref[j];
            if (this.getParameterByName(param)) {
                return true;
            }
        }
        return false;
    };

    UtmCookie.prototype.writeCookie = function (name, value) {
        this.createCookie(name, value, this._cookieExpiryDays, null, this._domain);
    };

    UtmCookie.prototype.writeAdditionalParams = function () {
        var j, len, param, ref, value;
        ref = this._additionalParams;
        for (j = 0, len = ref.length; j < len; j++) {
            param = ref[j];
            value = this.getParameterByName(param);
            this.writeCookie(param, value);
        }
    };

    UtmCookie.prototype.writeUtmCookieFromParams = function () {
        var j, len, param, ref, value;
        ref = this._utmParams;
        for (j = 0, len = ref.length; j < len; j++) {
            param = ref[j];
            value = this.getParameterByName(param);
            this.writeCookie(param, value);
        }
    };

    UtmCookie.prototype.writeCookieOnce = function (name, value) {
        var existingValue;
        existingValue = this.readCookie(name);
        if (!existingValue) {
            this.writeCookie(name, value);
        }
    };

    UtmCookie.prototype._sameDomainReferrer = function (referrer) {
        var hostname;
        hostname = document.location.hostname;
        return referrer.indexOf(this._domain) > -1 || referrer.indexOf(hostname) > -1;
    };

    UtmCookie.prototype._isInvalidReferrer = function (referrer) {
        return referrer === '' || referrer === void 0;
    };

    UtmCookie.prototype.writeInitialReferrer = function () {
        var value;
        value = document.referrer;
        if (this._isInvalidReferrer(value)) {
            value = 'direct';
        }
        this.writeCookieOnce('referrer', value);
    };

    UtmCookie.prototype.writeLastReferrer = function () {
        var value;
        value = document.referrer;
        if (!this._sameDomainReferrer(value)) {
            if (this._isInvalidReferrer(value)) {
                value = 'direct';
            }
            this.writeCookie('last_referrer', value);
        }
    };

    UtmCookie.prototype.writeInitialLandingPageUrl = function () {
        var value;
        value = this.cleanUrl();
        if (value) {
            this.writeCookieOnce('initial_landing_page', value);
        }
    };

    UtmCookie.prototype.initialReferrer = function () {
        return this.readCookie('referrer');
    };

    UtmCookie.prototype.lastReferrer = function () {
        return this.readCookie('last_referrer');
    };

    UtmCookie.prototype.initialLandingPageUrl = function () {
        return this.readCookie('initial_landing_page');
    };

    UtmCookie.prototype.incrementVisitCount = function () {
        var cookieName, existingValue, newValue;
        cookieName = 'visits';
        existingValue = parseInt(this.readCookie(cookieName), 10);
        newValue = 1;
        if (isNaN(existingValue)) {
            newValue = 1;
        } else {
            newValue = existingValue + 1;
        }
        this.writeCookie(cookieName, newValue);
    };

    UtmCookie.prototype.visits = function () {
        return this.readCookie('visits');
    };

    UtmCookie.prototype.setCurrentSession = function () {
        var cookieName, existingValue;
        cookieName = 'current_session';
        existingValue = this.readCookie(cookieName);
        if (!existingValue) {
            this.createCookie(cookieName, 'true', this._sessionLength / 24, null, this._domain);
            this.incrementVisitCount();
        }
    };

    UtmCookie.prototype.cleanUrl = function () {
        var cleanSearch;
        cleanSearch = window.location.search.replace(/utm_[^&]+&?/g, '').replace(/&$/, '').replace(/^\?$/, '');
        return window.location.origin + window.location.pathname + cleanSearch + window.location.hash;
    };

    return UtmCookie;

})();

var getUrlParameterByName = function(name) {
    var regex, regexS, results;
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    regexS = '[\\?&]' + name + '=([^&#]*)';
    regex = new RegExp(regexS);
    results = regex.exec(window.location.search);
    if (results) {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    } else {
      return '';
    }
};

if (!inIframe()) {
    if (getUrlParameterByName("utm_source").indexOf("tinkoff")<0) {
        var cookieExpiryDays = 30;
    } else {
        var cookieExpiryDays = 1 / 24;
    }
    var utmCookie = new UtmCookie({
        domain: "." + getDomainAndName()['domain'],
        sessionLength: 1,
        cookieExpiryDays: cookieExpiryDays
    });
}

function testEmailValidity(email) {
    return /\@.+\.\w+/.test(email);
}

/******************
IFRAME DETECTION
******************/
function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

var emailDomains = ['gmail.com', 'mail.ru', 'yandex.ru', 'inbox.lv', 'hotmail.com', 'yahoo.com', 'ukr.net', 'list.ru', 'bk.ru', 'inbox.ru', 'rambler.ru', 'ya.ru', 'icloud.com', 'tut.by', 'me.com', 'i.ua', 'abv.bg', 'yahoo.es', 'outlook.com', 'hot.ee', 'ua.fm', 'live.com', 'yandex.ua', 'hotmail.es', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.it', 'libero.it', 'meta.ua', 'live.ru', 'aol.com', 'seznam.cz', 'msn.com', 'mail.ee', 'web.de', 'googlemail.com', 'yahoo.de', 'windowslive.com', 'inbox.lt', 'walla.com', 'mynet.com', 'hotmail.co.uk', 'hotmail.fr', 'tvnet.lv', 'bigmir.net', 'uc.cl', 'latnet.lv', 'r-u.ru', 'yandex.com', 'yandex.by', 'live.co.uk', 'live.nl', 'live.no', 'live.it', 'live.com.pt', 'live.fr',  'live.de', 'live.se', 'live.dk', 'live.com.au', 'live.at', 'hotmail.it', 'yahoo.com.br', 'yahoo.gr', 'yahoo.ro', 'yahoo.ie', 'yahoo.co.jp', 'yahoo.no', 'yahoo.co.in', 'yahoo.se', 'yahoo.bg', 'yahoo.co.nz', 'yahoo.com.mx', 'yahoo.ca', 'yahoo.com.tr', 'yahoo.com.ph', 'yahoo.com.hk', 'outlook.it', 'outlook.es', 'outlook.jp', 'outlook.es', 'outlook.de', 'outlook.cl', 'outlook.ie', 'outlook.fr', 'outlook.dk', 'ymail.com', 'wp.pl', 'email.ua', 'live.ca', 'mail.com', 'hotmail.se', 'hotmail.com.tr', 'email.cz', 'op.pl', 'email.it', 'aol.com', 'wanadoo.fr', 'orange.fr', 'comcast.net', 'rediffmail.com', 'rocketmail.com', 'hotmail.nl', 'outlook.com.tr', 'wanadoo.fr', 'o2.pl', 'vp.pl', 'onet.pl'];

/******************
OBJECT TO STRING CONVERSION
******************/
var strObj = function (obj) {
    try {
        var completeText = '';
        if (obj == undefined) {
            return completeText;
        } else {
            var objLen = Object.keys(obj).length;
            if (objLen > 0 && obj.constructor === Object) {
                var n = 0;
                for (var key in obj) {
                    n = n + 1
                    if (obj.hasOwnProperty(key)) {
                        if (key != "username" && key != "password" && key != "depId" && key != "arrId" && key != "airId" && key != "utmSource") {
                            if (obj[key] !== null && typeof obj[key] === 'object') {
                                obj[key] = strObj(obj[key]);
                            }
                            completeText = completeText + key + ': ' + obj[key] + '\n';
                            if (n == objLen) {
                                completeText = completeText + '------ \n';
                                return completeText;
                            }
                        }
                    } else {
                        return completeText + "// obj doesn't have own property"
                    }
                }
            } else {
                return completeText + "// undefined object"
            }
        }
    } catch (err) {
        notiDev('Catch: Failed to execute strObj.', err.toString());
    }
}

/******************
ERROR NOTIFICATION
******************/
var getBrowser = function () {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    var browserArray = [isOpera, isFirefox, isSafari, isIE, isEdge, isChrome, isBlink]
    var nameArray = ['Opera', 'Firefox', 'Safari', 'Internet Explorer', 'Edge', 'Chrome', 'Blink']
    var resArray = [];
    for (var i = 0; i < browserArray.length; i++) {
        if (browserArray[i] == true) {
            resArray.push(nameArray[i]);
        }
        if (i == browserArray.length - 1) {
            return resArray;
        }
    }
}

function notiDev() {
    var text = '';
    switch (arguments[0]) {
        case "Form errors":
            var type = "userErrors";
            break
        case "Zero compensation displayed":
            var type = "zeroCompensation";
            break
        case "Invalid inputs entered":
            var type = "invalidInputs";
            break
        case "info":
            var type = "info";
            break
        default:
            var type = "notifyDev";
            text = text + arguments[0] + '\n'
    }
    for (var i = 1; i < arguments.length; i++) {
        text = text + arguments[i] + '\n';
    }

    var withIp = false;

    var notifyFunc = function (text, type) {
        console.log({texty: text, type: type})
    }

    if (type != "invalidInputs" && type != "zeroCompensation" && type != "info") {
        var date = new Date().toLocaleString();
        if (inIframe()) {
            var webvisor = "WEBVISOR: ";
        } else {
            var webvisor = "";
        }
        var browser = getBrowser().toString();
        var width = $(window).width();
        var height = $(window).height();
        var url = window.location.href;
        var loc = 'Location: unknown';
        if (withIp) {
            $.getJSON('https://geoip-db.com/json/geoip.php?jsonp=?')
                    .done(function (location)
                    {
                        if (location != undefined && location != null) {
                            if (location.country_name != undefined && location.country_name != null) {
                                loc = location.city + ", " + location.country_name;
                            }
                        }
                        text = '******' + date + '******\n' + webvisor + loc + ' | ' + browser + ' | ' + width + 'x' + height + ' | ' + language + ' | ' + url + '\n' + text;
                        notifyFunc(text, type);
                    });
        } else {
            text = '******' + date + '******\n' + webvisor + ' | ' + browser + ' | ' + width + 'x' + height + ' | ' + language + ' | ' + url + '\n' + text;
            notifyFunc(text, type);
        }
    } else {
        notifyFunc(text, type);
    }
}

window.onerror = function (msg, url, line) {
    notiDev('info', msg, url, 'Line number: ' + line);
}

/******************
ANALYTICS
******************/
function analyticsEvent(event, payload) {
    switch(event) {
        case "left contacts":
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'left contacts', payload);
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'AddToWishlist', payload);
            }
            if (typeof VK != 'undefined') {
                VK.Retargeting.Event('left contacts');
            }
            break;
        case "signed":
            if (typeof yaCounter33503888 != 'undefined') {
                yaCounter33503888.reachGoal('signed')
            };
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'signed');
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'InitiateCheckout');
            }
            if (typeof VK != 'undefined') {
                VK.Retargeting.Event('signed');
            }
            break;
        case "offered":
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'offered', payload);
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'CompleteRegistration', payload);
            }
            if (typeof VK != 'undefined') {
                VK.Retargeting.Event('offered');
            }
            break;
        case "calculated":
            if (typeof yaCounter33503888 != 'undefined') {
                yaCounter33503888.reachGoal('compensation');
            }
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'calculated', payload.euAir, payload.sum);
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'Purchase', {value: payload.sum, currency: "EUR"});
            }
            if (typeof VK != 'undefined') {
                VK.Retargeting.Event('calculated');
            }
            break;
        case "touched departure":
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'touched departure', payload);
            }
            break;
        case "filled companions":
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'filled companions', 'companions', payload);
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'AddPaymentInfo', {companions: payload});
            }
            break;
        case "filled changes reason and descript":
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'filled changes reason and descript');
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'AddToCart');
            }
            break;
        case "complete application":
            if (typeof yaCounter33503888 != 'undefined') {
                yaCounter33503888.reachGoal('finished')
            };
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'finished', 'complete application');
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'CustomizeProduct');
            }
            break;
        case "partner":
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'conversion', 'partner', payload);
            }
            if (typeof fbq != 'undefined') {
                fbq('track', 'Contact');
            }
    }
}

function retrieveSourceParams (name) {
    if (utmCookie != undefined) {
        if (utmCookie.readCookie(name) != undefined) {
            return utmCookie.readCookie(name);
        } else if (getUrlParameterByName(name) != undefined) {
            return getUrlParameterByName(name);
        } else {
            return '';
        }
    } else if (getUrlParameterByName(name) != undefined) {
        return getUrlParameterByName(name);
    } else {
        return '';
    }
}

/******************
WORKING WITH API
******************/
// @link https://stackoverflow.com/a/18560314
if (!Object.keys) {
    Object.keys = function (obj) {
        var arr = [],
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(key);
            }
        }
        return arr;
    };
}

function saveReturnedOpportunityDataToStorage(result) {
    console.log(result);
    if (typeof result !== "undefined") {
        window.sessionStorage.setItem("profileLink", JSON.stringify(result.profileLink));
        window.sessionStorage.setItem("opportunityId", JSON.stringify(result.opportunityId));
        window.sessionStorage.setItem("toBeChased", JSON.stringify(result.toBeChased));
    }
    return result;
};

/******************
DOCUMENT READY SECTION START
******************/
$(document).ready(function () {
    if (!inIframe() && utmCookie != undefined && !utmCookie.readCookie("policy_agreed")) {
        $('#cookie-disclaimer').removeClass('display-none');

        $('#cookie-button').click(function(evt) {
            evt.preventDefault();
            utmCookie.writeCookie("policy_agreed", true);
            $('#cookie-disclaimer').addClass('display-none');
        });
    }

    /******************
     IFRAME STYLING
     ******************/
    if (inIframe()) {
        $('#header').addClass('display-none');
        $('body').addClass('body-iframe');
        $('#footer').addClass('display-none');
        $('section.calculaton').css('margin-top', '50px');
        $('.ask-question').addClass('display-none');

        function setForChanges() {
            setTimeout(function () {
                var cur = $('.envisioned');
                var curHeight = parseInt(cur.outerHeight());
                var next = cur.next();
                var nextHeight = next.outerHeight();
                $('.cform-container').height(curHeight + 50);
                setForChanges();
            }, 1000);
        }
        setForChanges();
    }

    /******************
     PRIMARY CLEANOUT
     *****************/
    $('.cform-departure').val('');
    $('.cform-arrival').val('');
    $('.cform-mdeparture').val('');
    $('.cform-marrival').val('');
    $('.cform-airline').val('');
    $('.cform-country').val('');

    $(".envisioned .action-next").keydown(function (e) {
        if ($(this).parent().parent().hasClass('envisioned')) {
            if (e.which === 9) { //tab
                e.preventDefault();
            }
        }
    });

    if (page === 'check-flight') {
        /******************
         DEPARTURE TRIGGERS
         ******************/
        $(".cform-departure").one("keydown", function (touch) {
            try {
                analyticsEvent("touched departure", {'dimension3': language, 'dimension4': language});
            } catch (err) {
                notiDev('Catch: Catching the first keydown in cform-departure failed.', err.toString());
            }
        });

        var dropdownFocusFunction = function (cls, el) {
            try {
                $('.' + cls + '-dropdown').removeClass('display-none');
                if (parseInt($(window).outerHeight()) < 500 || parseInt($(window).outerWidth()) < 400) {
                    $("html,body").animate({scrollTop: el.offset().top - 50}, 200);
                }
            } catch (err) {
                notiDev('Catch: Failed to execute focus on dropdown element.', err.toString());
            }
        }

        $('.cform-departure').focus(function () {
            if (!$(this).hasClass('hasId')) {
                dropdownFocusFunction('departure', $(this));
            }
        });
    }

    if (page === 'app' || page === 'check-flight' || page === 'consent'|| page === 'new-employees'){
        function selectRow(fieldName) {
            buttonToggle();
            if (fieldName === "arrival") {
                $('.cform-mdeparture').val($('.cform-arrival').val());
            }
        }

        $.getScript("/assets/js/dropdown.js", function () {
            if (page === 'app' || page === 'consent' || page === 'new-employees') {
                setTriggers('country', function(){}, 'country');
            } else {
                setTriggers('departure', selectRow, 'airport');
                setTriggers('arrival', selectRow, 'airport');
                setTriggers('marrival', selectRow, 'airport');
                setTriggers('airline', selectRow, 'airline');
            }

            /*****************
             MASK DATE IF CANNOT HANDLE
             *****************/

            function maskDatesIfNecessary() {
                if (typeof (Modernizr) !== "undefined" && !Modernizr.inputtypes.date) {
                    $.getScript("/assets/js/external/jquery.mask.min.js", function () {
                        $('.cform-date').attr('type', 'text');
                        $('.cform-date').mask('00.00.0000', {placeholder: "ДД.ММ.ГГГГ"});
                        $('.cform-birthdate').attr('type', 'text');
                        $('.cform-birthdate').mask('00.00.0000', {placeholder: "ДД.ММ.ГГГГ"});
                        $('.cform-companion-birthdate').attr('type', 'text');
                        $('.cform-companion-birthdate').mask('00.00.0000', {placeholder: "ДД.ММ.ГГГГ"});
                    }).fail(function (a) {
                        getParamsFromUrlToPage();
                    });
                } else {
                    getParamsFromUrlToPage();
                }
            }

            try {
                maskDatesIfNecessary();
            } catch (err) {
                notiDev('Modernizr check failed.', err.toString());
            }
        }).fail(function (a) {
            console.log('getscript failed');
        });
    } else if (page === 'index') {
        function jumbotronFallback() {
            if (typeof (Modernizr) !== "undefined" && !Modernizr.backgroundblendmode) {
                $('.jumbotron').css('background-image', 'none');
                $('.jumbotron').css('background', '#358db6');
            }
        }
        try {
            jumbotronFallback();
        } catch (err) {
            notiDev('Modernizr check failed.', err.toString());
        }
    }

    /*************************************
     APP FRONT-END FUNCTIONS
     *************************************/
    var buttonToggle = function (source) {
        try {
            var inputs = $('.envisioned input');
            var radios = $('.envisioned .tip-radio-block');
            var n = 0;
            var p = 0;
            if (inputs.length > 0) {
                for (var i = 0; i < inputs.length; i++) {
                    if ((' ' + inputs[i].className + ' ').indexOf(' ' + 'display-none' + ' ') < 0 && (' ' + inputs[i].className + ' ').indexOf(' ' + 'dz-hidden-input' + ' ') < 0 && inputs[i].type !== "checkbox" && $(inputs[i]).parents('.display-none').length < 1 ) {
                        p = p + 1;
                        if ($('.fromToMissed').hasClass('display-none') && (' ' + inputs[i].className + ' ').indexOf(' ' + 'cform-marrival' + ' ') > 0) {
                            p = p - 1;
                        }
                        if (inputs[i].value.length > 0) {
                            n = n + 1;
                            if ($('.fromToMissed').hasClass('display-none') && (' ' + inputs[i].className + ' ').indexOf(' ' + 'cform-marrival' + ' ') > 0) {
                                n = n - 1;
                            }
                            if ($('.minor-companions').hasClass('display-none') && (' ' + inputs[i].className + ' ').indexOf(' ' + 'cform-companion-name' + ' ') > 0){
                                n = n - 1;
                            }
                            if ($('.minor-companions').hasClass('display-none') && (' ' + inputs[i].className + ' ').indexOf(' ' + 'cform-companion-birthdate' + ' ') > 0){
                                n = n - 1;
                            }
                        }
                    }
                }

                if (n === p) {
                    var l = 0;
                    var m = 0;
                    for (var k = 0; k < radios.length; k++){
                        if ((' ' + radios[k].className + ' ').indexOf(' ' + 'display-none' + ' ') < 0) {
                            l = l + 1;
                            if (radios[k].querySelector('.radio-active') != null) {
                                m = m + 1;
                            }
                        }
                    }

                    var activateButton = true;
                    if (l === m) {
                        if (
                            typeof signaturePad !== 'undefined' &&
                            signaturePad.isEmpty() &&
                            source !== 'signaturePadOnBegin'
                        ) {
                            activateButton = false;
                        }

                        if (
                            ( $('.envisioned').find('.policyagree-container input').length > 0 && !$('.envisioned').find('.policyagree-container input').is(":checked")) ||
                            ( $('.envisioned').find('.prbox-container input').length > 0 && !$('.envisioned').find('.prbox-container input').is(":checked"))
                        ) {
                            activateButton = false;
                        }
                    } else {
                        activateButton = false;
                    }

                    if (activateButton) {
                        $('.envisioned .action-button.action-next').addClass('ready-button');
                        $('.envisioned .action-button.submit-claim-button').addClass('ready-button');
                    } else {
                        $('.envisioned .action-button.action-next').removeClass('ready-button');
                        $('.envisioned .action-button.submit-claim-button').removeClass('ready-button');
                    }
                }
            }
        } catch (err) {
            notiDev('Catch: Button toggle processing failed.', err.toString());
        }
    };

    $('input').keyup(function (e) {
        buttonToggle();
    });

    function retrieveParam(str, param) {
        if (str.indexOf(param+'=') > -1) {
            var afterCode = str.substr(str.indexOf(param+'=')+param.length+1);
            if (afterCode.indexOf('&')>0) {
                afterCode = afterCode.substr(0, afterCode.indexOf('&'));
            }
            if (param != 'phone') {
                return afterCode.replace("+", " ").replace("%20", " ");
            } else {
                return afterCode;
            }
        }
    }

    function formatDate (inputDate) {
        var date = new Date(inputDate);
        if (!isNaN(date.getTime())) {
            var day = date.getDate().toString()[1] ? date.getDate().toString() : '0' + date.getDate().toString();
            var month = (date.getMonth() + 1).toString()[1] ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1).toString();
            return day + '.' + month + '.' + date.getFullYear();
        }
    }

    function getParamsFromUrlToPage () {
        try {
            var url = window.location.href;
            var urlRegex = /#(.*)/;
            var hash = urlRegex.exec(url);
            var delayMin;
            if (hash != null) {
                selectRadio($('#radio-' + retrieveParam(hash[1], 'typeOfDisruption')));

                setValue('airline', selectRow, 'airline', retrieveParam(hash[1], 'airline'));
                setValue('departure', selectRow, 'airport', retrieveParam(hash[1], 'departure'));
                setValue('arrival', selectRow, 'airport', retrieveParam(hash[1], 'arrival'));
                setValue('marrival', selectRow, 'airport', retrieveParam(hash[1], 'marrival'));
                setValue('country', selectRow, 'country', retrieveParam(hash[1], 'country'));

                if ($('.cform-date').attr('type') === 'date') {
                    $('.cform-date').val(retrieveParam(hash[1], 'date'));
                } else {
                    $('.cform-date').val(formatDate(retrieveParam(hash[1], 'date')));
                }

                if ($(retrieveParam(hash[1], 'delay')).selector < 120){
                    delayMin = 110;
                }
                if ($(retrieveParam(hash[1], 'delay')).selector > 119 && $(retrieveParam(hash[1], 'delay')).selector < 180){
                    delayMin = 150;
                }
                if ($(retrieveParam(hash[1], 'delay')).selector > 179 && $(retrieveParam(hash[1], 'delay')).selector < 240){
                    delayMin = 210;
                }
                if ($(retrieveParam(hash[1], 'delay')).selector > 239){
                    delayMin = 250;
                }
                selectRadio($('#radio-' + delayMin));

                selectRadio($('#radio-' + retrieveParam(hash[1], 'warnedBefore')));
                $('.cform-name').val(retrieveParam(hash[1], 'name'));
                $('.cform-email1').val(retrieveParam(hash[1], 'email'));
                $('.cform-phoneNumber').val(retrieveParam(hash[1], 'phone'));
                $('.cform-city').val(retrieveParam(hash[1], 'city'));
                $('.cform-address').val(retrieveParam(hash[1], 'address'));
                $('.cform-birthdate').val(retrieveParam(hash[1], 'birthdate'));
                $('.cform-flightNumber').val(retrieveParam(hash[1], 'flightNumber'));
                $('.cform-bookingNumber').val(retrieveParam(hash[1], 'bookingNumber'));
                $('.cform-ticketNumber').val(retrieveParam(hash[1], 'ticketNumber'));

                if ($('#companion-container').length > 0) {
                    var fellowPassengersString = decodeURI(retrieveParam(hash[1], 'fellowPassengers'));

                    var fellowPassengers = JSON.parse(fellowPassengersString);
                    var minorFellowPassengers = [];
                    var majorFellowPassengers = [];
                    for (var i=0; i<fellowPassengers.length; i++) {
                        if (fellowPassengers[i].minor) {
                            minorFellowPassengers.push(fellowPassengers[i]);
                        } else {
                            majorFellowPassengers.push(fellowPassengers[i]);
                        }
                    }

                    if (minorFellowPassengers.length > 0) {
                        $('.age-checkbox').prop('checked', true);
                        showMinorCompanions();

                        for (var n=0; n<minorFellowPassengers.length; n++) {
                            if (n > 0) {
                                addCompanionsProcess();
                            }
                            $('#minor-companion-container .companion-item').eq(n).find('.cform-companion-name').val(minorFellowPassengers[n]['name']);
                            $('#minor-companion-container .companion-item').eq(n).find('.cform-companion-birthdate').val(minorFellowPassengers[n]['birthdate']);
                        }
                    }

                    if (majorFellowPassengers.length > 0) {
                        for (var n=0; n<majorFellowPassengers.length; n++) {
                            if (n > 0) {
                                addMajorCompanion();
                            }
                            $('#companion-container .companion-item').eq(n).find('.cform-companion-name').val(majorFellowPassengers[n]['name']);
                            $('#companion-container .companion-item').eq(n).find('.cform-companion-email').val(majorFellowPassengers[n]['email']);
                        }
                    }
                }
            }
        } catch (err) {
            notiDev('getParamsFromUrlToPage failed.', err.toString());
        }
    };

    var pageIdentification = function () {
        try {
            var url = window.location.href;
            var urlRegex = /#(.*)/;
            var hash = urlRegex.exec(url);
            if (hash != null) {
                var id = hash[1];
                switch (id) {
                    case "6":
                        $('.signature').addClass('subvisioned');
                        $('.signature').removeClass('envisioned');
                        setTimeout(function () {
                            $('.companions').addClass('envisioned');
                            $('.companions').removeClass('provisioned');
                            $('.cform-container').height($('.envisioned').outerHeight() + 50);
                        }, 100);
                        break
                    case "7":
                        $('.signature').addClass('subvisioned');
                        $('.signature').removeClass('envisioned');
                        $('.companions').addClass('subvisioned');
                        $('.companions').removeClass('provisioned');
                        setTimeout(function () {
                            $('.documents').addClass('envisioned');
                            $('.documents').removeClass('provisioned');
                            $('.cform-container').height($('.envisioned').outerHeight() + 50);
                        }, 100);
                        break
                    case "8":
                        $('.signature').addClass('subvisioned');
                        $('.signature').removeClass('envisioned');
                        $('.companions').addClass('subvisioned');
                        $('.companions').removeClass('provisioned');
                        $('.documents').addClass('subvisioned');
                        $('.documents').removeClass('provisioned');
                        setTimeout(function () {
                            $('.other').addClass('envisioned');
                            $('.other').removeClass('provisioned');
                            $('.cform-container').height($('.envisioned').outerHeight() + 50);
                        }, 100);
                        break
                    case "9":
                        $('.signature').addClass('subvisioned');
                        $('.signature').removeClass('envisioned');
                        $('.companions').addClass('subvisioned');
                        $('.companions').removeClass('provisioned');
                        $('.documents').addClass('subvisioned');
                        $('.documents').removeClass('provisioned');
                        $('.other').addClass('subvisioned');
                        $('.other').removeClass('provisioned');
                        setTimeout(function () {
                            $('.final').addClass('envisioned');
                            $('.final').removeClass('provisioned');
                            $('.cform-container').height($('.envisioned').outerHeight() + 50);
                        }, 100);
                        break
                    case "howitworks":
                        $('html,body').animate({scrollTop: $('.howitworks-user').offset().top});
                        break
                    case "contacts":
                        $('html,body').animate({scrollTop: $('footer#footer').offset().top});
                        break
                    default:
                        id = 5;
                }
                if (id == '') {
                    id = 5;
                }
                var newNumTen = parseInt(id) * 100 / 9
                if (page === 'app') {
                    $('.heading').text(textItems_applicationHeading + ' (' + id + '/9)');
                    $('.heading-progress').css('width', newNumTen + '%');
                }
            }
        } catch (err) {
            notiDev('Page identification failed.', err.toString());
        }
    }

    pageIdentification();

    $(window).on('hashchange', function (e) {
        pageIdentification();
    });

    var cur = $('.envisioned');
    var curHeight = parseInt(cur.outerHeight());
    var next = cur.next();
    var nextHeight = next.outerHeight();
    $('.cform-container').height(curHeight + 50);

    function heightChange (classy, st) {
        try {
            var num = 2 * st - 1
            var curHeight = parseInt($('.cform-container').outerHeight());
            var blockHeight = parseInt($(classy).outerHeight());
            if (st == 1) {
                blockHeight = blockHeight + parseInt($(classy).css('margin-bottom')) + parseInt($(classy).css('margin-top'));
            } else {
                var activists = $(classy).find('.radio-active');
                activists.each(function () {
                    $(this).removeClass('radio-active');
                })
            }
            var newHeight = curHeight + num * blockHeight + 50;
            $('.cform-container').css('height', newHeight + 'px');
        } catch (err) {
            notiDev('Height change failed.', err.toString());
        }
    }

    function toggle (classy, st) {
        if (st) {
            if ($(classy).hasClass('display-none')) {
                $(classy).removeClass('display-none');
                heightChange(classy, st);
            }
        } else {
            if (!$(classy).hasClass('display-none')) {
                $(classy).addClass('display-none');
                heightChange(classy, st);
            }
        }
    }

    function typeBlockFunction (word) {
        if (word == "radio-cancellation") {
            toggle('.cancelWarning', 1);
            toggle('.fromToMissed', 0);
            toggle('.fromToTip', 0);
            toggle('.infoMissed', 0);
            toggle('.connectionTime', 0);
            $('.from-to-basic .cform-arrival').attr('placeholder', textItems_to);
        } else if (word == "radio-denied_boarding") {
            toggle('.cancelWarning', 0);
            toggle('.fromToMissed', 0);
            toggle('.fromToTip', 0);
            toggle('.infoMissed', 0);
            toggle('.connectionTime', 0);
            $('.from-to-basic .cform-arrival').attr('placeholder', textItems_to);
        } else if (word == "radio-delay") {
            toggle('.cancelWarning', 0);
            toggle('.fromToMissed', 0);
            toggle('.fromToTip', 0);
            toggle('.infoMissed', 0);
            toggle('.connectionTime', 0);
            $('.from-to-basic .cform-arrival').attr('placeholder', textItems_to);
        } else if (word == "radio-missed_connection") {
            toggle('.cancelWarning', 0);
            toggle('.fromToMissed', 1);
            toggle('.fromToTip', 1);
            toggle('.infoMissed', 1);
            toggle('.connectionTime', 1);
            $('.from-to-basic .cform-arrival').attr('placeholder', textItems_connection);
        } else {
            notiDev('Else: word in typeBlockFunction is neither of the options, it is ' + word)
        }
    };

    var widgetBorderFunction = function (word) {
        try {
            if (word == "radio-with") {
                $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/width:\s100%;/, "border: 1px solid #ccc; width: 100%;"));
                $('iframe').css('border', '1px solid #ccc');
            } else {
                $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/border:\s1px\ssolid\s#ccc;\s/, ""));
                $('iframe').css('border', 'none');
            }
        } catch (err) {
            notiDev('flightChangesBlockFunction failed.', err.toString());
        }
    }

    var widgetWidthFunction = function (word) {
        try {
            if (word == "radio-adaptive") {
                $('.width-type-symbol').html('%');
                $('.cform-widgetWidth').val(100);
                $('iframe').css('width', '100%');
                $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/width:\s\d*.{1,2}\;/, "width: 100%;"));
            } else {
                $('.width-type-symbol').html(textItems_px);
                $('.cform-widgetWidth').val(350);
                $('iframe').css('width', '350px');
                $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/width:\s\d*.{1,2}\;/, "width: 350px;"));
            }
        } catch (err) {
            notiDev('flightChangesBlockFunction failed.', err.toString());
        }
    }

    function selectRadio (option) {
        if (option.length > 0 && !option.hasClass('radio-active')) {

            var error = option.closest('.cform-error');
            error.removeClass('cform-error');

            var parent = option.parent();
            parent.children('.radio-item').each(function (index) {
                $(this).removeClass('radio-active');
            });
            option.addClass('radio-active');

            var block = option.closest('.tip-radio-block');
            var classList = block.attr('class').split(/\s+/);
            var blockType = classList[2];
            switch (blockType) {
                case "flightType":
                    var typeClass = option.attr('class').split(/\s+/);
                    typeBlockFunction(typeClass[1]);
                    break;
                case "partnerType":
                    partnerTypeFunction(option.attr('id'));
                    break;
                case "widgetBorder":
                    widgetBorderFunction(option.attr('id'));
                    break;
                case "widgetWidth":
                    widgetWidthFunction(option.attr('id'));
                    break;
                case "visaCountry":
                    displayVisaCard(option.attr('id'));
                    break;
            }
            buttonToggle();
        }
    }


    /*********************
     APP FRONT-END TRIGGERS
     *********************/
    $('.radio-block').on('click', '.radio-item', function (evt) {
        try {
            evt.preventDefault();
            selectRadio($(this));
        } catch (err) {
            notiDev('Catch: Radio item toggle failed.', err.toString());
        }
    });

    function addMajorCompanion() {
        var cont = document.getElementById('companion-container');
        var item = document.createElement('div');
        item.className = "companion-item";

        var createBlock = function (imgUserTag, imgUserSrc, inputUserClass, inputUserPlaceholder) {
            var blockUser = document.createElement('div');
            blockUser.className = "cform-block-item";

            var iconUser = document.createElement('div');
            iconUser.className = "cform-block-item-icon";
            var imgUser = document.createElement(imgUserTag);
            if (imgUserTag == 'p') {
                imgUser.innerHTML = '@';
                imgUser.className = 'cform-block-item-icon-img';
            } else {
                imgUser.src = imgUserSrc;
            }
            iconUser.appendChild(imgUser);

            var inputUser = document.createElement('input');
            inputUser.type = "text";
            inputUser.className = inputUserClass;
            inputUser.placeholder = inputUserPlaceholder;

            blockUser.appendChild(iconUser);
            blockUser.appendChild(inputUser);

            return blockUser;
        }

        var nameBlock = createBlock('img', '/img/colors/' + partnerColor + '/user.svg', 'cform-block-item-input cform-companion-name', textItems_inputUserPlaceholderName);
        var emailBlock = createBlock('p', '', 'cform-block-item-input cform-companion-email', 'E-mail (' + textItems_optional + ')');

        item.appendChild(nameBlock);
        item.appendChild(emailBlock);

        var compHeight = parseInt($('#companion-container .companion-item').outerHeight());
        var curMaxHeight = parseInt($('.companions.envisioned').css('max-height'));
        var blockNewHeight = curMaxHeight + compHeight + 50;
        var contNewHeight = curMaxHeight + compHeight + 150;
        $('.companions.envisioned').css('max-height', blockNewHeight + 'px');
        $('.cform-container').css('height', contNewHeight + 'px');
        cont.appendChild(item);
        $('.no-companions').addClass('display-none');
    }

    $('.companions .add-companions').click(function (evt) {
        evt.preventDefault();
        try {
            addMajorCompanion();
        } catch (err) {
            notiDev('Catch: Adding companions failed.', err.toString());
        }
        alarmGoodName('.cform-companion-name');
    });

    $('.reason-field').change(function (evt) {
        try {
            var reason = convertReason($(this).find('option:selected').attr('id'));
            if (reason == "Weather conditions" || reason == "Strike" || reason == "Other") {
                $('.reason-descript-block').removeClass('display-none');
                var reasHeight = parseInt($('.reason-descript-block').outerHeight());
                var curHeight = parseInt($('.cform-container').outerHeight());
                var newHeight = curHeight + reasHeight;
                $('.cform-container').css('height', newHeight + 'px');
            } else {
                $('.reason-descript-block').addClass('display-none');
            }
        } catch (err) {
            notiDev('Catch: Reason field change failed.', err.toString());
        }
    });

    $('.inline-info').click(function (evt) {
        evt.preventDefault();
        try {
            $('.modal-background').removeClass('display-none');
        } catch (err) {
            notiDev('Catch: Returning consent failed.', err.toString());
        }
    });

    $(document).click(function(e) {
        if ($('.question-block').find($(e.target)).length === 0) {
            if (
                (
                    $(e.target).hasClass('ask-question') ||
                    $(e.target).parents('.ask-question').length > 0
                ) &&
                $('.question-block').hasClass('display-none')
            ) {
                $('.question-block').removeClass('display-none');
            } else {
                $('.question-block').addClass('display-none');
            }
        }
    });

    $('.envisioned').on('click', '.add-city', function (event) {
        event.stopPropagation();
        try {
            var inputField = $(this).parent().parent().parent().find('input');
            if (inputField.hasClass('cform-airline')) {
                var addItem = textItems_addAirline;
                var itemPlaceholder = textItems_airlinePlaceholder;
            } else {
                var addItem = textItems_addCity;
                var itemPlaceholder = textItems_cityPlaceholder;
            }
            var val = inputField.val();
            $('#modal-content').html('');
            var cont = document.getElementById('modal-content');
            var item = document.createElement('div');
            item.className = "modal-question-container";

            var modalPara = document.createElement('p');
            modalPara.innerHTML = addItem;
            var input = document.createElement('input');
            input.type = "text";
            input.className = "modal-question-input modal-question-city";
            if (val == "") {
                input.placeholder = itemPlaceholder;
            } else {
                input.value = val;
            }

            var butcont = document.createElement('div');
            butcont.className = "action-button-container cform-block";

            var button = document.createElement('a');
            button.className = "action-button add-city-button ready-button";
            button.innerHTML = textItems_saveButtonValue;

            butcont.appendChild(button);

            item.appendChild(modalPara);
            item.appendChild(input);
            item.appendChild(butcont);

            cont.appendChild(item);

            $('.modal-background').removeClass('display-none');
            modalAddCity(inputField);
        } catch (err) {
            notiDev('Catch: Clicking on add-city failed.', err.toString());
        }
    });

    function modalAddCity(inputField) {
        $("#modal-content").on("click", ".add-city-button", function (event) {
            event.stopPropagation();
            var endpoint = 'airports';
            if (inputField.hasClass('cform-airline')) {
                endpoint = 'airlines';
            }
            callApi(
                getCompensairApiUrl(endpoint, 'index'),
                {"keyword": $("#modal-content input").val()}
                )
                .always(function(result) {
                    if (result != undefined) {
                        var vally = $("#modal-content input").val();
                        inputField.val(vally);
                        inputField.attr("id", result);
                        inputField.addClass('hasId');
                        $('.dropdown-item-active').removeClass('dropdown-item-active');
                        if (inputField.hasClass('cform-arrival')) {
                            $('.cform-mdeparture').val($('.cform-arrival').val());
                        }
                        inputField.parent().removeClass('cform-error');
                        inputField.next('.dropdown').addClass('display-none');
                        $('.modal-background').addClass('display-none');
                        listenToChanges(undefined, vally, inputField);
                        $("#modal-content").off();
                    } else {
                        notiDev('Else: Saving airport returns undefined', err.toString());
                    }
                });
        })
    }

    $('.modal-background').click(function (event) {
        event.preventDefault();
        try {
            if (!$(event.target).closest('.modal-content').length && !$(event.target).is('.modal-content')) {
                if ($('.modal-background').is(":visible")) {
                    $('.modal-background').addClass('display-none');
                }
            }
        } catch (err) {
            notiDev('Closing modal failed.', err.toString());
        }
    });

    $('.navbar-toggle').click(function (evt) {
        evt.preventDefault();
        if ($(this).hasClass('collapsed')) {
            $(this).removeClass('collapsed');
            $('.navbar-collapse').removeClass('collapse');
            $('.header-modal-background').removeClass('display-none');
        } else {
            $(this).addClass('collapsed');
            $('.navbar-collapse').addClass('collapse');
            $('.header-modal-background').addClass('display-none');
        }
    });

    $('.howitworks-transition-img .arrow-image').click(function () {
        $('html,body').animate({scrollTop: $(document).height() - $('#apply-button-container').height()});
    });

    /******************************
     VALIDATING AND SAVING FUNCTIONS
     *******************************/
    function radioValidationImprovedId (key, obj) {
        try {
            var typeContain = $('.' + key).find('.radio-active');
            if (typeContain == null || typeContain == undefined || typeContain.length < 1) {
                $('.' + key).addClass('cform-error cform-radio-error');
                $('.' + key).attr('data-content', errors_radio);
                obj.err[key] = "empty";
                $('html,body').animate({scrollTop: 0});
            } else {
                $('.' + key).removeClass('cform-error cform-radio-error');
                obj.save[key] = typeContain.attr('id').substring(6);
            }
            return obj;
        } catch (err) {
            notiDev('Radio validation improved id failed.', err.toString());
        }
    };

    var checkboxValidate = function (key, obj, dontScroll) {
        try {
            if ($('.cform-' + key).is(":visible") && !$('.cform-' + key).is(":checked")) {
                $('.cform-' + key).parent().addClass('cform-error cform-' + key + '-error');
                $('.cform-' + key).parent().attr('data-content', jQuery.i18n.prop('errors_' + key));
                obj.err[key] = "empty";
                textValidateScroll(dontScroll);
            } else {
                $('.cform-' + key).parent().removeClass('cform-error cform-' + key + '-error');
                obj.save[key] = true;
            }
            return obj;
        } catch (err) {
            notiDev('Checkbox validation failed.', err.toString());
        }
    };

    var convertFlightType = function (flightTypeClass) {
        switch (flightTypeClass) {
            case 'delay':
                return 'Delay'
                break
            case 'cancellation':
                return 'Cancellation'
                break
            case 'denied_boarding':
                return 'Overbooking'
                break
            case 'missed_connection':
                return 'Missed connection'
                break
            default:
                notiDev("in convertFlightType type is neither of the options, it is " + flightTypeClass);
        }
    }

    function getURLParameter(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    function getAav() {
        var conversionRates = {
            'Russian': {
                'organic': 0.614906832298137,
                'facebook': 0.388150807899461
            },
            'English': {
                'organic': 0.275942298743602,
                'facebook': 0.36897529364115
            },
            'Ukrainan': {
                'organic': 0.608695652173913,
                'facebook': 0.387096774193548
            },
            'German': {
                'organic': 0.48780487804878,
                'facebook': 0.333333333333333
            },
            'French': {
                'organic': 0.415094339622642,
                'facebook': 0.254237288135593
            },
            'Italian': {
                'organic': 0.5,
                'facebook': 0.34375
            },
            'Spanish': {
                'organic': 0.466666666666667,
                'facebook': 0.615384615384615
            },
            'Default': {
                'organic': 0.457841309,
                'facebook': 0.377289377
            }
        };

        var fbUtmSources = ["fb", "turkey_fb", "spain_fb", "facebook", "spain_lookalike_fb", "fb_airports",
            "turkey_fb_convers", "fb2", "fb_messenger_menu", "fb_messenger_welcome_calc", "fb_messenger_welcome_check"];
        if (fbUtmSources.indexOf(retrieveSourceParams('utm_source')) > -1) {
            var source = 'facebook';
        } else {
            var source = 'organic';
        }

        var conversionRate = '';
        if (typeof conversionRates[language] === 'undefined') {
            conversionRate = conversionRates['Default'][source];
        } else {
            conversionRate = conversionRates[language][source];
        }


        var airlineField = $('.cform-airline');
        var cumulativeAcv90 =
            parseFloat(airlineField.attr('acv30')) +
            parseFloat(airlineField.attr('acv60')) +
            parseFloat(airlineField.attr('acv90'));

        return cumulativeAcv90 * conversionRate;
    }

    var firstData = function (idyObj, button) {
        try {
            var oldObj = sessionStorageToObject();
            resetSessionStorage();
            var obj = {
                "save": {},
                "err": {}
            }
            if (partnerId !== undefined && partnerId !== '') {
                obj.save.partner = partnerId;
            }
            obj.save.binId = oldObj.binId !== undefined ? oldObj.binId : getURLParameter('binId');
            obj.save.promoId = oldObj.promoId !== undefined ? oldObj.promoId : getURLParameter('promoId');
            obj = textValidate('departure', obj);
            obj = textValidate('arrival', obj);
            obj = textValidate('date', obj);
            obj = textValidate('airline', obj);

            if (isNaN(getAav())) {
                obj.save['airlineShortAcv'] = 0;
            } else {
                obj.save['airlineShortAcv'] = getAav().toFixed(2);
            }

            obj = radioValidationImprovedId('flightType', obj);
            obj = radioValidationImprovedId('delayHours', obj, 1);
            obj.save.url = window.location.href;

            obj.save.flightType = convertFlightType(obj.save.flightType);
            var type = obj.save.flightType;

            if (type === "Cancellation") {
                obj = radioValidationImprovedId('cancelWarning', obj, 1);
            } else if (type === "Missed connection") {
                obj = textValidate('marrival', obj);
                obj = radioValidationImprovedId('connectionTime', obj, 1);
            }

            if (obj.save.cancelWarning === undefined) {
                obj.save.cancelWarning = "lessThan7";
            }

            if (obj.save.connectionTime === "lesshour") {
                obj.save.connectionTime = 0.9;
            }

            if (obj.save.connectionTime === "morehour") {
                obj.save.connectionTime = 1.1;
            }

            if (obj.save.connectionTime === "alreadyflown") {
                obj.save.connectionTime = 0;
            }

            var request = $.extend(true, {}, obj.save);
            delete request['url'];
            delete request['user'];
            delete request['password'];

            request.airline = {"id": request.airline};
            request.arrival = {"id": request.arrival};
            request.departure = {"id": request.departure};
            if (type !== undefined && type === "Missed connection") {
                request.marrival = {"id": request.marrival};
            }

            request.partnerId = partnerId;

            if (Object.keys(obj.err).length > 0) {
                restoreActionNext(button);
                return;
            }

            button.addClass('active');

            callApi(getCompensairApiUrl('compensation', 'calculation'), request)
                .then(function(result) {
                    obj.save.sum = result.sum;
                    obj.save.legislationApplied = result.legislationApplied;
                    obj.save.refuseReason = result.message;
                    obj.save.refuseReasonMessage = convertRefuseReason(result.message, obj.save.airlineString);
                    if (result.commission != undefined) {
                        obj.save.commission = result.commission;
                    }
                    saveToSessionStorage(obj.save);
                    resetAllActionNexts(obj.save);
                    return obj;
                })
                .fail(function(err) {
                    restoreActionNext(button);
                    if (err.status === 422 || err.status === 400) {
                        // Use returned data to display message.
                        obj.save.sum = 0;
                        obj.save.refuseReason = err.statusText;
                    }
                    notiDev('Catch: callApi failed.', err.toString());
                    return obj;
                })
                .always(function(result) {
                    var errLen = Object.keys(obj.err).length;
                    if (errLen > 0 && obj.err.constructor === Object) {
                        restoreActionNext(button);
                    } else {
                        $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                        if (button.hasClass('action-quick')) {
                            button.animate({"padding-right": '200'}, {queue: false});
                        } else {
                            button.addClass('active');
                        }
                        updateCompensation(obj.save);
                        var n = 0;
                    }
                    return obj;
                });
        } catch (err) {
            notiDev('Catch: firstData failed.', err.toString());
        }
    }

    function convertRefuseReason (message, airline) {
        switch (message) {
            case "Both departure airport and arrival airport are outside EU and Turkey":
                return calcRefuse_departureAndArrivalIrrelevant;
                break
            case "Both departure airport and airline are outside EU and Turkey":
                return calcRefuse_departureAndAirlineIrrelevant;
                break
            case "Both departure airport and airline are non-european":
                return calcRefuse_euDepartureAndAirlineIrrelevant;
                break
            case "Both departure airport and arrival airport are non-european":
                return calcRefuse_euDepartureAndArrivalIrrelevant;
                break
            case "The delay of your arrival is less than the legislation minimum":
                return calcRefuse_delayLessThanMinimum;
                break
            case "Flight date is more than 6 years ago":
                return calcRefuse_dateExpired;
                break
            case "Flight date is earlier than the airline individual eligibility period":
                return calcRefuse_individualDateExpired;
                break
            case "Airline has quit and is not active anymore":
                return calcRefuse_airlineInactive(airline);
                break
            case "Airline denies European law and it cannot be enforced due to its jurisdiction":
                return calcRefuse_airlineOutsideJurisdiction(airline);
                break
            case "You were warned of the flight cancellation more than 14 days before the flight date":
                return calcRefuse_warnedBeforehand;
                break
        }
    }

    var secondData = function (idyObj, button, dataFromPrevSteps) {
        try {
            var obj = {
                "save": sessionStorageToObject() != undefined && sessionStorageToObject().departureString != undefined ? sessionStorageToObject() : dataFromPrevSteps,
                "err": {}
            }
            obj = textValidate('name', obj);
            obj = textValidate('email1', obj);
            if (obj.save.email1 != undefined) {
                obj.save.email1 = obj.save.email1.toLowerCase();
            }
            obj = textValidate('phoneNumber', obj);
            obj = checkboxValidate('policycheckbox', obj);
            obj = checkboxValidate('prbox', obj);

            for (var i=0;i<trackingUrlParameters.length; i++) {
                if (retrieveSourceParams(trackingUrlParameters[i]).length > 0) {
                    obj.save[underscoreToCamelCase(trackingUrlParameters[i])] = retrieveSourceParams(trackingUrlParameters[i]);
                }
            }

            obj.save.language = language;

            if (inIframe()) {
                obj.save.iframe = window.name;
            }

            if (inIframe()) {
                if (window.name != undefined && window.name != null) {
                    obj.save.iframe = window.name;
                    if (obj.save.iframe == "MetrikaPlayer") {
                        obj.save.undefinedIframe = true;
                    }
                } else {
                    obj.save.undefinedIframe = true;
                }
            }

            saveToSessionStorage(obj.save);

            if (Object.keys(obj.err).length == 0 || ((Object.keys(obj.err).length == 1 && obj.err['name'] == 'nameSymbols'))) {
                $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                if (button.hasClass('action-quick')) {
                    button.animate({"padding-right": '200'}, {queue: false});
                } else {
                    button.addClass('active');
                }
                callApi(getCompensairApiUrl('all', 'save'), obj.save).always(function(response) {
                        saveReturnedOpportunityDataToStorage(response);
                        var urlHashPart = /#(.*)/.exec(window.location.href) !== null ? /#(.*)/.exec(window.location.href)[0] : '';
                        window.location.href = 'app.html' + urlHashPart;
                    }
                );
                analyticsEvent('left contacts', {
                    'dimension1': obj.sum,
                    'dimension3': obj.save.eng,
                    'dimension4': obj.save.eng,
                    'value': obj.save.airlineShortAcv,
                    'currency': 'EUR'
                });
            } else {
                restoreActionNext(button);
            }
        } catch (err) {
            notiDev('Catch: secondData failed.', err.toString());
        }
    };

    var thirdData = function (idyObj, button) {
        try {
            var oldObj = sessionStorageToObject();
            resetSessionStorage();
            if (oldObj != undefined && oldObj.opportunityId != undefined) {
                saveToSessionStorage({"opportunityId": oldObj.opportunityId});
            }
            if (oldObj != undefined && oldObj.profileLink != undefined) {
                saveToSessionStorage({"profileLink": oldObj.profileLink});
            }
            if (oldObj != undefined && oldObj.toBeChased != undefined) {
                saveToSessionStorage({"toBeChased": oldObj.toBeChased});
            }
            var obj = {
                "save": {},
                "err": {}
            }
            obj = textValidate('country', obj);
            obj = textValidate('city', obj);
            obj = textValidate('address', obj);
            //obj = textValidate('index', obj);
            obj.save.index = '';

            var errLen = Object.keys(obj.err).length;
            if (errLen == 0 && obj.err.constructor === Object) {
                obj.save.completeAddress = obj.save.countryString + ', ' + obj.save.city + ', ' + obj.save.address.replace(/,/g, " ") + ', ' + obj.save.index;
            }

            obj = textValidate('birthdate', obj);

            if ($('.age-checkbox').is(":checked")) {
                var companionArray = [];
                var len = $('#minor-companion-container .companion-item').length;
                for (var i = 0; i < len; i++) {
                    var companion = {};
                    companion.name = $('#minor-companion-container .companion-item').eq(i).find('.cform-companion-name').val();
                    companion.birthdate = $('#minor-companion-container .companion-item').eq(i).find('.cform-companion-birthdate').val();
                    companion.minor = true;
                    if (companion.name != "") {
                        companionArray.push(companion);
                    }
                }
                $('#minor-companion-container .companion-item').remove();
                obj.save.companions = companionArray;
            }

            saveToSessionStorage(obj.save);

            if (signaturePad.isEmpty()) {
                $('.signature-container').addClass('cform-error cform-signature-error');
                $('html,body').animate({scrollTop: 0});
                obj.err.signature = "empty";
            } else {
                var signUrl = signaturePad.toDataURL('image/png', 0.5);
                function dataURItoBlob(dataURI) {
                    var byteString = atob(dataURI.split(',')[1]);
                    var ab = new ArrayBuffer(byteString.length);
                    var ia = new Uint8Array(ab);
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    return new Blob([ab], {type: 'image/png'});
                }
                var name = "image1.png"; //This does *NOT* need to be a unique name
                var base64 = signUrl.split('base64,')[1];
                saveToSessionStorage({signBase64: base64});
            }

            var errLen = Object.keys(obj.err).length;
            if (errLen > 0 && obj.err.constructor === Object) {
                restoreActionNext(button);
            } else {
                $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                if (button.hasClass('action-quick')) {
                    button.animate({"padding-right": '200'}, {queue: false});
                } else {
                    button.addClass('active');
                }

                callApi(getCompensairApiUrl('all', 'save'), sessionStorageToObject())
                    .always(function(response) {
                        saveReturnedOpportunityDataToStorage(response);
                    });
                analyticsEvent("signed");
                nextPage();
            }
        } catch (err) {
            notiDev('Catch: thirdData failed.', err.toString());
        }
    }

    var fourthData = function (comp, idyObj, button) {
        try {
            var oldObj = sessionStorageToObject();
            resetSessionStorage();
            if (oldObj != undefined && oldObj.opportunityId != undefined) {
                saveToSessionStorage({"opportunityId": oldObj.opportunityId});
            }
            if (oldObj != undefined && oldObj.profileLink != undefined) {
                saveToSessionStorage({"profileLink": oldObj.profileLink});
            }
            if (oldObj != undefined && oldObj.toBeChased != undefined) {
                saveToSessionStorage({"toBeChased": oldObj.toBeChased});
            }
            var obj = {
                "save": {},
                "err": {}
            }
            var companionArray = [];
            if (comp) {
                var len = $('#companion-container .companion-item').length;
                for (var i = 0; i < len; i++) {
                    var companion = {};
                    companion.minor = false;
                    companion.email = $('#companion-container .companion-item').eq(i).find('.cform-companion-email').val();
                    companion.name = $('#companion-container .companion-item').eq(i).find('.cform-companion-name').val();
                    if (companion.name != "" || companion.email != "") {
                        companionArray.push(companion);
                    }
                }
            }

            obj.save.companions = companionArray;
            obj.save.companionsNum = companionArray.length;

            saveToSessionStorage(obj.save);

            var errLen = Object.keys(obj.err).length;
            if (errLen > 0 && obj.err.constructor === Object) {
                restoreActionNext(button);
            } else {
                $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                if (button.hasClass('action-quick')) {
                    button.animate({"padding-right": '200'}, {queue: false});
                } else {
                    button.addClass('active');
                }

                analyticsEvent("filled companions", obj.save.companionsNum);
                callApi(getCompensairApiUrl('all', 'save'), sessionStorageToObject())
                    .always(function(response) {
                        saveReturnedOpportunityDataToStorage(response);
                    });
                nextPage();
            }
        } catch (err) {
            notiDev('Catch: fourthData failed.', err.toString());
        }
    }

    function displayOnlyNecessaryFields() {
        try {
            var toBeChased = storageGetItem('toBeChased');
            displayFields(toBeChased);

            function displayFields(toBeChased) {
                if (toBeChased.indexOf('ticketNumber') > -1) {
                    $('.ticketNumber-block').removeClass('display-none');
                }
                if (toBeChased.indexOf('bookingNumber') > -1) {
                    $('.bookingNumber-block').removeClass('display-none');
                }
            }
        } catch (err) {
            notiDev('Catch: displayOnlyNecessaryFields failed.', err.toString());
        }
    }

    function convertReason (reasonId) {
        switch (reasonId) {
            case 'cform-reason-planning':
                return 'Planning failures'
                break
            case 'cform-reason-technical':
                return 'Technical issues'
                break
            case 'cform-reason-weather':
                return 'Weather conditions'
                break
            case 'cform-reason-strike':
                return 'Strike'
                break
            case 'cform-reason-other':
                return 'Other'
                break
            default:
                notiDev("in convertReason type is neither of the options, it is " + reasonId);
        }
    }

    var fifthData = function (idyObj, button) {
        try {
            var oldObj = sessionStorageToObject();
            resetSessionStorage();
            if (oldObj != undefined && oldObj.opportunityId != undefined) {
                saveToSessionStorage({"opportunityId": oldObj.opportunityId});
            }
            if (oldObj != undefined && oldObj.profileLink != undefined) {
                saveToSessionStorage({"profileLink": oldObj.profileLink});
            }
            if (oldObj != undefined && oldObj.toBeChased != undefined) {
                saveToSessionStorage({"toBeChased": oldObj.toBeChased});
            }
            var obj = {
                "save": {},
                "err": {}
            }
            var len = $('.cform-changes-city').length;
            var changesArray = [];
            for (var i = 0; i < len; i++) {
                var city = $('.cform-changes-city').eq(i).val();
                if (city != "") {
                    changesArray.push(city);
                    $('.cform-changes-city').parent().removeClass('cform-error cform-changes-city-error');
                } else {
                    $('.cform-changes-city').parent().addClass('cform-error cform-changes-city-error');
                    obj.err["changes-city"] = "empty";
                    $('html,body').animate({scrollTop: 0});
                }
            }
            obj.save.changes = changesArray;

            var reason = convertReason($('.cform-reason').find('option:selected').attr('id'));
            if (reason == "Weather conditions" || reason == "Strike" || reason == "Other") {
                obj = textValidate('reasonDescript', obj);
            }
            obj.save.reason = reason;
            obj.save.flightDescript = $('.cform-flightDescript').val();

            saveToSessionStorage(obj.save);

            var errLen = Object.keys(obj.err).length;
            if (errLen > 0 && obj.err.constructor === Object) {
                restoreActionNext(button);
            } else {
                $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                if (button.hasClass('action-quick')) {
                    button.animate({"padding-right": '200'}, {queue: false});
                } else {
                    button.addClass('active');
                }

                analyticsEvent("filled changes reason and descript");
                callApi(getCompensairApiUrl('all', 'save'), sessionStorageToObject())
                    .always(function(response) {
                        saveReturnedOpportunityDataToStorage(response);
                    });
                displayOnlyNecessaryFields();
                nextPage();
            }
        } catch (err) {
            notiDev('Catch: fifthData failed.', err.toString());
        }
    }

    var sixthData = function (idyObj, button) {
        try {
                    var oldObj = sessionStorageToObject();
        resetSessionStorage();
        if (oldObj != undefined && oldObj.opportunityId != undefined) {
            saveToSessionStorage({"opportunityId": oldObj.opportunityId});
        }
        if (oldObj != undefined && oldObj.profileLink != undefined) {
            saveToSessionStorage({"profileLink": oldObj.profileLink});
        }
        if (oldObj != undefined && oldObj.toBeChased != undefined) {
            saveToSessionStorage({"toBeChased": oldObj.toBeChased});
        }
            var obj = {
                "save": {},
                "err": {}
            }
            obj = textValidate('flightNumber', obj);
            if (!$('.ticketNumber-block').hasClass('display-none')) {
                obj = textValidate('ticketNumber', obj);
            }
            if (!$('.bookingNumber-block').hasClass('display-none')) {
                obj = textValidate('bookingNumber', obj);
            }

            saveToSessionStorage(obj.save);

            var errLen = Object.keys(obj.err).length;
            if (errLen > 0 && obj.err.constructor === Object) {
                restoreActionNext(button);
            } else {
                $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                if (button.hasClass('action-quick')) {
                    button.animate({"padding-right": '200'}, {queue: false});
                } else {
                    button.addClass('active');
                }

                callApi(getCompensairApiUrl('all', 'save'), sessionStorageToObject())
                    .always(function(response) {
                        saveReturnedOpportunityDataToStorage(response);
                    })
                analyticsEvent("complete application");
                nextPage();
            }

            $('.profile-link').attr('href', storageGetItem('profileLink'));
        } catch (err) {
            notiDev('Catch: sixthData failed.', err.toString());
        }
    };

    var consentData = function (button) {
        try {
            var result = {};
            var obj = {
                "save": {},
                "err": {}
            };
            obj = textValidate('name', obj);
            obj = textValidate('country', obj);
            obj = textValidate('city', obj);
            obj = textValidate('address', obj);
            obj = textValidate('birthdate', obj);

            var errLen = Object.keys(obj.err).length;
            if (errLen == 0 && obj.err.constructor === Object) {
                obj.save.completeAddress = obj.save.country + ', ' + obj.save.city + ', ' + obj.save.address.replace(/,/g, " ") + ', ' + obj.save.index;
            }

            saveToSessionStorage(obj.save);

            if (signaturePad.isEmpty()) {
                $('.signature-container').addClass('cform-error cform-signature-error');
                $('html,body').animate({scrollTop: 0});
                obj.err.signature = "empty";
            } else {
                var signUrl = signaturePad.toDataURL('image/png', 0.5);

                function dataURItoBlob(dataURI) {
                    var byteString = atob(dataURI.split(',')[1]);
                    var ab = new ArrayBuffer(byteString.length);
                    var ia = new Uint8Array(ab);
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    return new Blob([ab], {type: 'image/png'});
                }

                var name = "image1.png"; //This does *NOT* need to be a unique name
                var base64 = signUrl.split('base64,')[1];
                saveToSessionStorage({signBase64: base64});
            }

            var errLen = Object.keys(obj.err).length;
            if (errLen > 0 && obj.err.constructor === Object) {
                restoreActionNext(button);
            } else {
                $('.envisioned .action-quick span').animate({"margin-left": '-=300'}, {queue: false});
                if (button.hasClass('action-quick')) {
                    button.animate({"padding-right": '200'}, {queue: false});
                } else {
                    button.addClass('active');
                }
                callApi(getCompensairApiUrl('consent', 'edit'), sessionStorageToObject())
                    .always(function (response) {
                        nextPage();
                        if (response.downloadConsent !== undefined) {
                            var downLoadCompanionConsentElement = $('.download-companion-consent');
                            downLoadCompanionConsentElement.attr('href', response.downloadConsent);
                            downLoadCompanionConsentElement.removeClass('display-none');
                        }
                        if (response.profileLink !== undefined) {
                            var profileLinkElement = $('.profile-link');
                            profileLinkElement.attr('href', response.profileLink);
                            profileLinkElement.removeClass('display-none');
                        }
                    });
            }
        } catch (err) {
            notiDev('Catch: consentData failed.', err.toString());
        }
    };

    /*********************************
     COMPENSATION CALCULATING FUNCTIONS
     **********************************/

    function convertSumRub(sum) {

        fetch('https://www.cbr-xml-daily.ru/daily_json.js')
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function(data) {
                        var nominal = parseFloat(data.Valute.EUR.Nominal);
                        var value = parseFloat(data.Valute.EUR.Value);
                        var converted = sum / nominal * value;
                        converted = Math.round(converted);

                        var message = '~ ' + converted + ' руб';
                        message = message.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');

                        $('.convertedSum').html(message);
                        $('.convertedSum').removeClass('display-none');

                        return converted;
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }

    function convertSumUah(sum) {

        fetch('https://www.cbr-xml-daily.ru/daily_json.js')
            .then(
                function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function(data) {
                        var nominalRub = parseFloat(data.Valute.EUR.Nominal);
                        var valueRub = parseFloat(data.Valute.EUR.Value);
                        var convertedRub = sum / nominalRub * valueRub;

                        var nominal = parseFloat(data.Valute.UAH.Nominal);
                        var value = parseFloat(data.Valute.UAH.Value);
                        var converted = convertedRub * nominal / value;


                        converted = Math.round(converted);

                        var message = '~ ' + converted + ' грн';
                        message = message.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');

                        $('.convertedSum').html(message);
                        $('.convertedSum').removeClass('display-none');

                        return converted;
                    });
                }
            )
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }

    var updateCompensation = function (obj) {
        try {
            var sum = obj.sum;

            if (sum == 0) {
                if (obj.refuseReason == 'Impossible to calculate, because some entries are custom') {
                    sum = '?';
                    $('strong.para').addClass('display-none');
                    $('.pre-sum').html(textItems_weCantCalculate);
                    $('.post-sum').html(textItems_weCantCalculateButYouCanApply);
                } else {
                    $('strong.para').html('...');
                    $('.pre-sum').html(textItems_noCompensation);
                    $('.post-sum').html(obj.refuseReasonMessage);
                    $('.cta').addClass('display-none');
                    $('.congrats-form').addClass('display-none');
                    $('.congrats-note').addClass('display-none');
                    $('a.action-button').html(textItems_anotherFlight);
                    $('a.action-button').addClass('ready-button');
                    $('a.action-button').attr('href', 'javascript:void(0)');
                    $('a.action-button').attr('onclick', 'location.reload()');
                }
            } else if (sum == undefined) {
                sum = 400;
                notiDev("Sum somehow turned out to be undefined - last moment catch", strObj(obj));

                analyticsEvent("offered", {
                    'dimension1': sum,
                    'dimension3': language,
                    'value': obj.airlineShortAcv,
                    'currency': 'EUR'
                });

            } else {
                if (obj.commission != undefined) {
                    $('.congrats-note--commission').html(obj.commission);
                }
                obj.refuseReason = "none";
                analyticsEvent("offered", {
                    'dimension1': sum,
                    'dimension3': language,
                    'value': obj.airlineShortAcv,
                    'currency': 'EUR'
                });
            }

            if (language === 'Russian') {
                convertSumRub(sum);
            }

            if (language === 'Ukrainian'){
                convertSumUah(sum);
            }

            $('.sum').html('€' + sum);
            nextPage();

            analyticsEvent("calculated", {
                'euAir': obj.euAir,
                'sum': sum
            });

        } catch (err) {
            notiDev('Catch: updateCompensation failed.', err.toString());
        }
    }

    /******************
     SUBMITTING TRIGGERS
     *******************/
    var nextAction = function(evt) {
        evt.preventDefault();
        $(this).off();
        try {
            var idy = $(this).attr('id');
            var idyObj = idy.replace(/-/g, "");
            switch (idy) {
                case "first-button":
                    firstData(idyObj, $(this));
                    break;
                case "second-button":
                    secondData(idyObj, $(this), evt.data);
                    break;
                case "third-button":
                    thirdData(idyObj, $(this));
                    break;
                case "fourth-button":
                    fourthData(true, idyObj, $(this));
                    break;
                case "fifth-button":
                    fifthData(idyObj, $(this));
                    break;
                case "sixth-button":
                    sixthData(idyObj, $(this));
                    break;
                case "no-companions":
                    fourthData(false, "fourthbutton", $(this));
                    break
                case "consent-button":
                    consentData($(this));
                    break
            }
        } catch (err) {
            notiDev('Catch: action-next trigger failed.', err.toString());
        }
    };

    function restoreActionNext(button, params) {
        button.off();
        button.click(params, nextAction);
    }

    function resetAllActionNexts(params) {
        if (params == undefined) {
            params = {};
        }
        $('.action-next').off();
        $('.action-next').click(params, nextAction);
    }

    resetAllActionNexts();

    /****************************
     SIGNATURE
     **************************/
    var wrapper = document.getElementById("signature-pad");
    if (wrapper != null && wrapper != undefined) {

        var clearButton = wrapper.querySelector("[data-action=clear]"),
                saveButton = wrapper.querySelector("[data-action=save]"),
                canvas = wrapper.querySelector("canvas"),
                signaturePad;

        // Adjust canvas coordinate space taking into account pixel ratio to make it look crisp on mobile devices. This also causes canvas to be cleared.
        function resizeCanvas() {
            // When zoomed out to less than 100%, for some very strange reason, some browsers report devicePixelRatio as less than 1 and only part of the canvas is cleared then.
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }

        window.onresize = resizeCanvas;
        resizeCanvas();

        signaturePad = new SignaturePad(canvas, {
            penColor: "rgb(72, 61, 159)",
            onBegin: function () {
                buttonToggle('signaturePadOnBegin');
            }
        });

        clearButton.addEventListener("click", function (event) {
            signaturePad.clear();
        });
    }

    /*****************
     RESTYLING FOR FAQ AND RIGHTS
     *****************/
    if (page === 'faq' || page === 'rights') {
        $(".item-content").hide();
        $(".row").click(function () {
            $(this).find('.arrow').toggleClass("on");
            $(this).next().slideToggle();
        });
    }

    /*****************
     ADDING COMPANIONS
     *****************/
    var addCompanionsProcess = function (address) {
        try {
            if (address == undefined) {
                address = "";
            }

            var inputUserPlaceholderName = textItems_inputUserPlaceholderName;
            var inputUserPlaceholderBirthDate = textItems_inputUserPlaceholderBirthDate;
            var inputUserPlaceholderResidence = textItems_inputUserPlaceholderResidence;

            var cont = document.getElementById('minor-companion-container');
            var item = document.createElement('div');
            item.className = "companion-item";

            var blockUser1 = document.createElement('div');
            blockUser1.className = "cform-block-item";
            var iconUser = document.createElement('div');
            iconUser.className = "cform-block-item-icon";
            var imgUser = document.createElement("img");
            imgUser.src = "/img/colors/" + partnerColor + "/user.svg";
            iconUser.appendChild(imgUser);
            var inputUser = document.createElement('input');
            inputUser.type = "text";
            inputUser.className = "cform-block-item-input cform-companion-name";
            inputUser.placeholder = inputUserPlaceholderName;
            blockUser1.appendChild(iconUser);
            blockUser1.appendChild(inputUser);

            var blockUser2 = document.createElement('div');
            blockUser2.className = "cform-block-item minor-birthdate";
            var paraHead = document.createElement('p');
            paraHead.className = "para";
            paraHead.innerHTML = textItems_inputUserPlaceholderBirthDate;
            var iconUser = document.createElement('div');
            iconUser.className = "cform-block-item-icon";
            var imgUser = document.createElement("img");
            imgUser.src = "/img/colors/" + partnerColor + "/date.svg";
            iconUser.appendChild(imgUser);
            var inputUser = document.createElement('input');
            inputUser.type = "date";
            inputUser.className = "cform-block-item-input cform-companion-birthdate";
            inputUser.placeholder = inputUserPlaceholderBirthDate;
            blockUser2.appendChild(paraHead);
            blockUser2.appendChild(iconUser);
            blockUser2.appendChild(inputUser);

            item.appendChild(blockUser1);
            item.appendChild(blockUser2);

            var compHeight = parseInt($('#minor-companion-container .companion-item').outerHeight());
            var curMaxHeight = parseInt($('.companions').css('max-height'));
            var newHeight = curMaxHeight + compHeight;
            $('.companions').css('max-height', newHeight + 'px');
            var contHeight = parseInt($('.cform-container').outerHeight());
            var newContHeight = contHeight + compHeight + 50;
            $('.cform-container').css('height', newContHeight + 'px');
            cont.appendChild(item);
        } catch (err) {
            notiDev('Catch: Adding companions failed.', err.toString());
        }
    }

    function addCompanionsFunc(address) {
        $('.cform-block .add-junior-companions').off();
        $('.cform-block .add-junior-companions').click(function (evt) {
            evt.preventDefault();
            addCompanionsProcess(address);
        });
    }

    function showMinorCompanions() {
        $('.minor-companions').removeClass('display-none');
        addCompanionsFunc();
        var contHeight = parseInt($('.cform-container').outerHeight());
        var blockHeight = parseInt($('.minor-companions').outerHeight());
        var newContHeight = contHeight + blockHeight;
        $('.cform-container').css('height', newContHeight + 'px');
    }

    function hideMinorCompanions() {
        var blockHeight = parseInt($('.minor-companions').outerHeight());
        $('.minor-companions').addClass('display-none');
        addCompanionsFunc();
        var contHeight = parseInt($('.cform-container').outerHeight());
        var newContHeight = contHeight - blockHeight;
        $('.cform-container').css('height', newContHeight + 'px');
    }

    $('.age-checkbox').change(function () {
        if ($('.age-checkbox').is(":checked")) {
            showMinorCompanions();
        } else {
            hideMinorCompanions();
        }
    });

    $('.cform-policycheckbox').change(function () {
        buttonToggle();
    });
    $('.cform-prbox').change(function () {
        buttonToggle();
    });



    /*****************
     POPUP
     *****************/
    function callPopupAnchor() {
        try {
            setTimeout(
                    function () {
                        if ($('.cform-name').val() == '' && $('.cform-email1').val() == '' && $('.cform-phoneNumber').val() == '') {
                            $('.cform-small-popup').removeClass('small-popup-hidden');
                            //notiDev('info', 'SMALL POPUP APPEARED! Name: '+$('.cform-name').val()+', email: '+$('.cform-email1').val()+', phone: '+$('.cform-phoneNumber').val()+', sum: '+$('.sum').html());
                        }
                    }, 20000
                    );
        } catch (err) {
            notiDev('Catch: timed appearance failed.', err.toString());
        }
    }

    $('.cform-small-popup').click(function (evt) {
        $('.cform-popup-background').removeClass('display-none');
        notiDev('info', 'Complete popup appeared after click! Name: ' + $('.cform-name').val() + ', email: ' + $('.cform-email1').val() + ', phone: ' + $('.cform-phoneNumber').val() + ', sum: ' + $('.sum').html());
    });

    $('.footer-links-popup').click(function (evt) {
        $('.cform-popup-background').removeClass('display-none');
        //notiDev('info', 'Complete popup appeared after click on index!');
    });

    $('.cform-popup-background').click(function (event) {
        event.preventDefault();
        try {
            if (!$(event.target).closest('.cform-popup').length && !$(event.target).is('.cform-popup')) {
                if ($('.cform-popup-background').is(":visible")) {
                    $('.cform-popup-background').addClass('display-none');
                }
            }
        } catch (err) {
            notiDev('Closing modal failed.', err.toString());
        }
    });

    /*****************
     FOCUS ON PRIMARY ELEMENT
     *****************/
    if (!inIframe()) {
      $('.envisioned .focus-button').attr('tabindex', -1).focus()
    }

    /*****************
     TRANSLITERATE
     *****************/
    transliterateAsYouType('.cform-name');
    transliterateAsYouType('.cform-city');
    transliterateAsYouType('.cform-address');

    /*****************
     NOTIFY ABOUT WRONG SYMBOLS
     *****************/
    function displayIfWrongSymbols(classy, val) {
        if (classy == '.cform-name') {
            if (val.indexOf('.') > 0 || val.indexOf(',') > 0 || val.indexOf(',') > 0 || val.indexOf('.') > 0 || val.indexOf('|') > 0 || val.indexOf('/') > 0 || val.indexOf(';') > 0 || val.indexOf(':') > 0 || val.indexOf('&') > 0) {
                $('.cform-name').parent().addClass('cform-error cform-name-error');
                $('.cform-name').parent().attr('data-content', formats_nameSymbols);
            } else {
                $('.cform-name').parent().removeClass('cform-error cform-name-error');
            }
        }
    }

    $('.cform-email1').change(function (e) {
        var val = $('.cform-email1').val();
            $('.cform-email1').parent().removeClass('cform-error cform-email1-error');
    });
    $('.cform-email1').keyup(function (e) {
        var val = $('.cform-email1').val();
            $('.cform-email1').parent().removeClass('cform-error cform-email1-error');
    });

    /*****************
     NOTIFY ABOUT WRONG DATE
     *****************/
    function displayIfWrongDate(dto) {
        var dto = $(dto).val()
        var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
        var dt = new Date(dto.replace(pattern,'$3-$2-$1'));
        var now = new Date();
        var newDate = ((dt - now)/(60*60*24*1000));
        if (newDate>30) {
            $('.cform-date').parent().addClass('cform-error cform-date-error');
            $('.cform-date').parent().attr('data-content', formats_wrongDate);
        }
        else {
            $('.cform-date').parent().removeClass('cform-error cform-date-error');
        }
    }


    var alarmWrongDate = function(dto) {
        $(dto).change(function (){
        displayIfWrongDate(dto);
        });
    }

    alarmWrongDate('.cform-date');

    /*****************
     PARTNERS FRONTEND
     *****************/
    $('.partner-jumbotron a').click(function () {
        $('html,body').animate({scrollTop: $(document).height() - $('.partners-form-container').height() - 350});
    });

    $('.fits-company-item').click(function () {
        $('html,body').animate({scrollTop: $(document).height() - $('.partners-form-container').height() - 350});
    });

    function partnerTypeFunction(idy) {
        switch (idy) {
            case "radio-company":
                $('.partners-form-companyname').removeClass('display-none');
                $('.partners-form-website').removeClass('display-none');
                break
            case "radio-media":
                $('.partners-form-companyname').removeClass('display-none');
                $('.partners-form-website').removeClass('display-none');
                break
            case "radio-private":
                $('.partners-form-companyname').addClass('display-none');
                $('.partners-form-website').addClass('display-none');
                break
        }
    }

    if ( companyName !== 'Aircompense' ) {
        /*****************
         UNSLIDER
         *****************/
        if ($('.stage-item-container').length > 0) {
            $('.stage-item-container').unslider({
                autoplay: false,
                arrows: {
                    //  Unslider default behaviour
                    prev: '<div class="stage-arrow stage-left"><div class="arrow-image arrow-image-left display-none"></div></div>',
                    next: '<div class="stage-arrow stage-right"><div class="arrow-image arrow-image-right"></div></div>'
                },
                delay: 6000
            });
        }
    }

    function removeUnnecessaryRightArrow() {
        try {
            if ($('#feedback-item-container-list li:nth-child(2)').hasClass('unslider-active')) {
                $('.arrow-image-right').addClass('display-none');
            } else {
                $('.arrow-image-left').removeClass('display-none');
                $('.arrow-image-right').removeClass('display-none');
            }
        } catch (err) {
            notiDev('Catch: Removing unnecessary right arrow failed.', err.toString());
        }
    }

    function removeUnnecessaryLeftArrow() {
        try {
            if ($('#feedback-item-container-list li:nth-child(2)').hasClass('unslider-active')) {
                $('.arrow-image-left').addClass('display-none');
            } else {
                $('.arrow-image-left').removeClass('display-none');
                $('.arrow-image-right').removeClass('display-none');
            }
        } catch (err) {
            notiDev('Catch: Removing unnecessary left arrow failed.', err.toString());
        }
    }

    $('.arrow-image-left').click(function (evt) {
        removeUnnecessaryLeftArrow();
    });

    $('.arrow-image-right').click(function (evt) {
        removeUnnecessaryRightArrow();
    });

    /*****************
     PARTNER PROFILE WIDGET MANAGEMENT
     *****************/
    $('.cform-widgetWidth').keyup(function () {
        if ($('#radio-adaptive').hasClass('radio-active')) {
            $('iframe').css('width', $('.cform-widgetWidth').val() + '%');
            $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/width:\s\d*.{1,2}\;/, "width: " + $('.cform-widgetWidth').val() + "%;"));
        } else {
            $('iframe').css('width', $('.cform-widgetWidth').val() + 'px');
            $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/width:\s\d*.{1,2}\;/, "width: " + $('.cform-widgetWidth').val() + "px;"));
        }
    });

    $('.cform-widgetHeight').keyup(function () {
        $('iframe').css('height', $('.cform-widgetHeight').val() + 'px');
        $('pre.iframe-code-example code').html($('pre.iframe-code-example code').html().replace(/height:\s\d*.{1,2}\;/, "height: " + $('.cform-widgetHeight').val() + "px;"));
    });

    /*****************
     VISA MANAGEMENT
     *****************/

    var updateVisaCommission = function(result) {
        $('.form-congradulation--commission').html(result.commission);
        saveToSessionStorage({"binId": result.binId});
        var currentHref = $('.action-apply-visa').attr('href');
        var partnerCommissionQuery = 'binId=';
        var href = currentHref.indexOf(partnerCommissionQuery)>0 ? currentHref.substr(0, currentHref.indexOf(partnerCommissionQuery) - 1) : currentHref;
        var divider = href.indexOf('?')>0 ? '&' : '?';
        $('.action-apply-visa').attr('href', href + divider + partnerCommissionQuery+result.binId);
    }

    var checkCardNumber = function(number) {
        obj = {
            "save": {},
            "err": {}
        }
        obj = radioValidationImprovedId('visaCountry', obj);
        if (number.length == 3) {
            number = $('.cform-visaSixdigits').cleanVal() + number;
        }

        if ($('.visa-section').hasClass('visa-section--premier')) {
            var cardType = 'Sberbank Premier';
            var differentCommissionsText = textItems_card_premier_differentCommissions;
            var cardIdentifiedText = textItems_card_premier_cardIdentified;
            var notRecognizedText = textItems_card_premier_notRecognized;
        } else if ($('.visa-section').hasClass('visa-section--citi')) {
            var cardType = 'CITI';
            var differentCommissionsText = textItems_card_citi_differentCommissions;
            var cardIdentifiedText = textItems_card_citi_cardIdentified;
            var notRecognizedText = textItems_card_citi_notRecognized;
        } else {
            var cardType = 'VISA';
            var differentCommissionsText = textItems_card_visa_differentCommissions;
            var cardIdentifiedText = textItems_card_visa_cardIdentified;
            var notRecognizedText = textItems_card_visa_notRecognized;
        }

        callApi(getCompensairApiUrl('promo', 'card'), {'bin': number, 'country': obj.save.visaCountry, 'type': cardType})
            .always(function(result) {
                if (result.message != undefined) {
                    switch (result.message) {
                        case 'Only one':
                            $('.visa-status').html(textFunctions_card_yourTypeIs(result.type));
                            updateVisaCommission(result);
                            break;
                        case 'Different commissions':
                            $('.visa-status').html(differentCommissionsText);
                            $('.cform-visaThreedigits').removeClass('display-none');

                            if (parseInt($(window).outerWidth()) < 768) {
                                $('.cform-visaSixdigits').css('left', '-52px');
                                $('.cform-visaThreedigits').css('left', '-52px');
                            }
                            if ($('.cform-visaSixdigits').cleanVal().length == 6) {
                                $('.cform-visaThreedigits').focus();
                            }
                            break;
                        case 'Several identical':
                            $('.visa-status').html(cardIdentifiedText);
                            updateVisaCommission(result);
                            break;
                        case 'None':
                            $('.visa-status').html(notRecognizedText);
                            break;
                    }
                }
            });
    }

    function displayVisaCard(idy) {
        /*
        $('.visa-section').css('height', "338px");
        */
        $('.visa-second-step').removeClass('display-none');
    }

    function updateDigitsLeft(numLeft) {
        switch (numLeft) {
            case 5:
                $('.visa-status').html(textItems_visa_digitsLeft5);
                break;
            case 4:
                $('.visa-status').html(textItems_visa_digitsLeft4);
                break;
            case 3:
                $('.visa-status').html(textItems_visa_digitsLeft3);
                break;
            case 2:
                $('.visa-status').html(textItems_visa_digitsLeft2);
                break;
            case 1:
                $('.visa-status').html(textItems_visa_digitsLeft1);
                break;
        }
    }

    $('.cform-visaSixdigits').keyup(function() {
        $('.cform-visaThreedigits').addClass('display-none');
        var num = $('.cform-visaSixdigits').cleanVal().length;
        if (num > 5) {
            checkCardNumber($('.cform-visaSixdigits').cleanVal());
        } else {
            var numLeft = 6 - num;
            updateDigitsLeft(numLeft);
        }
    });

    $('.cform-visaThreedigits').keyup(function() {
        var num = $('.cform-visaThreedigits').cleanVal().length;
        if (num > 2) {
            checkCardNumber($('.cform-visaThreedigits').cleanVal());
        } else {
            var numLeft = 3 - num;
            updateDigitsLeft(numLeft);
        }
    });


    /*****************
     MTS PROMO MANAGEMENT
     *****************/
    var updatePromoCommission = function(result) {
        $('.form-congradulation--commission').html(result.commission);
        saveToSessionStorage({"promoId": result.promoId});
        var currentHref = $('.action-apply-visa').attr('href');
        var partnerCommissionQuery = 'promoId=';
        var href = currentHref.indexOf(partnerCommissionQuery)>0 ? currentHref.substr(0, currentHref.indexOf(partnerCommissionQuery) - 1) : currentHref;
        var divider = href.indexOf('?')>0 ? '&' : '?';
        $('.action-apply-visa').attr('href', href + divider + partnerCommissionQuery+result.promoId);
        $('.cform-promocode').addClass('cform-promocode--fixed');
        $('.action-forward .button-text').addClass('button-text--active');
    }

    var checkPromocode = function(code) {
        obj = {
            "save": {},
            "err": {}
        }
        callApi(getCompensairApiUrl('promo', 'code'), {'code': code})
            .always(function(result) {
                if (result.commission != undefined) {
                    $('.visa-status--found').removeClass('display-none');
                    $('.visa-status--notfound').addClass('display-none');
                    updatePromoCommission(result);
                } else {
                    $('.visa-status--found').addClass('display-none');
                    $('.visa-status--notfound').removeClass('display-none');
                }
            });
    }

    $('.cform-promocode').keyup(function() {
        var num = $('.cform-promocode').val().length;
        if (num > 0) {
            $('.visa-status--notentered').addClass('display-none');
            checkPromocode($('.cform-promocode').val());
        }
    });



    $('.cform-email1').change(function() {
            $(this).mailcheck({
                domains: emailDomains,
                topLevelDomains: ['com', 'ru', 'lv', 'net', 'by', 'ua', 'bg', 'es', 'ee', 'fm', 'co.uk', 'fr', 'it', 'cz', 'de', 'lt', 'eu', 'org', 'com.ar', 'me', 'cl', 'in'],
                suggested: function(element, suggestion) {
                        $('.cform-email1').parent().addClass('cform-error cform-email1-error');

                        if ($('.cform-email1-notice').length > 0) {
                            $('.cform-email1-notice').remove();
                        }

                        var cont = document.getElementById('email1-block');
                        var item = document.createElement('p');
                        item.className = "cform-email1-notice";
                        item.innerHTML = formats_email1_mailcheck(' <a class="cform-email1-suggestion" href="#">' + suggestion.full + '</a>');

                        cont.appendChild(item);
                },
                empty: function(element) {
                    $('.cform-email1').parent().removeClass('cform-error cform-email1-error');
                    $('.cform-email1-notice').remove();
                }
            });

    });

    $('#email1-block').on('click', '.cform-email1-suggestion', function (event) {
        event.stopPropagation();
        try {
            $('.cform-email1').val($(this).html());
            $('.cform-email1').parent().removeClass('cform-error cform-email1-error');
            $('.cform-email1-notice').remove();
        } catch (err) {
            notiDev('Dropdown item select error', err.toString());
        }
    });

});

/*****************
 TEXT DEPENDENT SCRIPTS START
 *****************/
function textDependentScripts() {

    function getCodeAndSign(string) {
        function retrieveParam(str, param) {
            var afterCode = str.substr(str.indexOf(param+'='));
            if (afterCode.indexOf('&')>0) {
                return afterCode.substr(0, afterCode.indexOf('&'));
            } else {
                return afterCode;
            }
        }
        var result = retrieveParam(string, 'code') + '&' + retrieveParam(string, 'sign');
        var email = retrieveParam(string, 'email');
        if (email) {
            result += '&' + email;
        }
        return result;
    }

    /*****************
     DROPZONE
     *****************/
    if (page === 'app' || page === 'new-employees') {
        var acceptedCounter = 0;
        // "myAwesomeDropzone" is the camelized version of the HTML element's ID
        Dropzone.options.myAwesomeDropzone = {
            paramName: "file", // The name that will be used to transfer the file
            acceptedFiles: ".pdf, .txt, .doc, .docx, .jpg, .jpeg, .png",
            dictDefaultMessage: dropzoneTexts_dictDefaultMessage,
            dictFallbackMessage: dropzoneTexts_dictFallbackMessage,
            dictFallbackText: dropzoneTexts_dictFallbackText,
            dictInvalidFileType: dropzoneTexts_dictInvalidFileType,
            dictFileTooBig: dropzoneTexts_dictFileTooBig,
            dictResponseError: dropzoneTexts_dictResponseError,
            dictCancelUpload: dropzoneTexts_dictCancelUpload,
            dictCancelUploadConfirmation: dropzoneTexts_dictCancelUploadConfirmation,
            dictRemoveFile: dropzoneTexts_dictRemoveFile,
            dictMaxFilesExceeded: dropzoneTexts_dictMaxFilesExceeded(partnerContact),
            addRemoveLinks: false,
            hiddenInputContainer: "#my-awesome-dropzone",
            maxFiles: 27,
            maxFilesize: 64,
            accept: function (file, done) {

                if (page === 'app') {
                    var url = window.location.protocol + "//" + window.location.host + "/api/v1/all/profile/?" + getCodeAndSign(sessionStorageToObject()['profileLink']);
                } else if (page === 'new-employees') {
                    var url = getCompensairApiUrl('employee', '');
                }
                acceptedCounter = acceptedCounter + 1;
                if (acceptedCounter === 3) {
                    document.getElementById("my-awesome-dropzone").classList.remove("dz-clickable");
                }

                var filename = file.name;
                var originalFilename = filename;
                if (/^[[:alnum:]]+$/.test(filename)) {
                    var lastIndex = filename.indexOf("fakepath");
                    if (lastIndex >= 0) {
                        filename = filename.substring(lastIndex + 9);
                    }
                } else {
                    filename = "document"
                }

                try {
                    var xhr = new XMLHttpRequest();
                    var fd = new FormData();
                    xhr.open("POST", url, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            done();
                            $("#my-awesome-dropzone").off();
                        }
                    };
                    fd.append("upload_file", file);
                    xhr.send(fd);
                } catch (err) {
                    notiDev('uploadFile failed.', err.toString());
                }
            }
        };
    }

    /******************
     AIRCOMPENSE SCRIPTS
     ******************/

    if (companyName === 'Aircompense') {

        $('.open-mobile').on('click', function () {
            $('.mobile-navbar').slideDown(200);
        });

        $('.close-mobile').on('click', function () {
            $('.mobile-navbar').slideUp(200);
        });

        $('.feedback-item-container').unslider({
            autoplay: true,
            arrows: {
                //  Unslider default behaviour
                prev: '<div class="feedback-left"><span class="carousel-navigation-prev"></span></div>',
                next: '<div class="feedback-right"><span class="carousel-navigation-next"></span></div>'
            },
            delay: 6000,
            fluid: true,
        });

        $('.nav-link[href="' + window.location.pathname.split("/").pop() + '"]').parent().addClass('active');

        $('.btn-wrapp').click(function () {
            $('html,body').animate({scrollTop: $(document).height() - $('.partners-form-container').height() - 1550});
        });
    };

    if (page === 'consent') {
        callApi(getCompensairApiUrl('consent', 'retrieve'), '', 'GET')
            .always(function (resp) {
                $('.cform-name').val(resp.name);
                $('.cform-city').val(resp.city);
                $('.cform-address').val(resp.address);
                $('.cform-birthdate').val(resp.birthdate);
            });
    }

    /*****************
     DOCUMENT READY WITHIN TEXT DEPENDENT
     *****************/
    $(document).ready(function () {

        // @todo Avoid duplication.
        /*****************
         REVIEWS MANAGEMENT
         *****************/
        function stringShortener(string) {
            var maxLength = 200
            var trimmedString = string.substr(0, maxLength);
            trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
            return trimmedString;
        }

        if ( companyName !== 'Aircompense' ) {
            var loadReviews = function () {
                try {
                    $('.feedback-item-container').unslider({
                        autoplay: true,
                        arrows: {
                            //  Unslider default behaviour
                            prev: '<div class="feedback-left"><div class="arrow-image arrow-image-left"></div></div>',
                            next: '<div class="feedback-right"><div class="arrow-image arrow-image-right"></div></div>'
                        },
                        delay: 6000
                    });

                    $('.feedback-item').removeClass('display-none');
                    $('.feedback-item-container').removeClass('feedback-item-container-complete');

                } catch (err) {
                    notiDev('Catch: Adding companions failed.', err.toString());
                }
            }

            if ($('.feedback-item-container').length > 0) {
                loadReviews();
            }
        }

        /*****************
         VALIDATION
         *****************/
        var radioValidationImprovedId = function (key, obj) {
            try {
                var typeContain = $('.' + key).find('.radio-active');
                if (typeContain == null || typeContain == undefined || typeContain.length < 1) {
                    $('.' + key).addClass('cform-error cform-radio-error');
                    $('.' + key).attr('data-content', errors_radio);
                    obj.err[key] = "empty";
                    $('html,body').animate({scrollTop: 0});
                } else {
                    $('.' + key).removeClass('cform-error cform-radio-error');
                    obj.save[key] = typeContain.attr('id').substring(6);
                }
                return obj;
            } catch (err) {
                notiDev('Radio validation improved id failed.', err.toString());
            }
        };

        var checkboxValidate = function (key, obj, dontScroll) {
            try {
                if ($('.cform-' + key).is(":visible") && !$('.cform-' + key).is(":checked")) {
                    $('.cform-' + key).parent().addClass('cform-error cform-' + key + '-error');
                    $('.cform-' + key).parent().attr('data-content', jQuery.i18n.prop('errors_' + key));
                    obj.err[key] = "empty";
                    textValidateScroll(dontScroll);
                } else {
                    $('.cform-' + key).parent().removeClass('cform-error cform-' + key + '-error');
                    obj.save[key] = true;
                }
                return obj;
            } catch (err) {
                notiDev('Checkbox validation failed.', err.toString());
            }
        };

        /*****************
         PARTNERS SAVING
         *****************/
        $('#partners-button').click(function (evt) {
            evt.preventDefault();
            $(this).off();
            try {
                var idy = $(this).attr('id');
                var idyObj = idy.replace(/-/g, "");
                partnersData(idyObj, $(this));
            } catch (err) {
                notiDev('Catch: action-next trigger failed.', err.toString());
            }
        });

        function partnersData(idyObj, button) {
            try {
                resetSessionStorage();
                var obj = {
                    "save": {},
                    "err": {}
                }
                obj = textValidate('contactname', obj, true);
                obj = textValidate('partnerEmail', obj, true);
                obj = textValidate('phoneNumber', obj, true);
                obj = radioValidationImprovedId('partnerType', obj);
                if (obj.save.partnerType === "company" || obj.save.partnerType === "media") {
                    obj = textValidate('companyname', obj, true);
                    obj = textValidate('website', obj, true);
                    obj.save.name = obj.save.companyname;
                } else {
                    obj.save.name = obj.save.contactname;
                }

                obj.save.formattedname = transliterate(obj.save.name).replace(/\s/g, "_").toLowerCase();
                obj.save.language = language;

                if (obj.save.partnerType === "company") {
                    obj.partnerTypeIndex = 1;
                } else if (obj.save.partnerType === "media") {
                    obj.partnerTypeIndex = 2;
                } else if (obj.save.partnerType === "private") {
                    obj.partnerTypeIndex = 3;
                } else {
                    obj.partnerTypeIndex = 5;
                }

                obj.save.partnerDescript = $('.cform-partnerDescript').val();
                obj.save.partnerLeadSource = $('.cform-partnerLeadSource').val();

                if (partnerId != undefined && partnerId != '') {
                    obj.save.partnerAbove = partnerId;
                }

                saveToSessionStorage(obj.save);

                var errLen = Object.keys(obj.err).length;
                if (errLen > 0 && obj.err.constructor === Object) {
                    $('#partners-button').click(function (evt) {
                        evt.preventDefault();
                        $(this).off();
                        try {
                            var idy = $(this).attr('id');
                            var idyObj = idy.replace(/-/g, "");
                            partnersData(idyObj, $(this));
                        } catch (err) {
                            notiDev('Catch: action-next trigger failed.', err.toString());
                        }
                    });
                } else {
                    $('.partners-form').html(textItems_partnerRegistered);
                    $('.section-header').addClass('display-none');
                    callApi(getCompensairApiUrl('partners', ''), sessionStorageToObject());
                    analyticsEvent("partner", {
                        'dimension5': obj.partnerTypeIndex,
                        'dimension3': obj.save.eng,
                        'dimension4': obj.save.eng
                    });
                }
            } catch (err) {
                notiDev('Catch: partnersData failed.', err.toString());
            }
        };

        /*****************
         NOTIFY ABOUT GOOD COMPANION NAME
         *****************/

        var alarmGoodName = function (dto) {
            $(document).on('change', dto, function () {
                var dt = $(this).val();
                var temp = [];
                temp = dt.split(' ');
                if (temp[1]) {
                    if (temp[0].length > 1 && temp[1].length > 1) {
                        $('.companion-item').addClass('cform-successful cform-name-successful');
                        $('.companion-item').attr('data-content', formats_successName);
                    } else {
                        $('.companion-item').removeClass('cform-successful cform-name-successful');
                    }
                } else {
                    $('.companion-item').removeClass('cform-successful cform-name-successful');
                }
            });
        }

        alarmGoodName('.cform-companion-name');

        /******************
         NEW-EMPLOYEES SCRIPTS
         ******************/

        if (page === 'new-employees') {
            $('#employee-button').click(function (evt) {
                evt.preventDefault();
                $(this).off();
                try {
                    var idy = $(this).attr('id');
                    var idyObj = idy.replace(/-/g, "");
                    employeeData(idyObj, $(this));
                } catch (err) {
                    notiDev('Catch: action-next trigger failed.', err.toString());
                }
            });

            function employeeData(idyObj, button) {
                try {
                    resetSessionStorage();
                    var obj = {
                        "save": {},
                        "err": {}
                    };
                    obj = textValidate('firstNameRu', obj, true);
                    obj = textValidate('lastNameRu', obj, true);
                    obj = textValidate('patronymicRu', obj, true);
                    obj = textValidate('firstName', obj, true);
                    obj = textValidate('lastName', obj, true);
                    obj = textValidate('patronymicEn', obj, true);
                    obj = textValidate('telegramLogin', obj, true);
                    obj = textValidate('citizenshipEn', obj, true);
                    obj = textValidate('passportNumber', obj, true);
                    obj = textValidate('passportIssuedByRu', obj, true);
                    obj = textValidate('passportIssuedByEn', obj, true);
                    obj = textValidate('passportIssuedWhen', obj, true);
                    obj = textValidate('residenceAddressRu', obj, true);
                    obj = textValidate('residenceAddressEn', obj, true);
                    obj = textValidate('employeeEmail', obj, true);
                    obj = textValidate('telephone', obj, true);

                    obj.save.language = language;

                    saveToSessionStorage(obj.save);

                    var errLen = Object.keys(obj.err).length;
                    if (errLen > 0 && obj.err.constructor === Object) {
                        $('#employee-button').click(function (evt) {
                            evt.preventDefault();
                            $(this).off();
                            try {
                                var idy = $(this).attr('id');
                                var idyObj = idy.replace(/-/g, "");
                                employeeData(idyObj, $(this));
                            } catch (err) {
                                notiDev('Catch: action-next trigger failed.', err.toString());
                            }
                        });
                    } else {
                        $('.employee-form').html(textItems_employeeRegistered);
                        $('.section-header').addClass('display-none');
                        callApi(getCompensairApiUrl('employee', ''), sessionStorageToObject());
                    }
                } catch (err) {
                    notiDev('Catch: partnersData failed.', err.toString());
                }
            };

        };
    });
}