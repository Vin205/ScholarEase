import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api';

export default function ApplicationSubmission() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    applicationLink: '',
    incomeCertificateLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setStudentData(parsedData);
          setFormData(prev => ({
            ...prev,
            name: parsedData.name,
            department: parsedData.department,
            year: parsedData.className
          }));
        }
      } catch (error) {
        console.error('Error loading student data:', error);
      }
    };
    loadStudentData();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.department || !formData.year || 
        !formData.applicationLink || !formData.incomeCertificateLink) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Validate Google Drive links
    if (!formData.applicationLink.includes('drive.google.com') || 
        !formData.incomeCertificateLink.includes('drive.google.com')) {
      Alert.alert('Error', 'Please provide valid Google Drive links');
      return;
    }

    setLoading(true);

    try {
      if (!studentData) throw new Error('Student data not found');
      
      const response = await API.submitApplication({
        studentId: studentData._id,
        ...formData
      });
      
      Alert.alert('Success', 'Application submitted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const openLinkGuide = () => {
    Linking.openURL('https://support.google.com/drive/answer/2494822');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Scholarship Application</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Department</Text>
        <TextInput
          style={styles.input}
          value={formData.department}
          onChangeText={(text) => setFormData({...formData, department: text})}
          placeholder="Enter your department"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={formData.year}
          onChangeText={(text) => setFormData({...formData, year: text})}
          placeholder="Enter your current year"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Application Form Link (Google Drive)
          <Text style={styles.helpText} onPress={openLinkGuide}> (How to share?)</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.applicationLink}
          onChangeText={(text) => setFormData({...formData, applicationLink: text})}
          placeholder="Paste Google Drive shareable link"
          keyboardType="url"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Income Certificate Link (Google Drive)
          <Text style={styles.helpText} onPress={openLinkGuide}> (How to share?)</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.incomeCertificateLink}
          onChangeText={(text) => setFormData({...formData, incomeCertificateLink: text})}
          placeholder="Paste Google Drive shareable link"
          keyboardType="url"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!formData.name || !formData.department || !formData.year || 
           !formData.applicationLink || !formData.incomeCertificateLink) && styles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!formData.name || !formData.department || !formData.year || 
                 !formData.applicationLink || !formData.incomeCertificateLink || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Application</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50'
  },
  formGroup: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3498db'
  },
  helpText: {
    color: '#3498db',
    textDecorationLine: 'underline',
    fontSize: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#bdc3c7'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});