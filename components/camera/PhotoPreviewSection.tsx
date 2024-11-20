import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { CameraCapturedPicture } from 'expo-camera';
import { router } from 'expo-router';
import Result from 'app/result';

const PhotoPreviewSection = ({
  photo,
  handleRetakePhoto,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [cause, setCause] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [prePhoto, setPrephoto] = useState<string | null>(null);

  const handleCheckPhoto = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any); // Bypass TypeScript type check
      formData.append('user_id', '672e3f347e1a5495453f36f8');

      const response = await fetch('https://cfapi.share.zrok.io/predictor/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`Tên bệnh: ${data.result.name}\nNguyên nhân: ${data.result.cause}\nGiải pháp: ${data.result.solution}`);
        setName(data.result.name);
        setCause(data.result.cause);
        setSolution(data.result.solution);
        setPrephoto(data.image_url);

        // router.replace('/result');
      } else {
        setResult(`Lỗi: ${data.message || 'Không thể dự đoán'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Đã xảy ra lỗi khi gửi API.');
    } finally {
      setLoading(false);
    }
  };

  // console.log(result)

  if (result) return <Result name={name} cause={cause} solution={solution} uri={prePhoto} />

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Image
          style={styles.previewContainer}
          source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
          <EvilIcons name="trash" size={44} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCheckPhoto}>
          {loading ? (
            <Text style={styles.loadingText}>Đang kiểm tra...</Text>
          ) : (
            <AntDesign name="check" size={44} color="black" />
          )}
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
    width: '100%',
  },
  button: {
    backgroundColor: 'gray',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15%',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  resultText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PhotoPreviewSection;
