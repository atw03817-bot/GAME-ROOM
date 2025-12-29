# تطبيق جيم روم - Expo Snack

## الرابط المباشر للتجربة:
https://snack.expo.dev/@anonymous/ab-tw-store

## كيفية الاستخدام:
1. افتح الرابط أعلاه في المتصفح
2. اضغط على "My Device" في الجانب الأيمن
3. امسح الـ QR Code بتطبيق Expo Go
4. أو اضغط "Run in web browser" للتجربة في المتصفح

## أو استخدم هذا الكود مباشرة في Expo Snack:

```javascript
import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

const APP_CONFIG = {
  WEBSITE_URL: 'https://www.gameroom-store.com',
  APP_NAME: 'جيم روم',
  COLORS: {
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    background: '#f9fafb',
    dark: '#1e293b',
  },
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
          <Text style={styles.splashTitle}>{APP_CONFIG.APP_NAME}</Text>
          <Text style={styles.splashSubtitle}>متجر الهواتف والإكسسوارات</Text>
          <ActivityIndicator size="large" color={APP_CONFIG.COLORS.primary} style={styles.splashLoader} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={APP_CONFIG.COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>خطأ في الاتصال</Text>
          <Text style={styles.errorMessage}>تأكد من اتصالك بالإنترنت</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(false);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: APP_CONFIG.WEBSITE_URL }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: APP_CONFIG.COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  splashContent: {
    alignItems: 'center',
    width: '100%',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
  },
  splashLoader: {
    marginTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: APP_CONFIG.COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## الطريقة الثانية: بناء APK للتثبيت المباشر

إذا تبغى تطبيق حقيقي للتثبيت، خلني أبني لك APK:

```bash
# في مجلد mobile-Expo-App
npx eas build --platform android --profile preview
```

## المميزات:
✅ يشتغل على أي شبكة إنترنت
✅ ما يحتاج نفس الشبكة
✅ يفتح موقعك مباشرة من السيرفر
✅ تجربة تطبيق حقيقي