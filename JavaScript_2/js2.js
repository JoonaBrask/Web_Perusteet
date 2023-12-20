document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    let tasks = [];

    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const taskName = document.getElementById('taskName').value;
        const priority = parseInt(document.getElementById('priority').value);
        const dueDate = document.getElementById('dueDate').value;

        if (!taskName || !priority || !dueDate) {
            alert('Kaikki kentät ovat pakollisia!');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (dueDate < today) {
            alert('Tavoitepvm ei voi olla historiassa!');
            return;
        }

        tasks.push({
            nro: tasks.length + 1,
            tehtava: taskName,
            prioriteetti: priority,
            tavoitepvm: dueDate,
            tila: 'Kesken'
        });

        updateTaskList();
        taskForm.reset();
    });
    
    function sortTasks() {
        const sortField = document.getElementById('sort').value;
    
        tasks.sort((a, b) => {
            if (sortField === 'tavoitepvm') {
                return new Date(a[sortField]) - new Date(b[sortField]);
            }
            return a[sortField] > b[sortField] ? 1 : -1;
        });
    
        updateTaskList();
    }
    

    function updateTaskList() {
        taskList.innerHTML = '';

        const sortedTasks = tasks.sort((a, b) => a.prioriteetti - b.prioriteetti);

        sortedTasks.forEach(task => {
            const row = document.createElement('tr');

            const nroCell = document.createElement('td');
            nroCell.textContent = task.nro;
            row.appendChild(nroCell);

            const taskNameCell = document.createElement('td');
            taskNameCell.textContent = task.tehtava;
            row.appendChild(taskNameCell);

            const priorityCell = document.createElement('td');
            priorityCell.textContent = task.prioriteetti;
            row.appendChild(priorityCell);

            const dueDateCell = document.createElement('td');
            dueDateCell.textContent = task.tavoitepvm;
            row.appendChild(dueDateCell);

            const statusCell = document.createElement('td');

            if (task.tila === 'Kesken') {
                const completeButton = document.createElement('button');
                completeButton.textContent = 'Valmis';
                completeButton.addEventListener('click', function() {
                    task.tila = 'Valmis';
                    updateTaskList();
                });
                statusCell.appendChild(completeButton);
            } else {
                statusCell.textContent = 'Valmis';
            }

            row.appendChild(statusCell);

            if (task.tila === 'Valmis') {
                row.classList.add('completed');
            }

            taskList.appendChild(row);
        });
    }

    updateTaskList();
});
