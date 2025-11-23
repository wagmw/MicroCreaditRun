import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/client";
import {
  colors,
  formStyles,
  buttonStyles,
  utilityStyles,
  modalStyles,
} from "../../theme";

import { useLocalization } from "../../context/LocalizationContext";

export default function CustomerFormScreen({ route, navigation }) {
  const { t } = useLocalization();
  // Check if we're in edit mode by checking if customerId is passed
  const customerId = route.params?.customerId;
  const isEditMode = !!customerId;

  // Localized dropdown options
  const GENDER_OPTIONS = [
    { label: t("customers.selectGender"), value: "" },
    { label: t("customers.genderMale"), value: "MALE" },
    { label: t("customers.genderFemale"), value: "FEMALE" },
  ];

  const MARITAL_STATUS_OPTIONS = [
    { label: t("customers.selectMaritalStatus"), value: "" },
    { label: t("customers.maritalSingle"), value: "SINGLE" },
    { label: t("customers.maritalMarried"), value: "MARRIED" },
    { label: t("customers.maritalWidowed"), value: "WIDOWED" },
    { label: t("customers.maritalDivorced"), value: "DIVORCED" },
    { label: t("customers.maritalSeparated"), value: "SEPARATED" },
    { label: t("customers.maritalOther"), value: "OTHER" },
  ];

  const ETHNICITY_OPTIONS = [
    { label: t("customers.selectEthnicity"), value: "" },
    { label: t("customers.ethnicitySinhala"), value: "SINHALA" },
    {
      label: t("customers.ethnicitySriLankanTamil"),
      value: "SRI_LANKAN_TAMIL",
    },
    { label: t("customers.ethnicityIndianTamil"), value: "INDIAN_TAMIL" },
    { label: t("customers.ethnicitySriLankanMoor"), value: "SRI_LANKAN_MOOR" },
    { label: t("customers.ethnicityBurgher"), value: "BURGHER" },
    { label: t("customers.ethnicityMalay"), value: "MALAY" },
    { label: t("customers.ethnicityMuslim"), value: "MUSLIM" },
    { label: t("customers.ethnicityOther"), value: "OTHER" },
  ];

  const RELIGION_OPTIONS = [
    { label: t("customers.selectReligion"), value: "" },
    { label: t("customers.religionBuddhism"), value: "BUDDHISM" },
    { label: t("customers.religionHinduism"), value: "HINDUISM" },
    { label: t("customers.religionIslam"), value: "ISLAM" },
    { label: t("customers.religionChristianity"), value: "CHRISTIANITY" },
    { label: t("customers.religionRomanCatholic"), value: "ROMAN_CATHOLIC" },
    { label: t("customers.religionOther"), value: "OTHER" },
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    otherNames: "",
    permanentAddress: "",
    dateOfBirth: "",
    nationalIdNo: "",
    gender: "",
    maritalStatus: "",
    ethnicity: "",
    religion: "",
    occupation: "",
    homePhone: "",
    mobilePhone: "",
    secondaryMobile: "",
    whatsappNumber: "",
    photoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Set navigation header title with translation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode
        ? t("customers.editCustomer")
        : t("customers.addCustomer"),
    });
  }, [navigation, isEditMode, t]);

  useEffect(() => {
    if (isEditMode) {
      fetchCustomer();
    }
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      const customer = response.data;

      // Format date for display
      let dateOfBirth = "";
      if (customer.dateOfBirth) {
        const date = new Date(customer.dateOfBirth);
        dateOfBirth = date.toISOString().split("T")[0];
      }

      setFormData({
        fullName: customer.fullName || "",
        otherNames: customer.otherNames || "",
        permanentAddress: customer.permanentAddress || "",
        dateOfBirth: dateOfBirth,
        nationalIdNo: customer.nationalIdNo || "",
        gender: customer.gender || "",
        maritalStatus: customer.maritalStatus || "",
        ethnicity: customer.ethnicity || "",
        religion: customer.religion || "",
        occupation: customer.occupation || "",
        homePhone: customer.homePhone || "",
        mobilePhone: customer.mobilePhone || "",
        secondaryMobile: customer.secondaryMobile || "",
        whatsappNumber: customer.whatsappNumber || "",
        photoUrl: customer.photoUrl || "",
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
      Alert.alert(t("common.error"), t("messages.loadError"));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        t("customers.permissionRequired"),
        t("customers.cameraRollPermission")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photoUrl: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        t("customers.permissionRequired"),
        t("customers.cameraPermission")
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photoUrl: result.assets[0].uri });
    }
  };

  const handlePhotoOptions = () => {
    const options = [
      { text: t("customers.takePhoto"), onPress: takePhoto },
      { text: t("customers.chooseFromLibrary"), onPress: pickImage },
    ];

    // Add remove option if in edit mode and photo exists
    if (isEditMode && formData.photoUrl) {
      options.push({
        text: t("customers.removePhoto"),
        onPress: () => setFormData({ ...formData, photoUrl: "" }),
        style: "destructive",
      });
    }

    options.push({ text: t("common.cancel"), style: "cancel" });

    Alert.alert(
      isEditMode ? t("customers.changePhoto") : t("customers.addPhoto"),
      "",
      options
    );
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.permanentAddress ||
      !formData.dateOfBirth ||
      !formData.nationalIdNo ||
      !formData.gender ||
      !formData.maritalStatus ||
      !formData.ethnicity ||
      !formData.religion ||
      !formData.occupation ||
      !formData.mobilePhone
    ) {
      Alert.alert(t("common.error"), t("customers.fillRequiredFields"));
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();

      // Add all text fields (include empty strings as they might be optional fields)
      Object.keys(formData).forEach((key) => {
        if (key !== "photoUrl") {
          // Always append the field, even if empty (backend expects all fields)
          formDataToSend.append(key, formData[key] || "");
        }
      });

      // Handle photo upload
      if (formData.photoUrl) {
        // Check if it's a local file (starts with file://)
        if (formData.photoUrl.startsWith("file://")) {
          // Extract filename from URI
          const uriParts = formData.photoUrl.split("/");
          const filename = uriParts[uriParts.length - 1];

          // Create file object for upload
          formDataToSend.append("photo", {
            uri: formData.photoUrl,
            type: "image/jpeg", // or detect from file extension
            name: filename,
          });
        }
        // If it's already a server URL, don't include it (keep existing)
      } else if (isEditMode && !formData.photoUrl) {
        // User removed the photo
        formDataToSend.append("removePhoto", "true");
      }

      if (isEditMode) {
        await api.put(`/customers/${customerId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        Alert.alert(t("common.success"), t("customers.customerUpdated"), [
          {
            text: t("common.ok"),
            onPress: () => {
              // Navigate to customer details screen with updated data
              navigation.replace("CustomerDetails", { customerId });
            },
          },
        ]);
      } else {
        await api.post("/customers", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        Alert.alert(t("common.success"), t("customers.customerAdded"), [
          { text: t("common.ok"), onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} customer:`,
        error
      );
      let errorMessage = isEditMode
        ? t("customers.failedToUpdate")
        : t("customers.failedToAdd");

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      }

      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View
        style={[
          utilityStyles.flex1,
          utilityStyles.justifyCenter,
          utilityStyles.alignCenter,
          utilityStyles.bgBackground,
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            utilityStyles.mt8,
            utilityStyles.text16,
            utilityStyles.textSecondary,
          ]}
        >
          {t("customers.loadingCustomer")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[utilityStyles.flex1, utilityStyles.bgBackground]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={utilityStyles.flex1}
      >
        <ScrollView contentContainerStyle={utilityStyles.p20}>
          <View style={formStyles.formContainer}>
            <Text style={formStyles.label}>{t("customers.customerPhoto")}</Text>
            <TouchableOpacity
              style={[utilityStyles.alignCenter, utilityStyles.mb8]}
              onPress={handlePhotoOptions}
            >
              {formData.photoUrl ? (
                <Image
                  source={{
                    uri:
                      formData.photoUrl.startsWith("file://") ||
                      formData.photoUrl.startsWith("http")
                        ? formData.photoUrl
                        : `${api.defaults.baseURL.replace("/api", "")}${
                            formData.photoUrl
                          }`,
                  }}
                  style={formStyles.photoPreview}
                />
              ) : (
                <View style={formStyles.photoPlaceholder}>
                  <Text style={formStyles.photoPlaceholderText}>📷</Text>
                  <Text style={formStyles.photoPlaceholderSubtext}>
                    {isEditMode
                      ? t("customers.changePhoto")
                      : t("customers.addPhoto")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={formStyles.label}>
              {t("customers.fullName")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.fullName}
              onChangeText={(value) => handleChange("fullName", value)}
              placeholder={t("customers.enterFullName")}
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.otherNamesLabel")}
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.otherNames}
              onChangeText={(value) => handleChange("otherNames", value)}
              placeholder={t("customers.enterOtherNames")}
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.permanentAddressLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <TextInput
              style={formStyles.textArea}
              value={formData.permanentAddress}
              onChangeText={(value) => handleChange("permanentAddress", value)}
              placeholder={t("customers.enterPermanentAddress")}
              multiline
              numberOfLines={3}
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.dateOfBirthLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.dateOfBirth}
              onChangeText={(value) => handleChange("dateOfBirth", value)}
              placeholder={t("customers.dateFormat")}
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.nationalIdNo")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.nationalIdNo}
              onChangeText={(value) => handleChange("nationalIdNo", value)}
              placeholder={t("customers.enterNationalId")}
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.genderLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <View style={formStyles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
                enabled={!loading}
              >
                {GENDER_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <Text style={formStyles.label}>
              {t("customers.maritalStatusLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <View style={formStyles.pickerContainer}>
              <Picker
                selectedValue={formData.maritalStatus}
                onValueChange={(value) => handleChange("maritalStatus", value)}
                enabled={!loading}
              >
                {MARITAL_STATUS_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <Text style={formStyles.label}>
              {t("customers.ethnicityLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <View style={formStyles.pickerContainer}>
              <Picker
                selectedValue={formData.ethnicity}
                onValueChange={(value) => handleChange("ethnicity", value)}
                enabled={!loading}
              >
                {ETHNICITY_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <Text style={formStyles.label}>
              {t("customers.religionLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <View style={formStyles.pickerContainer}>
              <Picker
                selectedValue={formData.religion}
                onValueChange={(value) => handleChange("religion", value)}
                enabled={!loading}
              >
                {RELIGION_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            <Text style={formStyles.label}>
              {t("customers.occupationLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.occupation}
              onChangeText={(value) => handleChange("occupation", value)}
              placeholder={t("customers.enterOccupation")}
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.homePhoneLabel")}
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.homePhone}
              onChangeText={(value) => handleChange("homePhone", value)}
              placeholder={t("customers.enterHomePhone")}
              keyboardType="phone-pad"
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.mobilePhoneLabel")}{" "}
              <Text style={formStyles.required}>*</Text>
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.mobilePhone}
              onChangeText={(value) => handleChange("mobilePhone", value)}
              placeholder={t("customers.enterMobilePhone")}
              keyboardType="phone-pad"
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.secondaryMobileLabel")}
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.secondaryMobile}
              onChangeText={(value) => handleChange("secondaryMobile", value)}
              placeholder={t("customers.enterSecondaryMobile")}
              keyboardType="phone-pad"
              editable={!loading}
            />

            <Text style={formStyles.label}>
              {t("customers.whatsappNumberLabel")}
            </Text>
            <TextInput
              style={formStyles.input}
              value={formData.whatsappNumber}
              onChangeText={(value) => handleChange("whatsappNumber", value)}
              placeholder={t("customers.enterWhatsappNumber")}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView style={styles.actionBarContainer} edges={["bottom"]}>
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && formStyles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? isEditMode
                  ? t("customers.updating")
                  : t("customers.adding")
                : isEditMode
                ? t("customers.updateCustomer")
                : t("customers.addCustomerButton")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBarContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionBar: {
    flexDirection: "column",
    padding: 12,
    gap: 12,
  },
  submitButton: {
    backgroundColor: "#384043",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#384043",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

// All styles moved to theme modules (formStyles, buttonStyles, utilityStyles)
