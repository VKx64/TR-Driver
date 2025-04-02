import { View, Text, SafeAreaView } from 'react-native';
import React from 'react';
import PageHeader from '../../components/PageHeader';

const Maintenance = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Use the PageHeader component */}
      <PageHeader title="Truck Maintenance" />

      {/* Main Content */}
      <View className="flex-1 p-4">

      </View>
    </SafeAreaView>
  );
};

export default Maintenance;