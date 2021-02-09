
export function setCookie(cName, cValue, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = cName + "=" + cValue + ";" + "expires=" + d.toUTCString() + ";path/"
}

export function getCookie(cName) {
    var name = cName + "=";
    var allCookie = document.cookie.split(';');
    for (var i = 0; i < allCookie.length; i++) {
        var currCookie = allCookie[i];
        //So we need to check if the first character of the current index is empty, we need to extract out the space as we only concern for the cookie
        while (currCookie.charAt(0) === ' ') {
            currCookie = currCookie.substring(1);
        }
        if (currCookie.indexOf(name) === 0) {
            return currCookie.substring(name.length, currCookie.length);
        }
    }
    return "";
}

export function deleteCookie(cName) {
    document.cookie = cName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}



