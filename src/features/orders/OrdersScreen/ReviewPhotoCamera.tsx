import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setMessage(t("orders.couldNotGrantCameraAccessPlease"));
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
      if (camera.current === activeCamera) setMessage(t("orders.couldNotTakeThePhotoPlease"));
    } finally {
      capturing.current = false;
      setTakingPhoto(false);
    }
  }

  return (
    <Modal visible animationType="slide" hardwareAccelerated onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-canvas">
        <StackHeader title={photoUri ? t("orders.previewPhoto") : t("orders.takeAProductPhoto")} onBack={onClose} />
        {!permission ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator accessibilityLabel={t("orders.checkingCameraPermissions")} color={colors.primary} />
          </View>
        ) : !permission.granted || cameraError ? (
          <View className="flex-1 justify-center gap-4 px-6">
            <Camera color={colors.primary} size={32} />
            <Text className="font-vietnam text-title-md text-ink">
              {cameraError ? t("orders.couldNotOpenTheCamera") : t("orders.cameraAccessNeeded")}
            </Text>
            {cameraError ? (
              <PrimaryBtn title={t("cart.tryAgain")} onPress={() => setCameraError(false)} />
            ) : (
              <PrimaryBtn
                loading={requesting}
                title={permission.canAskAgain ? t("orders.allowCameraAccess") : t("cart.openAppSettings")}
                onPress={() => void enableCamera()}
              />
            )}
            {message ? <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">{message}</Text> : null}
          </View>
        ) : (
          <View className="flex-1 gap-4 p-4">
            <View className="flex-1 overflow-hidden rounded-lg bg-surface-container">
              {photoUri ? (
                <Image accessibilityLabel={t("orders.capturedProductPhoto")} contentFit="contain" source={photoUri} style={StyleSheet.absoluteFill} />
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
                <PrimaryBtn className="flex-1" variant="secondary" title={t("orders.retake")} onPress={() => setPhotoUri(null)} />
                <PrimaryBtn className="flex-1" title={t("orders.usePhoto")} onPress={() => onAttach(photoUri)} />
              </View>
            ) : (
              <PrimaryBtn fullWidth disabled={!ready} loading={takingPhoto} title={t("orders.takeAPhoto")} onPress={() => void takePhoto()} />
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
