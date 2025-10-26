document.addEventListener('DOMContentLoaded', async () => {
    const scheduleContent = document.getElementById('schedule-content');
    const addScheduleBtn = document.getElementById('add-schedule-btn');

    // Mock user ID for now
    const userId = 'testuser';

    async function fetchSchedules() {
        try {
            const response = await fetch(`/api/schedules/${userId}`);
            if (response.ok) {
                const schedules = await response.json();
                scheduleContent.innerHTML = '';
                schedules.forEach(scheduleData => {
                    new Schedule(scheduleContent, scheduleData);
                });
            } else {
                scheduleContent.innerHTML = '<p>아무 일정도 없습니다 +버튼을 눌러 새로운 여행 기획하기!!</p>';
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            scheduleContent.innerHTML = '<p>일정을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }

    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', () => {
            new Schedule(scheduleContent);
        });
    }

    class Schedule {
        constructor(container, data = null) {
            this.container = container;
            this.data = data || { id: Date.now().toString(), title: '', items: [] };
            this.isEditing = !data;
            this.element = document.createElement('div');
            this.element.classList.add('schedule-item');
            this.container.appendChild(this.element);
            this.render();
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
            this.populateTimeSelects();
            this.attachEventListeners();
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
            this.attachEventListeners();
        }

        attachEventListeners() {
            this.element.querySelector('.add-date-btn')?.addEventListener('click', () => this.addDateSection());
            this.element.querySelectorAll('.add-item-btn').forEach(btn => btn.addEventListener('click', (e) => this.addItem(e.target)));
            this.element.querySelectorAll('.remove-item-btn').forEach(btn => btn.addEventListener('click', (e) => this.removeItem(e.target)));
            this.element.querySelector('.save-schedule-btn')?.addEventListener('click', () => this.save());
            this.element.querySelector('.edit-schedule-btn')?.addEventListener('click', () => this.edit());
            this.element.querySelector('.delete-schedule-btn')?.addEventListener('click', () => this.delete());
        }

        addDateSection() {
            const itineraryBox = this.element.querySelector('.itinerary-box');
            const newDateSection = document.createElement('div');
            newDateSection.innerHTML = this.getDateSectionHTML('', []);
            itineraryBox.appendChild(newDateSection.firstElementChild);
            this.populateTimeSelects();
        }

        addItem(button) {
            const itineraryItems = button.closest('.date-section').querySelector('.itinerary-items');
            const newItem = document.createElement('div');
            newItem.innerHTML = this.getItineraryItemHTML({ text: '', startTime: '09:00', endTime: '10:00' });
            itineraryItems.appendChild(newItem.firstElementChild);
            this.populateTimeSelects();
        }

        removeItem(button) {
            button.closest('.itinerary-item').remove();
        }

        edit() {
            this.isEditing = true;
            this.render();
        }

        async delete() {
            try {
                const response = await fetch(`/api/schedules/${userId}/${this.data.id}`, { method: 'DELETE' });
                if (response.ok) {
                    this.element.remove();
                } else {
                    alert('일정 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error deleting schedule:', error);
                alert('일정 삭제 중 오류가 발생했습니다.');
            }
        }

        async save() {
            const title = this.element.querySelector('.schedule-title').value;
            const items = [];
            this.element.querySelectorAll('.date-section').forEach(dateSection => {
                const date = dateSection.querySelector('.date-input').value;
                dateSection.querySelectorAll('.itinerary-item').forEach(itemEl => {
                    const text = itemEl.querySelector('.itinerary-text').value;
                    const startTime = `${itemEl.querySelector('.start-hour').value}:${itemEl.querySelector('.start-minute').value}`;
                    const endTime = `${itemEl.querySelector('.end-hour').value}:${itemEl.querySelector('.end-minute').value}`;
                    if (text && date) {
                        items.push({ date, text, startTime, endTime });
                    }
                });
            });

            this.data.title = title;
            this.data.items = items;

            try {
                const response = await fetch(`/api/schedules/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.data),
                });
                if (response.ok) {
                    this.isEditing = false;
                    this.render();
                } else {
                    alert('일정 저장에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error saving schedule:', error);
                alert('일정 저장 중 오류가 발생했습니다.');
            }
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

        populateTimeSelects() {
            // No longer needed as options are generated directly in the HTML
        }
    }

    fetchSchedules();
});