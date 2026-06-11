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

export const savePhoto = async (base64Data, caption) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const photo = { data: base64Data, caption, date: Date.now() };
    const request = store.add(photo);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getPhotos = async () => {
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
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Moods
export const saveMood = async (dateStr, mood) => {
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
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('moods', 'readonly');
    const store = tx.objectStore('moods');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Capsules
export const saveCapsule = async (capsule) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('capsules', 'readwrite');
    const store = tx.objectStore('capsules');
    // capsule should have: { id, title, message, unlockDate, createdAt }
    const request = store.put(capsule);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCapsules = async () => {
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
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('capsules', 'readwrite');
    const store = tx.objectStore('capsules');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
