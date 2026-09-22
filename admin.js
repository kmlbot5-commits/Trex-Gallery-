import { supabase } from './supabase.js';
import { BUCKET_NAME, ADMIN_UID } from './supabase-config.js';

const login = document.querySelector('#login');
const panel = document.querySelector('#panel');
const loginMsg = document.querySelector('#loginMsg');
const upload = document.querySelector('#upload');
const logout = document.querySelector('#logout');
const file = document.querySelector('#file');
const msg = document.querySelector('#msg');
const list = document.querySelector('#adminList');

function showLogin(message = '') {
  panel.classList.add('hidden');
  loginMsg.textContent = message;
}

function showPanel() {
  panel.classList.remove('hidden');
  loginMsg.textContent = '';
  loadAdminList();
}

async function verifyAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return showLogin('សូម Login ជាមុនសិន។');
  if (user.id !== ADMIN_UID) {
    await supabase.auth.signOut();
    return showLogin('គណនីនេះមិនមែនជា Admin ទេ។');
  }
  showPanel();
}

login.onclick = async () => {
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  if (!email || !password) {
    loginMsg.textContent = 'សូមបញ្ចូល Email និង Password។';
    return;
  }

  login.disabled = true;
  loginMsg.textContent = 'កំពុង Login...';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  login.disabled = false;

  if (error) {
    loginMsg.textContent = 'Login មិនបាន៖ ' + error.message;
    return;
  }
  await verifyAdmin();
};

upload.onclick = async () => {
  const selected = file.files?.[0];
  if (!selected) {
    msg.textContent = 'សូមជ្រើសរូបភាពជាមុនសិន។';
    return;
  }
  if (!selected.type.startsWith('image/')) {
    msg.textContent = 'អាច Upload បានតែឯកសាររូបភាពប៉ុណ្ណោះ។';
    return;
  }

  upload.disabled = true;
  msg.textContent = 'កំពុង Upload...';
  const safeName = selected.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}_${crypto.randomUUID()}_${safeName}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, selected, {
    cacheControl: '3600',
    upsert: false,
    contentType: selected.type
  });

  upload.disabled = false;
  if (error) {
    console.error(error);
    msg.textContent = 'Upload មិនបាន៖ ' + error.message;
    return;
  }

  file.value = '';
  msg.textContent = '✅ Upload បានជោគជ័យ!';
  await loadAdminList();
};

logout.onclick = async () => {
  await supabase.auth.signOut();
  showLogin('បាន Logout។');
};

async function loadAdminList() {
  list.innerHTML = 'កំពុងផ្ទុក...';
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });
  if (error) {
    list.textContent = 'មិនអាចផ្ទុកបញ្ជីបាន៖ ' + error.message;
    return;
  }

  const files = (data || []).filter(item => item.name && item.name !== '.emptyFolderPlaceholder');
  if (!files.length) {
    list.textContent = 'មិនទាន់មានរូបភាព។';
    return;
  }

  list.innerHTML = '';
  for (const item of files) {
    const row = document.createElement('div');
    row.className = 'admin-item';
    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.name);

    const img = document.createElement('img');
    img.src = publicData.publicUrl;
    img.alt = item.name;

    const name = document.createElement('span');
    name.textContent = item.name;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '🗑️ Delete';
    del.onclick = () => deleteImage(item.name, del);

    row.append(img, name, del);
    list.appendChild(row);
  }
}

async function deleteImage(path, button) {
  if (!confirm('លុបរូបភាពនេះមែនទេ?')) return;
  button.disabled = true;
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) {
    alert('Delete មិនបាន៖ ' + error.message);
    button.disabled = false;
    return;
  }
  await loadAdminList();
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) verifyAdmin();
  else showLogin();
});

verifyAdmin();
