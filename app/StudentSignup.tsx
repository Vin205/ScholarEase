import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Picker
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import API from './api';

const StudentSignup = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    className: '',
    div: '',
    rollNo: '',
    department: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const departments = ['Computer', 'IT', 'AIDS', 'CSD', 'E&TC'];

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      const requiredFields = ['name', 'email', 'phoneNo', 'className', 'div', 'rollNo', 'department', 'password'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          Alert.alert('Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return;
        }
      }

      setLoading(true);
      const response = await API.studentSignup(formData);
      
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('StudentLogin');
    } catch (error) {
      Alert.alert('Error', error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
    contentContainerStyle={styles.scrollContainer}
    style={styles.scrollView} // Add this style
    keyboardShouldPersistTaps="handled" // Add this prop
  >
      <View style={styles.container}>
        <Text style={styles.title}>Student Registration</Text>

        {/* Name */}
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />

        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        {/* Phone Number */}
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={formData.phoneNo}
          onChangeText={(text) => handleChange('phoneNo', text)}
        />

        {/* Class */}
        <Text style={styles.label}>Class *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., FY, SY, TY"
          value={formData.className}
          onChangeText={(text) => handleChange('className', text)}
        />

        {/* Division */}
        <Text style={styles.label}>Division *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., A, B, C"
          value={formData.div}
          onChangeText={(text) => handleChange('div', text)}
        />

        {/* Roll No */}
        <Text style={styles.label}>Roll Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your roll number"
          value={formData.rollNo}
          onChangeText={(text) => handleChange('rollNo', text)}
        />

        {/* Department */}
        <Text style={styles.label}>Department *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.department}
            style={styles.picker}
            onValueChange={(itemValue) => handleChange('department', itemValue)}>
            <Picker.Item label="Select Department" value="" />
            {departments.map((dept) => (
              <Picker.Item key={dept} label={dept} value={dept} />
            ))}
          </Picker>
        </View>

        {/* Password */}
        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('StudentLogin')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
    marginTop: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentSignup;