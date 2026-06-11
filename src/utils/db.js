import { supabase } from '../lib/supabaseClient';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OurMemoriesDB', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('moods')) {
        db.createObjectStore('moods', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('capsules')) {
        db.createObjectStore('capsules', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// -- PHOTOS --
export const savePhoto = async (base64Data, caption) => {
  const photo = { data: base64Data, caption, date: Date.now() };

  // Sync to Supabase
  if (supabase) {
    const id = Date.now().toString();
    const { error } = await supabase.from('photos').insert([{ id, ...photo }]);
    if (error) console.error("Supabase error:", error);
  }

  // Save to IndexedDB
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const request = store.add(photo);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getPhotos = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('photos').select('*');
    if (!error && data) return data;
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deletePhoto = async (id) => {
  if (supabase) {
    await supabase.from('photos').delete().eq('id', id);
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// -- MOODS --
export const saveMood = async (dateStr, mood) => {
  if (supabase) {
    const { error } = await supabase.from('moods').upsert([{ date: dateStr, mood }]);
    if (error) console.error("Supabase error:", error);
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('moods', 'readwrite');
    const store = tx.objectStore('moods');
    const request = store.put({ date: dateStr, mood });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getMoods = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('moods').select('*');
    if (!error && data) return data;
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('moods', 'readonly');
    const store = tx.objectStore('moods');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// -- CAPSULES --
export const saveCapsule = async (capsule) => {
  if (supabase) {
    // DB columns snake_case mismatch mapping
    const payload = {
      id: capsule.id,
      title: capsule.title,
      message: capsule.message,
      unlock_date: capsule.unlockDate,
      created_at: capsule.createdAt
    };
    const { error } = await supabase.from('capsules').upsert([payload]);
    if (error) console.error("Supabase error:", error);
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('capsules', 'readwrite');
    const store = tx.objectStore('capsules');
    const request = store.put(capsule);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCapsules = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('capsules').select('*');
    if (!error && data) {
      // Map back snake_case to camelCase
      return data.map(row => ({
        id: row.id,
        title: row.title,
        message: row.message,
        unlockDate: row.unlock_date,
        createdAt: row.created_at
      }));
    }
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('capsules', 'readonly');
    const store = tx.objectStore('capsules');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteCapsule = async (id) => {
  if (supabase) {
    await supabase.from('capsules').delete().eq('id', id);
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('capsules', 'readwrite');
    const store = tx.objectStore('capsules');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
