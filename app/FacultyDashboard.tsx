import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Modal,
  Pressable,
  TextInput,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api';

const FacultyDashboard = () => {
  const navigation = useNavigation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentApp, setCurrentApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await API.getApplications();
      setApplications(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch applications');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchApplications();
    });
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const approveApplication = async (studentId, applicationId) => {
    try {
      const response = await API.updateApplicationStatus(studentId, applicationId, { 
        status: 'Approved',
        remarks: 'Application approved by faculty'
      });
      
      // Optimistic UI update
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? { 
          ...app, 
          status: 'Approved',
          remarks: 'Application approved by faculty',
          updatedAt: new Date().toISOString()
        } : app
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to approve application');
      fetchApplications();
    }
  };

  const rejectApplication = async () => {
    if (!rejectionReason) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      const response = await API.updateApplicationStatus(currentApp.studentId, currentApp._id, { 
        status: 'Rejected',
        remarks: rejectionReason
      });
      
      // Optimistic UI update
      setApplications(prev => prev.map(app => 
        app._id === currentApp._id ? { 
          ...app, 
          status: 'Rejected',
          remarks: rejectionReason,
          updatedAt: new Date().toISOString()
        } : app
      ));
      
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject application');
      fetchApplications();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Student Applications</Text>
        <TouchableOpacity onPress={async () => {
          await API.clearAuthToken();
          navigation.navigate('FacultyLogin');
        }}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.scholarshipName}>{item.name || 'Scholarship Application'}</Text>
            
            {item.applicationImage && (
              <Image 
                source={{ uri: item.applicationImage }} 
                style={styles.applicationImage}
                resizeMode="contain"
              />
            )}

            <Text style={styles.studentName}>Student: {item.studentName}</Text>
            <Text style={styles.detail}>Department: {item.department}</Text>
            <Text style={styles.detail}>Year: {item.year}</Text>
            <Text style={styles.detail}>Roll No: {item.studentRollNo}</Text>
            
            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel}>Application:</Text>
              <TouchableOpacity onPress={() => openLink(item.applicationLink)}>
                <Text style={styles.linkText}>View Application</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel}>Income Certificate:</Text>
              <TouchableOpacity onPress={() => openLink(item.incomeCertificateLink)}>
                <Text style={styles.linkText}>View Certificate</Text>
              </TouchableOpacity>
            </View>

            <View style={[
              styles.statusBadge,
              item.status === 'Approved' && styles.approvedBadge,
              item.status === 'Rejected' && styles.rejectedBadge,
              item.status === 'Pending' && styles.pendingBadge
            ]}>
              <Text style={styles.statusText}>Status: {item.status}</Text>
            </View>

            {item.status === 'Pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.approveButton]}
                  onPress={() => approveApplication(item.studentId, item._id)}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => {
                    setCurrentApp(item);
                    setShowRejectModal(true);
                  }}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.remarks && (
              <View style={styles.remarksContainer}>
                <Text style={styles.remarksLabel}>Faculty Remarks:</Text>
                <Text style={styles.remarksText}>{item.remarks}</Text>
              </View>
            )}
          </View>
        )}
      />

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reason for Rejection</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rejection..."
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={rejectApplication}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3498db'
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  logoutText: {
    color: '#fff',
    fontSize: 16
  },
  listContent: {
    padding: 10
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  scholarshipName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center'
  },
  applicationImage: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    borderRadius: 5
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
    color: '#555'
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  linkLabel: {
    fontSize: 14,
    marginRight: 5,
    color: '#555'
  },
  linkText: {
    color: '#3498db',
    textDecorationLine: 'underline'
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#e0e0e0'
  },
  approvedBadge: {
    backgroundColor: '#4CAF50'
  },
  rejectedBadge: {
    backgroundColor: '#f44336'
  },
  pendingBadge: {
    backgroundColor: '#FFC107'
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5
  },
  approveButton: {
    backgroundColor: '#4CAF50'
  },
  rejectButton: {
    backgroundColor: '#f44336'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  remarksContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5
  },
  remarksLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555'
  },
  remarksText: {
    color: '#333'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50'
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 15,
    textAlignVertical: 'top'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#e0e0e0'
  },
  submitButton: {
    backgroundColor: '#f44336'
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default FacultyDashboard;