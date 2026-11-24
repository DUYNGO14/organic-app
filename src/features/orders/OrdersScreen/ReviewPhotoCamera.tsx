import { PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { useAppColors } from "@/hooks/use-app-colors";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ReviewPhotoCamera({
  onClose,
  onAttach,
}: {
  onClose: () => void;
  onAttach: (uri: string) => void;
}) {
  const colors = useAppColors();
  const camera = useRef<CameraView>(null);
  const capturing = useRef(false);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [appState, setAppState] = useState(AppState.currentState);
  const [requesting, setRequesting] = useState(false);
  const [ready, setReady] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [message, setMessage] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppState(state);
      if (state === "active") void getPermission().catch(() => {});
      else if (state === "background") setReady(false);
    });
    return () => subscription.remove();
  }, [getPermission]);

  async function enableCamera() {
    if (requesting) return;
    setMessage("");
    setRequesting(true);
    try {
      if (permission?.canAskAgain === false) await Linking.openSettings();
      else await requestPermission();
    } catch {
      setMessage("Không thể cấp quyền camera. Vui lòng thử lại.");
    } finally {
      setRequesting(false);
    }
  }

  async function takePhoto() {
    const activeCamera = camera.current;
    if (!activeCamera || !ready || capturing.current) return;
    capturing.current = true;
    setTakingPhoto(true);
    setMessage("");
    try {
      const photo = await activeCamera.takePictureAsync({ quality: 0.7 });
      if (camera.current !== activeCamera) return;
      if (!photo?.uri) throw new Error("Camera returned no photo");
      setPhotoUri(photo.uri);
      setReady(false);
    } catch {
      if (camera.current === activeCamera) setMessage("Chụp ảnh thất bại. Vui lòng thử lại.");
    } finally {
      capturing.current = false;
      setTakingPhoto(false);
    }
  }

  return (
    <Modal visible animationType="slide" hardwareAccelerated onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-canvas">
        <StackHeader title={photoUri ? "Xem ảnh đã chụp" : "Chụp ảnh sản phẩm"} onBack={onClose} />
        {!permission ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator accessibilityLabel="Đang kiểm tra quyền camera" color={colors.primary} />
          </View>
        ) : !permission.granted || cameraError ? (
          <View className="flex-1 justify-center gap-4 px-6">
            <Camera color={colors.primary} size={32} />
            <Text className="font-vietnam text-title-md text-ink">
              {cameraError ? "Không thể mở camera" : "Cần quyền truy cập camera"}
            </Text>
            {cameraError ? (
              <PrimaryBtn title="Thử lại" onPress={() => setCameraError(false)} />
            ) : (
              <PrimaryBtn
                loading={requesting}
                title={permission.canAskAgain ? "Cho phép dùng camera" : "Mở cài đặt ứng dụng"}
                onPress={() => void enableCamera()}
              />
            )}
            {message ? <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">{message}</Text> : null}
          </View>
        ) : (
          <View className="flex-1 gap-4 p-4">
            <View className="flex-1 overflow-hidden rounded-lg bg-surface-container">
              {photoUri ? (
                <Image accessibilityLabel="Ảnh sản phẩm vừa chụp" contentFit="contain" source={photoUri} style={StyleSheet.absoluteFill} />
              ) : appState !== "background" ? (
                <CameraView
                  ref={camera}
                  facing="back"
                  mode="picture"
                  style={StyleSheet.absoluteFill}
                  onCameraReady={() => setReady(true)}
                  onMountError={() => {
                    setReady(false);
                    setCameraError(true);
                  }}
                />
              ) : null}
            </View>
            {message ? <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">{message}</Text> : null}
            {photoUri ? (
              <View className="flex-row gap-2">
                <PrimaryBtn className="flex-1" variant="secondary" title="Chụp lại" onPress={() => setPhotoUri(null)} />
                <PrimaryBtn className="flex-1" title="Dùng ảnh" onPress={() => onAttach(photoUri)} />
              </View>
            ) : (
              <PrimaryBtn fullWidth disabled={!ready} loading={takingPhoto} title="Chụp ảnh" onPress={() => void takePhoto()} />
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
