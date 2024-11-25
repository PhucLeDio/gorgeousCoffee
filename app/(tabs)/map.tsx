import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { Paragraph, SizableText, Text, XStack, YStack } from 'tamagui'
import React, {useState, useEffect} from 'react';
import MapView,{Circle, Marker, Overlay} from 'react-native-maps'
import { Container } from '@tamagui/lucide-icons';
// import ColorList from '../../components/ColorList';


export default function Map() {

    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any | null>(
      null
    );
    
    const labelColor = {
        // 1 = orange, 2 = yellow, 3 = purple, 4 = red
        // 1 = miner, 2 = rust, 3 = phoma, 4 = cercospora
        "1": "rgb(255, 165, 0)",
        "2": "rgb(255, 255, 0)",
        "3": "rgb(128, 0, 128)",
        "4": "rgb(255, 0, 0)",
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://cfapi.share.zrok.io/histories/map');
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
      }, []);

    return loading ? (
        <View>
        </View>
    ) : (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 16.047079 ,
                    longitude: 108.206230,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                mapType="terrain"
            >
                {data && data.map((item: any) => (
                    <Marker
                    key={item.id}
                    coordinate={{
                        latitude: item.croods.lat,
                        longitude: item.croods.long,
                    }}
                >
                <View
                style={{
                    width: 10, // Kích thước cố định
                    height: 10,
                    backgroundColor: labelColor[item.result.toString()], // Màu sắc
                    borderRadius: 10, // Biến View thành vòng tròn
                    borderWidth: 1,
                    borderColor: 'blue',
                }}
                />
            </Marker>
                ))}
            </MapView>
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
})