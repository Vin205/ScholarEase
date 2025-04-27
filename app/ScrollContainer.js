// components/ScrollContainer.js
import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';

const ScrollContainer = ({ 
  children, 
  contentContainerStyle = {}, 
  refreshing, 
  onRefresh,
  style = {}
}) => {
  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={false}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default ScrollContainer;