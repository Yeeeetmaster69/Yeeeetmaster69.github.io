
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { haversine } from '../utils/geo';

const TASK = 'location-updates';

let meterTotal = 0;
let prev: {lat:number; lng:number} | null = null;

TaskManager.defineTask(TASK, ({ data, error }) => {
  if (error) return;
  // @ts-ignore
  const { locations } = data;
  for (const loc of locations) {
    const { latitude, longitude } = loc.coords;
    if (prev) meterTotal += haversine(prev.lat, prev.lng, latitude, longitude);
    prev = { lat: latitude, lng: longitude };
  }
});

export async function startLocation(){
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('location permission denied');
  await Location.startLocationUpdatesAsync(TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 5,
    foregroundService: { notificationTitle: 'Handyman Pro', notificationBody: 'Tracking distance for job' },
    showsBackgroundLocationIndicator: true
  });
  meterTotal = 0; prev = null;
}

export async function stopLocation(){ 
  const is = await Location.hasStartedLocationUpdatesAsync(TASK);
  if (is) await Location.stopLocationUpdatesAsync(TASK); 
  return meterTotal;
}
