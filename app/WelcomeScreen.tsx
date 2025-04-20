import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './App'; // Import RootStackParamList from App.tsx

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ScholarEase</Text>

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('StudentSignup')}
        >
          <Text style={styles.buttonText}>Student Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('StudentLogin')}
        >
          <Text style={styles.buttonText}>Student Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FacultySignup')}
        >
          <Text style={styles.buttonText}>Faculty Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FacultyLogin')}
        >
          <Text style={styles.buttonText}>Faculty Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', // Light white-yellow background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333', // Dark text color
  },
  buttonContainer: {
    width: '80%',
  },
  button: {
    backgroundColor: '#2196F3', // Blue background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded corners
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF', // White text color
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;