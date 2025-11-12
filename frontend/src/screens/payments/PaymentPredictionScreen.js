import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

export default function PaymentPredictionScreen({ navigation }) {
  const { t } = useLocalization();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Clear predictions when date changes
      setPredictions(null);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      // Clear predictions when date changes
      setPredictions(null);
    }
  };

  const handlePredict = async () => {
    if (startDate > endDate) {
      Alert.alert(t("common.error"), t("payments.invalidDateRange"));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/payments/predict", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setPredictions(response.data);
    } catch (error) {
      console.error("Failed to predict payments:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.error || t("payments.predictionError")
      );
    } finally {
      setLoading(false);
    }
  };

  const groupPredictionsByDate = () => {
    if (!predictions || !predictions.predictions) return {};

    const grouped = {};
    predictions.predictions.forEach((prediction) => {
      const dateKey = formatDate(new Date(prediction.expectedDate));
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(prediction);
    });

    return grouped;
  };

  const groupedPredictions = groupPredictionsByDate();
  const dateKeys = Object.keys(groupedPredictions).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {/* Date Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("payments.selectDateRange")}</Text>

          {/* Start Date */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>{t("payments.fromDate")}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Icon
                name="calendar"
                size={20}
                color={colors.primary}
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          {/* End Date */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>{t("payments.toDate")}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Icon
                name="calendar"
                size={20}
                color={colors.primary}
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}

          {/* Predict Button */}
          <TouchableOpacity
            style={styles.predictButton}
            onPress={handlePredict}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Icon
                  name="chart-timeline-variant"
                  size={20}
                  color={colors.textLight}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.predictButtonText}>
                  {t("payments.predictPayments")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Summary */}
        {predictions && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Icon name="chart-box-outline" size={20} color={colors.primary} />
              <Text style={styles.summaryTitle}>
                {t("payments.predictionSummary")}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t("payments.totalExpectedPayments")}:
              </Text>
              <Text style={styles.summaryValue}>{predictions.count}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t("payments.totalExpectedAmount")}:
              </Text>
              <Text style={styles.summaryAmountValue}>
                Rs. {formatCurrency(predictions.totalPredictedAmount)}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Icon
                name="information-outline"
                size={16}
                color={colors.info}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.infoText}>
                {t("payments.predictionInfo")}
              </Text>
            </View>

            {/* Show/Hide Payments Button */}
            {predictions.predictions.length > 0 && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPaymentList(!showPaymentList)}
              >
                <Icon
                  name={showPaymentList ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.toggleButtonText}>
                  {showPaymentList
                    ? t("payments.hideExpectedPayments")
                    : t("payments.showExpectedPayments")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Predictions List */}
        {predictions &&
          predictions.predictions.length > 0 &&
          showPaymentList && (
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>
                {t("payments.expectedPayments")}
              </Text>

              {dateKeys.map((dateKey) => (
                <View key={dateKey} style={styles.dateGroup}>
                  <View style={styles.dateGroupHeader}>
                    <Icon
                      name="calendar-clock"
                      size={16}
                      color={colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.dateGroupTitle}>{dateKey}</Text>
                    <View style={styles.dateGroupBadge}>
                      <Text style={styles.dateGroupCount}>
                        {groupedPredictions[dateKey].length}
                      </Text>
                    </View>
                  </View>

                  {groupedPredictions[dateKey].map((prediction, index) => (
                    <View key={index} style={styles.predictionItem}>
                      <View style={styles.predictionRow}>
                        <View style={styles.customerInfo}>
                          <Text style={styles.customerName}>
                            {prediction.customerName}
                          </Text>
                          <View style={styles.detailsRow}>
                            <Icon
                              name="phone"
                              size={11}
                              color={colors.textSecondary}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.detailTextSmall}>
                              {prediction.mobilePhone}
                            </Text>
                            <Text style={styles.separator}>•</Text>
                            <Text style={styles.detailTextSmall}>
                              {prediction.loanNumber}
                            </Text>
                          </View>
                          <View style={styles.installmentInfo}>
                            <View style={styles.installmentBadge}>
                              <Text style={styles.installmentText}>
                                {prediction.installmentNumber}/
                                {prediction.totalInstallments}
                              </Text>
                            </View>
                            <View style={styles.frequencyBadge}>
                              <Text style={styles.frequencyText}>
                                {prediction.frequency}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.amountContainer}>
                          <Text style={styles.predictionAmount}>
                            {formatCurrency(prediction.expectedAmount)}
                          </Text>
                          <Text style={styles.currencyLabel}>Rs.</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

        {predictions && predictions.predictions.length === 0 && (
          <View style={styles.emptyState}>
            <Icon
              name="calendar-remove"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              {t("payments.noPredictedPayments")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  predictButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  predictButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    margin: 12,
    marginTop: 0,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginLeft: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  summaryAmountValue: {
    fontSize: 18,
    color: colors.success,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: colors.info,
    lineHeight: 16,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  dateGroup: {
    marginBottom: 12,
  },
  dateGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  dateGroupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  dateGroupBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  dateGroupCount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  predictionItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  predictionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  customerInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  detailTextSmall: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: 11,
    color: colors.textSecondary,
    marginHorizontal: 6,
  },
  installmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  installmentBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
  },
  installmentText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.info,
  },
  frequencyBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  frequencyText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  predictionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.success,
  },
  currencyLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
  predictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
});
