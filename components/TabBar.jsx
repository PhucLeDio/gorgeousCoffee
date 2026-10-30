import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, TAB_BAR_HEIGHT } from 'constants/theme';

// Thanh tab cố định ở đáy: biểu tượng to, chữ tiếng Việt, nút "Chụp lá" nổi bật ở giữa.
const TABS = {
    index: { label: 'Trang chủ', icon: 'home', iconOutline: 'home-outline' },
    map: { label: 'Bản đồ', icon: 'map', iconOutline: 'map-outline' },
    camera: { label: 'Chụp lá', icon: 'camera', iconOutline: 'camera' },
    history: { label: 'Lịch sử', icon: 'time', iconOutline: 'time-outline' },
    profile: { label: 'Tài khoản', icon: 'person', iconOutline: 'person-outline' },
}

// Expo Router (SDK 58) truyền emitter/navigateToTab cho tabBar thay cho navigation
export default function TabBar({ state, emitter, navigateToTab, insets }) {
    return (
        <View style={[styles.tabbar, { paddingBottom: Math.max(insets?.bottom ?? 0, 8) }]}>
        {state.routes.map((route, index) => {
            const tab = TABS[route.name];
            if (!tab) return null;

            const isFocused = state.index === index;
            const isCamera = route.name === 'camera';

            const onPress = () => {
            const event = emitter.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigateToTab(route.key);
            }
            };

            const color = isFocused ? colors.primaryDark : colors.textMuted;

            return (
            <Pressable
                key={route.key}
                style={styles.tabbarItem}
                accessibilityRole="tab"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={tab.label}
                onPress={onPress}
            >
                {isCamera ? (
                    <View style={styles.cameraButton}>
                        <Ionicons name="camera" size={32} color="#fff" />
                    </View>
                ) : (
                    <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                        <Ionicons name={isFocused ? tab.icon : tab.iconOutline} size={28} color={color} />
                    </View>
                )}
                <Text
                    numberOfLines={1}
                    style={[styles.label, { color: isCamera ? colors.primaryDark : color }, (isFocused || isCamera) && styles.labelActive]}
                >
                    {tab.label}
                </Text>
            </Pressable>
            );
        })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabbar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        minHeight: TAB_BAR_HEIGHT,
        paddingTop: 6,
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 2,
        minHeight: 64,
    },
    iconWrap: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 16,
    },
    iconWrapActive: {
        backgroundColor: colors.primarySoft,
    },
    cameraButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -22,
        borderWidth: 4,
        borderColor: colors.surface,
    },
    label: {
        fontSize: 14,
    },
    labelActive: {
        fontWeight: 'bold',
    },
})
