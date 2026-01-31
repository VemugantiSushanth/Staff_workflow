import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "./supabase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyAccountScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUserId(data.user.id);
      setEmail(data.user.email ?? "");

      const { data: profile } = await supabase
        .from("staff_profile")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
    };

    loadProfile();
  }, []);

  /* ================= IMAGE PICK ================= */
  const pickImage = async () => {
    if (!editMode || !userId) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;
    uploadImage(result.assets[0].uri);
  };

  /* ================= UPLOAD IMAGE ================= */
  const uploadImage = async (uri: string) => {
    if (!userId) return;

    try {
      const blob = await (await fetch(uri)).blob();
      const filePath = `${userId}.jpg`;

      await supabase.storage.from("avatars").upload(filePath, blob, {
        upsert: true,
        contentType: "image/jpeg",
      });

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase
        .from("staff_profile")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);

      setAvatarUrl(data.publicUrl);
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message);
    }
  };

  /* ================= SAVE ================= */
  const saveProfile = async () => {
    if (!userId) return;

    setSaving(true);

    const { error } = await supabase
      .from("staff_profile")
      .update({
        full_name: fullName,
        phone,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Profile updated");
      setEditMode(false);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ================= HEADER CARD ================= */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSub}>Manage your personal details</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditMode(true)}
          >
            <Ionicons name="pencil" size={18} color="#2563EB" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ================= AVATAR ================= */}
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#777" />
            </View>
          )}
        </TouchableOpacity>

        {/* ================= FIELDS ================= */}
        <ProfileField
          label="FULL NAME"
          value={fullName}
          onChange={setFullName}
          editable={editMode}
        />

        <ProfileField
          label="EMAIL"
          value={email}
          editable={false}
          helper="Email cannot be changed"
        />

        <ProfileField
          label="PHONE NUMBER"
          value={phone}
          onChange={setPhone}
          editable={editMode}
        />

        {/* ================= SAVE ================= */}
        <TouchableOpacity
          style={[styles.saveBtn, { opacity: editMode ? 1 : 0.4 }]}
          disabled={!editMode}
          onPress={saveProfile}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= FIELD COMPONENT ================= */
function ProfileField({
  label,
  value,
  onChange,
  editable,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  editable: boolean;
  helper?: string;
}) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        style={[styles.fieldValue, !editable && { color: "#475569" }]}
      />
      {helper && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#64748B", marginTop: 4 },

  editBtn: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
  },

  editText: { color: "#2563EB", fontWeight: "700" },

  avatarWrap: {
    alignSelf: "center",
    marginVertical: 20,
  },

  avatar: {
    width: 120123,
    height: 120,
    borderRadius: 60,
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  fieldCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
  },

  fieldLabel: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },

  saveBtn: {
    backgroundColor: "#FFD700",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  saveText: { fontWeight: "800", fontSize: 16 },

  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#0F172A",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  logoutText: { color: "#fff", fontWeight: "800" },
});
