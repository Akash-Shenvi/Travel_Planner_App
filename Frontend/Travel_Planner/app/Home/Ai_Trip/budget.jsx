import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const BudgetScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.subtitle}>Choose spending habits for your trip</Text>

      {/* Budget Options */}
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionTitle}>Cheap</Text>
        <Text style={styles.optionSubtitle}>Stay conscious of costs</Text>
        <Image source={require("../../../assets/images/couple.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionTitle}>Moderate</Text>
        <Text style={styles.optionSubtitle}>Keep cost on the average side</Text>
        <Image source={require("../../../assets/images/couple.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionTitle}>Luxury</Text>
        <Text style={styles.optionSubtitle}>Don't worry about cost</Text>
        <Image source={require("../../../assets/images/couple.png")} style={styles.icon} />
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  icon: {
    width: 30,
    height: 30,
  },
  continueButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  continueText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BudgetScreen;
