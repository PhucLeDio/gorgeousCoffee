// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config').MetroConfig}
 */
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
})

config.resolver.sourceExts.push('mjs')

const proxyWorm = require.resolve('@tamagui/proxy-worm')
const platformWeb = require.resolve('react-native-web/dist/exports/Platform')

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (
      moduleName === 'react-native-maps' ||
      moduleName.startsWith('react-native/Libraries/Renderer/shims/ReactNative') ||
      moduleName.startsWith('react-native/Libraries/Renderer/shims/ReactFabric') ||
      moduleName.startsWith('react-native/Libraries/Utilities/codegenNativeCommands') ||
      moduleName.startsWith('react-native/Libraries/Utilities/codegenNativeComponent')
    ) {
      return {
        filePath: proxyWorm,
        type: 'sourceFile',
      }
    }
    if (moduleName === '../Utilities/Platform' || moduleName === './Platform') {
      return {
        filePath: platformWeb,
        type: 'sourceFile',
      }
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

// Enable Tamagui and add nice web support with optimizing compiler + CSS extraction
const { withTamagui } = require('@tamagui/metro-plugin')
module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
  outputCSS: './tamagui-web.css',
})

// REMOVE THIS (just for tamagui internal devs to work in monorepo):
// if (process.env.IS_TAMAGUI_DEV && __dirname.includes('tamagui')) {
//   const fs = require('fs')
//   const path = require('path')
//   const projectRoot = __dirname
//   const monorepoRoot = path.resolve(projectRoot, '../..')
//   config.watchFolders = [monorepoRoot]
//   config.resolver.nodeModulesPaths = [
//     path.resolve(projectRoot, 'node_modules'),
//     path.resolve(monorepoRoot, 'node_modules'),
//   ]
//   // have to manually de-deupe
//   try {
//     fs.rmSync(path.join(projectRoot, 'node_modules', '@tamagui'), {
//       recursive: true,
//       force: true,
//     })
//   } catch {}
//   try {
//     fs.rmSync(path.join(projectRoot, 'node_modules', 'tamagui'), {
//       recursive: true,
//       force: true,
//     })
//   } catch {}
//   try {
//     fs.rmSync(path.join(projectRoot, 'node_modules', 'react'), {
//       recursive: true,
//       force: true,
//     })
//   } catch {}
//   try {
//     fs.rmSync(path.join(projectRoot, 'node_modules', 'react-dom'), {
//       recursive: true,
//       force: true,
//     })
//   } catch {}
// }
