import { PrimaryBtn } from "@/components/common";
import { StackHeader } from "@/components/layout";
import { catalogProducts } from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { CameraView, useCameraPermissions, type BarcodeScanningResult, type BarcodeSettings } from "expo-camera";
import { router, useIsFocused } from "expo-router";
import { Camera, ScanLine } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BatchResult } from "./BatchResult";
import { readQrResult } from "./qr-result";

const scannerSettings: BarcodeSettings = { barcodeTypes: ["qr"] };

function openProduct(productId: string) {
  router.replace({
    pathname: "/(product)/product/[productId]",
    params: { productId },
  });
}

export default function QrScannerScreen() {
  const colors = useAppColors();
  const focused = useIsFocused();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [appState, setAppState] = useState(AppState.currentState);
  const [requesting, setRequesting] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ReturnType<typeof readQrResult>>(null);
  const scanned = useRef(false);
  const active = focused && (appState === "active" || appState === null);
  const otherResult = result?.kind === "other" ? result : null;
  const product = otherResult?.productId
    ? catalogProducts.find(({ id }) => id === otherResult.productId)
    : undefined;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppState(state);
      if (state === "active" && focused) void getPermission().catch(() => {});
    });
    return () => subscription.remove();
  }, [focused, getPermission]);

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

  function scan({ data }: BarcodeScanningResult) {
    if (!active || scanned.current) return;
    const nextResult = readQrResult(data);
    if (!nextResult) return;
    scanned.current = true;
    setResult(nextResult);
  }

  function restart() {
    scanned.current = false;
    setResult(null);
    setCameraError(false);
    setMessage("");
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <StackHeader title="Quét mã QR" onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/home");
      }} />
      {result ? (
        <ScrollView contentContainerClassName="gap-4 p-4">
          {result.kind === "batch" ? (
            <BatchResult batchCode={result.batchCode} active={active} onOpenProduct={openProduct} />
          ) : result.kind === "invalid-batch" ? (
            <View className="gap-2 rounded-lg border border-card-border bg-surface p-4">
              <Text accessibilityRole="alert" className="font-vietnam text-title-md text-ink">
                Mã truy xuất không hợp lệ
              </Text>
              <Text className="font-vietnam text-body-md text-muted">
                Hãy kiểm tra mã QR trên bao bì sản phẩm rồi quét lại.
              </Text>
            </View>
          ) : (
            <>
              <View className="gap-3 rounded-lg border border-card-border bg-surface p-4">
                <Text accessibilityRole="header" accessibilityLiveRegion="polite" className="font-vietnam text-title-md text-ink">
                  {product ? product.name : "Nội dung mã QR"}
                </Text>
                <Text selectable className="font-vietnam text-body-md text-muted">{result.data}</Text>
              </View>
              {product ? (
                <PrimaryBtn fullWidth title="Xem sản phẩm" onPress={() => openProduct(product.id)} />
              ) : result.url ? (
                <PrimaryBtn fullWidth title="Mở liên kết" onPress={() => {
                  const url = result.url;
                  if (!url) return;
                  setMessage("");
                  void Linking.openURL(url).catch(() => setMessage("Không thể mở liên kết này."));
                }} />
              ) : null}
            </>
          )}
          <PrimaryBtn fullWidth variant="secondary" title="Quét mã khác" onPress={restart} />
          {message ? <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">{message}</Text> : null}
        </ScrollView>
      ) : !permission ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator accessibilityLabel="Đang kiểm tra quyền camera" color={colors.primary} />
        </View>
      ) : !permission.granted || cameraError ? (
        <View className="flex-1 justify-center gap-4 px-6">
          <Camera color={colors.primary} size={32} />
          <Text className="font-vietnam text-title-md text-ink">
            {cameraError ? "Không thể mở camera" : "Cần quyền truy cập camera"}
          </Text>
          <Text className="font-vietnam text-body-md text-muted">
            {cameraError ? "Hãy thử mở lại camera." : "Cho phép ứng dụng dùng camera để quét mã QR."}
          </Text>
          {message ? <Text accessibilityRole="alert" className="font-vietnam text-body-sm text-danger">{message}</Text> : null}
          {cameraError ? (
            <PrimaryBtn fullWidth title="Thử lại" onPress={restart} />
          ) : (
            <PrimaryBtn
              fullWidth
              loading={requesting}
              title={permission.canAskAgain ? "Cho phép dùng camera" : "Mở cài đặt ứng dụng"}
              onPress={() => void enableCamera()}
            />
          )}
        </View>
      ) : (
        <View className="flex-1 gap-4 p-4">
          <View className="flex-1 overflow-hidden rounded-lg bg-surface-container">
            {active ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={scannerSettings}
                onBarcodeScanned={scan}
                onMountError={() => setCameraError(true)}
              />
            ) : null}
            <View pointerEvents="none" className="flex-1 items-center justify-center">
              <View className="aspect-square w-2/3 max-w-64 rounded-lg border-2 border-primary" />
            </View>
          </View>
          <View className="flex-row items-center justify-center gap-2">
            <ScanLine color={colors.primary} size={20} />
            <Text className="font-vietnam text-body-md text-ink">Đưa mã QR vào trong khung.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
