document.addEventListener('DOMContentLoaded', async () => {
    const scheduleContent = document.getElementById('schedule-content');
    const addScheduleBtn = document.getElementById('add-schedule-btn');

    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', () => {
            scheduleContent.innerHTML = `
                <div class="schedule-item">
                    <input type="text" class="schedule-title" placeholder="새로운 일정">
                    <div class="itinerary-box">
                        <div class="date-section">
                            <div class="date-header">
                                <input type="date" class="date-input">
                            </div>
                            <div class="itinerary-items">
                                <div class="itinerary-item">
                                    <input type="text" class="itinerary-text" placeholder="내용">
                                    <select class="hour-select"></select>
                                    <select class="minute-select"></select>
                                    <button class="add-item-btn">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="add-date-btn">+ 날짜 추가</button>
                    <button class="complete-schedule-btn">일정 완성하기</button>
                </div>
            `;
            populateTimeSelects();
        });
    }

    scheduleContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-item-btn')) {
            const itineraryItems = event.target.closest('.itinerary-items');
            const newItem = document.createElement('div');
            newItem.classList.add('itinerary-item');
            newItem.innerHTML = `
                <input type="text" class="itinerary-text" placeholder="내용">
                <select class="hour-select"></select>
                <select class="minute-select"></select>
                <button class="add-item-btn">+</button>
            `;
            itineraryItems.appendChild(newItem);
            populateTimeSelects();
        }

        if (event.target.classList.contains('add-date-btn')) {
            const itineraryBox = event.target.closest('.itinerary-box');
            const newDateSection = document.createElement('div');
            newDateSection.classList.add('date-section');
            newDateSection.innerHTML = `
                <div class="date-header">
                    <input type="date" class="date-input">
                </div>
                <div class="itinerary-items">
                    <div class="itinerary-item">
                        <input type="text" class="itinerary-text" placeholder="내용">
                        <select class="hour-select"></select>
                        <select class="minute-select"></select>
                        <button class="add-item-btn">+</button>
                    </div>
                </div>
            `;
            itineraryBox.appendChild(newDateSection);
            populateTimeSelects();
        }

        if (event.target.classList.contains('complete-schedule-btn')) {
            const scheduleItem = event.target.closest('.schedule-item');
            const title = scheduleItem.querySelector('.schedule-title').value;
            const itineraryBox = scheduleItem.querySelector('.itinerary-box');

            const scheduleData = [];

            itineraryBox.querySelectorAll('.date-section').forEach(dateSection => {
                const date = dateSection.querySelector('.date-input').value;
                dateSection.querySelectorAll('.itinerary-item').forEach(item => {
                    const text = item.querySelector('.itinerary-text').value;
                    const hour = item.querySelector('.hour-select').value;
                    const minute = item.querySelector('.minute-select').value;
                    if (text) {
                        scheduleData.push({ date, text, hour, minute });
                    }
                });
            });

            scheduleData.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.hour.padStart(2, '0')}:${a.minute.padStart(2, '0')}`);
                const dateB = new Date(`${b.date}T${b.hour.padStart(2, '0')}:${b.minute.padStart(2, '0')}`);
                return dateA - dateB;
            });

            let completedHTML = `<h3>${title}</h3>`;
            let currentDate = null;

            scheduleData.forEach(item => {
                if (item.date !== currentDate) {
                    if (currentDate !== null) {
                        completedHTML += '</div>';
                    }
                    currentDate = item.date;
                    completedHTML += `<div class="date-section-completed">
                                        <h4>${currentDate}</h4>`;
                }
                completedHTML += `<div class="itinerary-item-completed">
                                    <p class="text">${item.text}</p>
                                    <p class="time">${item.hour.padStart(2, '0')}:${item.minute.padStart(2, '0')}</p>
                                  </div>`;
            });

            if (currentDate !== null) {
                completedHTML += '</div>';
            }

            scheduleItem.innerHTML = completedHTML;
        }
    });

    function populateTimeSelects() {
        const hourSelects = document.querySelectorAll('.hour-select:not(.populated)');
        const minuteSelects = document.querySelectorAll('.minute-select:not(.populated)');

        hourSelects.forEach(select => {
            for (let i = 0; i < 24; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i.toString().padStart(2, '0');
                select.appendChild(option);
            }
            select.classList.add('populated');
        });

        minuteSelects.forEach(select => {
            for (let i = 0; i < 60; i += 15) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i.toString().padStart(2, '0');
                select.appendChild(option);
            }
            select.classList.add('populated');
        });
    }
});