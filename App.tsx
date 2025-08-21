import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Pressable, ActivityIndicator, BackHandler, Platform, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";

// Inicio y accesos directos
const HOME_URL = "https://www.sadjosecpaz.com/";
// Usamos HTTPS para evitar bloqueos en iOS (si no carga, te paso excepción ATS)
const OBLEA_URL = "https://servicios.abc.gov.ar/servaddo/puntaje.ingreso.docencia/";
const INSCRIP_108_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeqwxsHdByNPEF8BdJjS5QqVRvZPEEXNpbBVxJJZlHe8hj-JA/viewform";

// Visor PDF embebido
const PDF_VIEWER = "https://drive.google.com/viewerng/viewer?embedded=true&url=";

export default function App() {
  const webref = useRef<WebView>(null);
  const [url, setUrl] = useState(HOME_URL);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Botón físico "Atrás" (Android)
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webref.current) {
        webref.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const isPdf = (u: string) => u.toLowerCase().includes(".pdf");

  // Interceptar navegación: si es PDF, lo abrimos con el visor interno
  const onShouldStart = (req: any) => {
    const next = req.url;
    if (isPdf(next)) {
      const viewerUrl = PDF_VIEWER + encodeURIComponent(next);
      if (viewerUrl !== url) setUrl(viewerUrl);
      return false;
    }
    return true;
  };

  // Helpers de navegación
  const goHome = () => setUrl(HOME_URL);
  const goOblea = () => setUrl(OBLEA_URL);
  const goInscripcion = () => setUrl(INSCRIP_108_URL);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0ea5b5" }}>
      <StatusBar style="light" />

      {/* Barra superior con scroll horizontal para que entren más botones */}
      <View style={{ backgroundColor: "#0891b2", paddingVertical: 10 }}>
        <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
          <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>SAD José C. Paz</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, columnGap: 8 }}
        >
          <TopBtn label="SAD" onPress={goHome} tone="#155e75" />
          <TopBtn label="Actualizar" onPress={() => webref.current?.reload()} tone="#06b6d4" />
          <TopBtn label="OBLEA" onPress={goOblea} tone="#0ea5b5" />
          <TopBtn label="Inscripción 108A/B" onPress={goInscripcion} tone="#0e7490" />
        </ScrollView>
      </View>

      {/* Contenido */}
      <View style={{ flex: 1 }}>
        {loading && (
          <View
            style={{
              position: "absolute",
              zIndex: 10,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8 }}>Cargando…</Text>
          </View>
        )}

        <WebView
          ref={webref}
          source={{ uri: url }}
          originWhitelist={["*"]}
          mixedContentMode="always" // permite http si la página lo usa
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
          onShouldStartLoadWithRequest={onShouldStart}
          pullToRefreshEnabled
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          allowsInlineMediaPlayback
          userAgent={Platform.OS === "web" ? undefined : "Mozilla/5.0 (Mobile) WebViewApp"}
        />
      </View>
    </SafeAreaView>
  );
}

// Botón reutilizable para la topbar
function TopBtn({ label, onPress, tone }: { label: string; onPress: () => void; tone: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: tone,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
