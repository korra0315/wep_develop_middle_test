document.addEventListener('DOMContentLoaded', () => {
    const scheduleContent = document.getElementById('schedule-content');
    const addScheduleBtn = document.getElementById('add-schedule-btn');

    let userId = null;
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (user) {
        userId = user.id;
        fetchSchedules();
    } else {
        scheduleContent.innerHTML = '<p><a href="/login.html">로그인</a>하여 일정을 관리하세요.</p>';
    }

    function fetchSchedules() {
        if (!userId) return;
        const allSchedules = JSON.parse(localStorage.getItem('schedules')) || { schedules: {} };
        const userSchedules = allSchedules.schedules[userId] || [];

        scheduleContent.innerHTML = '';
        if (userSchedules.length === 0) {
            scheduleContent.innerHTML = '<p>아무 일정도 없습니다 +버튼을 눌러 새로운 여행 기획하기!!</p>';
        }
        userSchedules.forEach(scheduleData => {
            new Schedule(scheduleContent, scheduleData);
        });
    }

    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', () => {
            if (userId) {
                if (scheduleContent.querySelector('p')) {
                    scheduleContent.innerHTML = '';
                }
                new Schedule(scheduleContent);
            }
            else {
                alert("로그인이 필요합니다.");
            }
        });
    }

    class Schedule {
        constructor(container, data = null) {
            this.container = container;
            this.data = data || { id: Date.now().toString(), title: '', items: [] };
            this.isEditing = !data;
            this.element = document.createElement('div');
            this.element.classList.add('schedule-item');
            this.render();
            if (this.isEditing) {
                this.container.prepend(this.element);
            } else {
                this.container.appendChild(this.element);
            }
            this.attachEventListeners();
        }

        render() {
            if (this.isEditing) {
                this.renderEdit();
            } else {
                this.renderView();
            }
        }

        renderEdit() {
            let itemsHTML = '';
            const dates = [...new Set(this.data.items.map(item => item.date))];
            if (dates.length === 0) dates.push('');

            dates.forEach(date => {
                itemsHTML += this.getDateSectionHTML(date, this.data.items.filter(item => item.date === date));
            });

            this.element.innerHTML = `
                <input type="text" class="schedule-title" placeholder="새로운 일정" value="${this.data.title}">
                <div class="itinerary-box">${itemsHTML}</div>
                <button class="add-date-btn">+ 날짜 추가</button>
                <button class="save-schedule-btn">일정 저장하기</button>
            `;
        }

        getDateSectionHTML(date, items) {
            let itemsHTML = '';
            if (items.length === 0) items.push({ text: '', startTime: '09:00', endTime: '10:00' });

            items.forEach(item => {
                itemsHTML += this.getItineraryItemHTML(item);
            });

            return `
                <div class="date-section">
                    <div class="date-header">
                        <input type="date" class="date-input" value="${date}">
                    </div>
                    <div class="itinerary-items">${itemsHTML}</div>
                    <button class="add-item-btn">+ 항목 추가</button>
                </div>
            `;
        }

        getItineraryItemHTML(item) {
            const [startHour, startMinute] = item.startTime.split(':');
            const [endHour, endMinute] = item.endTime.split(':');
            return `
                <div class="itinerary-item">
                    <input type="text" class="itinerary-text" placeholder="내용" value="${item.text}">
                    <select class="hour-select start-hour">${this.getHourOptions(startHour)}</select>:
                    <select class="minute-select start-minute">${this.getMinuteOptions(startMinute)}</select> ~
                    <select class="hour-select end-hour">${this.getHourOptions(endHour)}</select>:
                    <select class="minute-select end-minute">${this.getMinuteOptions(endMinute)}</select>
                    <button class="remove-item-btn">-</button>
                </div>
            `;
        }

        renderView() {
            this.data.items.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateA - dateB;
            });

            let completedHTML = `<h3>${this.data.title}</h3>`;
            let currentDate = null;

            this.data.items.forEach(item => {
                if (item.date !== currentDate) {
                    if (currentDate !== null) completedHTML += '</div>';
                    currentDate = item.date;
                    completedHTML += `<div class="date-section-completed"><h4>${currentDate}</h4>`;
                }
                completedHTML += `
                    <div class="itinerary-item-completed">
                        <p class="text">${item.text}</p>
                        <p class="time">${item.startTime} ~ ${item.endTime}</p>
                    </div>`;
            });

            if (currentDate !== null) completedHTML += '</div>';

            this.element.innerHTML = `
                ${completedHTML}
                <button class="delete-schedule-btn">일정삭제하기</button>
                <button class="edit-schedule-btn">일정수정하기</button>
            `;
        }

        attachEventListeners() {
            this.element.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-date-btn')) this.addDateSection();
                if (e.target.classList.contains('add-item-btn')) this.addItem(e.target);
                if (e.target.classList.contains('remove-item-btn')) this.removeItem(e.target);
                if (e.target.classList.contains('save-schedule-btn')) this.save();
                if (e.target.classList.contains('edit-schedule-btn')) this.edit();
                if (e.target.classList.contains('delete-schedule-btn')) this.delete();
            });
        }

        addDateSection() {
            const itineraryBox = this.element.querySelector('.itinerary-box');
            const newDateSection = document.createElement('div');
            newDateSection.innerHTML = this.getDateSectionHTML('', []);
            itineraryBox.appendChild(newDateSection.firstElementChild);
        }

        addItem(button) {
            const itineraryItems = button.closest('.date-section').querySelector('.itinerary-items');
            const newItem = document.createElement('div');
            newItem.innerHTML = this.getItineraryItemHTML({ text: '', startTime: '09:00', endTime: '10:00' });
            itineraryItems.appendChild(newItem.firstElementChild);
        }

        removeItem(button) {
            button.closest('.itinerary-item').remove();
        }

        edit() {
            this.isEditing = true;
            this.render();
        }

        delete() {
            if (!userId) return;
            const allSchedules = JSON.parse(localStorage.getItem('schedules')) || { schedules: {} };
            if (allSchedules.schedules[userId]) {
                const index = allSchedules.schedules[userId].findIndex(s => s.id === this.data.id);
                if (index !== -1) {
                    allSchedules.schedules[userId].splice(index, 1);
                    localStorage.setItem('schedules', JSON.stringify(allSchedules));
                    this.element.remove();
                }
            }
        }

        save() {
            if (!userId) return;

            const title = this.element.querySelector('.schedule-title').value;
            const items = [];
            let dateMissing = false;
            this.element.querySelectorAll('.date-section').forEach(dateSection => {
                const date = dateSection.querySelector('.date-input').value;
                if (!date) {
                    dateMissing = true;
                }
                dateSection.querySelectorAll('.itinerary-item').forEach(itemEl => {
                    const text = itemEl.querySelector('.itinerary-text').value;
                    const startTime = `${itemEl.querySelector('.start-hour').value}:${itemEl.querySelector('.start-minute').value}`;
                    const endTime = `${itemEl.querySelector('.end-hour').value}:${itemEl.querySelector('.end-minute').value}`;
                    if (text) { // Only add items with content
                        items.push({ date, text, startTime, endTime });
                    }
                });
            });

            if (dateMissing) {
                alert('날짜를 입력해주세요');
                return;
            }

            this.data.title = title;
            this.data.items = items;

            const allSchedules = JSON.parse(localStorage.getItem('schedules')) || { schedules: {} };
            if (!allSchedules.schedules[userId]) {
                allSchedules.schedules[userId] = [];
            }

            const index = allSchedules.schedules[userId].findIndex(s => s.id === this.data.id);
            if (index !== -1) {
                allSchedules.schedules[userId][index] = this.data;
            } else {
                allSchedules.schedules[userId].push(this.data);
            }

            localStorage.setItem('schedules', JSON.stringify(allSchedules));
            this.isEditing = false;
            fetchSchedules();
        }

        getHourOptions(selectedHour) {
            let options = '';
            for (let i = 0; i < 24; i++) {
                const value = i.toString().padStart(2, '0');
                options += `<option value="${value}" ${selectedHour === value ? 'selected' : ''}>${value}</option>`;
            }
            return options;
        }

        getMinuteOptions(selectedMinute) {
            let options = '';
            for (let i = 0; i < 60; i++) {
                const value = i.toString().padStart(2, '0');
                options += `<option value="${value}" ${selectedMinute === value ? 'selected' : ''}>${value}</option>`;
            }
            return options;
        }
    }
});