import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "./supabase";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AssignedServices() {
  const [services, setServices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= LOAD SERVICES ================= */
  const loadServices = async () => {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("assigned_staff_email", email);

    setServices(bookings || []);
  };

  useEffect(() => {
    loadServices();
  }, []);

  /* ================= PULL TO REFRESH ================= */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }, []);

  /* ================= GOOGLE MAPS ================= */
  const openMaps = (address: string) => {
    if (!address) {
      Alert.alert("Address not available");
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ================= BODY ================= */}
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {services.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.customer_name}</Text>

            <Text>
              <Text style={styles.label}>Email:</Text> {item.email}
            </Text>

            <Text>
              <Text style={styles.label}>Phone:</Text> {item.phone_number}
            </Text>

            <Text>
              <Text style={styles.label}>Address:</Text> {item.full_address}
            </Text>

            <View style={styles.section}>
              <Text style={styles.label}>Services:</Text>

              {item.services?.map((s: any, i: number) => (
                <View key={i} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>• {s.title}</Text>
                  <Text style={styles.serviceMeta}>
                    Date: {item.booking_date}
                  </Text>
                  <Text style={styles.serviceMeta}>
                    Duration: {s.duration}
                  </Text>
                </View>
              ))}
            </View>

            <Text>
              <Text style={styles.label}>Time:</Text> {item.booking_time}
            </Text>

            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => openMaps(item.full_address)}
            >
              <Text style={styles.mapBtnText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* ================= FOOTER ================= */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.replace("/my-role")}
        >
          <Ionicons name="home" size={22} color="#000" />
          <Text style={styles.footerText}>Home</Text>
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

  /* HEADER */
  header: {
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 160,
    height: 44,
    resizeMode: "contain",
  },

  body: {
    padding: 20,
    paddingBottom: 90,
  },

  /* CARD */
  card: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  label: { fontWeight: "700" },

  section: { marginVertical: 10 },

  serviceItem: { marginLeft: 10, marginTop: 6 },

  serviceName: { fontWeight: "700" },

  serviceMeta: {
    marginLeft: 10,
    color: "#555",
    fontSize: 13,
  },

  mapBtn: {
    marginTop: 14,
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  mapBtnText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },

  /* FOOTER */
  footer: {
    height: 70,
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  footerItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    color: "#000",
  },
});
