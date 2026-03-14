'use strict';

const STORAGE_KEY = 'todos';

// --- State ---
let todos = load();
let filter = 'all';

// --- Persistence ---
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// --- DOM helpers ---
const $ = (id) => document.getElementById(id);

function createItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.done ? ' done' : '');
  li.dataset.id = todo.id;

  // Priority dot
  const dot = document.createElement('span');
  dot.className = `priority-dot ${todo.priority}`;
  dot.title = priorityLabel(todo.priority);

  // Checkbox
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'todo-check';
  check.checked = todo.done;
  check.addEventListener('change', () => toggleDone(todo.id));

  // Text (editable)
  const text = document.createElement('textarea');
  text.className = 'todo-text';
  text.value = todo.text;
  text.rows = 1;
  text.spellcheck = false;
  autoResize(text);
  text.addEventListener('input', () => {
    autoResize(text);
    updateText(todo.id, text.value);
  });
  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      text.blur();
    }
  });

  // Delete
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.innerHTML = '&times;';
  del.title = '削除';
  del.addEventListener('click', () => deleteTodo(todo.id));

  li.append(dot, check, text, del);
  return li;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function priorityLabel(p) {
  return { high: '優先度: 高', normal: '優先度: 普通', low: '優先度: 低' }[p] || '';
}

// --- Render ---
function render() {
  const list = $('todo-list');
  list.innerHTML = '';

  const visible = todos.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  if (visible.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = filter === 'done' ? '完了済みのタスクはありません' : 'タスクがありません';
    list.appendChild(msg);
  } else {
    visible.forEach((t) => list.appendChild(createItem(t)));
  }

  const active = todos.filter((t) => !t.done).length;
  $('remaining-count').textContent = `残り ${active} 件`;
}

// --- Actions ---
function addTodo(text, priority) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: Date.now(), text: trimmed, done: false, priority });
  save();
  render();
}

function toggleDone(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    save();
    render();
  }
}

function updateText(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = text;
    save();
    // don't re-render while editing
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

function clearDone() {
  todos = todos.filter((t) => !t.done);
  save();
  render();
}

// --- Event listeners ---
$('todo-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('todo-input');
  addTodo(input.value, $('priority-select').value);
  input.value = '';
  input.focus();
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

$('clear-done').addEventListener('click', clearDone);

// --- Init ---
render();
