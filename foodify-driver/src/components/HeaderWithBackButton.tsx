import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';

interface HeaderWithBackButtonProps {
  title: string;
  onBack?: () => void;
  showBorder?: boolean;
  titleMarginLeft?: number;

}

const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({
  title,
  onBack,
  showBorder = false,
  titleMarginLeft=s(60),
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        showBorder && styles.withBorder,
      ]}
    >
      <TouchableOpacity
        onPress={handleBack}
        activeOpacity={0.8}
        style={styles.backButton}
      >
        <ArrowLeft color="#CA251B" size={s(26)} />
      </TouchableOpacity>

      <Text style={[styles.title, { marginLeft: titleMarginLeft }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};

export default HeaderWithBackButton;

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '16@s',
    paddingTop: '20@vs',
    paddingBottom: '12@vs',
    backgroundColor: '#FFFFFF',
  },
  withBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@s',
    borderWidth: 1,
    borderColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#17213A',
  },
});
