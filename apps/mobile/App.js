import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const roles = [
  { key: "parent", label: "Parent" },
  { key: "teacher", label: "Teacher" },
  { key: "driver", label: "Driver" }
];

const roleCards = {
  parent: [
    ["Attendance", "Daily status, leave, and absent alerts"],
    ["Fees", "Installments, dues, receipts, and reminders"],
    ["Results", "Marksheets, charts, and teacher remarks"],
    ["Notices", "Holiday, event, and school announcements"]
  ],
  teacher: [
    ["Class Attendance", "Mark daily attendance and send absent alerts"],
    ["Marks Upload", "Enter subject marks, grades, and remarks"],
    ["Homework", "Post homework and progress notes"],
    ["Student Photos", "Upload progress and activity evidence"]
  ],
  driver: [
    ["Pickup List", "Route-wise students, address, and parent contact"],
    ["Pickup Status", "Mark picked, absent, or not using bus"],
    ["Bus Payments", "Monthly collection and school commission"],
    ["Route Updates", "View route and assigned students"]
  ]
};

export default function App() {
  const [activeRole, setActiveRole] = useState("parent");
  const [studentId, setStudentId] = useState("");
  const cards = useMemo(() => roleCards[activeRole], [activeRole]);

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>BSB International School</Text>
          <Text style={styles.title}>One app for parents, teachers, and bus drivers.</Text>
          <Text style={styles.copy}>
            Cloud-connected Android app shell for attendance, fees, results, notices, homework, transport, and alerts.
          </Text>
        </View>

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
            onChangeText={setStudentId}
            placeholder={activeRole === "driver" ? "Driver phone / username" : "Student ID / phone / username"}
            placeholderTextColor="#8aa39a"
            style={styles.input}
            value={studentId}
          />
          <TextInput placeholder="Password" placeholderTextColor="#8aa39a" secureTextEntry style={styles.input} />
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGrid}>
          {cards.map(([title, description]) => (
            <View key={title} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureCopy}>{description}</Text>
            </View>
          ))}
        </View>
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
    borderRadius: 18,
    backgroundColor: "#0f5c56"
  },
  kicker: {
    color: "#f3b93f",
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
    color: "#d6f2ec",
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
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900"
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
  }
});
