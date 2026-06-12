import type { Hole, Comment, FilterType, PaginationParams, PaginatedResult, ReportType, Draft, EmotionType, PublishMode, VisibleDuration } from '@/types';
import { mockHoles, generateMockHoles } from '@/data/mockHoles';
import { generateMockComments } from '@/data/mockComments';
import { mockDrafts } from '@/data/mockUser';
import storage from '@/utils/storage';
import { getExpireTime, generateTimeId } from '@/utils/time';
import { getRandomAvatar, getAnonymousName } from '@/utils/emotion';

let initialized = false;

function getPublishedHoles(): Hole[] {
  return storage.get<Hole[]>(storage.keys.PUBLISHED_HOLES, []);
}

function setPublishedHoles(holes: Hole[]): void {
  storage.set(storage.keys.PUBLISHED_HOLES, holes);
}

function getDeletedHoleIds(): string[] {
  return storage.get<string[]>(storage.keys.DELETED_HOLES, []);
}

function addDeletedHoleId(id: string): void {
  storage.addToSet(storage.keys.DELETED_HOLES, id);
}

function getHoleComments(holeId: string): Comment[] {
  const allComments = storage.get<Record<string, Comment[]>>(storage.keys.HOLE_COMMENTS, {});
  return allComments[holeId] || [];
}

function setHoleComments(holeId: string, comments: Comment[]): void {
  const allComments = storage.get<Record<string, Comment[]>>(storage.keys.HOLE_COMMENTS, {});
  allComments[holeId] = comments;
  storage.set(storage.keys.HOLE_COMMENTS, allComments);
}

export function initMockData(): void {
  if (initialized) return;
  initialized = true;

  const published = getPublishedHoles();
  const deleted = getDeletedHoleIds();

  published.forEach(hole => {
    const exists = mockHoles.find(h => h.id === hole.id);
    if (!exists) {
      mockHoles.unshift(hole);
    } else {
      const idx = mockHoles.findIndex(h => h.id === hole.id);
      mockHoles[idx] = { ...exists, ...hole };
    }
  });

  for (let i = mockHoles.length - 1; i >= 0; i--) {
    if (deleted.includes(mockHoles[i].id)) {
      mockHoles.splice(i, 1);
    }
  }

  console.log('[HoleService] 数据初始化完成，mockHoles数量:', mockHoles.length);
}

export function ensureInitialized(): void {
  if (!initialized) {
    initMockData();
  }
}

function getAllActiveHoles(): Hole[] {
  ensureInitialized();
  const deleted = getDeletedHoleIds();
  return mockHoles.filter(h => !deleted.includes(h.id));
}

export async function getHoleList(
  filter: FilterType,
  params: PaginationParams
): Promise<PaginatedResult<Hole>> {
  console.log('[HoleService] 获取树洞列表', filter, params);
  ensureInitialized();

  let holes = [...getAllActiveHoles()];

  if (filter === 'nearby') {
    holes = holes.filter(h => h.location);
  } else if (filter === 'similar') {
    const userEmotion: EmotionType = 'sad';
    holes = holes.filter(h => h.emotion === userEmotion);
  }

  const blockedIds = storage.get<string[]>(storage.keys.BLOCKED_HOLES, []);
  const foldedIds = storage.get<string[]>(storage.keys.FOLDED_HOLES, []);
  const likedIds = storage.get<string[]>(storage.keys.LIKED_HOLES, []);
  const huggedIds = storage.get<string[]>(storage.keys.HUGGED_HOLES, []);
  const favoritedIds = storage.get<string[]>(storage.keys.FAVORITED_HOLES, []);

  holes = holes.map(h => ({
    ...h,
    isBlocked: blockedIds.includes(h.id),
    isFolded: foldedIds.includes(h.id),
    isLiked: likedIds.includes(h.id),
    isHugged: huggedIds.includes(h.id),
    isFavorited: favoritedIds.includes(h.id),
  }));

  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const list = holes.slice(start, end);

  return {
    list,
    total: holes.length,
    hasMore: end < holes.length,
  };
}

export async function getHoleDetail(id: string): Promise<Hole | null> {
  console.log('[HoleService] 获取树洞详情', id);
  ensureInitialized();

  const deleted = getDeletedHoleIds();
  if (deleted.includes(id)) return null;

  const hole = getAllActiveHoles().find(h => h.id === id) || null;

  if (hole) {
    const blockedIds = storage.get<string[]>(storage.keys.BLOCKED_HOLES, []);
    const foldedIds = storage.get<string[]>(storage.keys.FOLDED_HOLES, []);
    const likedIds = storage.get<string[]>(storage.keys.LIKED_HOLES, []);
    const huggedIds = storage.get<string[]>(storage.keys.HUGGED_HOLES, []);
    const favoritedIds = storage.get<string[]>(storage.keys.FAVORITED_HOLES, []);

    return {
      ...hole,
      isBlocked: blockedIds.includes(hole.id),
      isFolded: foldedIds.includes(hole.id),
      isLiked: likedIds.includes(hole.id),
      isHugged: huggedIds.includes(hole.id),
      isFavorited: favoritedIds.includes(hole.id),
    };
  }

  return hole;
}

export async function getComments(holeId: string): Promise<Comment[]> {
  console.log('[HoleService] 获取评论列表', holeId);
  
  let comments = getHoleComments(holeId);
  
  if (comments.length === 0) {
    comments = generateMockComments(holeId, 5);
    setHoleComments(holeId, comments);
  }
  
  return comments;
}

function saveHoleToStorage(hole: Hole): void {
  const published = getPublishedHoles();
  const idx = published.findIndex(h => h.id === hole.id);
  if (idx > -1) {
    published[idx] = { ...hole };
  } else {
    published.unshift({ ...hole });
  }
  setPublishedHoles(published);

  const myHoles = storage.get<string[]>(storage.keys.MY_HOLES, []);
  if (!myHoles.includes(hole.id)) {
    myHoles.unshift(hole.id);
    storage.set(storage.keys.MY_HOLES, myHoles);
  }
}

export async function publishHole(params: {
  content: string;
  emotion: EmotionType;
  mode: PublishMode;
  visibleDuration: VisibleDuration;
  anonymousAvatar: string;
  isVoice: boolean;
  voiceUrl?: string;
  voiceDuration?: number;
}): Promise<Hole> {
  console.log('[HoleService] 发布树洞', params);
  ensureInitialized();

  const avatar = getRandomAvatar();
  const newHole: Hole = {
    id: `hole_${generateTimeId()}`,
    content: params.content,
    emotion: params.emotion,
    mode: params.mode,
    visibleDuration: params.visibleDuration,
    anonymousAvatar: params.anonymousAvatar || avatar.id,
    anonymousName: getAnonymousName(),
    isVoice: params.isVoice,
    voiceUrl: params.voiceUrl,
    voiceDuration: params.voiceDuration,
    createdAt: new Date().toISOString(),
    expiresAt: getExpireTime(params.visibleDuration),
    likes: 0,
    hugs: 0,
    comments: 0,
    favorites: 0,
    isLiked: false,
    isHugged: false,
    isFavorited: false,
    isFolded: false,
    isBlocked: false,
  };

  mockHoles.unshift(newHole);
  saveHoleToStorage(newHole);
  setHoleComments(newHole.id, []);

  return newHole;
}

export async function likeHole(id: string): Promise<boolean> {
  console.log('[HoleService] 点赞树洞', id);
  ensureInitialized();
  const hole = mockHoles.find(h => h.id === id);
  if (hole) {
    const isLiked = storage.isInSet(storage.keys.LIKED_HOLES, id);
    if (isLiked) {
      storage.removeFromSet(storage.keys.LIKED_HOLES, id);
      hole.likes = Math.max(0, hole.likes - 1);
    } else {
      storage.addToSet(storage.keys.LIKED_HOLES, id);
      hole.likes += 1;
    }
    saveHoleToStorage(hole);
    return !isLiked;
  }
  return false;
}

export async function hugHole(id: string): Promise<boolean> {
  console.log('[HoleService] 拥抱树洞', id);
  ensureInitialized();
  const hole = mockHoles.find(h => h.id === id);
  if (hole) {
    const isHugged = storage.isInSet(storage.keys.HUGGED_HOLES, id);
    if (isHugged) {
      storage.removeFromSet(storage.keys.HUGGED_HOLES, id);
      hole.hugs = Math.max(0, hole.hugs - 1);
    } else {
      storage.addToSet(storage.keys.HUGGED_HOLES, id);
      hole.hugs += 1;
    }
    saveHoleToStorage(hole);
    return !isHugged;
  }
  return false;
}

export async function favoriteHole(id: string): Promise<boolean> {
  console.log('[HoleService] 收藏树洞', id);
  ensureInitialized();
  const hole = mockHoles.find(h => h.id === id);
  if (hole) {
    const isFavorited = storage.isInSet(storage.keys.FAVORITED_HOLES, id);
    if (isFavorited) {
      storage.removeFromSet(storage.keys.FAVORITED_HOLES, id);
      hole.favorites = Math.max(0, hole.favorites - 1);
    } else {
      storage.addToSet(storage.keys.FAVORITED_HOLES, id);
      hole.favorites += 1;
    }
    saveHoleToStorage(hole);
    return !isFavorited;
  }
  return false;
}

export async function foldHole(id: string): Promise<void> {
  console.log('[HoleService] 折叠树洞', id);
  storage.addToSet(storage.keys.FOLDED_HOLES, id);
}

export async function blockHole(id: string): Promise<void> {
  console.log('[HoleService] 屏蔽树洞', id);
  storage.addToSet(storage.keys.BLOCKED_HOLES, id);
}

export async function reportContent(params: {
  targetId: string;
  targetType: 'hole' | 'comment';
  reportType: ReportType;
  reason: string;
}): Promise<boolean> {
  console.log('[HoleService] 举报内容', params);
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 500);
  });
}

export async function addComment(params: {
  holeId: string;
  content: string;
}): Promise<Comment> {
  console.log('[HoleService] 添加评论', params);
  ensureInitialized();
  const avatar = getRandomAvatar();
  const newComment: Comment = {
    id: `comment_${params.holeId}_${generateTimeId()}`,
    holeId: params.holeId,
    content: params.content,
    anonymousAvatar: avatar.id,
    anonymousName: getAnonymousName(),
    createdAt: new Date().toISOString(),
    likes: 0,
    isLiked: false,
    isAuthor: true,
  };

  const comments = getHoleComments(params.holeId);
  comments.unshift(newComment);
  setHoleComments(params.holeId, comments);

  const hole = mockHoles.find(h => h.id === params.holeId);
  if (hole) {
    hole.comments += 1;
    saveHoleToStorage(hole);
  }

  return newComment;
}

export async function getDrafts(): Promise<Draft[]> {
  console.log('[HoleService] 获取草稿列表');
  return storage.get<Draft[]>(storage.keys.DRAFTS, mockDrafts);
}

export async function saveDraft(draft: Draft): Promise<void> {
  console.log('[HoleService] 保存草稿', draft);
  const drafts = storage.get<Draft[]>(storage.keys.DRAFTS, mockDrafts);
  const index = drafts.findIndex(d => d.id === draft.id);
  if (index > -1) {
    drafts[index] = draft;
  } else {
    drafts.unshift(draft);
  }
  storage.set(storage.keys.DRAFTS, drafts);
}

export async function deleteDraft(id: string): Promise<void> {
  console.log('[HoleService] 删除草稿', id);
  const drafts = storage.get<Draft[]>(storage.keys.DRAFTS, mockDrafts);
  const filtered = drafts.filter(d => d.id !== id);
  storage.set(storage.keys.DRAFTS, filtered);
}

export async function getHistoryHoles(): Promise<Hole[]> {
  console.log('[HoleService] 获取历史树洞');
  ensureInitialized();

  const myHoleIds = storage.get<string[]>(storage.keys.MY_HOLES, []);
  const deleted = getDeletedHoleIds();

  const myHoles = myHoleIds
    .filter(id => !deleted.includes(id))
    .map(id => mockHoles.find(h => h.id === id))
    .filter((h): h is Hole => h !== undefined);

  if (myHoles.length === 0) {
    const existingFirst = getAllActiveHoles()[0];
    if (existingFirst) {
      const myHolesList = storage.get<string[]>(storage.keys.MY_HOLES, []);
      if (!myHolesList.includes(existingFirst.id)) {
        myHolesList.unshift(existingFirst.id);
        storage.set(storage.keys.MY_HOLES, myHolesList);
      }
      myHoles.push(existingFirst);
      saveHoleToStorage(existingFirst);
    }
  }

  const likedIds = storage.get<string[]>(storage.keys.LIKED_HOLES, []);
  const huggedIds = storage.get<string[]>(storage.keys.HUGGED_HOLES, []);
  const favoritedIds = storage.get<string[]>(storage.keys.FAVORITED_HOLES, []);

  return myHoles.map(h => ({
    ...h,
    isLiked: likedIds.includes(h.id),
    isHugged: huggedIds.includes(h.id),
    isFavorited: favoritedIds.includes(h.id),
    isFolded: false,
    isBlocked: false,
  }));
}

export async function deleteHole(id: string): Promise<void> {
  console.log('[HoleService] 删除树洞', id);
  ensureInitialized();

  const index = mockHoles.findIndex(h => h.id === id);
  if (index > -1) {
    mockHoles.splice(index, 1);
  }

  addDeletedHoleId(id);

  const published = getPublishedHoles();
  const filtered = published.filter(h => h.id !== id);
  setPublishedHoles(filtered);

  const myHoles = storage.get<string[]>(storage.keys.MY_HOLES, []);
  const filteredMy = myHoles.filter(hid => hid !== id);
  storage.set(storage.keys.MY_HOLES, filteredMy);
}

export default {
  getHoleList,
  getHoleDetail,
  getComments,
  publishHole,
  likeHole,
  hugHole,
  favoriteHole,
  foldHole,
  blockHole,
  reportContent,
  addComment,
  getDrafts,
  saveDraft,
  deleteDraft,
  getHistoryHoles,
  deleteHole,
  initMockData,
  ensureInitialized,
};
