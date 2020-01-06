var UtmCookie;

function getTopDomainAndName() {
    var regexDomain = /[-\w]+\.(?:[-\w]+\.xn--[-\w]+|[-\w]{3,}|[-\w]+\.[-\w]{2})$/i;
    results = regexDomain.exec(window.location.host);

    var regexName = /(\w+)\./;
    var resultObj = {};
    resultObj.domain = results[0];
    resultObj.name = regexName.exec(results[0])[1];

    return resultObj;
}

UtmCookie = (function() {
  function UtmCookie(options) {
    if (options == null) {
      options = {};
    }
    this._cookieNamePrefix = '_' + getTopDomainAndName()['name'] + '_';
    this._domain = "." + getTopDomainAndName()['domain'];
    this._sessionLength = options.sessionLength || 1;
    this._cookieExpiryDays = options.cookieExpiryDays || 365;
    this._additionalParams = options.additionalParams || [];
    this._utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sub_id'];
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

  UtmCookie.prototype.createCookie = function(name, value, days, path, domain, secure) {
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

  UtmCookie.prototype.readCookie = function(name) {
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

  UtmCookie.prototype.eraseCookie = function(name) {
    this.createCookie(name, '', -1, null, this._domain);
  };

  UtmCookie.prototype.getParameterByName = function(name) {
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

  UtmCookie.prototype.additionalParamsPresentInUrl = function() {
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

  UtmCookie.prototype.utmPresentInUrl = function() {
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

  UtmCookie.prototype.writeCookie = function(name, value) {
    this.createCookie(name, value, this._cookieExpiryDays, null, this._domain);
  };

  UtmCookie.prototype.writeAdditionalParams = function() {
    var j, len, param, ref, value;
    ref = this._additionalParams;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      value = this.getParameterByName(param);
      this.writeCookie(param, value);
    }
  };

  UtmCookie.prototype.writeUtmCookieFromParams = function() {
    var j, len, param, ref, value;
    ref = this._utmParams;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      value = this.getParameterByName(param);
      this.writeCookie(param, value);
    }
  };

  UtmCookie.prototype.writeCookieOnce = function(name, value) {
    var existingValue;
    existingValue = this.readCookie(name);
    if (!existingValue) {
      this.writeCookie(name, value);
    }
  };

  UtmCookie.prototype._sameDomainReferrer = function(referrer) {
    var hostname;
    hostname = document.location.hostname;
    return referrer.indexOf(this._domain) > -1 || referrer.indexOf(hostname) > -1;
  };

  UtmCookie.prototype._isInvalidReferrer = function(referrer) {
    return referrer === '' || referrer === void 0;
  };

  UtmCookie.prototype.writeInitialReferrer = function() {
    var value;
    value = document.referrer;
    if (this._isInvalidReferrer(value)) {
      value = 'direct';
    }
    this.writeCookieOnce('referrer', value);
  };

  UtmCookie.prototype.writeLastReferrer = function() {
    var value;
    value = document.referrer;
    if (!this._sameDomainReferrer(value)) {
      if (this._isInvalidReferrer(value)) {
        value = 'direct';
      }
      this.writeCookie('last_referrer', value);
    }
  };

  UtmCookie.prototype.writeInitialLandingPageUrl = function() {
    var value;
    value = this.cleanUrl();
    if (value) {
      this.writeCookieOnce('initial_landing_page', value);
    }
  };

  UtmCookie.prototype.initialReferrer = function() {
    return this.readCookie('referrer');
  };

  UtmCookie.prototype.lastReferrer = function() {
    return this.readCookie('last_referrer');
  };

  UtmCookie.prototype.initialLandingPageUrl = function() {
    return this.readCookie('initial_landing_page');
  };

  UtmCookie.prototype.incrementVisitCount = function() {
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

  UtmCookie.prototype.visits = function() {
    return this.readCookie('visits');
  };

  UtmCookie.prototype.setCurrentSession = function() {
    var cookieName, existingValue;
    cookieName = 'current_session';
    existingValue = this.readCookie(cookieName);
    if (!existingValue) {
      this.createCookie(cookieName, 'true', this._sessionLength / 24, null, this._domain);
      this.incrementVisitCount();
    }
  };

  UtmCookie.prototype.cleanUrl = function() {
    var cleanSearch;
    cleanSearch = window.location.search.replace(/utm_[^&]+&?/g, '').replace(/&$/, '').replace(/^\?$/, '');
    return window.location.origin + window.location.pathname + cleanSearch + window.location.hash;
  };

  return UtmCookie;

})();