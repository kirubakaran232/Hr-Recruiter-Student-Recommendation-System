import api from './api';

export async function fetchNotifications() {
  const { data } = await api.get('/hr/notifications');
  return data; // { success, unreadCount, notifications }
}

export async function markNotificationAsRead(id) {
  const { data } = await api.patch(`/hr/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.patch('/hr/notifications/read-all');
  return data;
}

export async function clearNotifications() {
  const { data } = await api.delete('/hr/notifications');
  return data;
}
