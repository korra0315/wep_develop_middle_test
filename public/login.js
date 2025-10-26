document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailIdInput = document.getElementById('email-id');
    const passwordInput = document.getElementById('password');
    const emailIdError = document.getElementById('email-id-error');
    const passwordError = document.getElementById('password-error');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        emailIdError.textContent = '';
        passwordError.textContent = '';

        const emailId = emailIdInput.value;
        const password = passwordInput.value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => (u.id === emailId || u.email === emailId) && u.password === password);

        if (user) {
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = '/';
        } else {
            const existingUser = users.find(u => u.id === emailId || u.email === emailId);
            if (!existingUser) {
                emailIdError.textContent = 'ID 또는 이메일이 존재하지 않습니다';
            } else {
                passwordError.textContent = '비밀번호가 일치하지 않습니다';
            }
        }
    });
});