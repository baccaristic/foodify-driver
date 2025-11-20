import React, { JSX, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { moderateScale, verticalScale, s } from 'react-native-size-matters';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    IdCard,
    Upload,
    Hourglass,
    Check,
    PlugZap,
    Gavel,
    Camera,
    Briefcase,
    AlertCircle,
} from 'lucide-react-native';
import { UploadStep } from '../../../types/upload';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDriverDocuments } from '../../../services/driverService';
import type { DriverVerificationSummaryDto, DriverDocumentDto, DriverDocumentType } from '../../../types/driver';

// Base step configuration with UI metadata
const baseSteps: Omit<UploadStep, 'status'>[] = [
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
        documentType: 'ID_CARD',
    },
    {
        id: 2,
        title: 'Picture',
        description: "Please upload a clear photo of yourself, make sure your face is fully visible.",
        icon: Camera,
        type: 'single-image',
        uploadFields: [{ key: 'photo', label: 'Upload your picture' }],
        documentType: 'PROFILE_PICTURE',
    },
    {
        id: 3,
        title: 'Bulletin N°3',
        description: "Please upload a clear photo of your B3 or a scanned document. Ensure all details are visible and legible.",
        icon: Gavel,
        type: 'single-image',
        uploadFields: [{ key: 'b3', label: 'Upload your B3' }],
        documentType: 'BULLETIN_N3',
    },
    {
        id: 4,
        title: 'Electricity or Water Bill',
        description: "Please upload a clear photo of an electricity or water bill. Ensure all details are visible and legible.",
        icon: PlugZap,
        type: 'single-image',
        uploadFields: [{ key: 'bill', label: 'Upload your bill' }],
        documentType: 'UTILITY_BILL',
    },
    {
        id: 5,
        title: 'Patent Number',
        description: "Please upload a clear photo of your patent number proof.",
        icon: Briefcase,
        type: 'single-image',
        uploadFields: [{ key: 'patent', label: 'Upload your patent proof' }],
        documentType: 'PATENT_NUMBER',
    },
];

/**
 * Map document state from API to UI status
 */
const mapDocumentStateToStatus = (state: string): 'check' | 'pending' | 'upload' => {
    switch (state) {
        case 'APPROVED':
            return 'check';
        case 'PENDING_REVIEW':
            return 'pending';
        case 'REJECTED':
        case 'MISSING':
        default:
            return 'upload';
    }
};

export default function ProfileCompletionScreen(): JSX.Element {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<DriverVerificationSummaryDto | null>(null);
    const [steps, setSteps] = useState<UploadStep[]>([]);

    // Fetch document verification status
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDriverDocuments();
            setSummary(data);

            // Map API documents to UI steps
            const updatedSteps = baseSteps.map((baseStep) => {
                const apiDoc = data.documents.find(
                    (doc: DriverDocumentDto) => doc.type === baseStep.documentType
                );

                return {
                    ...baseStep,
                    status: apiDoc ? mapDocumentStateToStatus(apiDoc.state) : 'upload',
                    rejectionReason: apiDoc?.rejectionReason || undefined,
                } as UploadStep;
            });

            setSteps(updatedSteps);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to load document status. Please try again.');
            
            // Fallback to default steps if API fails
            setSteps(baseSteps.map(step => ({ ...step, status: 'upload' as const })));
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh on initial mount
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Refresh when screen comes into focus (e.g., after uploading a document)
    useFocusEffect(
        useCallback(() => {
            fetchDocuments();
        }, [fetchDocuments])
    );

    const completed = summary?.approvedDocuments || 0;
    const total = summary?.totalDocuments || 5;
    
    const handleSubmit = () => {
        if (summary?.status === 'APPROVED') {
            navigation.navigate('DashboardScreen');
        }
    };

    if (loading) {
        return (
            <View style={[styles.screen, styles.centerContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <ActivityIndicator size="large" color="#CA251B" />
                <Text style={styles.loadingText}>Loading verification status...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <HeaderWithBackButton title="WELCOME BACK, RIDER" titleMarginLeft={s(40)} />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {error && (
                        <View style={styles.errorContainer}>
                            <AlertCircle color="#CA251B" size={20} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Text style={styles.subHeader}>
                        Complete your profile infos and start earning
                    </Text>

                    <Text style={styles.progressText}>
                        {completed} of {total} steps completed
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[styles.progressFill, { width: `${(completed / total) * 100}%` }]}
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
                            <View key={step.id}>
                                <TouchableOpacity
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
                                {step.rejectionReason && (
                                    <View style={styles.rejectionContainer}>
                                        <AlertCircle color="#CA251B" size={16} />
                                        <Text style={styles.rejectionText}>{step.rejectionReason}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={[
                            styles.continueBtn,
                            { backgroundColor: summary?.status === 'APPROVED' ? '#17213A' : '#9CA3AF' },
                        ]}
                        onPress={handleSubmit}
                        disabled={summary?.status !== 'APPROVED'}
                    >
                        <Text style={styles.continueText}>
                            {summary?.status === 'APPROVED' ? 'Continue' : 'Complete all documents to continue'}
                        </Text>
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#17213A',
        fontSize: moderateScale(14),
    },
    container: {
        backgroundColor: '#FFF',
        paddingHorizontal: s(16),
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        flex: 1,
        color: '#CA251B',
        fontSize: moderateScale(13),
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
    rejectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: -5,
        gap: 8,
    },
    rejectionText: {
        flex: 1,
        color: '#CA251B',
        fontSize: moderateScale(12),
    },
    continueBtn: {
        marginTop: 24,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    continueText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
