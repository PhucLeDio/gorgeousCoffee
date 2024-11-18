import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { CameraCapturedPicture } from 'expo-camera';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';

const PhotoPickerSection = ({
    photo,
    handleRetakePhoto,
    handleUpload,
}: {
    photo: ImagePicker.ImagePickerAsset,
    handleRetakePhoto: () => void,
    handleUpload: (photo: ImagePicker.ImagePickerAsset) => void,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Image
          style={styles.previewContainer}
          source={{uri: `data:${photo.mimeType};base64,${photo.base64}`}}
        />
      </View>

      <View style={styles.redPoint} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
          <EvilIcons name="trash" size={44} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleUpload(photo)}>
            <AntDesign name="check" size={44} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
    },
    box: {
        borderRadius: 15,
        padding: 1,
        width: '95%',
        backgroundColor: 'darkgray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        width: '75%',
        height: '75%',
        borderRadius: 15,
    },
    buttonContainer: {
        gap: 20,
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%'
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15%',
    },
    redPoint: {
      position: 'absolute',
      top: '40%',
      left: '50%',
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'red',
      transform: [{ translateX: -5 }, { translateY: -5 }],
    },
});

export default PhotoPickerSection;
