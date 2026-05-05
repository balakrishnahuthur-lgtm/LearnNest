import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'schedule-return-notification') return;

  const delaySeconds = Number(event.data.delay) || 10;
  const title = event.data.title || 'Reminder';
  const body = event.data.body || '';

  const notify = () => {
    return self.registration.showNotification(title, {
      body,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: 'return-reminder'
    });
  };

  if (event.source && event.source.postMessage) {
    event.source.postMessage({
      type: 'schedule-return-notification-ack',
      delay: delaySeconds
    });
  }

  event.waitUntil(
    new Promise((resolve) => {
      setTimeout(() => {
        notify().then(() => {
          if (event.source && event.source.postMessage) {
            event.source.postMessage({ type: 'notification-shown' });
          }
          resolve();
        }).catch((error) => {
          if (event.source && event.source.postMessage) {
            event.source.postMessage({ type: 'notification-error', error: error.message });
          }
          resolve();
        });
      }, delaySeconds * 1000);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        const client = clients[0];
        client.focus();
        if (typeof client.navigate === 'function') {
          client.navigate('/roadmap?returnReminder=true');
        }
        client.postMessage({ type: 'return-reminder-clicked' });
        return;
      }
      return self.clients.openWindow('/roadmap?returnReminder=true');
    })
  );
});
