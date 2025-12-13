// VividTodo Application Logic
// This script is loaded with <script src="app.js" defer></script> (non‑module).
// All functionality is exposed via the global `window.VividTodo` object for testing.

(() => {
  // ---------- Task Class ----------
  class Task {
    /**
     * @param {string|number} id - Unique identifier for the task.
     * @param {string} text - Task description.
     * @param {boolean} completed - Completion state.
     */
    constructor(id, text, completed = false) {
      this.id = id;
      this.text = text;
      this.completed = completed;
    }

    toggleComplete() {
      this.completed = !this.completed;
    }

    setText(newText) {
      this.text = newText;
    }
  }

  // ---------- TaskManager Module ----------
  const TaskManager = (() => {
    const STORAGE_KEY = "vividtodo-tasks";
    let tasks = [];
    let nextId = 1; // simple incremental id generator

    const _saveToStorage = () => {
      const data = tasks.map(t => ({ id: t.id, text: t.text, completed: t.completed }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const loadFromStorage = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          tasks = parsed.map(item => new Task(item.id, item.text, item.completed));
          // set nextId to max existing id + 1 to avoid collisions
          const maxId = tasks.reduce((max, t) => Math.max(max, Number(t.id)), 0);
          nextId = maxId + 1;
        } catch (e) {
          console.error("Failed to parse tasks from storage", e);
          tasks = [];
        }
      }
    };

    const addTask = (text) => {
      const task = new Task(nextId++, text, false);
      tasks.push(task);
      _saveToStorage();
      return task;
    };

    const _findIndexById = (id) => tasks.findIndex(t => String(t.id) === String(id));

    const editTask = (id, newText) => {
      const idx = _findIndexById(id);
      if (idx !== -1) {
        tasks[idx].setText(newText);
        _saveToStorage();
        return true;
      }
      return false;
    };

    const deleteTask = (id) => {
      const idx = _findIndexById(id);
      if (idx !== -1) {
        tasks.splice(idx, 1);
        _saveToStorage();
        return true;
      }
      return false;
    };

    const toggleTask = (id) => {
      const idx = _findIndexById(id);
      if (idx !== -1) {
        tasks[idx].toggleComplete();
        _saveToStorage();
        return true;
      }
      return false;
    };

    const reorderTasks = (oldIndex, newIndex) => {
      if (oldIndex < 0 || oldIndex >= tasks.length || newIndex < 0 || newIndex >= tasks.length) return false;
      const [moved] = tasks.splice(oldIndex, 1);
      tasks.splice(newIndex, 0, moved);
      _saveToStorage();
      return true;
    };

    const getFilteredTasks = (filter) => {
      switch (filter) {
        case "active":
          return tasks.filter(t => !t.completed);
        case "completed":
          return tasks.filter(t => t.completed);
        case "all":
        default:
          return [...tasks];
      }
    };

    const getAllTasks = () => [...tasks];

    const getTaskById = (id) => tasks.find(t => String(t.id) === String(id));

    const getTaskIndexById = (id) => _findIndexById(id);

    const saveToStorage = _saveToStorage; // expose for explicit calls if needed

    return {
      loadFromStorage,
      addTask,
      editTask,
      deleteTask,
      toggleTask,
      reorderTasks,
      getFilteredTasks,
      getAllTasks,
      getTaskById,
      getTaskIndexById,
      saveToStorage,
    };
  })();

  // ---------- UI Functions ----------
  const UI = (() => {
    const taskListEl = document.getElementById("task-list");
    const templateEl = document.getElementById("task-item-template");

    // Helper to create a <li> element for a task
    const createTaskElement = (task) => {
      const clone = templateEl.content.firstElementChild.cloneNode(true);
      clone.dataset.id = task.id;
      clone.setAttribute("draggable", "true");

      const checkbox = clone.querySelector(".task-checkbox");
      const textSpan = clone.querySelector(".task-text");
      const deleteBtn = clone.querySelector(".delete-task");

      checkbox.checked = task.completed;
      textSpan.textContent = task.text;
      if (task.completed) clone.classList.add("completed");

      // ----- Event Listeners -----
      // Toggle completion via checkbox
      checkbox.addEventListener("change", () => {
        TaskManager.toggleTask(task.id);
        renderTaskList(currentFilter);
      });

      // Delete button
      deleteBtn.addEventListener("click", () => {
        TaskManager.deleteTask(task.id);
        renderTaskList(currentFilter);
      });

      // Inline edit on double click
      textSpan.addEventListener("dblclick", () => {
        startEditing(clone, task);
      });

      // Drag‑and‑drop handlers
      clone.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", task.id);
        // Store the start index for later reorder
        const idx = TaskManager.getTaskIndexById(task.id);
        e.dataTransfer.setData("application/task-index", idx);
        // Add dragging class
        clone.classList.add("dragging");
      });

      clone.addEventListener("dragend", () => {
        clone.classList.remove("dragging");
      });

      clone.addEventListener("dragover", (e) => {
        e.preventDefault(); // allow drop
        const draggingEl = taskListEl.querySelector(".dragging");
        if (!draggingEl || draggingEl === clone) return;
        const bounding = clone.getBoundingClientRect();
        const offset = e.clientY - bounding.top;
        const after = offset > bounding.height / 2;
        taskListEl.insertBefore(draggingEl, after ? clone.nextSibling : clone);
      });

      clone.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        const fromIdx = Number(e.dataTransfer.getData("application/task-index"));
        const toIdx = Array.from(taskListEl.children).indexOf(clone);
        if (fromIdx !== toIdx) {
          TaskManager.reorderTasks(fromIdx, toIdx);
          renderTaskList(currentFilter);
        }
      });

      return clone;
    };

    // Start inline editing of a task element
    const startEditing = (liEl, task) => {
      const textSpan = liEl.querySelector(".task-text");
      const currentText = task.text;
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentText;
      input.className = "edit-input";
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          commitEdit();
        } else if (e.key === "Escape") {
          cancelEdit();
        }
      });
      input.addEventListener("blur", commitEdit);

      const commitEdit = () => {
        const newVal = input.value.trim();
        if (newVal && newVal !== currentText) {
          TaskManager.editTask(task.id, newVal);
        }
        finish();
      };

      const cancelEdit = () => {
        finish();
      };

      const finish = () => {
        liEl.replaceChild(textSpan, input);
        renderTaskList(currentFilter);
      };

      liEl.replaceChild(input, textSpan);
      input.focus();
      // Place cursor at end
      input.setSelectionRange(input.value.length, input.value.length);
    };

    // Render task list based on filter
    const renderTaskList = (filter = "all") => {
      currentFilter = filter; // keep global reference for other calls
      // Clear existing list
      taskListEl.innerHTML = "";
      const tasks = TaskManager.getFilteredTasks(filter);
      const fragment = document.createDocumentFragment();
      tasks.forEach((task) => {
        const li = createTaskElement(task);
        fragment.appendChild(li);
      });
      taskListEl.appendChild(fragment);
    };

    // Expose render function for external use
    return { renderTaskList, createTaskElement };
  })();

  // ---------- Theme Management ----------
  const Theme = (() => {
    const STORAGE_KEY = "vividtodo-theme";
    const selector = document.getElementById("theme-selector");
    const applyTheme = (theme) => {
      document.body.classList.remove("light", "dark");
      if (theme === "light" || theme === "dark") {
        document.body.classList.add(theme);
      } else if (theme === "system") {
        // system: rely on prefers-color-scheme media query via CSS, no class needed
      }
      localStorage.setItem(STORAGE_KEY, theme);
    };

    const loadTheme = () => {
      const saved = localStorage.getItem(STORAGE_KEY) || "light";
      selector.value = saved;
      applyTheme(saved);
    };

    selector.addEventListener("change", () => {
      applyTheme(selector.value);
    });

    return { loadTheme, applyTheme };
  })();

  // ---------- Global State ----------
  let currentFilter = "all";

  // ---------- Event Listeners for Controls ----------
  const initEventListeners = () => {
    // Form submit – add new task
    const form = document.getElementById("new-task-form");
    const input = document.getElementById("new-task-input");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        TaskManager.addTask(text);
        input.value = "";
        UI.renderTaskList(currentFilter);
      }
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Update aria-pressed
        filterButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        const filter = btn.dataset.filter;
        UI.renderTaskList(filter);
      });
    });

    // Keyboard shortcuts – delegated to document
    document.addEventListener("keydown", (e) => {
      // Enter on #new-task-input is already handled by form submit.
      if (e.key === "Escape") {
        // Cancel any inline edit if an edit input is focused
        const editInput = document.querySelector(".edit-input");
        if (editInput) {
          editInput.blur(); // triggers cancel via blur handler
        }
      }

      if (e.ctrlKey && e.key === "Enter") {
        // Toggle completion of the currently focused task item
        const activeEl = document.activeElement;
        const li = activeEl.closest("li[data-id]");
        if (li) {
          const id = li.dataset.id;
          TaskManager.toggleTask(id);
          UI.renderTaskList(currentFilter);
        }
      }
    });
  };

  // ---------- Initialization ----------
  document.addEventListener("DOMContentLoaded", () => {
    TaskManager.loadFromStorage();
    Theme.loadTheme();
    UI.renderTaskList("all");
    initEventListeners();
  });

  // Expose for testing
  window.VividTodo = {
    Task,
    TaskManager,
    UI,
    Theme,
  };
})();
