import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import { Octicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from "@/hooks/useThemeColors";
import { UserProfile } from "@/store/userStore";
import { useTranslation } from "react-i18next";

interface EditProfileModalProps {
  visible: boolean;
  initialProfile: UserProfile;
  onClose: () => void;
  onSubmit: (updates: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  initialProfile,
  onClose,
  onSubmit,
}) => {
  const { color } = useThemeColors();
  const { t } = useTranslation();
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio);
  const [status, setStatus] = useState(initialProfile.status);
  const [statusEmoji, setStatusEmoji] = useState(initialProfile.statusEmoji || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(initialProfile.avatarUri);

  useEffect(() => {
    if (visible) {
      setUsername(initialProfile.username);
      setBio(initialProfile.bio);
      setStatus(initialProfile.status);
      setStatusEmoji(initialProfile.statusEmoji || "");
      setAvatarUri(initialProfile.avatarUri);
    }
  }, [visible, initialProfile]);

  const pickImage = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t("profile.permissionRequired"), t("profile.permissionDesc"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Skip buggy OS cropper, we handle circular display via UI
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    onSubmit({
      username: username.trim() || initialProfile.username,
      bio: bio.trim(),
      status: status.trim(),
      statusEmoji: statusEmoji.trim(),
      avatarUri,
    });
    onClose();
  };

  const handleRemovePhoto = () => {
    setAvatarUri(null);
  }

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
        <View className="bg-github-lightBg dark:bg-github-darkBg rounded-lg border border-github-lightBorder dark:border-github-darkBorder max-h-[90%]">
          <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
            <Text className="text-lg font-semibold text-github-lightText dark:text-github-darkText">
              {t("profile.editProfile")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Octicons name="x" size={20} color={color.muted} />
            </TouchableOpacity>
          </View>

          <View className="p-4">
             {/* Avatar Section */}
             <View className="flex-row items-center mb-6">
                <Image
                  source={avatarUri ? { uri: avatarUri } : require('@/assets/images/default-user-icon.png')}
                  className="w-16 h-16 rounded-full border border-github-lightBorder dark:border-github-darkBorder mr-4"
                />
                <View>
                  <TouchableOpacity 
                    className="mb-2 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1.5 rounded-md"
                    onPress={pickImage}
                  >
                    <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">{t("profile.changePhoto")}</Text>
                  </TouchableOpacity>
                  {avatarUri && (
                    <TouchableOpacity onPress={handleRemovePhoto}>
                      <Text className="text-sm text-github-danger dark:text-github-danger">{t("profile.removePhoto")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
             </View>

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              {t("profile.username")}
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder={t("profile.usernamePlaceholder")}
              placeholderTextColor={color.muted}
              value={username}
              onChangeText={setUsername}
            />
            
            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              {t("profile.bio")}
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder={t("profile.bioPlaceholder")}
              placeholderTextColor={color.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={bio}
              onChangeText={setBio}
            />

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              {t("profile.status")}
            </Text>
            <View className="flex-row">
              <TextInput
                className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mr-2 w-12 text-center"
                placeholder="😀"
                placeholderTextColor={`${color.text}66`}
                value={statusEmoji}
                onChangeText={setStatusEmoji}
                maxLength={2}
              />
              <TextInput
                className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText"
                placeholder={t("profile.statusPlaceholder")}
                placeholderTextColor={color.muted}
                value={status}
                onChangeText={setStatus}
              />
            </View>
          </View>

          <View className="p-4 border-t border-github-lightBorder dark:border-github-darkBorder flex-row justify-end">
            <TouchableOpacity
              className="px-4 py-2 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mr-3"
              onPress={onClose}
            >
              <Text className="font-semibold text-github-lightText dark:text-github-darkText">
                {t("profile.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-md"
              style={{ backgroundColor: color.primary }}
              onPress={handleSave}
            >
              <Text className="font-bold text-white">{t("profile.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
