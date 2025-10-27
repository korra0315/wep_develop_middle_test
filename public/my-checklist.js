document.addEventListener('DOMContentLoaded', () => {
    const checklistsContainer = document.getElementById('checklists');
    const addChecklistButton = document.querySelector('.add-checklist-btn');

    let userId = null;
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        userId = user.id;
        loadChecklists();
    } else {
        document.getElementById('checklist-container').innerHTML = '<p><a href="/login.html">로그인</a>하여 체크리스트를 관리하세요.</p>';
        return;
    }

    addChecklistButton.addEventListener('click', () => {
        const type = prompt('체크리스트 종류를 선택하세요: 국내 또는 해외');
        if (type === '국내' || type === '해외') {
            createChecklist(type === '국내' ? 'domestic' : 'overseas');
        } else if (type !== null) {
            alert('잘못된 입력입니다. \'국내\' 또는 \'해외\' 중에서 선택해주세요.');
        }
    });

    async function loadChecklists() {
        try {
            const response = await fetch(`/api/checklists/${userId}`);
            const userChecklists = await response.json();
            checklistsContainer.innerHTML = '';
            userChecklists.forEach(checklistData => {
                renderChecklist(checklistData, checklistData.completed);
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
            const response = await fetch(`/api/checklists/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChecklistData)
            });
            const createdChecklist = await response.json();
            renderChecklist(createdChecklist, false); // Always render in edit mode initially
        } catch (error) {
            console.error('Error creating checklist:', error);
        }
    }

    function renderChecklist(checklistData, isCompleted) {
        const checklistElement = document.createElement('div');
        checklistElement.classList.add('checklist-box');
        checklistElement.dataset.id = checklistData.id;

        if (isCompleted) {
            renderChecklistView(checklistElement, checklistData);
        } else {
            renderChecklistEdit(checklistElement, checklistData);
        }

        checklistsContainer.appendChild(checklistElement);
        attachEventListeners(checklistElement, checklistData.id);
    }

    function renderChecklistView(checklistElement, checklistData) {
        checklistElement.classList.add('completed');
        const itemsHTML = checklistData.items.map(item => `
            <div class="checklist-item">
                <span class="item-text ${item.completed ? 'completed' : ''}">${item.text}</span>
                <input type="checkbox" class="item-completed-checkbox" ${item.completed ? 'checked' : ''}>
            </div>
        `).join('');

        checklistElement.innerHTML = `
            <div class="checklist-header">
                <span class="checklist-title">${checklistData.title}</span>
                <div class="checklist-controls">
                    <button class="edit-checklist-btn">수정</button>
                    <button class="delete-checklist-btn">삭제</button>
                </div>
            </div>
            <div class="checklist-items">${itemsHTML}</div>
        `;
    }

    function renderChecklistEdit(checklistElement, checklistData) {
        checklistElement.classList.remove('completed');
        const itemsHTML = checklistData.items.map(item => `
            <div class="checklist-item">
                <input type="text" class="item-text-input" value="${item.text}">
                <button class="remove-item-btn">-</button>
            </div>
        `).join('');

        checklistElement.innerHTML = `
            <div class="checklist-header">
                <input type="text" class="checklist-title-input" value="${checklistData.title}">
            </div>
            <div class="checklist-items">${itemsHTML}</div>
            <div class="checklist-footer">
                <button class="add-item-btn">+ 항목 추가</button>
                <button class="complete-checklist-btn">체크리스트 완성하기</button>
            </div>
        `;
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
            if (e.target.classList.contains('add-item-btn')) {
                addChecklistItem(checklistElement);
            }
            if (e.target.classList.contains('remove-item-btn')) {
                e.target.parentElement.remove();
            }
        });

        checklistElement.addEventListener('change', async (e) => {
            if (e.target.classList.contains('item-completed-checkbox')) {
                await updateItemCompletion(checklistId);
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
            const checklistData = await getChecklistData(checklistId);
            const checklistElement = document.querySelector(`.checklist-box[data-id='${checklistId}']`);
            checklistElement.remove();
            renderChecklist(checklistData, false);
        } catch (error) {
            console.error('Error fetching checklist for editing:', error);
        }
    }

    async function completeChecklist(checklistId) {
        try {
            const checklistElement = document.querySelector(`.checklist-box[data-id='${checklistId}']`);
            const title = checklistElement.querySelector('.checklist-title-input').value;
            const items = [];
            checklistElement.querySelectorAll('.checklist-item').forEach(itemEl => {
                items.push({
                    text: itemEl.querySelector('.item-text-input').value,
                    completed: false
                });
            });

            const checklistData = await getChecklistData(checklistId);
            const updatedChecklist = {
                ...checklistData,
                title: title,
                items: items,
                completed: true
            };

            await fetch(`/api/checklists/${userId}/${checklistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedChecklist)
            });
            loadChecklists();
        } catch (error) {
            console.error('Error completing checklist:', error);
        }
    }
    
    async function updateItemCompletion(checklistId) {
        try {
            const checklistElement = document.querySelector(`.checklist-box[data-id='${checklistId}']`);
            const checklistData = await getChecklistData(checklistId);
            
            const itemElements = checklistElement.querySelectorAll('.checklist-item');
            const updatedItems = Array.from(itemElements).map((itemEl, index) => {
                const checkbox = itemEl.querySelector('.item-completed-checkbox');
                return {
                    text: checklistData.items[index].text,
                    completed: checkbox.checked
                };
            });
    
            const updatedChecklist = { ...checklistData, items: updatedItems };
    
            await fetch(`/api/checklists/${userId}/${checklistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedChecklist)
            });
    
            // Visually update the strikethrough
            itemElements.forEach((itemEl, index) => {
                const textSpan = itemEl.querySelector('.item-text');
                if (textSpan && updatedItems[index].completed) {
                    textSpan.classList.add('completed');
                } else if (textSpan) {
                    textSpan.classList.remove('completed');
                }
            });
    
        } catch (error) {
            console.error('Error updating item completion:', error);
        }
    }
    
    async function getChecklistData(checklistId) {
        const response = await fetch(`/api/checklists/${userId}`);
        const userChecklists = await response.json();
        return userChecklists.find(c => c.id === checklistId);
    }

    function addChecklistItem(checklistElement) {
        const itemsContainer = checklistElement.querySelector('.checklist-items');
        const itemElement = document.createElement('div');
        itemElement.classList.add('checklist-item');
        itemElement.innerHTML = `
            <input type="text" class="item-text-input" value="">
            <button class="remove-item-btn">-</button>
        `;
        itemsContainer.appendChild(itemElement);
    }
});
