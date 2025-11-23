# Minimal Floor Planner

This is a small, minimal floor planner built with React and Vite. It's focused on functionality: create a floor area, add rooms, drag/drop with grid snapping, save/load plans to localStorage, and print.

This README was updated to reflect recent additions: room resizing, zoom/fit-to-view, grid edge fix (outer lines visible), and a `.gitignore` for typical Node/React projects.

Quick start

1. Install dependencies:

```bash
cd /Users/RahulChaurasia/Documents/DevJs/Floor-planner
npm install
```

2. Run in development:

```bash
npm run dev
```

3. Open the URL printed by Vite (usually http://localhost:5173)

How to use

- Enter `Floor Width` and `Floor Height` in feet.
- Enter `Grid Size` (how many feet per grid cell). For example, `2` means each grid square = 2 ft.
- Create rooms by entering Name, Length and Breadth (feet) and click `Add Room`.
- Drag rooms with the mouse. They snap to the grid and are constrained to the floor bounds.
- Resize a room by dragging the small square handle at the room's bottom-right corner. Resizing snaps to the grid and is constrained to the floor.
- Use the Zoom (-/+) buttons to change the canvas scale. Click `Fit to view` to automatically scale the floor so it fits inside the canvas area without scrolling.
- Save plan to localStorage via `Save Plan`. Use `Load Plan` to open a previously saved plan (prompt-based selector). There is also an autosave for the current session.
- Use `Print` to print the canvas (UI controls are hidden for printing).

Notes on visuals and grid

- The canvas now shows outermost grid lines by rendering a border around the drawing area; this ensures you can see the last row/column of grid squares.
- Each grid cell represents the number of feet you enter as `Grid Size` and the app uses a `pxPerFoot` conversion for visual scaling (default 20 px per foot). You can change `pxPerFoot` in the source if you want a different visual scale.

Saving and storage options

- Current implementation stores an autosave in `localStorage` (`floorplan_autosave`) and manual saves under `saved_floor_plans` (an array of saved plan objects).
- Alternatives if you need more complexity:
  - Export/import JSON files for portability.
  - Use IndexedDB for more robust, larger-plan storage.
  - Add a backend (server + auth) for multi-device sync and collaboration.

Design notes and behavior

- Rooms are rendered as absolute boxes and colored randomly for identification.
- Adjacent rooms that share a wall aligned exactly on the grid will hide the shared border to provide a contiguous appearance.
- Dragging and resizing snap to the configured grid size (grid alignment is preserved).

Limitations & future improvements

- No rotation of rooms yet.
- No automatic overlap prevention: rooms may overlap when resizing or dragging. Adjacency detection hides walls when edges align exactly, but overlapping detection/auto-avoidance is not implemented.
- Current saved-plan loader is prompt-based (index selection). I can replace it with a saved-plans UI panel if you'd like.

Possible next improvements:

- Add overlap prevention (block or push rooms to avoid overlaps).
- Replace prompt-based Save/Load with a saved-plans UI (list with thumbnails, delete, rename).
- Add export/import of JSON plan files.
- Add rotation for rooms.