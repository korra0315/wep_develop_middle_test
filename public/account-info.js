document.addEventListener('DOMContentLoaded', async () => {
    const userInfoDiv = document.getElementById('user-info');

    const response = await fetch('/api/user');
    if (response.ok) {
        const user = await response.json();
        userInfoDiv.innerHTML = `
            <p><strong>First Name:</strong> ${user.firstName}</p>
            <p><strong>Last Name:</strong> ${user.lastName}</p>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
        `;
    } else {
        window.location.href = '/login.html';
    }
});