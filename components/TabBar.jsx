import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

export default function TabBar({ state, descriptors, navigation }) {
    const primaryColor = '#0891b2';
    const greyColor = '#737373';

    const icons = {
        index: (props, index) => <AntDesign name='home' size={26} color={greyColor} {...props} />,
        map: (props, index) => <Feather name="map" size={24} color="black" {...props} />,
        camera: (props, index) => <AntDesign name='camerao' size={26} color={greyColor} {...props} />,
        history: (props, index) => <Feather name='globe' size={26} color={greyColor} {...props} />,
        profile: (props, index) => <AntDesign name='user' size={26} color={greyColor} {...props} />
    }

    return (
        <View style={styles.tabbar}>
        {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
            options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            if (['_sitemap', '+not-found'].includes(route.name)) return null;

            const isFocused = state.index === index;

            const onPress = () => {
            const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
            }
            };

            const onLongPress = () => {
            navigation.emit({
                type: 'tabLongPress',
                target: route.key,
            });
            };

            return (
            <TouchableOpacity
                key={index}
                style={styles.tabbarItem}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                {
                    icons[route.name]?.({
                        color: isFocused ? primaryColor : greyColor
                    })
                }
                <Text style={{ color: isFocused ? primaryColor : greyColor, fontSize: 12 }}>
                    {label}
                </Text>
            </TouchableOpacity>
            );
        })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute', 
        bottom: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderCurve: 'continuous',
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 10},
        shadowRadius: 10,
        shadowOpacity: 0.1
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    }
})