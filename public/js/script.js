$(document).ready(function () {

    // Append slash with affiliate id, only if an affiliate ID is not found in the link yet
    const booklinks = document.querySelectorAll('a[href*="/book"]');
    booklinks.forEach(function (el) {
        if (!el.href.includes('id=')) {
            el.href = el.href.replace(/\?.*$/, '') + '?id=' + el.getAttribute('id');
            console.log(el);
        }
    });

});
