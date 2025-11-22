import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { en } from "../localization/en";
import { si } from "../localization/si";

const LocalizationContext = createContext();

const LANGUAGE_KEY = "@microcredit_language";

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(en);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        changeLanguage(savedLanguage);
      }
    } catch (error) {
      // Silent fail - use default language
    }
  };

  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      setTranslations(lang === "si" ? si : en);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      // Silent fail
    }
  };

  // Translation function - supports nested keys like 'customers.title'
  // and variable interpolation like t('message', { name: 'John' })
  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        if (__DEV__) {
          console.warn(`Translation key not found: ${key}`);
        }
        return key;
      }
    }

    // Replace placeholders like {name} with actual values from params
    if (typeof value === "string" && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  };

  return (
    <LocalizationContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return context;
};
