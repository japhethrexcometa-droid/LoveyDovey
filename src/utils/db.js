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
export const savePhoto = async (file, base64Data, caption, dateOverride = null) => {
  const id = Date.now().toString();
  const timestamp = dateOverride ? new Date(dateOverride).getTime() : Date.now();
  let imageUrl = base64Data;

  // Sync to Supabase
  if (supabase && file) {
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Supabase Storage error:", uploadError);
    } else {
      // 2. Get Public URL
      const { data: urlData } = supabase.storage.from('memories').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // 3. Save to DB
    const { error: dbError } = await supabase.from('photos').insert([{ 
      id, 
      data: imageUrl, 
      caption, 
      date: timestamp 
    }]);
    
    if (dbError) console.error("Supabase DB error:", dbError);
  }

  // Save to IndexedDB
  const photo = { id, data: imageUrl, caption, date: timestamp };
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
    // 1. Fetch the photo to get its image URL so we know the filename
    const { data: photoData } = await supabase.from('photos').select('data').eq('id', id).single();
    
    // 2. Delete from the photos table
    await supabase.from('photos').delete().eq('id', id);

    // 3. Delete the actual image file from the storage bucket to free up space
    if (photoData && photoData.data) {
      const url = photoData.data;
      if (url.includes('/memories/')) {
        const fileName = url.split('/memories/').pop();
        if (fileName) {
          await supabase.storage.from('memories').remove([fileName]);
        }
      }
    }
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
export const saveMood = async (dateStr, moodObj, role) => {
  let mergedMoods = {};

  if (supabase) {
    const { data } = await supabase.from('moods').select('mood').eq('date', dateStr).single();
    if (data && data.mood) {
      if (data.mood.emoji) mergedMoods = { legacy: data.mood };
      else mergedMoods = data.mood;
    }
    mergedMoods[role] = moodObj;
    
    const { error } = await supabase.from('moods').upsert([{ date: dateStr, mood: mergedMoods }]);
    if (error) console.error("Supabase error:", error);
  } else {
    mergedMoods[role] = moodObj; // Fallback if no supabase
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('moods', 'readwrite');
    const store = tx.objectStore('moods');
    const getReq = store.get(dateStr);
    
    getReq.onsuccess = () => {
      let idbMoods = {};
      if (getReq.result && getReq.result.mood) {
        if (getReq.result.mood.emoji) idbMoods = { legacy: getReq.result.mood };
        else idbMoods = getReq.result.mood;
      }
      idbMoods[role] = moodObj;
      const putReq = store.put({ date: dateStr, mood: idbMoods });
      putReq.onsuccess = () => resolve(idbMoods);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
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

// -- FARM LOGS --
export const saveFarmLog = async (dateStr, text) => {
  if (supabase) {
    const id = dateStr;
    const { error } = await supabase.from('farm_logs').upsert([{ id, date: dateStr, log_text: text }]);
    if (error) console.error("Supabase Farm Log error:", error);
  }

  // Backup to localStorage
  localStorage.setItem('ojtFarmLog', text);
};

export const getFarmLog = async (dateStr) => {
  if (supabase) {
    const { data, error } = await supabase.from('farm_logs').select('log_text').eq('date', dateStr).single();
    if (!error && data) return data.log_text;
  }
  return localStorage.getItem('ojtFarmLog') || '';
};
