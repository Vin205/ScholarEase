import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native'; // Add these imports
import WelcomeScreen from './WelcomeScreen';
import StudentSignup from './StudentSignup';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';
import FacultyLogin from './FacultyLogin';
import FacultySignup from './FacultySignup';
import FacultyDashboard from './FacultyDashboard';
import ApplicationSubmission from './ApplicationSubmission';
import ApplicationDetails from './ApplicationDetails';

// Define the navigation parameters for all screens
export type RootStackParamList = {
  Welcome: undefined;
  StudentSignup: undefined;
  StudentLogin: undefined;
  StudentDashboard: undefined;
  FacultySignup: undefined;
  FacultyLogin: undefined;
  FacultyDashboard: undefined;
  ApplicationSubmission: undefined;
  ApplicationDetails: { application: any }; // Corrected parameter name
};

const Stack = createStackNavigator<RootStackParamList>();
// Add global styles
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});


const App: React.FC = () => {
  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Welcome"
          screenOptions={{
            cardStyle: { flex: 1 }, // Ensure each screen fills the available space
          }}
        >
          {/* Welcome Screen */}
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ 
              title: 'Welcome',
              headerShown: false // Optional: Hide header for welcome screen
            }}
          />

          {/* Student Screens */}
          <Stack.Screen
            name="StudentSignup"
            component={StudentSignup}
            options={{ 
              title: 'Student Signup',
              headerStyle: { backgroundColor: '#f5f5f5' } // Optional styling
            }}
          />
          <Stack.Screen
            name="StudentLogin"
            component={StudentLogin}
            options={{ 
              title: 'Student Login',
              headerStyle: { backgroundColor: '#f5f5f5' }
            }}
          />
          <Stack.Screen
            name="StudentDashboard"
            component={StudentDashboard}
            options={{ 
              title: 'Student Dashboard',
              headerBackTitle: 'Back' // Better back button text
            }}
          />

          {/* Faculty Screens */}
          <Stack.Screen
            name="FacultySignup"
            component={FacultySignup}
            options={{ 
              title: 'Faculty Signup',
              headerStyle: { backgroundColor: '#f5f5f5' }
            }}
          />
          <Stack.Screen
            name="FacultyLogin"
            component={FacultyLogin}
            options={{ 
              title: 'Faculty Login',
              headerStyle: { backgroundColor: '#f5f5f5' }
            }}
          />
          <Stack.Screen
            name="FacultyDashboard"
            component={FacultyDashboard}
            options={{ 
              title: 'Faculty Dashboard',
              headerBackTitle: 'Back'
            }}
          />

          {/* Application Screens */}
          <Stack.Screen
            name="ApplicationSubmission"
            component={ApplicationSubmission}
            options={{ 
              title: 'Submit Application',
              headerBackTitle: 'Back'
            }}
          />
          <Stack.Screen
            name="ApplicationDetails"
            component={ApplicationDetails}
            options={{ 
              title: 'Application Details',
              headerBackTitle: 'Back'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;