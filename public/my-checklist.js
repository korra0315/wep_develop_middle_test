document.addEventListener('DOMContentLoaded', () => {
    const domesticChecklistsContainer = document.getElementById('domestic-checklists');
    const overseasChecklistsContainer = document.getElementById('overseas-checklists');
    const addChecklistButtons = document.querySelectorAll('.add-checklist-btn');

    let userId = null;
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        userId = user.id;
        loadChecklists();
    } else {
        document.getElementById('checklist-container').innerHTML = '<p><a href="/login.html">로그인</a>하여 체크리스트를 관리하세요.</p>';
        return;
    }

    addChecklistButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            createChecklist(type);
        });
    });

    async function loadChecklists() {
        try {
            const response = await fetch(`/api/checklists/${userId}`);
            const userChecklists = await response.json();
            domesticChecklistsContainer.innerHTML = '';
            overseasChecklistsContainer.innerHTML = '';
            userChecklists.forEach(checklistData => {
                renderChecklist(checklistData);
            });
        } catch (error) {
            console.error('Error loading checklists:', error);
        }
    }

    async function createChecklist(type) {
        const defaultItems = type === 'overseas' ? 
            [
                { text: '여권', completed: false },
                { text: '환전', completed: false },
                { text: '항공편', completed: false },
                { text: '숙박', completed: false },
                { text: '유심', completed: false },
            ] : [];

        const newChecklistData = {
            id: Date.now().toString(),
            type: type,
            title: '새로운 체크리스트',
            items: defaultItems,
            completed: false
        };

        try {
            const response = await fetch(`/api/checklists/${userId}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChecklistData)
            });
            const createdChecklist = await response.json();
            renderChecklist(createdChecklist);
        } catch (error) {
            console.error('Error creating checklist:', error);
        }
    }

    function renderChecklist(checklistData, isEditing = false) {
        const checklistElement = document.createElement('div');
        checklistElement.classList.add('checklist-box');
        checklistElement.dataset.id = checklistData.id;

        let itemsHTML;
        if (isEditing) {
            itemsHTML = checklistData.items.map(item => `
                <div class="checklist-item">
                    <input type="text" class="item-text-input" value="${item.text}">
                    <input type="checkbox" class="item-completed-checkbox" ${item.completed ? 'checked' : ''}>
                    <button class="remove-item-btn">-</button>
                </div>
            `).join('');
        } else {
            itemsHTML = checklistData.items.map(item => `
                <div class="checklist-item">
                    <span class="item-text ${item.completed ? 'completed' : ''}">${item.text}</span>
                    <input type="checkbox" class="item-completed-checkbox" ${item.completed ? 'checked' : ''} ${checklistData.completed ? 'disabled' : ''}>
                </div>
            `).join('');
        }

        checklistElement.innerHTML = `
            <input type="text" class="checklist-title-input" value="${checklistData.title}" ${!isEditing && checklistData.completed ? 'disabled' : ''}>
            <div class="checklist-items">${itemsHTML}</div>
            ${isEditing ? '<button class="add-item-btn">+ 항목 추가</button>' : ''}
            <div class="checklist-controls">
                 <button class="delete-checklist-btn" style="display: ${!isEditing && checklistData.completed ? 'inline-block' : 'none'}">삭제</button>
                 <button class="edit-checklist-btn" style="display: ${!isEditing && checklistData.completed ? 'inline-block' : 'none'}">수정</button>
            </div>
            <button class="complete-checklist-btn" style="display: ${isEditing ? 'none' : (checklistData.completed ? 'none' : 'block')}">체크리스트 완성하기</button>
            <button class="save-checklist-btn" style="display: ${isEditing ? 'block' : 'none'}">저장</button>
        `;

        if (checklistData.completed && !isEditing) {
            checklistElement.classList.add('completed');
        }

        if (checklistData.type === 'domestic') {
            domesticChecklistsContainer.appendChild(checklistElement);
        } else {
            overseasChecklistsContainer.appendChild(checklistElement);
        }

        attachEventListeners(checklistElement, checklistData.id);
    }

    function attachEventListeners(checklistElement, checklistId) {
        checklistElement.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-checklist-btn')) {
                await deleteChecklist(checklistId);
            }
            if (e.target.classList.contains('edit-checklist-btn')) {
                await editChecklist(checklistId);
            }
            if (e.target.classList.contains('complete-checklist-btn')) {
                await completeChecklist(checklistId);
            }
            if (e.target.classList.contains('save-checklist-btn')) {
                await saveChecklist(checklistId);
            }
            if (e.target.classList.contains('add-item-btn')) {
                addChecklistItem(checklistElement);
            }
            if (e.target.classList.contains('remove-item-btn')) {
                e.target.parentElement.remove();
            }
        });
    }

    async function deleteChecklist(checklistId) {
        try {
            await fetch(`/api/checklists/${userId}/${checklistId}`, { method: 'DELETE' });
            loadChecklists();
        } catch (error) {
            console.error('Error deleting checklist:', error);
        }
    }

    async function editChecklist(checklistId) {
        try {
            const response = await fetch(`/api/checklists/${userId}`);
            const userChecklists = await response.json();
            const checklistData = userChecklists.find(c => c.id === checklistId);
            const checklistElement = document.querySelector(`.checklist-box[data-id='${checklistId}']`);
            checklistElement.remove();
            renderChecklist(checklistData, true);
        } catch (error) {
            console.error('Error fetching checklist for editing:', error);
        }
    }

    async function completeChecklist(checklistId) {
        try {
            const response = await fetch(`/api/checklists/${userId}`);
            const userChecklists = await response.json();
            const checklist = userChecklists.find(c => c.id === checklistId);
            
            checklist.completed = true;
            const checklistElement = document.querySelector(`.checklist-box[data-id='${checklistId}']`);
            const itemElements = checklistElement.querySelectorAll('.checklist-item');
            itemElements.forEach((itemEl, index) => {
                const checkbox = itemEl.querySelector('.item-completed-checkbox');
                checklist.items[index].completed = checkbox.checked;
            });

            await fetch(`/api/checklists/${userId}/${checklistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checklist)
            });
            loadChecklists();
        } catch (error) {
            console.error('Error completing checklist:', error);
        }
    }

    async function saveChecklist(checklistId) {
        try {
            const response = await fetch(`/api/checklists/${userId}`);
            const userChecklists = await response.json();
            const checklist = userChecklists.find(c => c.id === checklistId);
            const checklistElement = document.querySelector(`.checklist-box[data-id='${checklistId}']`);
            
            checklist.title = checklistElement.querySelector('.checklist-title-input').value;
            checklist.items = [];
            checklistElement.querySelectorAll('.checklist-item').forEach(itemEl => {
                checklist.items.push({
                    text: itemEl.querySelector('.item-text-input').value,
                    completed: itemEl.querySelector('.item-completed-checkbox').checked
                });
            });
            checklist.completed = false;

            await fetch(`/api/checklists/${userId}/${checklistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checklist)
            });
            loadChecklists();
        } catch (error) {
            console.error('Error saving checklist:', error);
        }
    }

    function addChecklistItem(checklistElement) {
        const itemsContainer = checklistElement.querySelector('.checklist-items');
        const itemElement = document.createElement('div');
        itemElement.classList.add('checklist-item');
        itemElement.innerHTML = `
            <input type="text" class="item-text-input" value="">
            <input type="checkbox" class="item-completed-checkbox">
            <button class="remove-item-btn">-</button>
        `;
        itemsContainer.appendChild(itemElement);
    }
});
