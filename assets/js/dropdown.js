/******************
DEVELOPMENT PROCESS
******************/
var strObj = function(obj) {
    try {
        var completeText = '';
        if (obj == undefined) {
            return completeText;
        } else {
            var objLen = Object.keys(obj).length;
            if (objLen > 0 && obj.constructor === Object) {
                var n = 0;
                for (var key in obj) {
                    n=n+1;
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
                    }
                }
            } else {
                return completeText + "// undefined object"
            }
        }
    }
    catch (err) {
        notiDev('Catch: Failed to execute strObj.', err.toString());        
    }
};

function getBrowser() {
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
    var browserArray = [isOpera, isFirefox, isSafari, isIE, isEdge, isChrome, isBlink];
    var nameArray = ['Opera', 'Firefox', 'Safari', 'Internet Explorer', 'Edge', 'Chrome', 'Blink'];
    var resArray = [];
    for (var i=0; i<browserArray.length; i++) {
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
    if (arguments[0] == "Form errors") {
        var type = "userErrors";
        arguments[0] = "";
    } else {
        var type = "notifyDev";
    }
    for (var i = 0; i < arguments.length; i++){
        console.log(arguments[i]);
        text = text+arguments[i] + '\n';
    }
    var date = new Date().toLocaleString();

    var browser = getBrowser().toString();
    var width = $(window).width();
    var height = $(window).height();
    var loc = 'Location: unknown';

    if (location != undefined && location !=null) {
        if (location.country_name != undefined && location.country_name != null) {
            loc = "Location: " + location.city + ", " + location.country_name;
        }
    }

    text = '******' + date + '******\n' + loc + ' | ' + browser + ' | ' + width + 'x' + height + '\n' + text;
    console.log(text);
}   

window.onerror = function (msg, url, line) {
    notiDev(msg, url, 'Line number: '+line);
};

/**********************************
COMMON DROPDOWN-SPECIFIC FUNCTIONS
***********************************/

var promisesRegistry = {};

var firstToUpper = function (word, brackets, comma, noSpace) {
    try {
        if (word == "" || word == undefined) {
            return "";
        } else {
            var res = "";
            var wordArray = word.split(/\s+/);
            for (var i = 0; i < wordArray.length; i++) {
                res = res + wordArray[i].charAt(0).toUpperCase() + wordArray[i].slice(1) + ' ';
            }
            word = res;
            word = $.trim(word);
            if (brackets) {
                word = "(" + word + ")";
            }
            if (comma) {
                word = word + ",";
            }
            if (noSpace) {
                return word
            } else {
                return word + " ";
            }
        }
    } catch (err) {
        notiDev('Catch: Failed to perform firstToUpper function.', err.toString());
    }
};

var getDropdownTextAirport = function (name, city, country, russianCity, code, russianName, isRequestCyrillic) {
    if (typeof isRequestCyrillic === 'undefined') {
        isRequestCyrillic = false;
    }
    name = name.split(' ').map(function(w) {
            return !$.isEmptyObject(w) ? w[0].toUpperCase() + w.substr(1).toLowerCase() : '';
        }).join(' ');
    name = firstToUpper((isRequestCyrillic && /[а-яА-ЯЁё]/.test(russianName)) ? russianName : name, 0, 0);
    code = firstToUpper(code, 1, 0).toUpperCase();
    city = firstToUpper((isRequestCyrillic && /[а-яА-ЯЁё]/.test(russianCity)) ? russianCity : city, 0, 1);
    country = firstToUpper(country, 0, 0);
    return city + name + code + '<span class="dropdown-country">' + country + '</span>';
};

var getDropdownTextCommon = function (name, russianName, code, isRequestCyrillic) {
    if (typeof isRequestCyrillic === 'undefined') {
        isRequestCyrillic = false;
    }
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // split camelCase into separate words
    name = name.split(' ').map(function(w) {
        return !$.isEmptyObject(w) ? w[0].toUpperCase() + w.substr(1).toLowerCase() : ''; // make each separate word start with a Capital Letter
    }).join(' ');
    var left = firstToUpper((isRequestCyrillic && /[а-яА-ЯЁё]/.test(russianName)) ? russianName : name, 0, 0);
    if (typeof code !== "undefined") {
        code = firstToUpper(code, 1, 0).toUpperCase();
        left = left + code;
    }
    var result = left;
    if (isRequestCyrillic) {
        var right = firstToUpper((isRequestCyrillic && /[а-яА-ЯЁё]/.test(russianName)) ? name : russianName, 1, 0);
        return result + right;
    } else {
        return result;
    }
};

function getDropdownText(params, object) {
    if (params.entity == "airline") {
        var name = object.name_for_search;
    }
    if (params.entity == "airport") {
        return getDropdownTextAirport(object.name_for_search, object.city, object.country, object.russian_city, object.iata, object.russian_name, params.isRequestCyrillic);
    } else {
        return getDropdownTextCommon(typeof name === "undefined" ? object.name : name, object.russian_name, object.iata, params.isRequestCyrillic);
    }
}

function createDropdownRow(dropdown, fieldName, entity, keyword, object) {
    try {
        var block = dropdown.find('.dropdown-item-container');
        var item = document.createElement('button');
        item.className = "dropdown-item";
        var immovableAttrubutes = ['type', 'class', 'placeholder'];
        for (var key in object) {
            if (immovableAttrubutes.indexOf(key) < 0) {
                item.setAttribute(key, object[key]);
            }
        }
        item.setAttribute("name", fieldName);

        item.innerHTML = getDropdownText(
            {
                entity: entity,
                isRequestCyrillic: /[а-яА-ЯЁё]/.test(keyword)
            }, object
        );

        dropdown.find('.dropdown-tip').addClass("display-none");
        block.append($(item));
    } catch (err) {
        notiDev('Catch: Failed to create dropdown row.', err.toString());
    }
}

var pressArrowDown = function (dropdown) {
    try {
        var i = $('.dropdown-item-active').index();
        var len = dropdown.find('.dropdown-item').length;
        if (i != len - 1) {
            dropdown.find('.dropdown-item').eq(i).removeClass('dropdown-item-active');
            dropdown.find('.dropdown-item').eq(i + 1).addClass('dropdown-item-active');
            dropdown.animate({
                scrollTop: 35 * (i)
            }, 200);
        }
    } catch (err) {
        notiDev('Catch: Failed to execute pressArrowDown function.', err.toString());
    }
};

var pressArrowUp = function (dropdown) {
    try {
        var i = $('.dropdown-item-active').index();
        if (i != 0) {
            dropdown.find('.dropdown-item').eq(i).removeClass('dropdown-item-active');
            dropdown.find('.dropdown-item').eq(i - 1).addClass('dropdown-item-active');
            dropdown.animate({
                scrollTop: 35 * (i - 1)
            }, 200);
        }
    } catch (err) {
        notiDev('Catch: Failed to execute pressArrowUp function.', err.toString());
    }
};

function fillDropdown (response, dropdown, fieldName, entity, keyword) {
    dropdown.find('.dropdown-loader').addClass("display-none");
    dropdown.find('.dropdown-item-container').empty();
    if (response.length < 1) {
        dropdown.find('.dropdown-tip').html(textItems_nothingFound + ' <a class="add-city" href="#">' + textItems_optionMissing + '</a>');
        dropdown.find('.dropdown-tip').removeClass("display-none");
    } else {
        for (var i = 0; i < response.length; i++) {
            createDropdownRow(
                dropdown,
                fieldName,
                entity,
                keyword,
                response[i]
            );
        }
        dropdown.find('.dropdown-tip').addClass("display-none");
    }
    dropdown.removeClass("display-none");
}

var dropdownQuery = function (keyword, dropdown, entity, searchBy) {
    try {
        if (typeof searchBy === 'undefined') {
            searchBy = null;
        }
        keyword = $.trim(keyword);
        var restParams = {
            "keyword": keyword,
            "maxSize": 20
        };
        if (keyword.indexOf("(") > 0 && keyword.indexOf(")") > 0) {
            var afterIata = keyword.substr(keyword.indexOf('(') + 1);
            keyword = afterIata.substr(0, afterIata.indexOf(')'));
            restParams["searchBy"] = "iata";
        } else if (searchBy !== null) {
            restParams["searchBy"] = searchBy;
        }
        dropdown.find('.dropdown-tip').addClass("display-none");

        var resultsPromise = null;
        if (promisesRegistry['dropdownQuery'] && promisesRegistry['dropdownQuery'][dropdown.attr('id')]) {
            // JQuery AJAX doesn't fully supports promises interface.
            try {
                promisesRegistry['dropdownQuery'][dropdown.attr('id')].abort();
            } catch (e) {
            }
            try {
                promisesRegistry['dropdownQuery'][dropdown.attr('id')].reject();
            } catch (e) {
            }
            delete promisesRegistry['dropdownQuery'][dropdown.attr('id')];
        }
        if (entity != 'country') {
            restParams["sortBy"] = "dropdown_priority";
        }
        if (entity[entity.length-1] == 'y') {
            var entityWord = entity.substr(0, entity.length-1) + 'ies';
        } else {
            var entityWord = entity + 's';
        }
        resultsPromise = $.get('/api/v1/'+entityWord+'/', restParams);
        // Store the promise in order to be able to reject it after further keyUp.
        promisesRegistry['dropdownQuery'] = (promisesRegistry['dropdownQuery'] || {});
        promisesRegistry['dropdownQuery'][dropdown.attr('id')] = resultsPromise;

        resultsPromise
            .fail(function (errorObject, error) {
                //notiDev('info', 'Failed to query dropdown');
            });
        return resultsPromise;
    } catch (err) {
        notiDev('Catch: Failed to execute query function.', err.toString());
    }
};

var listenToChanges = function (field, value) {
    try {
        field.keyup(function (e) {
            if (e.keyCode != 13) {
                var val = field.val();
                if ($.trim(val) != $.trim(value)) {
                    field.removeAttr("id");
                    field.removeClass('hasId');
                }
            }
        });
    } catch (err) {
        notiDev('Catch: Failed to listen to dropdown deletes.', err.toString());
    }
};

var updateFieldAfterSelect = function(field, value) {
    if (typeof value === 'string' && value.indexOf('<span') > -1) {
        value = value.substring(0, value.indexOf('<span') - 1);
    }
    field.val(value);

    field.addClass('hasId');
    field.next('.dropdown').addClass('display-none');
}

var selectDropdownRow = function (callback, fieldName) {
    try {
        var chosenDropdownRow = $('.dropdown-item-active');

        var field = $('.cform-' + chosenDropdownRow.attr("name"));
        var value = chosenDropdownRow.html();

        var attributes = document.getElementById(chosenDropdownRow.attr("id")).attributes;
        var immovableAttrubutes = ['type', 'class', 'placeholder'];
        for (var i = 0; i < attributes.length; i++) {
            if (immovableAttrubutes.indexOf(attributes[i].name) < 0) {
                field.attr(attributes[i].name, attributes[i].value);
            }
        }
        updateFieldAfterSelect(field, value);
        chosenDropdownRow.removeClass('dropdown-item-active');
        listenToChanges(field, value);
        callback(fieldName);
    } catch (err) {
        notiDev('Catch: Failed to select dropdown row.', err.toString());
    }
};

function setValue(fieldName, callback, entity, keyword) {
    if (!(typeof (keyword) === 'string' && keyword.length > 0)) {
        return;
    }
    var field = $('.cform-' + fieldName);
    var dropdown = field.next('.dropdown');
    dropdownQuery(keyword, dropdown, entity, 'iata')
        .then(function (response) {
            var immovableAttrubutes = ['type', 'class', 'placeholder'];
            var attributes = [];
            for (var key in response[0]) {
                if (response[0].hasOwnProperty(key) && immovableAttrubutes.indexOf(key) < 0) {
                    var attribute = {
                        name: key,
                        value: response[0][key]
                    };
                    attributes.push(attribute);
                }
            }

            var attribute = {
                name: 'name',
                value: fieldName
            };
            attributes.push(attribute);

            var value = getDropdownText(
                {
                    entity: entity,
                    isRequestCyrillic: /[а-яА-ЯЁё]/.test(keyword)
                }, response[0]
            );

            for (var i = 0; i < attributes.length; i++) {
                field.attr(attributes[i].name, attributes[i].value);
            }
            updateFieldAfterSelect(field, value);
            listenToChanges(field, value);
            callback(fieldName);
        })
}
console.log('setValue loaded');

function setTriggers(fieldName, callback, endpoint) {
    var field = $('.cform-'+fieldName);
    var dropdown = field.next('.dropdown');
    var dropdownTip = dropdown.find('.dropdown-tip');

    function keydown(e) {
        try {
            var val = field.val().toLowerCase();
            if (val.length > 0) {
                if (!$(this).hasClass('hasId')) {
                    dropdownTip.addClass("display-none");
                    dropdown.removeClass("display-none");
                    dropdown.find('.dropdown-item').removeClass("display-none");
                    if (e.which == 9 && $('.dropdown-item-active').index() > -1) { //enter
                        selectDropdownRow(callback, fieldName);
                    }
                } else {
                    dropdownTip.html(textItems_startTyping);
                    dropdownTip.removeClass("display-none");
                }
            }
        } catch (err) {
            notiDev('Catch: dropdown keydown processing failed.', err.toString());
        }
    }

    function keyup(e) {
        try {
            var keyword = field.val().toLowerCase();
            if (keyword.length > 0) {
                if (!field.hasClass('hasId')) {
                    dropdownTip.addClass("display-none");
                    dropdown.removeClass("display-none");
                    dropdown.find('.dropdown-item').removeClass("display-none");
                    if (e.which == 40) {    //down
                        pressArrowDown(dropdown);
                    } else if (e.which == 38) { //up
                        pressArrowUp(dropdown);
                    } else if (e.which == 13 && $('.dropdown-item-active').index() > -1) { //enter
                        selectDropdownRow(callback, fieldName);
                    } else {
                        dropdownTip.addClass("display-none");
                        dropdown.find('.dropdown-loader').removeClass("display-none");
                        dropdownQuery(keyword, dropdown, endpoint)
                            .fail(function (response) {
                                //console.log(response);
                            })
                            .then(function (response) {
                                fillDropdown(response, dropdown, fieldName, endpoint, keyword);
                            })
                    }
                }
            } else {
                dropdown.find('.dropdown-item-container').empty();
                dropdownTip.html(textItems_startTyping);
                dropdownTip.removeClass("display-none");
            }
        } catch (err) {
            notiDev('Catch: Dropdown keyup processing failed.', err.toString());
        }
    }

    field.keydown(function (e) {
        keydown(e);
    });

    field.keyup(function (e) {
        keyup(e);
    });

    dropdown.on('mouseenter', '.dropdown-item', function () {
        $('.dropdown-item-active').removeClass('dropdown-item-active');
        $(this).addClass('dropdown-item-active');
    });

    dropdown.on('mousedown', '.dropdown-item', function (event) {
        event.stopPropagation();
        try {
            selectDropdownRow(callback, fieldName);
        } catch (err) {
            notiDev('Dropdown item select error', err.toString());
        }
    });

    field.focusout(function () {
        if (dropdown.find('.dropdown-item').length == 1) {
            dropdown.find('.dropdown-item').addClass('dropdown-item-active');
            selectDropdownRow(callback, fieldName);
        }
        setTimeout(function () {
            dropdown.addClass('display-none');
            $('.dropdown-item-active').removeClass('dropdown-item-active');
            dropdown.find('.dropdown-item-container').empty();
        }, 100);
    });
}