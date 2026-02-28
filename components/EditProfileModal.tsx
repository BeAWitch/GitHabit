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
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio);
  const [status, setStatus] = useState(initialProfile.status);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialProfile.avatarUri);

  useEffect(() => {
    if (visible) {
      setUsername(initialProfile.username);
      setBio(initialProfile.bio);
      setStatus(initialProfile.status);
      setAvatarUri(initialProfile.avatarUri);
    }
  }, [visible, initialProfile]);

  const pickImage = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to upload a profile picture.");
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
              Edit profile
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
                    <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">Change photo</Text>
                  </TouchableOpacity>
                  {avatarUri && (
                    <TouchableOpacity onPress={handleRemovePhoto}>
                      <Text className="text-sm text-github-danger dark:text-github-danger">Remove photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
             </View>

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              Username
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder="e.g. monalisa"
              placeholderTextColor={color.muted}
              value={username}
              onChangeText={setUsername}
            />
            
            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              Bio
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder="A little bit about yourself"
              placeholderTextColor={color.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={bio}
              onChangeText={setBio}
            />

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              Status
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText"
              placeholder="What's happening?"
              placeholderTextColor={color.muted}
              value={status}
              onChangeText={setStatus}
            />
          </View>

          <View className="p-4 border-t border-github-lightBorder dark:border-github-darkBorder flex-row justify-end">
            <TouchableOpacity
              className="px-4 py-2 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mr-3"
              onPress={onClose}
            >
              <Text className="font-semibold text-github-lightText dark:text-github-darkText">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-md"
              style={{ backgroundColor: color.primary }}
              onPress={handleSave}
            >
              <Text className="font-bold text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
