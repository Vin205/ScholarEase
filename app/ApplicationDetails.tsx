import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Alert,
  ActivityIndicator 
} from 'react-native';

const ApplicationDetails = ({ route }) => {
  const { application } = route.params;
  const [loading, setLoading] = useState({ type: null, loading: false });

  const handleOpenPdf = async (type) => {
    const filePath = type === 'application' 
      ? application.applicationFile 
      : application.incomeCertificateFile;
    
    if (!filePath) {
      Alert.alert('Error', `${type === 'application' ? 'Application' : 'Income Certificate'} not found`);
      return;
    }

    try {
      setLoading({ type, loading: true });
      const pdfUrl = `http://localhost:5000${filePath}`;
      
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Error', 'No PDF viewer available');
      }
    } catch (error) {
      console.error('PDF Opening Error:', error);
      Alert.alert('Error', 'Failed to open PDF');
    } finally {
      setLoading({ type: null, loading: false });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Application Details</Text>
        
        <DetailField label="Name" value={application.name} />
        <DetailField label="Department" value={application.department} />
        <DetailField label="Class" value={`${application.className} - ${application.div}`} />
        <DetailField 
          label="Status" 
          value={application.status || 'Pending'} 
          isStatus 
          status={application.status}
        />
        
        {application.remarks && (
          <DetailField label="Remarks" value={application.remarks} isRemark />
        )}

        <PdfButton
          title="View Application PDF"
          loading={loading.type === 'application' && loading.loading}
          onPress={() => handleOpenPdf('application')}
        />

        <PdfButton
          title="View Income Certificate"
          loading={loading.type === 'income' && loading.loading}
          onPress={() => handleOpenPdf('income')}
        />
      </View>
    </ScrollView>
  );
};

// Reusable Components
const DetailField = ({ label, value, isStatus = false, isRemark = false, status }) => (
  <View style={styles.detailField}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={[
      styles.value,
      isStatus && styles.statusText,
      isStatus && status === 'Approved' && styles.approved,
      isStatus && status === 'Rejected' && styles.rejected,
      isRemark && styles.remarks
    ]}>
      {value}
    </Text>
  </View>
);

const PdfButton = ({ title, loading, onPress }) => (
  <TouchableOpacity
    style={[styles.pdfButton, loading && styles.disabledButton]}
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.pdfButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    minHeight: '100%'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  detailField: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5
  },
  value: {
    fontSize: 16,
    color: '#333'
  },
  statusText: {
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  approved: {
    color: '#4CAF50'
  },
  rejected: {
    color: '#F44336'
  },
  remarks: {
    fontStyle: 'italic',
    color: '#666'
  },
  pdfButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center'
  },
  disabledButton: {
    opacity: 0.7
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default ApplicationDetails;