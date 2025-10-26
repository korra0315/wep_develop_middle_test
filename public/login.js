document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailIdInput = document.getElementById('email-id');
    const passwordInput = document.getElementById('password');
    const emailIdError = document.getElementById('email-id-error');
    const passwordError = document.getElementById('password-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        emailIdError.textContent = '';
        passwordError.textContent = '';

        const emailId = emailIdInput.value;
        const password = passwordInput.value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emailId, password })
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            const errorData = await response.json();
            if (errorData.field === 'email-id') {
                emailIdError.textContent = errorData.message;
            } else if (errorData.field === 'password') {
                passwordError.textContent = errorData.message;
            }
        }
    });
});