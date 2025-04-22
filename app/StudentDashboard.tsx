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
    image: 'https://www.reliancefoundation.org/images/rf-scholarship-logo.png',
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
    image: 'https://www.abbvie.com/content/dam/abbvie-dotcom/images/careers/abbvie-scholarship-program.jpg',
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
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [recommendedScholarships, setRecommendedScholarships] = useState([]);
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

  const openScholarshipDetails = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowScholarshipModal(true);
  };

  const renderStatusBadge = (status) => {
    const colors = {
      Pending: '#FFC107',
      Approved: '#4CAF50',
      Rejected: '#F44336'
    };
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors[status] }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
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
          <View key={app._id || index} style={styles.applicationCard}>
            <Text style={styles.scholarshipName}>{app.scholarshipName || 'Scholarship Application'}</Text>
            
            <View style={styles.statusRow}>
              {renderStatusBadge(app.status)}
              <Text style={styles.dateText}>
                Submitted: {new Date(app.submittedAt).toLocaleDateString()}
              </Text>
            </View>

            {app.status === 'Rejected' && app.remarks && (
              <View style={styles.remarksContainer}>
                <Text style={styles.remarksTitle}>Faculty Remarks:</Text>
                <Text style={styles.remarksText}>{app.remarks}</Text>
              </View>
            )}

            <View style={styles.linksContainer}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(app.applicationLink)}
              >
                <Icon name="description" size={20} color="#fff" />
                <Text style={styles.linkText}>Application</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(app.incomeCertificateLink)}
              >
                <Icon name="receipt" size={20} color="#fff" />
                <Text style={styles.linkText}>Certificate</Text>
              </TouchableOpacity>
            </View>

            {app.status === 'Rejected' && (
              <TouchableOpacity
                style={styles.resubmitButton}
                onPress={() => navigation.navigate('ApplicationSubmission')}
              >
                <Text style={styles.resubmitText}>Resubmit Application</Text>
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
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

        {renderApplicationStatus()}

        <TouchableOpacity
          style={[styles.button, styles.actionButton]}
          onPress={() => navigation.navigate('ApplicationSubmission')}
        >
          <Text style={styles.buttonText}>Submit New Application</Text>
        </TouchableOpacity>

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
              
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.scholarshipModalContent}
              >
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
                  {selectedScholarship.eligibility.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.scholarshipDetailSection}>
                  <Text style={styles.scholarshipDetailHeading}>Steps to Apply</Text>
                  {selectedScholarship.stepsToApply.map((item, index) => (
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
                  <ScrollView 
                    style={styles.recommendationsScroll}
                    contentContainerStyle={styles.recommendationsContainer}
                  >
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
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
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendButton: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  scholarshipName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  remarksContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  remarksTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#E65100',
  },
  remarksText: {
    color: '#555',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    width: '48%',
    justifyContent: 'center',
  },
  linkText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  resubmitButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  resubmitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
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
  recommendationsScroll: {
    width: '100%',
  },
  recommendationsContainer: {
    paddingBottom: 15,
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
  scholarshipModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalScrollView: {
    flex: 1,
  },
  scholarshipModalContent: {
    padding: 20,
  },
  modalCloseButton: {
    padding: 15,
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