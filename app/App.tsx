import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {/* Welcome Screen */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: 'Welcome' }}
        />

        {/* Student Screens */}
        <Stack.Screen
          name="StudentSignup"
          component={StudentSignup}
          options={{ title: 'Student Signup' }}
        />
        <Stack.Screen
          name="StudentLogin"
          component={StudentLogin}
          options={{ title: 'Student Login' }}
        />
        <Stack.Screen
          name="StudentDashboard"
          component={StudentDashboard}
          options={{ title: 'Student Dashboard' }}
        />

        {/* Faculty Screens */}
        <Stack.Screen
          name="FacultySignup"
          component={FacultySignup}
          options={{ title: 'Faculty Signup' }}
        />
        <Stack.Screen
          name="FacultyLogin"
          component={FacultyLogin}
          options={{ title: 'Faculty Login' }}
        />
        <Stack.Screen
          name="FacultyDashboard"
          component={FacultyDashboard}
          options={{ title: 'Faculty Dashboard' }}
        />

        {/* Application Screens */}
        <Stack.Screen
          name="ApplicationSubmission"
          component={ApplicationSubmission}
          options={{ title: 'Submit Application' }}
        />
        <Stack.Screen
          name="ApplicationDetails"
          component={ApplicationDetails}
          options={{ title: 'Application Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;