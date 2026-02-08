(function() {
    var STORAGE_KEY = 'boneka_users';

    function getUsers() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveUser(email, login, password) {
        var users = getUsers();
        email = (email || '').trim().toLowerCase();
        users[email] = { login: (login || '').trim(), password: password };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    function findUser(email, password) {
        var users = getUsers();
        email = (email || '').trim().toLowerCase();
        var u = users[email];
        return u && u.password === password ? u : null;
    }

    function showMessage(id, text, isError) {
        if (!id) return;
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = text;
        el.style.display = 'block';
        el.className = 'form-message ' + (isError ? 'form-message-error' : 'form-message-success');
        el.setAttribute('role', 'alert');
    }

    function hideMessage(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    function getCaptchaResponse() {
        var el = document.querySelector('textarea[name="h-captcha-response"]');
        if (el && el.value && el.value.length > 0) return el.value;
        el = document.querySelector('input[name="h-captcha-response"]');
        if (el && el.value && el.value.length > 0) return el.value;
        return null;
    }

    function initRegister() {
        var form = document.getElementById('register-form');
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideMessage('register-message');

            var emailEl = document.getElementById('email');
            var loginEl = document.getElementById('login');
            var passwordEl = document.getElementById('password');
            if (!emailEl || !loginEl || !passwordEl) {
                showMessage('register-message', 'Ошибка: не найдены поля формы.', true);
                return;
            }

            var email = emailEl.value.trim();
            var login = loginEl.value.trim();
            var password = passwordEl.value;

            if (!email || !login || !password) {
                showMessage('register-message', 'Заполните все поля.', true);
                return;
            }
            if (login.length < 3) {
                showMessage('register-message', 'Логин не менее 3 символов.', true);
                return;
            }
            if (password.length < 6) {
                showMessage('register-message', 'Пароль не менее 6 символов.', true);
                return;
            }

            var captchaToken = getCaptchaResponse();
            if (!captchaToken) {
                showMessage('register-message', 'Пожалуйста, пройдите капчу (отметьте «Я не робот»).', true);
                var msgEl = document.getElementById('register-message');
                if (msgEl) msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                return;
            }

            var users = getUsers();
            if (users[email.toLowerCase()]) {
                showMessage('register-message', 'Аккаунт с таким email уже зарегистрирован. Войдите в аккаунт.', true);
                return;
            }

            saveUser(email, login, password);
            localStorage.setItem('boneka_logged_email', email.toLowerCase());
            window.location.href = 'cabinet.html';
        });
    }

    function initLogin() {
        var form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideMessage('login-message');

            var emailEl = document.getElementById('login-email');
            var passwordEl = document.getElementById('login-password');
            if (!emailEl || !passwordEl) return;

            var email = emailEl.value.trim();
            var password = passwordEl.value;

            var captchaToken = getCaptchaResponse();
            if (!captchaToken) {
                showMessage('login-message', 'Пожалуйста, пройдите капчу.', true);
                return;
            }

            var user = findUser(email, password);
            if (!user) {
                showMessage('login-message', 'Неверный email или пароль.', true);
                if (typeof hcaptcha !== 'undefined') {
                    try { hcaptcha.reset(); } catch (err) {}
                }
                return;
            }

            localStorage.setItem('boneka_logged_email', email.toLowerCase());
            var redirect = new URLSearchParams(window.location.search).get('redirect');
            window.location.href = (redirect && redirect.indexOf('://') === -1) ? redirect : 'cabinet.html';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initRegister();
            initLogin();
        });
    } else {
        initRegister();
        initLogin();
    }
})();
