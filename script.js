const todoContainer = document.getElementById('todoContainer');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoInput = document.getElementById('todoInput');

// Hardcoded sample todos
const sampleTodos = ['Sample Todo 1', 'Sample Todo 2'];
let lastValidPositions = new Map(); // Tracks last valid positions of todos

// Initialize with sample todos
sampleTodos.forEach((text, index) => {
  createTodo(text, 50 + index * 100, 50 + index * 50);
});

// Add a new todo
addTodoBtn.addEventListener('click', () => {
  const text = todoInput.value.trim();
  if (text) {
    const newPosition = getNewPosition(); // Get a new position for the todo
    createTodo(text, newPosition.x, newPosition.y);
    todoInput.value = '';
  }
});

// Create a draggable todo
function createTodo(text, x = 100, y = 100) {
  const todo = document.createElement('div');
  todo.className = 'todo';
  todo.textContent = text;

  // Add delete button
  const deleteBtn = document.createElement('span');
  deleteBtn.className = 'delete';
  deleteBtn.textContent = '✖';
  deleteBtn.addEventListener('click', () => {
    todoContainer.removeChild(todo);
    lastValidPositions.delete(todo);
  });
  todo.appendChild(deleteBtn);

  todoContainer.appendChild(todo);

  // Set initial position
  todo.style.left = `${x}px`;
  todo.style.top = `${y}px`;
  lastValidPositions.set(todo, { x, y });

  // Enable dragging
  enableDrag(todo);
}

// Calculate a new position for the new todo
function getNewPosition() {
  const todos = Array.from(todoContainer.querySelectorAll('.todo'));
  const offset = 50; // Offset between todos
  const baseX = 50;
  const baseY = 50;

  // Calculate position based on the number of existing todos
  const x = baseX + (todos.length * offset) % todoContainer.offsetWidth;
  const y = baseY + Math.floor((todos.length * offset) / todoContainer.offsetWidth) * offset;

  return { x, y };
}

function enableDrag(todo) {
  let offsetX = 0;
  let offsetY = 0;

  todo.addEventListener('mousedown', (e) => {
    offsetX = e.clientX - todo.offsetLeft;
    offsetY = e.clientY - todo.offsetTop;

    const onMouseMove = (e) => {
      const containerRect = todoContainer.getBoundingClientRect();
      const todoRect = todo.getBoundingClientRect();

      // Calculate new position
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Restrict within container boundaries
      newX = Math.max(0, Math.min(newX, containerRect.width - todoRect.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - todoRect.height));

      // Update position
      todo.style.left = `${newX}px`;
      todo.style.top = `${newY}px`;

      // Check for collisions
      if (checkCollision(todo)) {
        todo.classList.remove('no-collision');
      } else {
        todo.classList.add('no-collision');
        lastValidPositions.set(todo, { x: newX, y: newY });
      }
    };

    const onMouseUp = () => {
      // Revert position if collision
      if (!todo.classList.contains('no-collision')) {
        const { x, y } = lastValidPositions.get(todo);
        todo.style.left = `${x}px`;
        todo.style.top = `${y}px`;
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function checkCollision(todo) {
  const todoRect = todo.getBoundingClientRect();

  for (const otherTodo of todoContainer.querySelectorAll('.todo')) {
    if (otherTodo === todo) continue;

    const otherRect = otherTodo.getBoundingClientRect();

    if (
      todoRect.right > otherRect.left &&
      todoRect.left < otherRect.right &&
      todoRect.bottom > otherRect.top &&
      todoRect.top < otherRect.bottom
    ) {
      return true;
    }
  }
  return false;
}
