import { Dimensions, ImageBackground, StyleSheet, View } from "react-native";
import {
  LoaderCircle,
  TimerReset,
  Cloudy,
  ArrowBigRight,
  ListPlus,
  Trees,
  Calendar,
  MessageSquare,
  PhoneCall,
} from "@tamagui/lucide-icons";
import {
  Paragraph,
  SizableText,
  Text,
  XStack,
  YStack,
  Button,
  YGroup,
  Separator,
  ListItem,
  Image,
  H3,
  Avatar,
  ZStack,
  H4,
  styled,
  H1,
  ScrollView,
  H2,
  Switch,
  Label,
} from "tamagui";

import WeatherBg from "../../assets/images/WeatherBg.png";
import lightningicontravelmug from "../../assets/images/lightning-icon-travel-mug.png";

import img_1041022 from "../../assets/images/1041022.png";
import img_5846822 from "../../assets/images/5846822.png";
import img_4088981 from "../../assets/images/4088981.png";
import img_862819 from "../../assets/images/862819.png";
import bg1 from "../../assets/images/bg1.png";

import FeatureItem from "components/home/featurebox";
import GlassmorphismCard from "components/home/GlassContainer";
import MyPlantCard from "components/home/myplantContainer";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import Fontisto from "@expo/vector-icons/Fontisto";
import * as Location from "expo-location";

export default function Home() {
  const features = [
    {
      iconUrl: img_1041022,
      label: "Theo dõi bão",
    },
    {
      iconUrl: img_5846822,
      label: "Chuyến xe nông dân",
    },
    {
      iconUrl: img_4088981,
      label: "Bảo hiểm lượng mưa",
    },
    {
      iconUrl: img_862819,
      label: "Giá cả thị trường",
    },
  ];

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<any | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        setLoading(true); // Bắt đầu loading
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg("Error getting location");
        console.error(error);
      } finally {
        setLoading(false); // Dừng loading
      }
    }

    getCurrentLocation();
  }, []);

  useEffect(() => {
    async function getWeather() {
      if (location) {
        try {
          setLoading(true); // Bắt đầu loading
          const response = await fetch(
            `http://api.weatherapi.com/v1/current.json?key=6cc7f8d8c1e74ddeb87131911242111&q=${location.coords.latitude},${location.coords.longitude}&lang=vi`
          );
          const data = await response.json();
          setWeather({
            location: data.location.name,
            temp_c: data.current.temp_c,
            wind_kph: data.current.wind_kph,
            humidity: data.current.humidity,
            condition: data.current.condition.text,
            icon: data.current.condition.icon.replace(/^\/\//, ""),
          });
        } catch (error) {
          setErrorMsg("Error getting weather");
          console.error(error);
        } finally {
          setLoading(false); // Dừng loading
        }
      }
    }

    getWeather();
  }, [location]); // Chỉ chạy khi `location` đã có giá trị

  return loading ? (
    <View></View>
  ) : (
    <ScrollView>
      <YStack backgroundColor="white">
        {/* Weather report */}
        <YStack gap="$5">
          <XStack
            gap="$2"
            paddingTop="$3"
            backgroundColor="white"
            borderTopColor="$gray7"
            borderWidth="$1"
            borderLeftColor="white"
            borderRightColor="white"
            borderBottomColor="white"
          >
            <YStack flex={5.5} paddingLeft={7} alignItems="center">
              <Image
                source={{
                  uri: WeatherBg,
                  width: 180,
                  height: 180,
                }}
                borderRadius={100}
              />
              {/* Degrees */}
              <YStack position="absolute" top="50%" left="65%">
                <Image
                  source={{
                    uri: weather
                      ? `https://${weather?.icon}`
                      : "https://default-icon-url.png",
                  }}
                  width={40}
                  height={40}
                  transform={[{ translateX: -43 }, { translateY: -50 }]}
                />

                {/* <Cloudy
                  size={40}
                  style={{
                    transform: [{ translateX: -43 }, { translateY: -50 }],
                  }}
                /> */}
                <Text
                  style={{
                    transform: [{ translateX: -50 }, { translateY: -50 }],
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  {weather ? weather.temp_c : ""}°C
                </Text>
              </YStack>

              {/* Weather type */}
              <Text textAlign="center" fontWeight="bold">
                {weather ? weather.condition : ""}
              </Text>
            </YStack>

            <YStack flex={4.5} paddingRight={15} gap="$2">
              <XStack gap="$3" flexWrap="nowrap" alignItems="center">
                <Text fontSize={"$7"} flexShrink={0}>
                  🏠
                </Text>
                <Text flexShrink={0}>{weather ? weather.location : ""}</Text>
                <TimerReset />
              </XStack>
              <YGroup gap="$3">
                <YGroup.Item>
                  <ListItem
                    borderColor="$gray4"
                    borderWidth="$1"
                    title="Gió"
                    subTitle={`🌪️   ${weather ? weather.wind_kph : ""} km/h`}
                    backgroundColor={"white"}
                    borderRadius={"$10"}
                  />
                </YGroup.Item>
                <YGroup.Item>
                  <ListItem
                    borderColor="$gray4"
                    borderWidth="$1"
                    title="Độ ẩm"
                    subTitle={`💧   ${weather ? weather.humidity : ""}`}
                    backgroundColor={"white"}
                    borderRadius={"$10"}
                  />
                </YGroup.Item>
              </YGroup>
            </YStack>
          </XStack>

          <YStack alignItems="center" paddingBottom="$2">
            <XStack
              flexWrap="nowrap"
              alignItems="center"
              backgroundColor="#E69227"
              borderRadius={10}
            >
              <Button backgroundColor="#E69227" color="white" width={300}>
                <Image
                  source={{
                    uri: lightningicontravelmug,
                    width: 40,
                    height: 40,
                  }}
                  borderRadius={100}
                />
                Khuyến cáo nông vụ
              </Button>
              <ArrowBigRight size={30} color="white" />
            </XStack>
          </YStack>
        </YStack>

        {/* Interesting features */}
        <YStack padding={"$5"}>
          <H3 color="#294531">Tính năng nổi bật</H3>
          <XStack gap="$2" justifyContent="space-around" marginTop="$4">
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                iconUrl={feature.iconUrl}
                label={feature.label}
              />
            ))}
          </XStack>
        </YStack>

        {/* Medicine Finding */}
        <ImageBackground
          source={{
            uri: "https://www.rdworldonline.com/wp-content/uploads/2019/09/pesticides_Shutterstock_featured.jpg",
          }} // replace with your image URL
          style={{ width: Dimensions.get("window").width, height: 230 }} // covers entire background
        >
          <YStack
            backgroundColor="rgba(0, 0, 0, 0.4)"
            width={Dimensions.get("window").width}
            height={230}
          >
            <YStack padding="$2">
              <XStack
                justifyContent="space-between"
                flexWrap="nowrap"
                alignItems="center"
                padding="$2"
              >
                <H3 color="white">Tra Cứu Thuốc</H3>
                <SizableText
                  size="$5"
                  color="white"
                  textDecorationLine="underline"
                >
                  Tra cứu ngay
                </SizableText>
              </XStack>

              <XStack top="$7" gap="$3">
                <GlassmorphismCard
                  text="Thuốc BVTV được phép lưu hành"
                  uri="https://cdn-icons-png.flaticon.com/512/5671/5671070.png"
                />
                <GlassmorphismCard
                  text="Thuốc BVTV không được lưu hành"
                  uri="https://cdn3.iconfinder.com/data/icons/weed-vivid-vol-2/256/Pesticide-Free-512.png"
                />
              </XStack>
            </YStack>
          </YStack>
        </ImageBackground>

        {/* My plant */}
        <ZStack height={500}>
          <YStack height={500}>
            <YStack height={100} backgroundColor="white" />
            <YStack
              height={400}
              backgroundColor="#F3F8FC"
              borderTopRightRadius={100}
              borderTopLeftRadius={100}
            />
          </YStack>

          <YStack>
            <XStack justifyContent="space-between" padding="$4">
              <H3 color="#294531">Cây trồng của tôi</H3>
              <ListPlus size={40} color="$green7Light" />
            </XStack>
            <YStack top="$-2">
              <YStack>
                <XStack justifyContent="center">
                  <Avatar
                    circular
                    size="$6"
                    borderWidth="$0.25"
                    borderColor="$gray9"
                  >
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      src="https://cdn-icons-png.flaticon.com/128/4215/4215095.png"
                    />
                    <Avatar.Fallback backgroundColor="$blue10" />
                  </Avatar>
                </XStack>
                <XStack justifyContent="space-around" top="$-7">
                  <Avatar
                    circular
                    size="$6"
                    borderWidth="$0.25"
                    borderColor="$gray9"
                  >
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      src="https://cdn-icons-png.flaticon.com/128/5280/5280911.png"
                    />
                    <Avatar.Fallback backgroundColor="$blue10" />
                  </Avatar>
                  <Avatar
                    circular
                    size="$6"
                    borderWidth="$0.25"
                    borderColor="$gray9"
                  >
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      src="https://cdn-icons-png.flaticon.com/128/1330/1330443.png"
                    />
                    <Avatar.Fallback backgroundColor="$blue10" />
                  </Avatar>
                </XStack>
                <XStack justifyContent="space-between" top="$-8">
                  <Avatar
                    circular
                    size="$6"
                    borderWidth="$0.25"
                    borderColor="$gray9"
                  >
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      src="https://cdn-icons-png.flaticon.com/512/8782/8782264.png"
                    />
                    <Avatar.Fallback backgroundColor="$blue10" />
                  </Avatar>
                  <Avatar
                    circular
                    size="$6"
                    borderWidth="$0.25"
                    borderColor="$gray9"
                  >
                    <Avatar.Image
                      accessibilityLabel="Cam"
                      src="https://cdn-icons-png.flaticon.com/128/14034/14034643.png"
                    />
                    <Avatar.Fallback backgroundColor="$blue10" />
                  </Avatar>
                </XStack>
              </YStack>

              <YStack alignItems="center" justifyContent="center" top="$-12">
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/128/4215/4215095.png",
                    width: 150,
                    height: 150,
                  }}
                />
                <Text textAlign="center" color="#294531" fontSize="$6">
                  Cà phê
                </Text>
              </YStack>

              <XStack top="$-12" justifyContent="space-between" padding="$3">
                <MyPlantCard
                  text="Kĩ thuật canh tác"
                  uri="https://cdn-icons-png.flaticon.com/128/188/188333.png"
                />
                <MyPlantCard
                  text="Sâu và bệnh hại"
                  uri="https://cdn-icons-png.flaticon.com/128/11167/11167005.png"
                />
                <MyPlantCard
                  text="Lịch nông vụ"
                  uri="https://cdn-icons-png.flaticon.com/128/8718/8718037.png"
                />
              </XStack>
            </YStack>
          </YStack>
        </ZStack>

        {/* Expert */}
        <YStack top="$3">
          <XStack
            justifyContent="space-between"
            gap="$3"
            flexWrap="nowrap"
            alignItems="center"
          >
            <H3 paddingLeft="$3">Chuyên gia tư vấn</H3>
            <XStack
              top="$1"
              right="$3"
              gap="$3"
              flexWrap="nowrap"
              alignItems="center"
            >
              <Switch size="$2" theme={"green"}>
                <Switch.Thumb animation="bouncy" theme={"green"} />
              </Switch>
              <Text>Offline</Text>
            </XStack>
          </XStack>

          <YStack
            top="$3"
            borderWidth="$1"
            borderBlockColor="$gray3"
            borderLeftColor="$gray3"
            borderRightColor="$gray3"
            margin="$3"
            shadowColor="$accentColor"
            borderRadius="$5"
          >
            <YStack backgroundColor="#ffffff" borderRadius="$5">
              <XStack gap="$5" padding="$3">
                <Avatar
                  size="$11"
                  borderWidth="$1"
                  borderColor="$gray3"
                  borderRadius="$5"
                >
                  <Avatar.Image
                    accessibilityLabel="Cam"
                    src="https://hoangkimlong.wordpress.com/wp-content/uploads/2020/03/pham-hong-duc-phuoc-ca-cao.jpg?w=584"
                  />
                  <Avatar.Fallback backgroundColor="$blue10" />
                </Avatar>
                <YStack gap="$2" top="$1">
                  <Text>0123456789</Text>
                  <Text fontSize="$4" fontWeight="bold">
                    TS. Phạm Hồng Đức Phước
                  </Text>
                  <XStack gap="$2" flexWrap="nowrap" alignItems="center">
                    <Trees size={24} color="#595959" />
                    <Text fontSize="$4" color="#595959">
                      Hoa cây cảnh
                    </Text>
                  </XStack>
                  <XStack
                    gap="$2"
                    backgroundColor="#E3E3E3"
                    flexWrap="nowrap"
                    alignItems="center"
                    borderRadius="$3"
                    padding="$2"
                  >
                    <Fontisto
                      name="radio-btn-active"
                      size={24}
                      color="#949494"
                    />
                    <Text fontSize="$4" color="#949494">
                      Không trực tuyến
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
            </YStack>
            <YStack
              backgroundColor="#EAF4FE"
              borderBottomRightRadius="$4"
              borderBottomLeftRadius="$4"
            >
              <XStack
                justifyContent="space-between"
                padding="$2"
                flexWrap="nowrap"
                alignItems="center"
              >
                <XStack
                  backgroundColor="#ffffff"
                  borderRadius={100}
                  width={48}
                  height={48}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Calendar size={24} color="#1F66AE" />
                </XStack>
                <XStack
                  backgroundColor="#ffffff"
                  borderRadius="$10"
                  padding="$3"
                  gap="$2"
                >
                  <MessageSquare size={24} color="#1F66AE" />
                  <Text fontSize="$5" color="#1F66AE">
                    Đặt câu hỏi
                  </Text>
                </XStack>
                <XStack
                  backgroundColor="#ffffff"
                  borderRadius="$10"
                  padding="$3"
                  gap="$2"
                >
                  <PhoneCall size={24} color="#1F66AE" />
                  <Text fontSize="$5" color="#1F66AE">
                    Đặt câu hỏi
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
        </YStack>

        {/* Marketplace */}
        <XStack alignItems="center" justifyContent="center" height={300}>
          <H1 textAlign="center">CloseAI</H1>
        </XStack>

        {/* News */}
        {/* Logo team */}
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, // Ensures the background covers the whole screen
    resizeMode: "cover", // Ensures the image scales to cover the entire view
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
  },
});
