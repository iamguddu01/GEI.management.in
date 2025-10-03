(function () {
  const STORAGE_KEY = 'geiData';
  const ROLE_KEY = 'geiRole';            // 'student' | 'teacher' | null
  const TEACHER_PASSCODE = 'teacher123'; // change as needed
  function nowIso() { return new Date().toISOString().slice(0, 19).replace('T', ' '); }
  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { notes: [], syllabus: [], notices: [] };
      const obj = JSON.parse(raw);
      return {
        notes: Array.isArray(obj.notes) ? obj.notes : [],
        syllabus: Array.isArray(obj.syllabus) ? obj.syllabus : [],
        notices: Array.isArray(obj.notices) ? obj.notices : []
      };
    } catch (e) { return { notes: [], syllabus: [], notices: [] }; }
  }
  function setData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  function addItem(kind, item) { const d = getData(); d[kind].unshift(item); setData(d); }
  function removeItem(kind, index) { const d = getData(); d[kind].splice(index, 1); setData(d); }
  function renderList(kind, ul) {
    const d = getData();
    ul.innerHTML = '';
    if (!d[kind].length) {
      const li = document.createElement('li'); li.textContent = 'No items yet.'; ul.appendChild(li); return;
    }
    d[kind].forEach((it, idx) => {
      const li = document.createElement('li');
      const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems = 'center';
      const title = document.createElement('a');
      if (it.url) { title.href = it.url; title.target = '_blank'; title.rel = 'noopener'; title.textContent = it.title; }
      else { title.href = '#'; title.onclick = (e) => e.preventDefault(); title.textContent = it.title + (it.text ? ' — ' + it.text : ''); }
      const meta = document.createElement('span'); meta.className = 'muted'; meta.textContent = ' ' + it.createdAt;
      left.appendChild(title); left.appendChild(meta); li.appendChild(left);
      if (document.documentElement.getAttribute('data-role') === 'teacher') {
        const btn = document.createElement('button'); btn.textContent = 'Delete'; btn.onclick = () => { removeItem(kind, idx); renderAll(); }; li.appendChild(btn);
      }
      ul.appendChild(li);
    });
  }
  function renderAll() {
    const notesUl = document.getElementById('list-notes');
    const sylUl = document.getElementById('list-syllabus');
    const noticeUl = document.getElementById('list-notices');
    if (notesUl) renderList('notes', notesUl);
    if (sylUl) renderList('syllabus', sylUl);
    if (noticeUl) renderList('notices', noticeUl);
  }
  function getRole() {
    return localStorage.getItem(ROLE_KEY);
  }
  function setRole(role) {
    if (role) localStorage.setItem(ROLE_KEY, role); else localStorage.removeItem(ROLE_KEY);
  }
  function updateNavAuth() {
    const login = document.getElementById('nav-login');
    const logout = document.getElementById('nav-logout');
    const r = getRole();
    if (login) login.style.display = r ? 'none' : '';
    if (logout) logout.style.display = r ? '' : 'none';
    if (logout) logout.onclick = (e) => { e.preventDefault(); setRole(null); location.href = 'index.html'; };
  }
  function guardTeacherPage() {
    if (document.documentElement.getAttribute('data-role') === 'teacher') {
      if (getRole() !== 'teacher') {
        alert('Please login as Teacher first.');
        location.href = 'login.html';
      }
    }
  }
  function hookLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const role = document.getElementById('role-select').value;
      const pass = document.getElementById('teacher-passcode').value;
      if (role === 'teacher') {
        if (pass !== TEACHER_PASSCODE) { alert('Invalid passcode'); return; }
      }
      setRole(role);
      location.href = role === 'teacher' ? 'teacher.html' : 'student.html';
    });
  }
  function hookTeacherForm() {
    const form = document.getElementById('add-form'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const kind = document.getElementById('input-kind').value;
      const title = document.getElementById('input-title').value.trim();
      const url = document.getElementById('input-url').value.trim();
      const text = document.getElementById('input-text').value.trim();
      if (!title) return;
      addItem(kind, { title, url: url || null, text: text || null, createdAt: nowIso() });
      form.reset(); renderAll();
    });
    const btnExport = document.getElementById('btn-export');
    const inputImport = document.getElementById('input-import');
    const btnClear = document.getElementById('btn-clear');
    if (btnExport) {
      btnExport.onclick = () => {
        const blob = new Blob([JSON.stringify(getData(), null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gei_data.json'; a.click(); URL.revokeObjectURL(a.href);
      };
    }
    if (inputImport) {
      inputImport.onchange = async () => {
        const f = inputImport.files && inputImport.files[0]; if (!f) return;
        const txt = await f.text();
        try {
          const obj = JSON.parse(txt);
          setData({
            notes: Array.isArray(obj.notes) ? obj.notes : [],
            syllabus: Array.isArray(obj.syllabus) ? obj.syllabus : [],
            notices: Array.isArray(obj.notices) ? obj.notices : []
          });
          renderAll();
        } catch (e) { alert('Invalid JSON'); }
        inputImport.value = '';
      };
    }
    if (btnClear) {
      btnClear.onclick = () => { if (confirm('Clear all data?')) { setData({ notes: [], syllabus: [], notices: [] }); renderAll(); } };
    }
  }
  document.addEventListener('DOMContentLoaded', function () { renderAll(); hookTeacherForm(); });
  document.addEventListener('DOMContentLoaded', function () {
    updateNavAuth();
    guardTeacherPage();
    hookLoginForm();
  });
})();


