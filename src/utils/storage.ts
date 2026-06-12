import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  DRAFTS: 'drafts',
  MY_HOLES: 'my_holes',
  HOLE_COMMENTS: 'hole_comments',
  BLOCKED_HOLES: 'blocked_holes',
  FOLDED_HOLES: 'folded_holes',
  LIKED_HOLES: 'liked_holes',
  HUGGED_HOLES: 'hugged_holes',
  FAVORITED_HOLES: 'favorited_holes',
};

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const value = Taro.getStorageSync(key);
    return value !== '' ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('[Storage] Get error:', key, error);
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value));
  } catch (error) {
    console.error('[Storage] Set error:', key, error);
  }
}

export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key);
  } catch (error) {
    console.error('[Storage] Remove error:', key, error);
  }
}

export function addToSet(key: string, id: string): void {
  const set = getStorage<string[]>(key, []);
  if (!set.includes(id)) {
    set.push(id);
    setStorage(key, set);
  }
}

export function removeFromSet(key: string, id: string): void {
  const set = getStorage<string[]>(key, []);
  const index = set.indexOf(id);
  if (index > -1) {
    set.splice(index, 1);
    setStorage(key, set);
  }
}

export function isInSet(key: string, id: string): boolean {
  const set = getStorage<string[]>(key, []);
  return set.includes(id);
}

export const storage = {
  keys: STORAGE_KEYS,
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  addToSet,
  removeFromSet,
  isInSet,
};

export default storage;
