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

    let closestSchedule = null;
    let closestDate = null;

    userSchedules.forEach(schedule => {
      if (schedule.items && schedule.items.length > 0) {
        schedule.items.forEach(item => {
          const itemDate = new Date(item.date);
          const now = new Date();
          now.setHours(0, 0, 0, 0); 

          if (itemDate >= now) {
            if (!closestDate || itemDate < closestDate) {
              closestDate = itemDate;
              closestSchedule = schedule;
            }
          }
        });
      }
    });

    if (closestSchedule) {
      const closestDayItems = closestSchedule.items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === closestDate.getFullYear() &&
               itemDate.getMonth() === closestDate.getMonth() &&
               itemDate.getDate() === closestDate.getDate();
      });

      tripList.innerHTML = '';
      const scheduleElement = document.createElement('div');
      scheduleElement.classList.add('trip-item');
      
      let itemsHtml = '<ul>';
      closestDayItems.forEach(item => {
        itemsHtml += `<li>${item.text} (${item.startTime} - ${item.endTime})</li>`;
      });
      itemsHtml += '</ul>';

      scheduleElement.innerHTML = `
        <h4>${closestSchedule.title}</h4>
        <p>가장 가까운 일정 (${closestDate.toLocaleDateString()})</p>
        ${itemsHtml}
      `;
      tripList.appendChild(scheduleElement);
    } else {
      tripList.innerHTML = '<p>예정된 일정이 없습니다.</p>';
    }
  };
  
  checkUserStatus();
});