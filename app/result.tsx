import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
export default function Result() {
  const searchParams = useLocalSearchParams() as {
    uri: string;
    name: string;
    cause: string;
    solution: string;
  };
  const { uri, name, cause, solution } = searchParams;

  const [query, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { type: "query" | "results"; text: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollViewRef = useRef<ScrollView>(null);

  const url_chatbot = "http://192.168.0.116:5000/predict"; // Thay bằng địa chỉ IP của server

  const handleQuestion = async () => {
    if (query.trim() === "") return;

    setIsLoading(true);

    const newChat = [...chatHistory, { type: "query", text: query }];
    setChatHistory(newChat); // Cập nhật lịch sử chat với câu hỏi ngay lập tức
    setQuestion("");

    try {
      const response = await fetch(url_chatbot, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Thêm các header khác nếu cần, ví dụ: Authorization
        },
        body: JSON.stringify({
          query: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Giả sử server trả về JSON

      // Xử lý dữ liệu trả về từ server
      let results =
        data.results || "Hiện tại tôi chưa thể trả lời câu hỏi này.";

      console.log(results);

      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { type: "results", text: results },
      ]);
    } catch (error) {
      console.error("Error sending question:", error);
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { type: "results", text: "Lỗi khi gửi câu hỏi." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Khi có tin nhắn mới, scroll đến cuối tin nhắn
    if (chatHistory.length > 0) {
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  useEffect(() => {
    // Scroll đến phần Q&A khi component mount
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 550, animated: true }); // Điều chỉnh giá trị y
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const MAX_HEIGHT = 100;
  const router = useRouter();

  const goToFullText = (title, content) => {
    router.push({
      pathname: "/fullText",
      params: { title, content },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Image and Title Section */}
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: uri }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.title}>{name}</Text>
          </View>

          {/* Disease Information */}
          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={styles.infoSection}
              onPress={() => goToFullText("Nguyên nhân", cause)}
            >
              <Icon
                name="help-circle-outline"
                size={20}
                color="#4CAF50"
                style={styles.icon}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Nguyên nhân:</Text>
                <View style={{ maxHeight: MAX_HEIGHT, overflow: "hidden" }}>
                  <Text style={styles.infoText}>{cause}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoSection}
              onPress={() => goToFullText("Phòng ngừa", solution)}
            >
              <Icon
                name="shield-checkmark-outline"
                size={20}
                color="#4CAF50"
                style={styles.icon}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Phòng ngừa:</Text>
                <View style={{ maxHeight: MAX_HEIGHT, overflow: "hidden" }}>
                  <Text style={styles.infoText}>{solution}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Q&A Section */}
          <View style={styles.qaContainer}>
            <Text style={styles.qaTitle}>Hỏi đáp về bệnh</Text>

            {/* Chat History */}
            <ScrollView
              style={styles.chatBox}
              ref={chatScrollViewRef}
              onContentSizeChange={() =>
                chatScrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {chatHistory.map((chat, index) => (
                <View
                  key={index}
                  style={[
                    styles.chatBubble,
                    chat.type === "query"
                      ? styles.questionBubble
                      : styles.answerBubble,
                  ]}
                >
                  <Text style={styles.chatText}>{chat.text}</Text>
                </View>
              ))}
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#4CAF50"
                  style={{ marginTop: 10 }}
                />
              )}
            </ScrollView>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập câu hỏi của bạn..."
                value={query}
                onChangeText={setQuestion}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleQuestion}
              >
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1, // Bỏ dòng này
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
    color: "#333",
  },
  infoContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoSection: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 8,
    marginTop: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  infoTextContainer: {
    flex: 1,
  },
  qaContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  chatBox: {
    flex: 1,
    marginBottom: 15,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "80%",
  },
  questionBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e4f0e4",
    borderTopRightRadius: 2,
  },
  answerBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 2,
  },
  chatText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  input: {
    flex: 1,
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
