import { supabase } from './supabase.js';
import { BUCKET_NAME } from './supabase-config.js';

const gallery = document.querySelector('#gallery');
const empty = document.querySelector('#empty');
const status = document.querySelector('#status');

function setStatus(text) {
  if (status) status.textContent = text;
}

async function loadGallery() {
  gallery.innerHTML = '';
  setStatus('កំពុងផ្ទុករូបភាព...');

  const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  });

  if (error) {
    console.error(error);
    empty.style.display = 'block';
    empty.textContent = 'មិនអាចផ្ទុករូបភាពបាន។ សូមពិនិត្យ Supabase Storage policy។';
    setStatus('');
    return;
  }

  const files = (data || []).filter(item => item.name && item.name !== '.emptyFolderPlaceholder');
  empty.style.display = files.length ? 'none' : 'block';
  setStatus(files.length ? `${files.length} រូបភាព` : '');

  for (const item of files) {
    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.name);
    const card = document.createElement('article');
    card.className = 'gallery-card';

    const img = document.createElement('img');
    img.src = publicData.publicUrl;
    img.alt = item.name;
    img.loading = 'lazy';
    img.onclick = () => window.open(publicData.publicUrl, '_blank');

    const actions = document.createElement('div');
    actions.className = 'image-actions';
    const save = document.createElement('a');
    save.href = publicData.publicUrl;
    save.target = '_blank';
    save.rel = 'noopener';
    save.textContent = '↗ បើក / Save';
    actions.appendChild(save);

    card.append(img, actions);
    gallery.appendChild(card);
  }
}

loadGallery();
