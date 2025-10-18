import React, { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { moderateScale, verticalScale, s } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import {
    IdCard,
    User,
    FileText,
    FileBadge,
    Landmark,
    Upload,
    CheckCircle2,
    Clock,
    Hourglass,
    Check,
    PlugZap,
    Gavel,
    Camera,
    Briefcase,
} from 'lucide-react-native';
import { UploadStep } from '../../../types/upload';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const steps: UploadStep[] = [
    {
        id: 1,
        title: 'ID Card',
        description: "Please upload a clear photo of the front and back of your driver's license. Ensure all details are visible and legible.",
        icon: IdCard,
        type: 'dual-image',
        uploadFields: [
            { key: 'front', label: 'Upload front side' },
            { key: 'back', label: 'Upload back side' },
        ],
        status: 'check',
    },
    {
        id: 2,
        title: 'Picture',
        description: "Please upload a clear photo you , make sure your face is fully covered",
        icon: Camera,
        type: 'single-image',
        uploadFields: [{ key: 'photo', label: 'Upload your picture' }],
        status: 'check',
    },
    {
        id: 3,
        title: 'Bulletin N°3',
        description: "Please upload a clear photo of your B3 or a scanned document. Ensure all details are visible and legible.",
        icon: Gavel,
        type: 'single-image',
        uploadFields: [{ key: 'b3', label: 'Upload your B3' }],
        status: 'pending',
    },
    {
        id: 4,
        title: 'Electricity or Water Bill',
        description: "Please upload a clear photo of an electricity or water bill. Ensure all details are visible and legible.",
        icon: PlugZap,
        type: 'single-image',
        uploadFields: [{ key: 'bill', label: 'Upload your bill' }],
        status: 'upload',
    },
    {
        id: 5,
        title: 'Patent Number',
        description: "Please fill this field with your patent number.",
        icon: Briefcase,
        type: 'text',
        uploadFields: [],
        status: 'upload',
    },
];

export default function ProfileCompletionScreen(): JSX.Element {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const completed = steps.filter((s) => s.status === 'check').length;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <HeaderWithBackButton title="WELCOME BACK, RIDER" titleMarginLeft={s(40)} />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.subHeader}>
                        Complete your profile infos and start earning
                    </Text>

                    <Text style={styles.progressText}>
                        {completed} of {steps.length} steps completed
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[styles.progressFill, { width: `${(completed / steps.length) * 100}%` }]}
                        />
                    </View>

                    {steps.map((step) => {
                        const IconComp = step.icon;
                        const StatusIcon =
                            step.status === 'check'
                                ? Check
                                : step.status === 'pending'
                                    ? Hourglass
                                    : Upload;

                        const bgColor =
                            step.status === 'check'
                                ? '#3BCA1B'
                                : step.status === 'pending'
                                    ? '#17213A'
                                    : '#CA251B';

                        return (
                            <TouchableOpacity
                                key={step.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('UploadStepScreen', step)}
                            >
                                <View style={styles.cardLeft}>
                                    <View style={styles.iconCircle}>
                                        <IconComp color="#CA251B" size={26} />
                                    </View>
                                    <Text style={styles.cardTitle}>{step.title}</Text>
                                </View>
                                <View style={[styles.statusButton, { backgroundColor: bgColor }]}>
                                    <Text style={styles.statusText}>
                                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                                    </Text>
                                    <StatusIcon color="#FFF" size={20} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity
                        style={[
                            styles.continueBtn,
                            { backgroundColor: completed === steps.length ? '#17213A' : '#9CA3AF' },
                        ]}
                        disabled={completed !== steps.length}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        backgroundColor: '#FFF',
        paddingHorizontal: s(16),
    },
    subHeader: {
        textAlign: 'center',
        color: '#17213A',
        marginBottom: 20,
        fontSize: moderateScale(12),
        fontWeight: '400',
    },
    progressText: { color: '#17213A', fontSize: 13, marginBottom: 10, marginTop: moderateScale(15) },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        marginBottom: 20,
    },
    progressFill: { height: 6, backgroundColor: '#CA251B', borderRadius: 6 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E6E8EB',
        elevation: 2,
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    iconCircle: {
        width: moderateScale(46),
        height: verticalScale(40),
        borderRadius: 42,
        backgroundColor: '#FDE4E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        color: '#CA251B', fontWeight: '700', fontSize: 15, maxWidth: moderateScale(140),
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(10),
        alignSelf: 'center',
        gap: 4,
    },
    statusText: { color: '#FFF', fontWeight: '500', fontSize: 12 },
    continueBtn: {
        marginTop: 24,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    continueText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
