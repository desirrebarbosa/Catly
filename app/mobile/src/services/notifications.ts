import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission needed', 'Failed to get push token for push notification!');
      return false;
    }
    return true;
  } else {
    // Alert.alert('Notice', 'Must use physical device for Push Notifications');
    return false;
  }
};

export const scheduleLocalNotification = async (title: string, body: string, hour: number, minute: number, recurrence: string) => {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  const trigger: any = {
    hour,
    minute,
    repeats: recurrence !== 'Once',
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🐱 Catly Reminder: ${title}`,
      body: body,
      sound: true,
    },
    trigger,
  });
};
