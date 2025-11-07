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
} from "react-native";
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

const GENDER_OPTIONS = [
  { label: "Select Gender", value: "" },
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
];

const MARITAL_STATUS_OPTIONS = [
  { label: "Select Marital Status", value: "" },
  { label: "Single", value: "SINGLE" },
  { label: "Married", value: "MARRIED" },
  { label: "Widowed", value: "WIDOWED" },
  { label: "Divorced", value: "DIVORCED" },
  { label: "Separated", value: "SEPARATED" },
  { label: "Other", value: "OTHER" },
];

const ETHNICITY_OPTIONS = [
  { label: "Select Ethnicity", value: "" },
  { label: "Sinhala", value: "SINHALA" },
  { label: "Sri Lankan Tamil", value: "SRI_LANKAN_TAMIL" },
  { label: "Indian Tamil", value: "INDIAN_TAMIL" },
  { label: "Sri Lankan Moor", value: "SRI_LANKAN_MOOR" },
  { label: "Burgher", value: "BURGHER" },
  { label: "Malay", value: "MALAY" },
  { label: "Muslim", value: "MUSLIM" },
  { label: "Other", value: "OTHER" },
];

const RELIGION_OPTIONS = [
  { label: "Select Religion", value: "" },
  { label: "Buddhism", value: "BUDDHISM" },
  { label: "Hinduism", value: "HINDUISM" },
  { label: "Islam", value: "ISLAM" },
  { label: "Christianity", value: "CHRISTIANITY" },
  { label: "Roman Catholic", value: "ROMAN_CATHOLIC" },
  { label: "Other", value: "OTHER" },
];

export default function CustomerFormScreen({ route, navigation }) {
  // Check if we're in edit mode by checking if customerId is passed
  const customerId = route.params?.customerId;
  const isEditMode = !!customerId;

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
      Alert.alert("Error", "Failed to load customer data");
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
        "Permission Required",
        "Permission to access camera roll is required!"
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
        "Permission Required",
        "Permission to access camera is required!"
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
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
    ];

    // Add remove option if in edit mode and photo exists
    if (isEditMode && formData.photoUrl) {
      options.push({
        text: "Remove Photo",
        onPress: () => setFormData({ ...formData, photoUrl: "" }),
        style: "destructive",
      });
    }

    options.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      isEditMode ? "Change Photo" : "Add Photo",
      "Choose an option",
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
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/customers/${customerId}`, formData);
        Alert.alert("Success", "Customer updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await api.post("/customers", formData);
        Alert.alert("Success", "Customer added successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} customer:`,
        error
      );
      Alert.alert(
        "Error",
        error.response?.data?.details ||
          `Failed to ${isEditMode ? "update" : "add"} customer`
      );
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
          Loading customer...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[utilityStyles.flex1, utilityStyles.bgBackground]}
    >
      <ScrollView contentContainerStyle={utilityStyles.p20}>
        <View style={formStyles.formContainer}>
          <Text style={formStyles.label}>Customer Photo</Text>
          <TouchableOpacity
            style={[utilityStyles.alignCenter, utilityStyles.mb8]}
            onPress={handlePhotoOptions}
          >
            {formData.photoUrl ? (
              <Image
                source={{ uri: formData.photoUrl }}
                style={formStyles.photoPreview}
              />
            ) : (
              <View style={formStyles.photoPlaceholder}>
                <Text style={formStyles.photoPlaceholderText}>📷</Text>
                <Text style={formStyles.photoPlaceholderSubtext}>
                  {isEditMode ? "Change Photo" : "Add Photo"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={formStyles.label}>
            Full Name <Text style={formStyles.required}>*</Text>
          </Text>
          <TextInput
            style={formStyles.input}
            value={formData.fullName}
            onChangeText={(value) => handleChange("fullName", value)}
            placeholder="Enter full name"
            editable={!loading}
          />

          <Text style={formStyles.label}>Other Names</Text>
          <TextInput
            style={formStyles.input}
            value={formData.otherNames}
            onChangeText={(value) => handleChange("otherNames", value)}
            placeholder="Enter other names (optional)"
            editable={!loading}
          />

          <Text style={formStyles.label}>
            Permanent Address <Text style={formStyles.required}>*</Text>
          </Text>
          <TextInput
            style={formStyles.textArea}
            value={formData.permanentAddress}
            onChangeText={(value) => handleChange("permanentAddress", value)}
            placeholder="Enter permanent address"
            multiline
            numberOfLines={3}
            editable={!loading}
          />

          <Text style={formStyles.label}>
            Date of Birth <Text style={formStyles.required}>*</Text>
          </Text>
          <TextInput
            style={formStyles.input}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleChange("dateOfBirth", value)}
            placeholder="YYYY-MM-DD"
            editable={!loading}
          />

          <Text style={formStyles.label}>
            National ID No <Text style={formStyles.required}>*</Text>
          </Text>
          <TextInput
            style={formStyles.input}
            value={formData.nationalIdNo}
            onChangeText={(value) => handleChange("nationalIdNo", value)}
            placeholder="Enter national ID number"
            editable={!loading}
          />

          <Text style={formStyles.label}>
            Gender <Text style={formStyles.required}>*</Text>
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
            Marital Status <Text style={formStyles.required}>*</Text>
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
            Ethnicity <Text style={formStyles.required}>*</Text>
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
            Religion <Text style={formStyles.required}>*</Text>
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
            Occupation <Text style={formStyles.required}>*</Text>
          </Text>
          <TextInput
            style={formStyles.input}
            value={formData.occupation}
            onChangeText={(value) => handleChange("occupation", value)}
            placeholder="Enter occupation"
            editable={!loading}
          />

          <Text style={formStyles.label}>Home Phone</Text>
          <TextInput
            style={formStyles.input}
            value={formData.homePhone}
            onChangeText={(value) => handleChange("homePhone", value)}
            placeholder="Enter home phone (optional)"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={formStyles.label}>
            Mobile Phone <Text style={formStyles.required}>*</Text>
          </Text>
          <TextInput
            style={formStyles.input}
            value={formData.mobilePhone}
            onChangeText={(value) => handleChange("mobilePhone", value)}
            placeholder="Enter mobile phone"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={formStyles.label}>Secondary Mobile</Text>
          <TextInput
            style={formStyles.input}
            value={formData.secondaryMobile}
            onChangeText={(value) => handleChange("secondaryMobile", value)}
            placeholder="Enter secondary mobile (optional)"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={formStyles.label}>WhatsApp Number</Text>
          <TextInput
            style={formStyles.input}
            value={formData.whatsappNumber}
            onChangeText={(value) => handleChange("whatsappNumber", value)}
            placeholder="Enter WhatsApp number (optional)"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              formStyles.submitButton,
              loading && formStyles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={formStyles.submitButtonText}>
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update Customer"
                : "Add Customer"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={formStyles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={formStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// All styles moved to theme modules (formStyles, buttonStyles, utilityStyles)
