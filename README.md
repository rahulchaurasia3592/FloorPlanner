# Minimal Floor Planner

This is a small, minimal floor planner built with React and Vite. It's focused on functionality: create a floor area, add rooms, drag/drop with grid snapping, save/load plans to localStorage, and print.

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
- Save plan to localStorage via `Save Plan`. Use `Load Plan` to open a previously saved plan.
- Use `Print` to print the canvas (UI controls are hidden for printing).

Design notes and options for saving complexity

- Current implementation stores autosave in `localStorage` (`floorplan_autosave`) and supports manual saves under `saved_floor_plans`.
- Alternatives:
  - Use IndexedDB for larger plans and structured queries.
  - Add export/import JSON file for portability.
  - Add server-side storage (requires backend + auth) for collaboration and multi-device access.

Limitations & future improvements

- No rotation of rooms.
- No explicit overlap prevention other than floor bounds (dragging will snap to grid; overlapping rooms are allowed but adjacency detection will only hide common walls when edges exactly align).
- Room resizing via UI is not implemented (you can create a new room with desired size).

If you'd like, I can:
- Add room resizing handles.
- Add file import/export for plans.
- Add a list UI for saved plans instead of a prompt-based loader.

Questions I have

- Do you want unit selection other than feet (meters)?
- Would you prefer a smaller or larger `pxPerFoot` for UI scaling? Currently it's 20 px per foot.
