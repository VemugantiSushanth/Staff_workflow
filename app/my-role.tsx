import { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  BackHandler,
  RefreshControl,
  Alert,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "./supabase";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");
const SLIDER_HEIGHT = height * 0.42;

const slides = [
  require("../assets/slides/slide1.png"),
  require("../assets/slides/slide2.png"),
  require("../assets/slides/slide3.png"),
  require("../assets/slides/slide4.png"),
];

export default function MyRoleScreen() {
  const [newCount, setNewCount] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const sliderRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 🔙 BACK → LOGIN (ONLY FROM MY ROLE) */
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        router.replace("/login");
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => sub.remove();
    }, []),
  );

  /* 🔔 FETCH NOTIFICATIONS */
  const fetchCount = async () => {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return;

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("assigned_staff_email", email)
      .eq("is_viewed", false);

    setNewCount(count || 0);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCount();
    }, []),
  );

  /* 🔄 REFRESH */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCount();
    setRefreshing(false);
  }, []);

  /* 🔁 AUTO SLIDER */
  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      const next = (activeSlide + 1) % slides.length;
      sliderRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveSlide(next);
    }, 3000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [activeSlide]);

  /* 🚪 LOGOUT */
  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={[{ key: "main" }]}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={() => (
          <View style={styles.container}>
            <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

            {/* ================= HEADER ================= */}
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />

              <TouchableOpacity onPress={() => setShowMenu(true)}>
                <Ionicons name="person-circle-outline" size={34} color="#000" />
              </TouchableOpacity>
            </View>

            {showMenu && (
              <Pressable
                style={styles.overlay}
                onPress={() => setShowMenu(false)}
              />
            )}

            {showMenu && (
              <View style={styles.menu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    router.push("/my-account");
                  }}
                >
                  <Text style={styles.menuText}>My Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                >
                  <Text style={[styles.menuText, { color: "red" }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= SLIDER ================= */}
            <View style={styles.sliderWrapper}>
              <FlatList
                ref={sliderRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                onMomentumScrollEnd={(e) =>
                  setActiveSlide(
                    Math.round(e.nativeEvent.contentOffset.x / width),
                  )
                }
                renderItem={({ item }) => (
                  <Image source={item} style={styles.slideImage} />
                )}
              />

              <View style={styles.dots}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, activeSlide === i && styles.activeDot]}
                  />
                ))}
              </View>
            </View>

            {/* 🔔 NEW ASSIGNED */}
            <TouchableOpacity
              style={styles.notifyBtn}
              onPress={() => router.push("/new-services")}
            >
              <Text style={styles.notifyText}>New Assigned Services</Text>

              {newCount > 0 && (
                <View style={styles.bellWrapper}>
                  <Ionicons name="notifications" size={20} color="#000" />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{newCount}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* 📋 MY ASSIGNED */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push("/assigned-services")}
            >
              <Text style={styles.primaryBtnText}>My Assigned Services</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ================= FOOTER ================= */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="home" size={22} color="#000" />
          <Text style={styles.footerTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={22} color="#000" />
          <Text style={styles.footerText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/my-account")}
        >
          <Ionicons name="person-outline" size={22} color="#000" />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { width: 160, height: 44, resizeMode: "contain" },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },

  menu: {
    position: "absolute",
    top: 72,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 6,
    width: 150,
    zIndex: 20,
  },

  menuItem: { padding: 14 },
  menuText: { fontSize: 15, fontWeight: "600" },

  sliderWrapper: {
    height: SLIDER_HEIGHT,
    margin: 16,
    borderRadius: 18,
    overflow: "hidden",
  },

  slideImage: { width: width - 32, height: SLIDER_HEIGHT },

  dots: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: { backgroundColor: "#000" },

  notifyBtn: {
    backgroundColor: "#FFD700",
    marginHorizontal: 40,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  notifyText: { fontWeight: "800", fontSize: 15 },

  bellWrapper: { position: "relative" },

  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#000",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFD700",
    fontWeight: "800",
    fontSize: 12,
  },

  primaryBtn: {
    backgroundColor: "#FFD700",
    marginHorizontal: 40,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },

  primaryBtnText: { fontWeight: "800", fontSize: 15 },

  footer: {
    height: 70,
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  footerItem: { alignItems: "center" },

  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  footerTextActive: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "800",
  },
});
