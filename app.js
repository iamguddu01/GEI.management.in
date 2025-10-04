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
      if (it.url) { 
        // Check if it's a base64 file or regular URL
        if (it.url.startsWith('data:')) {
          // It's a base64 file - make it downloadable
          title.href = it.url; 
          title.download = it.title;
          title.textContent = it.title;
        } else {
          // It's a regular URL
          title.href = it.url; 
          title.target = '_blank'; 
          title.rel = 'noopener'; 
          title.textContent = it.title;
        }
      } else { 
        title.href = '#'; 
        title.onclick = (e) => e.preventDefault(); 
        title.textContent = it.title + (it.text ? ' — ' + it.text : ''); 
      }
      const meta = document.createElement('span'); 
      meta.className = 'muted'; 
      let metaText = ' ' + it.createdAt;
      if (it.fileType) {
        metaText += ` • ${it.fileType}`;
      }
      if (it.fileSize) {
        const sizeKB = Math.round(it.fileSize / 1024);
        metaText += ` • ${sizeKB}KB`;
      }
      meta.textContent = metaText;
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
    const inputUploadNotes = document.getElementById('input-upload-notes');
    const inputUploadSyllabus = document.getElementById('input-upload-syllabus');
    const btnClear = document.getElementById('btn-clear');
    
    // Function to handle file uploads
    const handleFileUpload = async (files, category) => {
      if (!files || files.length === 0) return;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        
        // Convert file to base64 for storage
        const fileContent = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        
        // Add the uploaded file to the specified category
        addItem(category, { 
          title: fileName, 
          url: fileContent, // Store base64 data instead of blob URL
          text: `Uploaded file: ${fileName}`, 
          createdAt: nowIso(),
          fileType: file.type,
          fileSize: file.size
        });
      }
      
      renderAll();
    };
    
    if (inputUploadNotes) {
      inputUploadNotes.onchange = async () => {
        await handleFileUpload(inputUploadNotes.files, 'notes');
        inputUploadNotes.value = '';
      };
    }
    
    if (inputUploadSyllabus) {
      inputUploadSyllabus.onchange = async () => {
        await handleFileUpload(inputUploadSyllabus.files, 'syllabus');
        inputUploadSyllabus.value = '';
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


