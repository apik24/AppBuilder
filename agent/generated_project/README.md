# VividTodo

## Project Overview
VividTodo is a lightweight, browser‑based Todo application that showcases modern front‑end development practices while keeping the codebase simple and approachable. The app allows users to create, edit, delete, and organize tasks with a clean, responsive UI. It supports drag‑and‑drop reordering, theme switching, and a set of handy keyboard shortcuts, making task management fast and enjoyable.

## Features
- **Add tasks** – Quickly add a new task via the input field or `Enter` key.
- **Edit tasks** – Click on a task title to edit inline.
- **Delete tasks** – Remove tasks with a single click on the trash icon.
- **Toggle completion** – Mark tasks as completed; completed items are visually distinct.
- **Filter view** – Switch between *All*, *Active*, and *Completed* tasks.
- **Drag‑and‑drop** – Reorder tasks by dragging them to the desired position.
- **Theme switching** – Choose between Light, Dark, and a custom “Vivid” theme.
- **Keyboard shortcuts** –
  - `Enter` – Add a new task when the input is focused.
  - `Esc` – Cancel editing.
  - `Ctrl + D` – Delete the selected task.
  - `Ctrl + ↑/↓` – Move the selected task up or down.
- **Responsive design** – Works on desktop and mobile browsers.
- **Customizable themes** – Add new themes by defining CSS variables.

## Tech Stack
- **HTML5** – Structure of the application (`index.html`).
- **CSS3 (custom properties)** – Styling and theming (`style.css`).
- **Vanilla JavaScript (ES6+)** – Application logic (`app.js`).
- No external libraries or frameworks; the project is pure front‑end code.

## File Structure
```
VividTodo/
├─ index.html      # Main entry point – loads the UI and scripts.
├─ style.css       # Global styles, theme definitions, and layout.
└─ app.js          # Core JavaScript: state management, UI rendering, event handling.
```
- **index.html** – Contains the markup for the task input, task list, filter buttons, and theme selector. It links to `style.css` and `app.js`.
- **style.css** – Defines base styles, dark/light/vivid themes using CSS variables, and the drag‑and‑drop visual cues.
- **app.js** – Implements the Todo model, renders tasks, handles user interactions (clicks, keypresses, drag events), and persists data in `localStorage`.

## Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/VividTodo.git
   cd VividTodo
   ```
2. **Open the app**
   - Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari). No build step or server is required for basic usage.
   - For a smoother development experience (e.g., live reload), you can serve the directory with a local HTTP server (see the Development section).

## Usage
### Adding a Task
- Type a task description into the input field at the top and press **Enter** or click the **Add** button.

### Editing a Task
- Click on the task text. It becomes an editable input field. Press **Enter** to save or **Esc** to cancel.

### Deleting a Task
- Click the trash‑can icon on the right side of a task, or focus the task and press **Ctrl + D**.

### Toggling Completion
- Click the checkbox next to a task, or press **Space** while the task is focused.

### Filtering Tasks
- Use the filter buttons (**All**, **Active**, **Completed**) at the bottom to change the visible list.

### Drag‑and‑Drop Reordering
- Click and hold a task, then drag it to the desired position. Release to drop. The new order is saved automatically.

### Changing Themes
- Click the theme selector (gear icon) and choose **Light**, **Dark**, or **Vivid**. The selection is stored in `localStorage` and persists across sessions.

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Enter` (input focused) | Add new task |
| `Esc` (editing) | Cancel edit |
| `Ctrl + D` (task focused) | Delete task |
| `Ctrl + ↑ / ↓` (task focused) | Move task up/down |
| `Space` (task focused) | Toggle completion |

## Customization
### Adding New Themes
1. Open **style.css**.
2. Define a new set of CSS variables under a selector that matches the theme name, e.g.:
   ```css
   :root[data-theme="my-theme"] {
       --bg-color: #f0f8ff;
       --text-color: #333;
       --accent-color: #ff6f61;
       /* Add any other variables you need */
   }
   ```
3. Add the theme to the theme selector in **index.html** (or dynamically via JavaScript):
   ```html
   <option value="my-theme">My Theme</option>
   ```
4. The app will automatically apply the new theme when selected.

## Development
### Running a Local Server
While you can open `index.html` directly, some browsers enforce stricter security for local files (e.g., `fetch` or `localStorage` quirks). Use a simple server:
```bash
# Python 3
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```
Or with Node.js:
```bash
npx serve .
```
### Linting & Code Style
- The project follows standard **ESLint** rules for JavaScript and **Stylelint** for CSS. If you add new files, run:
```bash
npm run lint   # Assuming the repo provides a lint script
```
- Ensure any new JavaScript follows the existing coding style (arrow functions, const/let, descriptive variable names).

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---
*Happy task managing with VividTodo!*