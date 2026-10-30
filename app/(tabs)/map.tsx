import { View, StyleSheet } from 'react-native'
import { Text } from 'tamagui'
import React, { useCallback, useState } from 'react';
import MapView, { Marker } from 'react-native-maps'
import { useFocusEffect, useRouter } from 'expo-router';
import { listScans } from 'utils/ktcfs/api';
import { getUser } from 'utils/ktcfs/session';
import { LABEL_COLORS, displayName } from 'utils/ktcfs/display';
import type { Garden, Scan } from 'utils/ktcfs/types';

// Xã Đăk Mar, dùng khi tài khoản chưa có vườn
const DEFAULT_REGION = {
  latitude: 14.5649,
  longitude: 107.9234,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Vườn của người dùng và các lần chụp ra bệnh của họ.
export default function Map() {
  const router = useRouter();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const user = await getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        setGardens(user.gardens ?? []);
        try {
          const page = await listScans(100);
          setScans(page.items.filter((scan) => scan.result.is_disease || scan.result.top2));
        } catch (error) {
          console.error('Error fetching scans: ', error);
        }
      })();
    }, [router])
  );

  const firstCenter = gardens.find((garden) => garden.center)?.center;
  const region = firstCenter
    ? { ...DEFAULT_REGION, latitude: firstCenter.lat, longitude: firstCenter.lon, latitudeDelta: 0.03, longitudeDelta: 0.03 }
    : DEFAULT_REGION;
  const shownLabels = [...new Set(scans.map((scan) => scan.result.label))];

  return (
    <View style={styles.container}>
      <MapView
        key={firstCenter ? 'garden' : 'default'}
        style={styles.map}
        initialRegion={region}
        mapType="hybrid"
      >
        {gardens.map((garden) =>
          garden.center ? (
            <Marker
              key={garden.polygon_id}
              coordinate={{ latitude: garden.center.lat, longitude: garden.center.lon }}
              title={`Vườn ${garden.polygon_id}`}
              description={`${garden.commune_name} · ${garden.area_ha} ha`}
              pinColor="green"
            />
          ) : null
        )}
        {scans.map((scan) => (
          <Marker
            key={scan.scan_id}
            coordinate={{ latitude: scan.location.lat, longitude: scan.location.lon }}
            title={scan.result.top2 ? 'Chưa chắc chắn' : displayName(scan.result)}
            onCalloutPress={() =>
              router.push({ pathname: '/result', params: { scan_id: scan.scan_id } })
            }
          >
            <View
              style={[styles.scanDot, { backgroundColor: LABEL_COLORS[scan.result.label] }]}
            />
          </Marker>
        ))}
      </MapView>
      {shownLabels.length > 0 && (
        <View style={styles.overlay}>
          {shownLabels.map((label) => {
            const sample = scans.find((scan) => scan.result.label === label)!.result;
            return (
              <View style={styles.labelItem} key={label}>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: LABEL_COLORS[label],
                    marginRight: 5,
                  }}
                />
                <Text style={styles.labelText}>{displayName(sample)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  scanDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 5,
    padding: 10,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  labelText: {
    fontSize: 16,
    color: 'black',
  },
});
