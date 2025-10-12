import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DeleteAccountScreen() {
  const [step, setStep] = useState<'confirm' | 'deleting' | 'done'>('confirm');
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 'deleting') {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start();
    }
  }, [step]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleDelete = () => {
    if (!checked) return;
    setStep('deleting');
    setTimeout(() => setStep('done'), 2500);
  };

  const renderDeleting = () => (
    <View style={styles.deletingBox}>
      <ActivityIndicator color="#CA251B" size="large" />
      <Text allowFontScaling={false} style={styles.deletingTitle}>Deleting Your Account</Text>
      <Text allowFontScaling={false} style={styles.deletingText}>
        This may take a few moments. Please don’t close the app.
      </Text>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: widthInterpolated }]} />
      </View>
      <Text allowFontScaling={false} style={styles.deletingSubText}>
        You will be notified when the process is complete or if any issues arise
      </Text>
    </View>
  );

  const renderDone = () => (
    <View style={styles.deletingBox}>
      <CheckCircle2 size={82} color="#CA251B" />
      <Text allowFontScaling={false} style={styles.doneTitle}>Account Deleted</Text>
      <Text allowFontScaling={false} style={styles.doneText}>
        Your account and all associated data have been successfully deleted.
        You will be logged out automatically.
      </Text>
      <TouchableOpacity style={styles.okayButton}>
        <Text allowFontScaling={false} style={styles.okayText}>Okay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderWithBackButton title="Delete account & Data" titleMarginLeft={s(40)} />
      {step === 'confirm' ? (
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: '#FFFFFF' }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.warningBox, { backgroundColor: '#FAEAE9' }]}>
            <AlertTriangle size={70} color="#CA251B" />
            <Text allowFontScaling={false} style={styles.warningTitle}>This is Irreversible</Text>
            <Text allowFontScaling={false} style={styles.warningText}>
              Deleting your account will permanently remove all your data, including earnings,
              delivery history, and personal information.
            </Text>
          </View>

          <Text allowFontScaling={false} style={styles.confirmTitle}>Please confirm to continue</Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setChecked(!checked)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                { backgroundColor: checked ? '#CA251B' : 'transparent' },
              ]}
            />
            <Text allowFontScaling={false} style={styles.checkboxLabel}>
              I understand that deleting my account is permanent. All my data will be lost forever.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              { backgroundColor: checked ? '#CA251B' : '#FAEAE9' },
            ]}
            disabled={!checked}
            onPress={handleDelete}
          >
            <Text allowFontScaling={false} style={styles.deleteText}>Delete My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setChecked(false)}>
            <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : step === 'deleting' ? (
        renderDeleting()
      ) : (
        renderDone()
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: '16@s',
    paddingTop: '24@vs',
    backgroundColor: '#fff',
  },
  warningBox: {
    borderRadius: '12@ms',
    padding: '16@s',
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#CA251B',
    marginTop: '8@vs',
  },
  warningText: {
    fontSize: '14@ms',
    color: '#17213A',
    textAlign: 'center',
    marginTop: '6@vs',
    maxWidth: moderateScale(280),
  },
  confirmTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#17213A',
    marginTop: '20@vs',
    marginBottom: moderateScale(10),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: '12@vs',
  },
  checkbox: {
    width: '22@s',
    height: '22@s',
    borderWidth: 1.5,
    borderColor: '#CA251B',
    borderRadius: '6@ms',
    marginRight: '10@s',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: '14@ms',
    color: '#17213A',
  },
  deleteButton: {
    paddingVertical: '12@vs',
    paddingHorizontal: moderateScale(50),
    borderRadius: '10@ms',
    marginTop: '20@vs',
    alignSelf: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: '16@ms',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: '12@vs',
    backgroundColor: '#17213A',
    borderRadius: '10@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: moderateScale(94),
    alignSelf: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: '16@ms',
    fontWeight: '600',
  },
  deletingBox: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: vs(40),
    backgroundColor: '#fff',
    paddingHorizontal:vs(24),
  },
  deletingTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#CA251B',
    marginTop: '20@vs',
  },
  deletingText: {
    textAlign: 'center',
    fontSize: '16@ms',
    color: '#17213A',
    marginVertical: '10@vs',
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#FADADA',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#CA251B',
  },
  deletingSubText: {
    textAlign: 'center',
    fontSize: '16@ms',
    color: '#999',
  },
  doneTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#CA251B',
    marginTop: '16@vs',
  },
  doneText: {
    textAlign: 'center',
    fontSize: '15@ms',
    color: '#17213A',
    marginTop: '8@vs',
    lineHeight: 20,
    maxWidth: moderateScale(300),
  },
  okayButton: {
    backgroundColor: '#17213A',
    borderRadius: '10@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '80@s',
    marginTop: '24@vs',
  },
  okayText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: '18@ms',
  },
});
