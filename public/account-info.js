document.addEventListener('DOMContentLoaded', () => {
    const userInfoDiv = document.getElementById('user-info');
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user) {
        userInfoDiv.innerHTML = `
            <p><strong>이름:</strong> ${user.firstName}</p>
            <p><strong>성:</strong> ${user.lastName}</p>
            <p><strong>아이디:</strong> ${user.id}</p>
            <p><strong>이메일:</strong> ${user.email}</p>
            <p><strong>전화번호:</strong> ${user.phone}</p>
        `;
    } else {
        window.location.href = '/login.html';
    }
});