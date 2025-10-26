document.addEventListener('DOMContentLoaded', () => {
  // Banner rotation
  let slideIndex = 0;
  const slides = document.querySelectorAll('.banner-slide');

  function showSlides() {
    slides.forEach(slide => {
      slide.classList.remove('active');
    });

    slideIndex++;
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }

    slides[slideIndex - 1].classList.add('active');
    setTimeout(showSlides, 5000); // Change image every 5 seconds
  }

  if (slides.length > 0) {
    showSlides();
  }

  const userDropdown = document.querySelector('.user-dropdown');
  const signupLink = document.querySelector('.signup-link');
  const loginBtn = document.querySelector('.login-btn');
  const tripList = document.getElementById('trip-list');

  const checkUserStatus = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      renderLoggedIn(user);
      displaySchedules(user.id);
    } else {
      renderLoggedOut();
      displaySchedules(null);
    }
  };

  const renderLoggedIn = (user) => {
    signupLink.style.display = 'none';
    loginBtn.style.display = 'none';
    userDropdown.innerHTML = `
      <button class="user-btn">${user.id} &#9662;</button>
      <div class="dropdown-content">
        <a href="/account-info.html">계정정보</a>
        <a href="/my-schedule.html">내일정</a>
        <a href="/my-checklist.html">내 체크리스트</a>
        <a href="#" id="logout-link">로그아웃</a>
      </div>
    `;

    const logoutLink = document.getElementById('logout-link');
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('user');
      window.location.href = '/';
    });
  };

  const renderLoggedOut = () => {
    signupLink.style.display = 'block';
    loginBtn.style.display = 'block';
    userDropdown.innerHTML = '';
  };

  const displaySchedules = (userId) => {
    if (!userId) {
      tripList.innerHTML = '<p><a href="/login.html">로그인</a>하여 일정을 확인하세요.</p>';
      return;
    }

    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || { schedules: {} };
    const userSchedules = allSchedules.schedules[userId] || [];

    if (userSchedules.length === 0) {
      tripList.innerHTML = '<p>아무 일정도 없습니다.</p>';
      return;
    }

    tripList.innerHTML = '';
    userSchedules.forEach(schedule => {
      const scheduleElement = document.createElement('div');
      scheduleElement.classList.add('trip-item'); // You might need to style this class
      scheduleElement.innerHTML = `
        <h4>${schedule.title}</h4>
        <p>${schedule.items.length}개의 항목</p>
      `;
      tripList.appendChild(scheduleElement);
    });
  };
  
  checkUserStatus();
});