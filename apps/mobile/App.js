import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000/api";

const roles = [
  { key: "parent", label: "Parent" },
  { key: "teacher", label: "Teacher" },
  { key: "driver", label: "Driver" }
];

const demoProfiles = {
  parent: {
    fullName: "Parent Demo",
    roleLabel: "Parent Portal",
    studentName: "Aarav Bankar",
    studentId: "BSB-2026-0001",
    metrics: [
      ["Attendance", "92%"],
      ["Fees Due", "Rs 3,500"],
      ["Latest Result", "A"],
      ["Notices", "4"]
    ],
    actions: [
      ["Attendance", "Daily attendance, leave records, and absent alerts."],
      ["Fees", "Installments, due dates, receipts, and payment reminders."],
      ["Results", "Marksheets, performance charts, and teacher remarks."],
      ["Bus Updates", "Pickup status, driver contact, and route updates."]
    ]
  },
  teacher: {
    fullName: "Teacher Demo",
    roleLabel: "Teacher Portal",
    studentName: "Class 1 - A",
    studentId: "Assigned Class",
    metrics: [
      ["Students", "32"],
      ["Present Today", "29"],
      ["Homework", "2"],
      ["Pending Marks", "8"]
    ],
    actions: [
      ["Mark Attendance", "Save daily attendance and trigger absent alerts."],
      ["Upload Marks", "Enter subject marks, grades, and remarks."],
      ["Homework", "Post homework and classroom instructions."],
      ["Progress Photos", "Upload learning activity photos for student records."]
    ]
  },
  driver: {
    fullName: "Driver Demo",
    roleLabel: "Driver Portal",
    studentName: "Route A",
    studentId: "Vehicle MH-00-BSB",
    metrics: [
      ["Students", "18"],
      ["Picked", "15"],
      ["Pending Pickup", "3"],
      ["Collection", "Rs 12,000"]
    ],
    actions: [
      ["Pickup List", "Student names, parent contact, address, and route."],
      ["Mark Pickup", "Picked, absent, or not using bus for the day."],
      ["Bus Payments", "Monthly collection and school commission tracking."],
      ["Route Help", "Driver-focused route and parent communication view."]
    ]
  }
};

async function apiRequest(path, { token, body, method = "GET" } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
}

export default function App() {
  const [activeRole, setActiveRole] = useState("parent");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);

  const profile = useMemo(() => session?.profile || demoProfiles[activeRole], [activeRole, session]);

  async function handleLogin() {
    if (!identifier || !password) {
      Alert.alert("Login required", "Enter username/phone and password.");
      return;
    }

    setBusy(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { identifier, password }
      });
      setSession({
        token: data.token,
        user: data.user,
        profile: {
          ...demoProfiles[activeRole],
          fullName: data.user.fullName,
          roleLabel: `${activeRole.charAt(0).toUpperCase()}${activeRole.slice(1)} Portal`
        }
      });
    } catch (error) {
      Alert.alert("Offline demo mode", "Backend login is not connected on this phone yet, so demo mode is opened.");
      setSession({ token: null, user: { fullName: `${activeRole} demo` }, profile: demoProfiles[activeRole] });
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setSession(null);
    setPassword("");
  }

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={["#0d5c56", "#11786f", "#33a3d3"]} style={styles.hero}>
          <Text style={styles.kicker}>BSB International School</Text>
          <Text style={styles.title}>{session ? profile.roleLabel : "One app for parents, teachers, and drivers."}</Text>
          <Text style={styles.copy}>
            {session
              ? `${profile.fullName} • ${profile.studentName} • ${profile.studentId}`
              : "Attendance, fees, results, homework, notices, bus pickup, and reminders connected to the school ERP."}
          </Text>
        </LinearGradient>

        {!session ? (
          <>
            <View style={styles.roleSwitch}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  onPress={() => setActiveRole(role.key)}
                  style={[styles.roleButton, activeRole === role.key && styles.roleButtonActive]}
                >
                  <Text style={[styles.roleText, activeRole === role.key && styles.roleTextActive]}>{role.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.sectionTitle}>{roles.find((role) => role.key === activeRole)?.label} Login</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setIdentifier}
                placeholder={activeRole === "driver" ? "Driver phone / username" : "Student ID / phone / username"}
                placeholderTextColor="#8aa39a"
                style={styles.input}
                value={identifier}
              />
              <TextInput
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#8aa39a"
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <TouchableOpacity disabled={busy} onPress={handleLogin} style={styles.primaryButton}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Continue</Text>}
              </TouchableOpacity>
              <Text style={styles.helper}>Demo opens automatically if the backend is not reachable.</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.metricGrid}>
              {profile.metrics.map(([label, value]) => (
                <View key={label} style={styles.metricCard}>
                  <Text style={styles.metricValue}>{value}</Text>
                  <Text style={styles.metricLabel}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardGrid}>
              {profile.actions.map(([title, description]) => (
                <TouchableOpacity key={title} style={styles.featureCard}>
                  <Text style={styles.featureTitle}>{title}</Text>
                  <Text style={styles.featureCopy}>{description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={logout} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#092f2c"
  },
  content: {
    padding: 20,
    gap: 18
  },
  hero: {
    padding: 22,
    borderRadius: 20
  },
  kicker: {
    color: "#ffe879",
    fontWeight: "800",
    marginBottom: 8
  },
  title: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36
  },
  copy: {
    color: "#e9fffb",
    marginTop: 10,
    lineHeight: 22
  },
  roleSwitch: {
    flexDirection: "row",
    gap: 8
  },
  roleButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    backgroundColor: "#174944",
    alignItems: "center"
  },
  roleButtonActive: {
    backgroundColor: "#f05aa3"
  },
  roleText: {
    color: "#d6f2ec",
    fontWeight: "800"
  },
  roleTextActive: {
    color: "#ffffff"
  },
  loginCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    gap: 12
  },
  sectionTitle: {
    color: "#0d5c56",
    fontSize: 22,
    fontWeight: "900"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7ece9",
    borderRadius: 12,
    padding: 14,
    color: "#204640"
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#11786f",
    padding: 15,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  helper: {
    color: "#57766a",
    fontSize: 12,
    textAlign: "center"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff"
  },
  metricValue: {
    color: "#0d5c56",
    fontSize: 24,
    fontWeight: "900"
  },
  metricLabel: {
    color: "#57766a",
    marginTop: 4,
    fontWeight: "800"
  },
  cardGrid: {
    gap: 12
  },
  featureCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff9ef"
  },
  featureTitle: {
    color: "#0d5c56",
    fontSize: 18,
    fontWeight: "900"
  },
  featureCopy: {
    color: "#57766a",
    marginTop: 4,
    lineHeight: 20
  },
  secondaryButton: {
    borderRadius: 999,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#174944"
  },
  secondaryButtonText: {
    color: "#d6f2ec",
    fontWeight: "900"
  }
});
