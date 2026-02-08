(function() {
    var STORAGE_KEY = 'boneka_users';
    var LOGGED_KEY = 'boneka_logged_email';

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
        users[email] = users[email] || {};
        users[email].login = (login || '').trim();
        if (password !== undefined) users[email].password = password;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    function getLoggedEmail() {
        return localStorage.getItem(LOGGED_KEY) || '';
    }

    function logout() {
        localStorage.removeItem(LOGGED_KEY);
        window.location.href = 'login.html';
    }

    function showMessage(id, text, isError) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = text;
        el.style.display = 'block';
        el.className = 'form-message ' + (isError ? 'form-message-error' : 'form-message-success');
    }

    function hideMessage(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    var email = getLoggedEmail();
    if (!email) {
        window.location.href = 'login.html?redirect=cabinet.html';
        return;
    }

    var users = getUsers();
    var user = users[email];
    if (!user) {
        localStorage.removeItem(LOGGED_KEY);
        window.location.href = 'login.html';
        return;
    }

    var displayLogin = user.login || email.split('@')[0] || '—';
    var displayEmail = user.email || email;

    document.getElementById('cabinet-email').textContent = displayEmail;
    document.getElementById('cabinet-login').textContent = displayLogin;
    document.getElementById('cabinet-profile-name').textContent = displayLogin;
    document.getElementById('cabinet-profile-email').textContent = displayEmail;

    var avatarEl = document.getElementById('cabinet-avatar');
    if (user.avatarUrl) {
        avatarEl.innerHTML = '';
        var img = document.createElement('img');
        img.src = user.avatarUrl;
        img.alt = displayLogin;
        img.className = 'cabinet-avatar-img';
        avatarEl.appendChild(img);
    } else {
        avatarEl.textContent = (displayLogin.charAt(0) || email.charAt(0) || '?').toUpperCase();
        avatarEl.className = 'cabinet-avatar cabinet-avatar-initials';
    }

    var planNames = { '1m': '1 месяц', '3m': '3 месяца', 'forever': 'Навсегда', 'alpha': 'Alpha' };
    var planEl = document.getElementById('cabinet-profile-plan');
    if (user.plan && planNames[user.plan]) {
        planEl.textContent = 'Подписка: ' + planNames[user.plan];
        planEl.className = 'cabinet-profile-plan cabinet-profile-plan-active';
        document.getElementById('cabinet-download-buttons').style.display = 'flex';
        document.getElementById('cabinet-download-locked').style.display = 'none';
    } else {
        planEl.textContent = 'Нет активной подписки';
        planEl.className = 'cabinet-profile-plan cabinet-profile-plan-none';
        document.getElementById('cabinet-download-buttons').style.display = 'none';
        document.getElementById('cabinet-download-locked').style.display = 'block';
    }

    document.getElementById('header-login').style.display = 'none';
    document.getElementById('header-logout').style.display = 'inline-block';
    document.getElementById('header-logout').href = '#';
    document.getElementById('header-logout').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    document.getElementById('new-login').value = user.login || '';

    document.getElementById('cabinet-form-login').addEventListener('submit', function(e) {
        e.preventDefault();
        hideMessage('cabinet-login-message');
        var newLogin = document.getElementById('new-login').value.trim();
        if (newLogin.length < 3) {
            showMessage('cabinet-login-message', 'Ник не менее 3 символов.', true);
            return;
        }
        saveUser(email, newLogin, user.password);
        user.login = newLogin;
        document.getElementById('cabinet-login').textContent = newLogin;
        showMessage('cabinet-login-message', 'Имя пользователя сохранено.', false);
    });

    document.getElementById('cabinet-form-password').addEventListener('submit', function(e) {
        e.preventDefault();
        hideMessage('cabinet-password-message');
        var current = document.getElementById('current-password').value;
        var newPass = document.getElementById('new-password').value;
        var repeat = document.getElementById('new-password-repeat').value;
        if (current !== user.password) {
            showMessage('cabinet-password-message', 'Неверный текущий пароль.', true);
            return;
        }
        if (newPass.length < 6) {
            showMessage('cabinet-password-message', 'Новый пароль не менее 6 символов.', true);
            return;
        }
        if (newPass !== repeat) {
            showMessage('cabinet-password-message', 'Пароли не совпадают.', true);
            return;
        }
        saveUser(email, user.login, newPass);
        user.password = newPass;
        document.getElementById('cabinet-form-password').reset();
        showMessage('cabinet-password-message', 'Пароль успешно изменён.', false);
    });

    document.getElementById('cabinet-logout-btn').addEventListener('click', function() {
        logout();
    });
})();
