import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Octicons } from "@expo/vector-icons";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useTranslation } from "react-i18next";
import { formatUnit } from "@/utils/unitFormatterUtil";

interface CommitModalProps {
  visible: boolean;
  title: string;
  unitLabel: string;
  unitType: "count" | "binary";
  initialMessage?: string;
  initialValue?: number;
  onClose: () => void;
  onSubmit: (value: number, message: string) => void;
  onDelete?: () => void;
}

export const CommitModal: React.FC<CommitModalProps> = ({
  visible,
  title,
  unitLabel,
  unitType,
  initialMessage = "",
  initialValue = 1,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const { color } = useThemeColors();
  const { t } = useTranslation();
  const [valueInput, setValueInput] = useState(initialValue.toString());
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (visible) {
      setValueInput(initialValue.toString());
      setMessage(initialMessage);
    }
  }, [visible, initialValue, initialMessage]);

  const parsedValue = useMemo(() => {
    const nextValue = Number.parseInt(valueInput.trim(), 10);
    return Number.isFinite(nextValue) ? nextValue : 0;
  }, [valueInput]);

  const isValid = unitType === "binary" || parsedValue > 0;
  const valueLabel = unitType === "binary" ? formatUnit(2, t("units.time")) : unitLabel || formatUnit(2, t("units.time"));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center bg-black/50 p-4"
      >
        <View className="bg-github-lightBg dark:bg-github-darkBg rounded-lg border border-github-lightBorder dark:border-github-darkBorder">
          <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
            <Text className="text-lg font-semibold text-github-lightText dark:text-github-darkText">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Octicons name="x" size={20} color={color.muted} />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            {unitType !== "binary" && (
              <>
                <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                  {t("commitModal.valueLabel")} ({valueLabel})
                </Text>
                <TextInput
                  className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
                  placeholder="1"
                  placeholderTextColor={color.muted}
                  keyboardType="number-pad"
                  value={valueInput}
                  onChangeText={setValueInput}
                />
              </>
            )}

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              {t("commitModal.messageLabel")} <Text className="text-github-lightMuted dark:text-github-darkMuted font-normal">{t("commitModal.optional")}</Text>
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder={t("commitModal.messagePlaceholder")}
              placeholderTextColor={color.muted}
              value={message}
              onChangeText={setMessage}
            />

            {unitType === "binary" && (
              <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mt-1">
                {t("commitModal.quickCommitHint")}
              </Text>
            )}
          </View>

          <View className="p-4 border-t border-github-lightBorder dark:border-github-darkBorder flex-row justify-between">
            {onDelete ? (
              <TouchableOpacity
                className="px-4 py-2 border border-transparent rounded-md flex-row items-center"
                onPress={() => {
                  onDelete();
                  onClose();
                }}
              >
                <Octicons name="trash" size={16} color={color.danger} className="mr-2" />
                <Text className="font-semibold text-github-lightDanger dark:text-github-darkDanger">
                  {t("habit.delete")}
                </Text>
              </TouchableOpacity>
            ) : (
              <View /> // Placeholder to keep spacing if needed, though justify-between pushes right items correctly
            )}
            
            <View className="flex-row">
              <TouchableOpacity
                className="px-4 py-2 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mr-3"
                onPress={onClose}
              >
                <Text className="font-semibold text-github-lightText dark:text-github-darkText">
                  {t("commitModal.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-md ${!isValid ? "opacity-50" : ""}`}
                style={{ backgroundColor: color.primary }}
                disabled={!isValid}
                onPress={() => {
                  const finalValue = unitType === "binary" ? (initialValue > 0 ? initialValue : 1) : parsedValue;
                  onSubmit(finalValue, message.trim());
                  onClose();
                }}
              >
                <Text className="font-bold text-white">{initialMessage ? t("commitModal.editCommit") : t("commitModal.commit")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
