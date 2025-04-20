import { Stack } from 'expo-router';

export default function AppNavigator() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Welcome' }} />
      <Stack.Screen name="auth/LoginScreen" options={{ title: 'Login' }} />
      <Stack.Screen name="auth/SignupScreen" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="student/StudentDashboard" options={{ title: 'Student Dashboard' }} />
      <Stack.Screen name="faculty/FacultyDashboard" options={{ title: 'Faculty Dashboard' }} />
      <Stack.Screen name="admin/AdminDashboard" options={{ title: 'Admin Dashboard' }} />
    </Stack>
  );
}