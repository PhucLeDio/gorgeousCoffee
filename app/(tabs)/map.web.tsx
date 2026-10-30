import { StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ui } from 'components/ui'
import { colors, font, space } from 'constants/theme'

// react-native-maps không hỗ trợ web; Expo Router dùng file này thay cho map.tsx trên web.
export default function Map() {
  return (
    <View style={[ui.screen, styles.container]}>
      <Ionicons name="map" size={72} color={colors.primary} />
      <Text style={styles.title}>Bản đồ vườn</Text>
      <Text style={[ui.body, { textAlign: 'center' }]}>
        Bản đồ chỉ có trên ứng dụng điện thoại Android / iOS.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.lg,
  },
  title: {
    fontSize: font.title,
    fontWeight: 'bold',
    color: colors.text,
  },
})
