import '../tamagui-web.css'

import { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { DefaultTheme, ThemeProvider } from 'expo-router/react-navigation'
import { colors, font } from 'constants/theme'
import { useFonts } from 'expo-font'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from './Provider'
import { useTheme } from 'tamagui'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    // Tải sẵn font biểu tượng để icon không bị trống lúc mới mở
    ...Ionicons.font,
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  )
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>
}

// Luôn dùng giao diện sáng, tương phản cao, tiêu đề tiếng Việt chữ to
function RootLayoutNav() {
  const theme = useTheme()
  return (
    <ThemeProvider value={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background } }}>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: font.title, fontWeight: 'bold' },
          headerBackTitle: 'Quay lại',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="result" options={{ title: 'Kết quả kiểm tra' }} />
        <Stack.Screen name="diseases" options={{ title: 'Tra cứu bệnh' }} />
        <Stack.Screen name="fullText" options={{ title: '' }} />
        <Stack.Screen name="information" options={{ title: 'Thông tin cá nhân' }} />

        <Stack.Screen
          name="modal"
          options={{
            title: 'Tamagui + Expo',
            presentation: 'modal',
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: {
              backgroundColor: theme.background.val,
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
