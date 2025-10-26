document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous error messages
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const id = document.getElementById('id').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;

  let isValid = true;

  if (!firstName) {
    document.getElementById('error-firstName').textContent = '성을 입력해야합니다';
    isValid = false;
  }
  if (!lastName) {
    document.getElementById('error-lastName').textContent = '이름을 입력해야합니다';
    isValid = false;
  }
  if (!id) {
    document.getElementById('error-id').textContent = '아이디를 입력해야합니다';
    isValid = false;
  }
  if (!password) {
    document.getElementById('error-password').textContent = '비밀번호를 입력해야합니다';
    isValid = false;
  }
  if (password !== confirmPassword) {
    document.getElementById('error-confirmPassword').textContent = '비밀번호가 일치하지 않습니다';
    isValid = false;
  }
  if (!phone) {
    document.getElementById('error-phone').textContent = '전화번호를 입력해야합니다';
    isValid = false;
  }
  if (!email) {
    document.getElementById('error-email').textContent = '이메일을 입력해야합니다';
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firstName, lastName, id, password, phone, email })
    });

    const result = await response.json();

    if (response.ok) {
      alert('계정이 생성되었습니다.');
      window.location.href = 'index.html';
    } else {
      alert(`계정 생성 실패: ${result.error}`);
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('계정 생성 중 오류가 발생했습니다.');
  }
});