// HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moral Dilemma App</Text>
      <Button
        title="Generate Dilemma"
        onPress={() => navigation.navigate('Dilemma')}
      />
      <Button
        title="Get Dilemma"
        onPress={() => navigation.navigate('GetDilemma')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: 24, 
    marginBottom: 20
  }
});

export default HomeScreen;
