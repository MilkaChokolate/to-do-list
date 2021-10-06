let valueInput = '';
let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
let input = null;
let activeEditTask = null;
window.onload = async function init(){
    input = document.getElementById('add-task');
    input.addEventListener("change", updateValue);
    const resp = await fetch('http://localhost:8000/allTasks', {method:'GET'});
    let result = await resp.json();
    allTasks = result.data;
    render();
}
onClickButton = async () =>{
    allTasks.push({
        text : valueInput,
        isCheck :false
    });
    const resp = await fetch('http://localhost:8000/createTask', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify ({
            text: valueInput,
            isCheck: false
        })
    });
    let result = await resp.json();
    console.log(result);
    allTasks = result.data;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    valueInput = '';//очистка переменной
    input.value = '';//обнуление ввода
    render();
}
updateValue = (event) =>{
    valueInput = event.target.value;//добавление задачи
}
render = () =>{
    const content = document.getElementById('content-page')//прикреплем контент к имеющемус контейнеру по id
    while (content.firstChild){
       content.removeChild(content.firstChild);
    }//очищаем контент каждый раз от записанного элемента
    allTasks.map((item, index) => {
        const container = document.createElement('div');//создаем контейнер для таски
        container.id = 'task-s{index}';//доб номер таска
        container.className = 'task-container';
        const checkbox = document.createElement('input');//сщздаем ему checkbox
        checkbox.type = 'checkbox';
        checkbox.checked = item.isCheck;//присваиваем чекбоксу true false
        checkbox.onchange = function () {
            onChangeCheckbox(index);
        };
        container.appendChild(checkbox);//добавляяяем его в контейнер

        if (index === activeEditTask) {
            const inputTask = document.createElement('input');
            inputTask.type = 'text';
            inputTask.value = item.text;
            inputTask.addEventListener('change', updateTaskText);
            inputTask.addEventListener('blur', doneEditTask);
            container.appendChild(inputTask);
        } else {
            const text = document.createElement('p');
            text.innerText = item.text;
            text.className = item.isCheck ? 'text-task text-done' : 'text-task';
            container.appendChild(text);
        }
            if (!item.isCheck) {
                if (index === activeEditTask) {
                    const imageDone = document.createElement('img');
                    imageDone.src = "done.png";
                    imageDone.onclick = function () {
                        doneEditTask();
                    };
                    container.appendChild(imageDone);
                } else {
                    const imageEdit = document.createElement('img');
                    imageEdit.src = "redact.png";
                    imageEdit.onclick = function () {
                        activeEditTask = index;
                        render();
                    };
                    container.appendChild(imageEdit);
                }
                const imageDelete = document.createElement('img');
                imageDelete.src = 'delete.png';
                container.appendChild(imageDelete);
                imageDelete.onclick = function () {
                    onClickDelete(index);
                };
                container.appendChild(imageDelete);
            }
        content.appendChild(container);//доб в контент наш сформированный контейнер
    });
}

onChangeCheckbox = async (index) => {
    allTasks[index].isCheck = !allTasks[index].isCheck;

    const resp = await fetch('http://localhost:8000/deleteTask', {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*'
        },
        body: {
            id : index,
            isCheck : !isCheck
        }
    });
    let result = await resp.json();

    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
}
onClickDelete = async (elem) => {
    allTasks.splice(elem, 1);
    const resp = await fetch('http://localhost:8000/deleteTask', {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*'
        },
        params: {
            id : elem
        }
    });
    let result = await resp.json();
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
}
updateTaskText =  (event) => {
    allTasks[activeEditTask].text = event.target.value;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
}
doneEditTask = () => {
    activeEditTask = null;
    render();
}