
document.addEventListener('DOMContentLoaded', () => {
  const tripList = document.getElementById('trip-list');
  const newTripForm = document.getElementById('new-trip-form');
  const titleInput = document.getElementById('title');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  const apiUrl = '/api/trips';

  const fetchTrips = async () => {
    try {
      const response = await fetch(apiUrl);
      const trips = await response.json();
      renderTrips(trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const renderTrips = (trips) => {
    tripList.innerHTML = '';
    trips.forEach(trip => {
      const tripElement = document.createElement('div');
      tripElement.classList.add('trip-item');
      tripElement.innerHTML = `
        <h3>${trip.title}</h3>
        <p>${trip.startDate} to ${trip.endDate}</p>
        <button class="delete-btn" data-id="${trip.id}">Delete</button>
      `;
      tripList.appendChild(tripElement);
    });
  };

  newTripForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTrip = {
      title: titleInput.value,
      startDate: startDateInput.value,
      endDate: endDateInput.value,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrip),
      });

      if (response.ok) {
        fetchTrips();
        newTripForm.reset();
      } else {
        console.error('Error adding trip:', await response.json());
      }
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  });

  tripList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.dataset.id;
      try {
        const response = await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTrips();
        } else {
          console.error('Error deleting trip:', await response.json());
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  });

  fetchTrips();
});
