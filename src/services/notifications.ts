
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPush(): Promise<string | null>{
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }
  const token = (await Notifications.getExpoPushTokenAsync({ projectId: (Constants.expoConfig?.extra as any)?.eas?.projectId })).data;
  return token;
}
