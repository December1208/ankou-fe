import { v4 as uuidv4 } from 'uuid';

export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
  }
  // 设置 cookie
  document.cookie = `sessionId=${sessionId}; path=/`;
  return sessionId;
}; 