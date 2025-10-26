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