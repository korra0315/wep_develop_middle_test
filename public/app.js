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

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const user = await response.json();
        renderLoggedIn(user);
      } else {
        renderLoggedOut();
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      renderLoggedOut();
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
        <a href="#" id="logout-link">로그아웃</a>
      </div>
    `;

    const logoutLink = document.getElementById('logout-link');
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/logout');
      window.location.href = '/';
    });
  };

  const renderLoggedOut = () => {
    signupLink.style.display = 'block';
    loginBtn.style.display = 'block';
    userDropdown.innerHTML = '';
  };
  
  checkUserStatus();

  // Trip list functionality
  const tripList = document.getElementById('trip-list');
  const apiUrl = '/api/trips';

  const fetchTrips = async () => {
    try {
      const response = await fetch(apiUrl);
      const trips = await response.json();
      renderTrips(trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      tripList.innerHTML = '<p>Could not load upcoming schedules.</p>';
    }
  };

  const renderTrips = (trips) => {
    tripList.innerHTML = '';

    if (trips.length === 0) {
        tripList.innerHTML = '<p>No upcoming schedules.</p>';
        return;
    }

    // Sort trips by start date (ascending)
    const sortedTrips = trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Filter to show only future or ongoing trips
    const upcomingTrips = sortedTrips.filter(trip => new Date(trip.endDate) >= new Date());

    if (upcomingTrips.length === 0) {
        tripList.innerHTML = '<p>No upcoming schedules.</p>';
        return;
    }

    upcomingTrips.forEach(trip => {
      const tripElement = document.createElement('div');
      tripElement.classList.add('trip-item');
      // Simple display for now, can be enhanced
      tripElement.innerHTML = `
        <h3>${trip.title}</h3>
        <p>${trip.startDate} ~ ${trip.endDate}</p>
      `;
      tripList.appendChild(tripElement);
    });
  };

  // Initial fetch
  fetchTrips();

  // Note: The form for adding new trips and the delete functionality have been removed 
  // as the form is commented out in the HTML.
  // If that functionality is needed, the corresponding JS would be added back.
});