import axiosInstance from './axiosInstance';

export async function fetchUsers({page = 1, limit = 50} = {}) {
  const res = await axiosInstance.get(`/users?page=${page}&limit=${limit}`);
  return res.data;
}

export async function createConversation({participantIds, isGroup = false, name} = {}) {
  const res = await axiosInstance.post('/chats/conversations', {
    participantIds,
    isGroup,
    name,
  });
  return res.data;
}

export async function fetchConversations({page = 1, limit = 20} = {}) {
  const res = await axiosInstance.get(`/chats/conversations?page=${page}&limit=${limit}`);
  return res.data;
}

export async function fetchMessages({conversationId, limit = 30, before} = {}) {
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (before) query.set('before', before);

  const res = await axiosInstance.get(
    `/chats/conversations/${conversationId}/messages?${query.toString()}`,
  );
  return res.data;
}

export async function sendMessageHttp({conversationId, text} = {}) {
  const res = await axiosInstance.post(`/chats/conversations/${conversationId}/messages`, {
    text,
  });
  return res.data;
}
