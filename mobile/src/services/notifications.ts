import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler so alerts display even if app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleDailyRitualAlarms(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) return;

    try {
      // Cancel existing to prevent duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      const alarms = [
        {
          hour: 5,
          minute: 30,
          title: '🌅 Morning Ritual Call',
          body: '5:30 AM: Rise, hydrate with 500ml, pray, and begin your run/movement.',
        },
        {
          hour: 8,
          minute: 30,
          title: '⚡ Deep Work Block 1 (Code Engine)',
          body: '8:30 AM: 90-minute focus on Quant Bot / Paper Thoughts. Lock in.',
        },
        {
          hour: 10,
          minute: 0,
          title: '🛑 90m Hard-Cap Reached!',
          body: '10:00 AM: Step away from the screen. Hydrate, stretch your ankle, and rest.',
        },
        {
          hour: 11,
          minute: 30,
          title: '📐 Deep Work Block 2 (Math Sprint)',
          body: '11:30 AM: MIT OCW Multivariable Calculus sprint. One problem at a time.',
        },
        {
          hour: 14,
          minute: 30,
          title: '🎓 Deep Work Block 3 (Fellowships & Paper)',
          body: '2:30 PM: Daily compounding progress on fellowship applications & paper drafting.',
        },
        {
          hour: 20,
          minute: 15,
          title: '🌙 Evening Sanctuary Time',
          body: '8:15 PM: Pick up the acoustic guitar for 15 minutes of non-screen decompression.',
        },
      ];

      for (const a of alarms) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: a.title,
            body: a.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: a.hour,
            minute: a.minute,
          },
        });
      }

      // Weekly Sunday Body Composition & Ankle Audit at 8:00 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚖️ Sunday Body Audit Reminder',
          body: 'Sabbath morning: measure weekly weight, waist, tummy circumference, and left ankle strain.',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1, // Sunday
          hour: 8,
          minute: 0,
        },
      });
    } catch (e) {
      console.warn('Failed to schedule daily notifications:', e);
    }
  },
};

