import { Bell, MailOpen } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function NotificationsScreen() {
    const [loading, setLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(false);
    const [offersPush, setOffersPush] = useState(false);
    const [offersEmail, setOffersEmail] = useState(false);
    const insets = useSafeAreaInsets();


    const handleEnableAll = () => {
        setLoading(true);
        setTimeout(() => {
            setOrderStatus(true);
            setOffersPush(true);
            setOffersEmail(true);
            setLoading(false);
        }, 1200);
    };



    return (
        <View style={[styles.screen, {
            paddingTop: insets.top, paddingBottom: insets.bottom
        },]}>
            <HeaderWithBackButton title="Notifications" titleMarginLeft={s(70)} />

            <ScrollView style={styles.container}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator color="#CA251B" size="large" />
                    </View>
                )}

                <View style={styles.headerBox}>
                    <Text allowFontScaling={false} style={styles.headerTitle}>Stay in the Loop — Get Real-Time Updates!</Text>
                    <Text allowFontScaling={false} style={styles.headerText}>
                        Turn on notifications to never miss order updates, delivery alerts, or exclusive deals.
                        You’re in control — pick what matters most.
                    </Text>

                    <TouchableOpacity style={styles.enableButton} onPress={handleEnableAll}>
                        <Text allowFontScaling={false} style={styles.enableButtonText}>Enable All & Customize Later</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>Order Status</Text>
                        <View style={styles.recommendedContainer}>
                            <Text allowFontScaling={false} style={styles.recommendedText}>Recommended</Text>
                        </View>
                    </View>

                    <Text allowFontScaling={false} style={styles.sectionDesc}>
                        Get real-time updates from your courier + support team. We recommend this!
                    </Text>

                    <View style={styles.switchRow}>
                        <View style={styles.labelRow}>
                            <Bell size={24} color="#CA251B" style={styles.icon} />
                            <Text allowFontScaling={false} style={styles.switchLabel}>Push Notifications</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#ccc', true: '#CA251B' }}
                            thumbColor="#fff"
                            value={orderStatus}
                            onValueChange={setOrderStatus}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text allowFontScaling={false} style={styles.sectionTitle}>Special offers just for you</Text>
                    <Text allowFontScaling={false} style={styles.sectionDesc}>
                        Unlock discounts, promos, and coupons tailored to your tastes.
                    </Text>

                    <View style={styles.switchRow}>
                        <View style={styles.labelRow}>
                            <Bell size={24} color="#CA251B" style={styles.icon} />
                            <Text allowFontScaling={false} style={styles.switchLabel}>Push Notifications</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#ccc', true: '#CA251B' }}
                            thumbColor="#fff"
                            value={offersPush}
                            onValueChange={setOffersPush}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.labelRow}>
                            <MailOpen size={24} color="#CA251B" style={styles.icon} />
                            <Text allowFontScaling={false} style={styles.switchLabel}>Personalized Emails</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#ccc', true: '#CA251B' }}
                            thumbColor="#fff"
                            value={offersEmail}
                            onValueChange={setOffersEmail}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '16@s',
        borderTopColor: '#F9FAFB',
        borderColor: '#F9FAFB',
        borderTopWidth: 2,
        borderBottomWidth: 0,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    headerBox: {
        backgroundColor: '#F6F6F6',
        borderRadius: '12@ms',
        padding: '16@s',
        fontStyle: 'Roboto',
        marginTop: '10@s',
    },
    headerTitle: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#17213A',
        marginBottom: '6@vs',
    },
    headerText: {
        fontSize: '13@ms',
        color: '#444',
    },
    enableButton: {
        backgroundColor: '#CA251B',
        paddingVertical: '8@vs',
        paddingHorizontal: '26@s',
        borderRadius: '12@ms',
        marginTop: '14@vs',
        alignSelf: 'center',
    },
    enableButtonText: {
        color: '#FFFFFF',
        fontSize: '12@ms',
        fontWeight: '400',
        textAlign: 'center',
    },
    section: {
        borderBottomColor: '#E5E5E5',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: '14@vs',
        fontStyle: 'Roboto',

    },
    sectionTitle: {
        fontSize: '15@ms',
        fontWeight: '700',
        color: '#17213A',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vs(6),
        gap: s(6),
    },

    recommendedContainer: {
        backgroundColor: '#CA251B',
        borderRadius: 8,
        paddingHorizontal: s(10),
        paddingVertical: vs(2),
        justifyContent: 'center',
        alignItems: 'center',
        height: vs(20),
    },

    recommendedText: {
        color: '#FFF',
        fontSize: '11@ms',
        fontWeight: '600',

    },

    sectionDesc: {
        fontSize: '13@ms',
        color: '#555',
        marginVertical: '8@vs',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '6@vs',
    },
    switchLabel: {
        fontSize: '14@ms',
        color: '#17213A',
        fontWeight: '600',

    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: s(6),
        marginTop: 1,
    },

});
