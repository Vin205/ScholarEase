
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import API from './api';
import Layout from './_layout';

// Scholarship data with detailed information
const SCHOLARSHIP_DATA = [
  {
    id: 1,
    name: 'MahaDBT Scholarship',
    image: 'https://enggsolution.com/faculty/imgs/news/Mahadbt%20scholarship%202022.png',
    link: 'https://mahadbt.maharashtra.gov.in/',
    categories: ['OPEN', 'OBC', 'EBC', 'EWS', 'SC', 'NT'],
    genders: ['Male', 'Female', 'Other'],
    maxIncome: 800000,
    description: 'Government of Maharashtra scholarship for all categories of students pursuing higher education.',
    eligibility: [
      'Must be a domicile of Maharashtra',
      'Pursuing undergraduate studies in recognized institutions',
      'Family income should not exceed ₹8 Lakhs',
      'Minimum 50% marks in previous examination'
    ],
    stepsToApply: [
      'Register on MahaDBT portal',
      'Fill the application form with required details',
      'Upload necessary documents (Income certificate, caste certificate if applicable)',
      'Submit the application before deadline',
      'Track application status online'
    ],
    deadline: '31 October 2023'
  },
  {
    id: 2,
    name: 'Reliance Foundation Scholarship',
    image: 'data:image/png;base64,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',
    link: 'https://www.reliancefoundation.org/scholarships',
    categories: ['OPEN', 'OBC'],
    genders: ['Male', 'Female', 'Other'],
    maxIncome: 600000,
    description: 'Merit-cum-means scholarship for students pursuing higher education in STEM fields.',
    eligibility: [
      'Indian nationality',
      'Pursuing 1st year of undergraduate studies in STEM fields',
      'Minimum 60% marks in 12th standard',
      'Family income should not exceed ₹6 Lakhs',
      'Admitted to a recognized college/university'
    ],
    stepsToApply: [
      'Register on Reliance Foundation portal',
      'Complete the online application form',
      'Upload mark sheets and income proof',
      'Submit before deadline',
      'Shortlisted candidates will be called for interview'
    ],
    deadline: '15 September 2023'
  },
  {
    id: 3,
    name: 'ABB Scholarship',
    image: 'data:image/jpeg;base64,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',
    link: 'https://www.abbvie.com/scholarships',
    categories: ['OPEN', 'OBC', 'SC', 'NT'],
    genders: ['Female'],
    maxIncome: 500000,
    description: 'Scholarship for female students pursuing engineering education in Maharashtra.',
    eligibility: [
      'Female candidates only',
      'Pursuing engineering degree in recognized institutions',
      'Family income should not exceed ₹5 Lakhs',
      'Minimum 75% marks in 12th standard',
      'No backlog in any subject'
    ],
    stepsToApply: [
      'Download application form from ABB website',
      'Fill the form and attach required documents',
      'Submit to nearest ABB office or email',
      'Selection based on merit and interview',
      'Scholarship disbursed directly to institute'
    ],
    deadline: '30 November 2023'
  }
];

const StudentDashboard = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [recommendedScholarships, setRecommendedScholarships] = useState<any[]>([]);
  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('Male');
  const [income, setIncome] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString);
        setUserData(parsedUserData);
        
        const response = await API.getStudentApplications();
        
        if (response && response.applications) {
          setApplications(response.applications);
        } else {
          setApplications([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load application data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const recommendScholarships = () => {
    if (!income || isNaN(parseInt(income))) {
      Alert.alert('Error', 'Please enter a valid income amount');
      return;
    }

    const incomeValue = parseInt(income);
    const filtered = SCHOLARSHIP_DATA.filter(scholarship => 
      scholarship.categories.includes(category) &&
      scholarship.genders.includes(gender) &&
      incomeValue <= scholarship.maxIncome
    );

    setRecommendedScholarships(filtered);
    setShowRecommendationModal(true);
  };

  const openScholarshipDetails = (scholarship: any) => {
    setSelectedScholarship(scholarship);
    setShowScholarshipModal(true);
  };

  const renderApplicationStatus = () => {
    if (applications.length === 0) {
      return (
        <View style={[styles.statusContainer, styles.noApplication]}>
          <Text style={styles.statusTitle}>No Application Submitted</Text>
          <Text style={styles.statusText}>
            You haven't submitted any scholarship applications yet.
          </Text>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => navigation.navigate('ApplicationSubmission')}
          >
            <Text style={styles.buttonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.applicationsContainer}>
        <Text style={styles.applicationsTitle}>Your Applications</Text>
        {applications.map((app, index) => (
          <View 
            key={app._id}
            style={[
              styles.applicationCard,
              app.status === 'Approved' && styles.approvedCard,
              app.status === 'Rejected' && styles.rejectedCard,
              app.status === 'Pending' && styles.pendingCard
            ]}
          >
            <Text style={styles.applicationNumber}>Application #{applications.length - index}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[
                styles.statusValue,
                app.status === 'Approved' && styles.statusApproved,
                app.status === 'Rejected' && styles.statusRejected
              ]}>
                {app.status}
              </Text>
            </View>

            {app.remarks && (
              <View style={styles.remarksContainer}>
                <Text style={styles.remarksLabel}>Faculty Remarks:</Text>
                <Text style={styles.remarksText}>{app.remarks}</Text>
              </View>
            )}

            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Submitted:</Text>
              <Text style={styles.dateValue}>
                {new Date(app.submittedAt).toLocaleDateString('en-IN')}
              </Text>
            </View>

            {app.updatedAt && app.status !== 'Pending' && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  {app.status === 'Approved' ? 'Approved' : 'Rejected'}:
                </Text>
                <Text style={styles.dateValue}>
                  {new Date(app.updatedAt).toLocaleDateString('en-IN')}
                </Text>
              </View>
            )}

            <View style={styles.linksContainer}>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => Linking.openURL(app.applicationLink)}
              >
                <Text style={styles.linkButtonText}>View Application</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => Linking.openURL(app.incomeCertificateLink)}
              >
                <Text style={styles.linkButtonText}>View Certificate</Text>
              </TouchableOpacity>
            </View>

            {app.status === 'Rejected' && (
              <TouchableOpacity 
                style={styles.resubmitButton}
                onPress={() => navigation.navigate('ApplicationSubmission')}
              >
                <Text style={styles.resubmitButtonText}>Resubmit Application</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
          />
        }
      >
        {userData && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome, {userData.name}</Text>
            <Text style={styles.userInfo}>Department: {userData.department}</Text>
            <Text style={styles.userInfo}>Class: {userData.className} - {userData.div}</Text>
            <Text style={styles.userInfo}>Roll No: {userData.rollNo}</Text>
          </View>
        )}

        {/* Scholarship Recommendation Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scholarship Recommendation</Text>
          <Text style={styles.sectionSubtitle}>Find scholarships that match your profile</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.recommendButton]}
            onPress={() => setShowRecommendationModal(true)}
          >
            <Text style={styles.buttonText}>Get Recommendations</Text>
          </TouchableOpacity>
        </View>

        {/* Available Scholarships Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Available Scholarships</Text>
          <Text style={styles.sectionSubtitle}>Explore various scholarship opportunities</Text>
          
          {SCHOLARSHIP_DATA.map((scholarship) => (
            <View key={scholarship.id} style={styles.scholarshipItem}>
              <Image 
                source={{ uri: scholarship.image }} 
                style={styles.scholarshipThumbnail}
              />
              <View style={styles.scholarshipInfo}>
                <Text style={styles.scholarshipName}>{scholarship.name}</Text>
                <Text style={styles.scholarshipDesc} numberOfLines={2}>
                  {scholarship.description}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkEligibilityButton}
                onPress={() => openScholarshipDetails(scholarship)}
              >
                <Text style={styles.checkEligibilityText}>Check Eligibility</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Application Status Section */}
        {renderApplicationStatus()}

        {/* New Application Button */}
        <TouchableOpacity
          style={[styles.button, styles.actionButton]}
          onPress={() => navigation.navigate('ApplicationSubmission')}
        >
          <Text style={styles.buttonText}>Submit New Application</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={async () => {
            await API.clearAuthToken();
            navigation.reset({
              index: 0,
              routes: [{ name: 'StudentLogin' }],
            });
          }}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Scholarship Details Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showScholarshipModal}
          onRequestClose={() => setShowScholarshipModal(false)}
        >
          {selectedScholarship && (
            <View style={styles.scholarshipModalContainer}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowScholarshipModal(false)}
              >
                <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              
              <ScrollView style={styles.scholarshipModalContent}>
                <Image 
                  source={{ uri: selectedScholarship.image }} 
                  style={styles.scholarshipModalImage}
                />
                
                <Text style={styles.scholarshipModalTitle}>{selectedScholarship.name}</Text>
                
                <View style={styles.scholarshipDetailSection}>
                  <Text style={styles.scholarshipDetailHeading}>Description</Text>
                  <Text style={styles.scholarshipDetailText}>
                    {selectedScholarship.description}
                  </Text>
                </View>
                
                <View style={styles.scholarshipDetailSection}>
                  <Text style={styles.scholarshipDetailHeading}>Eligibility Criteria</Text>
                  {selectedScholarship.eligibility.map((item: string, index: number) => (
                    <View key={index} style={styles.listItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.scholarshipDetailSection}>
                  <Text style={styles.scholarshipDetailHeading}>Steps to Apply</Text>
                  {selectedScholarship.stepsToApply.map((item: string, index: number) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.stepNumber}>{index + 1}.</Text>
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.scholarshipDetailSection}>
                  <Text style={styles.scholarshipDetailHeading}>Application Deadline</Text>
                  <Text style={styles.scholarshipDetailText}>
                    {selectedScholarship.deadline}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.button, styles.applyButton]}
                  onPress={() => Linking.openURL(selectedScholarship.link)}
                >
                  <Text style={styles.buttonText}>Apply Now</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </Modal>

        {/* Recommendation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRecommendationModal}
          onRequestClose={() => setShowRecommendationModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Find Scholarships</Text>
              
              {recommendedScholarships.length === 0 ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category:</Text>
                    <Picker
                      selectedValue={category}
                      style={styles.picker}
                      onValueChange={(itemValue) => setCategory(itemValue)}
                    >
                      <Picker.Item label="OPEN" value="OPEN" />
                      <Picker.Item label="OBC" value="OBC" />
                      <Picker.Item label="EBC" value="EBC" />
                      <Picker.Item label="EWS" value="EWS" />
                      <Picker.Item label="SC" value="SC" />
                      <Picker.Item label="NT" value="NT" />
                    </Picker>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender:</Text>
                    <Picker
                      selectedValue={gender}
                      style={styles.picker}
                      onValueChange={(itemValue) => setGender(itemValue)}
                    >
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Annual Family Income (₹):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your family income"
                      keyboardType="numeric"
                      value={income}
                      onChangeText={setIncome}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, styles.recommendButton]}
                    onPress={recommendScholarships}
                  >
                    <Text style={styles.buttonText}>Find Scholarships</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <ScrollView style={styles.recommendationsList}>
                    {recommendedScholarships.map((scholarship, index) => (
                      <View key={index} style={styles.scholarshipCard}>
                        <Image 
                          source={{ uri: scholarship.image }} 
                          style={styles.scholarshipImage} 
                        />
                        <Text style={styles.scholarshipName}>{scholarship.name}</Text>
                        <TouchableOpacity
                          style={styles.scholarshipButton}
                          onPress={() => {
                            setSelectedScholarship(scholarship);
                            setShowRecommendationModal(false);
                            setShowScholarshipModal(true);
                          }}
                        >
                          <Text style={styles.scholarshipButtonText}>View Details</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowRecommendationModal(false);
                  setRecommendedScholarships([]);
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    margin: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    color: '#555',
    marginTop: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendButton: {
    backgroundColor: '#4CAF50',
  },
  infoButton: {
    backgroundColor: '#2196F3',
  },
  actionButton: {
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    margin: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicationsContainer: {
    margin: 15,
  },
  applicationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  applicationCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#9E9E9E',
  },
  approvedCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  rejectedCard: {
    borderLeftColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  pendingCard: {
    borderLeftColor: '#FFC107',
    backgroundColor: '#fff8e1',
  },
  applicationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    borderLeftWidth: 4,
  },
  noApplication: {
    borderLeftColor: '#9E9E9E',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#555',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusApproved: {
    color: '#2E7D32',
  },
  statusRejected: {
    color: '#C62828',
  },
  remarksContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
  },
  remarksLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  remarksText: {
    color: '#555',
    fontStyle: 'italic',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
  resubmitButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
  },
  resubmitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  recommendationsList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  scholarshipCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  scholarshipImage: {
    width: 100,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  scholarshipName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scholarshipButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  scholarshipButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scholarshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  scholarshipThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  scholarshipInfo: {
    flex: 1,
  },
  scholarshipName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scholarshipDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkEligibilityButton: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  checkEligibilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scholarshipModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    padding: 15,
  },
  scholarshipModalContent: {
    padding: 20,
  },
  scholarshipModalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  scholarshipModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scholarshipDetailSection: {
    marginBottom: 20,
  },
  scholarshipDetailHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scholarshipDetailText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#555',
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
  },
});

export default StudentDashboard;