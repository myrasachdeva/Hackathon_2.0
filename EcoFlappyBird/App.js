import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function App() {

  const games = [
    {
      title: "FLAPPY BIRD",
      desc: "EVS Reflex Challenge"
    },
    {
      title: "DINO RUN",
      desc: "Chrome dinosaur revived"
    },
    {
      title: "HANGMAN",
      desc: "Guess CS & science words"
    }
  ];

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.logo}>LAZARUS ARCADE</Text>
      <Text style={styles.tagline}>reviving dead games</Text>

      {games.map((game, i) => (

        <View key={i} style={styles.machine}>

          <View style={styles.screen}>
            <Text style={styles.insert}>INSERT COIN</Text>
          </View>

          <Text style={styles.gameTitle}>{game.title}</Text>
          <Text style={styles.gameDesc}>{game.desc}</Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>⚡ REVIVE GAME</Text>
          </TouchableOpacity>

        </View>

      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0a0016",
    paddingTop: 60,
    paddingHorizontal: 20
  },

  logo: {
    fontSize: 40,
    color: "#FFD700",
    textAlign: "center",
    fontWeight: "900",
    letterSpacing: 4
  },

  tagline: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 40
  },

  machine: {
    backgroundColor: "#1a0033",
    borderWidth: 4,
    borderColor: "#FFD700",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30
  },

  screen: {
    height: 140,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#00ffcc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },

  insert: {
    color: "#00ffcc",
    fontSize: 12
  },

  gameTitle: {
    color: "#FFD700",
    fontSize: 20,
    fontWeight: "bold"
  },

  gameDesc: {
    color: "#ccc",
    marginBottom: 15
  },

  button: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },

  buttonText: {
    fontWeight: "bold",
    color: "#000"
  }

});