import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface Component1Props {
  title: string;
  description: string;
}

const Component1 = ({ title, description }: Component1Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
};

export default Component1;