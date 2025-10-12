import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { User, Phone, Mail, Lock, Star, Languages, ChevronRight } from 'lucide-react-native';
import ModifyNameOverlay from '../../../components/ProfilSettings/ModifyNameOverlay';
import ModifyEmailOverlay from '../../../components/ProfilSettings/ModifyEmailOverlay';
import ModifyPhoneOverlay from '../../../components/ProfilSettings/ModifyPhoneOverlay';
import ModifyPasswordOverlay from '../../../components/ProfilSettings/ModifyPasswordOverlay';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { useAuth } from '../../../contexts/AuthContext';
import LetteredAvatar from '../../../components/ProfilSettings/LetteredAvatar';
import { moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
};

const ProfileSettingsScreen = () => {
  const { user } = useAuth();
  const displayName = user?.name ?? 'Flen Foulani';
  const displayEmail = user?.email ?? 'flenfoulani@email.com';
  const displayPhone = user?.phone ?? '987654432';

  const [visibleOverlay, setVisibleOverlay] = useState<string | null>(null);
  const insets = useSafeAreaInsets();


  const openOverlay = (type: string) => setVisibleOverlay(type);
  const closeOverlay = () => setVisibleOverlay(null);

  return (
    <View style={[styles.screen, {
      paddingTop: insets.top, paddingBottom: insets.bottom
    },]}>
      <HeaderWithBackButton title="Profile Settings" titleMarginLeft={s(70)} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <LetteredAvatar name={displayName} size={80} />
        </View>


        <Text allowFontScaling={false} style={styles.sectionTitle}>Personal informations</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <User size={20} color={palette.accent} />
              <Text allowFontScaling={false} style={styles.infoText}>{displayName}</Text>
            </View>
            <TouchableOpacity style={styles.modifyButton} onPress={() => openOverlay('name')}>
              <Text allowFontScaling={false} style={styles.modifyText}>Modify</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Phone size={20} color={palette.accent} />
              <Text allowFontScaling={false} style={styles.infoText}>{displayPhone}</Text>
            </View>
            <TouchableOpacity style={styles.modifyButton} onPress={() => openOverlay('phone')}>
              <Text allowFontScaling={false} style={styles.modifyText}>Modify</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Mail size={20} color={palette.accent} />
              <Text allowFontScaling={false} style={styles.infoText}>{displayEmail}</Text>
            </View>
            <TouchableOpacity style={styles.modifyButton} onPress={() => openOverlay('email')}>
              <Text allowFontScaling={false} style={styles.modifyText} numberOfLines={1}
              >Modify</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.infoRow} onPress={() => openOverlay('password')}>
            <View style={styles.infoLeft}>
              <Lock size={20} color={palette.accent} />
              <Text allowFontScaling={false} style={styles.infoText}>Change Password</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text allowFontScaling={false} style={styles.sectionTitle}>Other</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
            <View style={styles.infoLeft}>
              <Star size={20} color={palette.accent} />
              <Text allowFontScaling={false} style={styles.infoText}>Points & Level</Text>
            </View>
            <ChevronRight size={s(18)} color={palette.accent} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
            <View style={styles.infoLeft}>
              <Languages size={20} color={palette.accent} />
              <Text allowFontScaling={false} style={styles.infoText}>Language</Text>
            </View>
            <ChevronRight size={s(18)} color={palette.accent} />
          </TouchableOpacity>
        </View>
      </ScrollView>


      <Modal visible={visibleOverlay === 'name'} animationType="slide" transparent>
        <ModifyNameOverlay onClose={closeOverlay} />
      </Modal>
      <Modal visible={visibleOverlay === 'email'} animationType="slide" transparent>
        <ModifyEmailOverlay onClose={closeOverlay} />
      </Modal>
      <Modal visible={visibleOverlay === 'phone'} animationType="slide" transparent>
        <ModifyPhoneOverlay onClose={closeOverlay} />
      </Modal>
      <Modal visible={visibleOverlay === 'password'} animationType="slide" transparent>
        <ModifyPasswordOverlay onClose={closeOverlay} />
      </Modal>
    </View >

  );
};

const styles = ScaledSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1, backgroundColor: '#FFFFFF', borderTopColor: '#F9FAFB',
    borderColor: '#F9FAFB',
    borderTopWidth: 2,
    borderBottomWidth: 0,
  },
  scrollContent: { paddingHorizontal: '16@s', paddingVertical: '12@vs' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    alignItems: 'center',
    padding: '8@vs',
    marginBottom: '8@vs',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  userName: { color: palette.accentDark, fontWeight: '700', fontSize: '16@ms' },
  sectionTitle: { color: palette.accent, fontSize: '18@ms', fontWeight: '700', marginVertical: '10@vs' },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    paddingVertical: '10@vs',
    paddingHorizontal: '14@s',
    marginBottom: '20@vs',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '10@vs' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: '6@s' },
  infoText: {
    color: palette.accentDark,
    fontSize: '14@ms',
    fontWeight: '600',
    maxWidth: '90%',
  }, modifyButton: {
    backgroundColor: palette.accent,
    paddingVertical: '4@vs',
    paddingHorizontal: '16@s',
    borderRadius: '20@ms',
  },
  modifyText: { color: '#FFFFFF', fontSize: '13@ms', fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5E5' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: '12@vs' },
});

export default ProfileSettingsScreen;
