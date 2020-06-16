$(document).ready(function () {

    // Append slash with book id, only if a book ID is not found in the link yet
    const booklinks = document.querySelectorAll('a[href*="/book"]');
    booklinks.forEach(function (el) {
        if (!el.href.includes('id=')) {
            el.href = el.href.replace(/\?.*$/, '') + '?id=' + el.getAttribute('id');
        }
    });

    //hash the password on client-side for sign up, login and change password forms
    //MD5 hashing is not the best solution, but still better than storing plane text on the server
    //on form submission, prevent default action and convert the user's entry to MD5 hash value
    $('#register-form').on('submit', function () {
        var pass = $('#rpassword').val();
        var pass_conf = $('#rpassConf').val();
        $('#rpassword').val(CryptoJS.MD5(pass).toString());
        $('#rpassConf').val(CryptoJS.MD5(pass_conf).toString());
    });

    $('#login-form').on('submit', function () {
        var pass = $('#lpassword').val();
        $('#lpassword').val(CryptoJS.MD5(pass).toString());
    });

});
