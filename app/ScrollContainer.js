// components/ScrollContainer.js
import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';

const ScrollContainer = ({ children, contentContainerStyle = {}, refreshing, onRefresh }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={false}
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