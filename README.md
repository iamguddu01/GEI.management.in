Global Educational Institute - Academic Portal (Global Mini)
===========================================================

Stack
-----
- Flask (Python)
- SQLite (file: `college.db`)
- HTML/CSS, minimal JS

Features
--------
- Separate interfaces for Teacher and Student
- Teacher: upload and delete Notes, Syllabus, Notices
- Student: view/download Notes, Syllabus, Notices
- File downloads served from `uploads/`

Setup
-----
1. (Recommended) Create and activate a virtualenv.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database:
   ```bash
   python db_init.py
   ```
4. Run the server:
   ```bash
   export TEACHER_PASSWORD=teacher123  # change for production
   python app.py
   ```
5. Open `http://127.0.0.1:5000`.

Usage
-----
- Student: select Student role on Login (no password).
- Teacher: select Teacher role and enter `TEACHER_PASSWORD`.
- Teacher dashboard: upload files (Notes, Syllabus, Notices) and delete items.
- Student portal: download/view uploaded items.

Branding and Logo
-----------------
- Put your logo file in a `gfd/` folder. The app searches `global mini/gfd/` then project root `gfd/` and serves the first image at `/gfd/logo`.

Generate PPT
------------
```bash
python ppt_generate.py
```
This creates `GEI_Portal_Presentation.pptx`.

Notes
-----
- Demo-only authentication via cookie. Add proper auth for production.
- Files are stored in `uploads/` with sanitized timestamped names.


