const STORAGE_KEY = "studentPlannerTasks";
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const filter = document.getElementById("filter");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

document.getElementById("today").textContent =
  new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const dateInput = document.getElementById("dueDate");
dateInput.value = new Date().toISOString().slice(0, 10);

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  const shownTasks = tasks.filter(task => {
    if (filter.value === "pending") return !task.completed;
    if (filter.value === "completed") return task.completed;
    return true;
  });

  shownTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  shownTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item ${task.completed ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement("div");
    info.className = "task-info";
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = `${task.subject} • Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}`;
    info.append(title, meta);

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, info, remove);
    taskList.appendChild(item);
  });

  emptyMessage.hidden = shownTasks.length !== 0;
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = tasks.filter(t => t.completed).length;
  document.getElementById("pendingCount").textContent = tasks.filter(t => !t.completed).length;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const subject = document.getElementById("subject").value;
  const dueDate = dateInput.value;
  if (!title || !dueDate) return;

  tasks.push({ id: `${Date.now()}-${Math.random()}`, title, subject, dueDate, completed: false });
  saveTasks();
  taskForm.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  renderTasks();
});

filter.addEventListener("change", renderTasks);
renderTasks();
