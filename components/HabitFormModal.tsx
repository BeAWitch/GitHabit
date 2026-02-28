import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Octicons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getMarkdownStyle } from "@/utils/markdownStyle";
import { useHabitStore } from "@/store/habitStore";
import { SegmentedControl } from "@/components/SegmentedControl";

interface HabitFormModalProps {
  visible: boolean;
  onClose: () => void;
  habitId?: number; // If provided, it's edit mode
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  visible,
  onClose,
  habitId,
}) => {
  const { color } = useThemeColors();
  const { categories, habits, addHabit, updateHabit } = useHabitStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [unitType, setUnitType] = useState<"count" | "binary">("count");
  const [unitLabel, setUnitLabel] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [pinned, setPinned] = useState(false);
  const [readmeHeight, setReadmeHeight] = useState(100);
  const [isReadmeFullScreen, setIsReadmeFullScreen] = useState(false);
  const readmeStartHeight = useRef(180);
  const [readmeViewMode, setReadmeViewMode] = useState<"edit" | "preview">("edit");

  // Initialize form when modal opens or habitId changes
  useEffect(() => {
    if (visible) {
      if (habitId) {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          setName(habit.name);
          setDescription(habit.description || "");
          setPlan(habit.plan || "");
          setUnitType(habit.unitType || "count");
          setUnitLabel(habit.unitLabel || "");
          setSelectedCategoryId(habit.categoryId);
          setStatus(habit.status || "active");
          setPinned(Boolean(habit.pinned));
        }
      } else {
        setName("");
        setDescription("");
        setPlan("");
        setUnitType("count");
        setUnitLabel("");
        setStatus("active");
        setPinned(false);
        if (categories.length > 0) {
          setSelectedCategoryId(categories[0].id);
        }
      }
    }
  }, [visible, habitId, habits, categories]);

  const screenHeight = Dimensions.get("window").height;
  const minReadmeHeight = 120;
  const maxReadmeHeight = Math.min(Math.round(screenHeight * 0.45), 360);

  const clampReadmeHeight = (value: number) =>
    Math.max(minReadmeHeight, Math.min(maxReadmeHeight, value));

  const readmePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        readmeStartHeight.current = readmeHeight;
      },
      onPanResponderMove: (_, gesture) => {
        const nextHeight = clampReadmeHeight(readmeStartHeight.current + gesture.dy);
        setReadmeHeight(nextHeight);
      },
    })
  ).current;

  const markdownStyle = useMemo(() => getMarkdownStyle(color), [color]);


  const handleSubmit = () => {
    if (!name.trim() || selectedCategoryId === null) return;

    const finalUnitLabel = unitLabel.trim() || (unitType === "count" ? "times" : "done");

    if (habitId) {
      updateHabit(
        habitId,
        name.trim(),
        description.trim(),
        plan.trim(),
        unitType,
        finalUnitLabel,
        selectedCategoryId,
        status,
        pinned ? 1 : 0
      );
    } else {
      addHabit(
        name.trim(),
        description.trim(),
        plan.trim(),
        unitType,
        finalUnitLabel,
        selectedCategoryId,
        status,
        pinned ? 1 : 0
      );
    }
    onClose();
  };

  return (
    <>
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
          <View className="bg-github-lightBg dark:bg-github-darkBg rounded-lg border border-github-lightBorder dark:border-github-darkBorder max-h-[80%]">
            <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
              <Text className="text-lg font-semibold text-github-lightText dark:text-github-darkText">
                {habitId ? "Edit habit" : "Create a new habit"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Octicons name="x" size={20} color={color.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              Habit name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder="e.g. read-books, exercise"
              placeholderTextColor={color.muted}
              value={name}
              onChangeText={setName}
            />

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              Description (optional)
            </Text>
            <TextInput
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
              placeholder="What is this habit about?"
              placeholderTextColor={color.muted}
              value={description}
              onChangeText={setDescription}
            />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
                Detailed Plan (optional)
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setReadmeViewMode("edit")}
                  accessibilityLabel="Edit only"
                  className={`px-2 py-1 rounded-md mr-2 border ${
                    readmeViewMode === "edit"
                      ? "border-github-lightText dark:border-github-darkText"
                      : "border-github-lightBorder dark:border-github-darkBorder"
                  }`}
                >
                  <Text className="text-xs text-github-lightText dark:text-github-darkText">
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setReadmeViewMode("preview")}
                  accessibilityLabel="Preview only"
                  className={`px-2 py-1 rounded-md mr-2 border ${
                    readmeViewMode === "preview"
                      ? "border-github-lightText dark:border-github-darkText"
                      : "border-github-lightBorder dark:border-github-darkBorder"
                  }`}
                >
                  <Text className="text-xs text-github-lightText dark:text-github-darkText">
                    Preview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsReadmeFullScreen(true)}
                  accessibilityLabel="Full screen README editor"
                >
                  <Octicons name="screen-full" size={16} color={color.muted} />
                </TouchableOpacity>
              </View>
            </View>
            <View
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mb-3"
              style={{ height: readmeHeight }}
            >
              {readmeViewMode !== "preview" && (
                <TextInput
                  className="px-3 py-2 text-github-lightText dark:text-github-darkText flex-1"
                  placeholder="# Goal\nWrite down your rules..."
                  placeholderTextColor={color.muted}
                  multiline
                  textAlignVertical="top"
                  value={plan}
                  onChangeText={setPlan}
                />
              )}
              {readmeViewMode !== "edit" && (
                <ScrollView className="px-3 py-2" nestedScrollEnabled>
                  {plan.trim().length > 0 ? (
                    <Markdown style={markdownStyle}>{plan}</Markdown>
                  ) : (
                    <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
                      Markdown preview will appear here.
                    </Text>
                  )}
                </ScrollView>
              )}
              <View
                className="absolute bottom-2 right-2 w-6 h-6 border border-github-lightBorder dark:border-github-darkBorder rounded-md items-center justify-center"
                {...readmePanResponder.panHandlers}
              >
                <View className="w-3 h-3 border-r border-b border-github-lightMuted dark:border-github-darkMuted" />
              </View>
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                  Unit Type
                </Text>
                <SegmentedControl
                  options={[
                    { label: "Count", value: "count" },
                    { label: "Binary", value: "binary" },
                  ]}
                  value={unitType}
                  onChange={(nextValue) => setUnitType(nextValue as "count" | "binary")}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                  Unit Label
                </Text>
                <TextInput
                  className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText"
                  placeholder={unitType === "count" ? "e.g. times" : "e.g. done"}
                  placeholderTextColor={color.muted}
                  value={unitLabel}
                  onChangeText={setUnitLabel}
                />
              </View>
            </View>

            <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                  className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                    selectedCategoryId === c.id
                      ? "border-github-lightText dark:border-github-darkText"
                      : "border-github-lightBorder dark:border-github-darkBorder"
                  }`}
                >
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: c.color }}
                  />
                  <Text className="text-sm text-github-lightText dark:text-github-darkText">
                    {c.name}
                  </Text>
                </TouchableOpacity>
                ))}
            </View>

            <View className="flex-row mb-6">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                  Status
                </Text>
                <SegmentedControl
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Archived", value: "archived" },
                  ]}
                  value={status}
                  onChange={(nextValue) => setStatus(nextValue as "active" | "archived")}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                  Pinned
                </Text>
                <SegmentedControl
                  options={[
                    { label: "Yes", value: "yes" },
                    { label: "No", value: "no" },
                  ]}
                  value={pinned ? "yes" : "no"}
                  onChange={(nextValue) => setPinned(nextValue === "yes")}
                />
              </View>
            </View>
          </ScrollView>

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
              className={`px-4 py-2 rounded-md ${
                !name.trim() ? "opacity-50" : ""
              }`}
              style={{ backgroundColor: color.primary }}
              disabled={!name.trim()}
              onPress={handleSubmit}
            >
              <Text className="font-bold text-white">
                {habitId ? "Save changes" : "Create habit"}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={isReadmeFullScreen}
        animationType="slide"
        onRequestClose={() => setIsReadmeFullScreen(false)}
      >
        <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-github-lightBorder dark:border-github-darkBorder">
            <Text className="text-base font-semibold text-github-lightText dark:text-github-darkText">
              README
            </Text>
            <TouchableOpacity
              onPress={() => setIsReadmeFullScreen(false)}
              accessibilityLabel="Exit full screen README editor"
            >
              <Octicons name="screen-normal" size={18} color={color.muted} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 px-4 py-3">
            {readmeViewMode === "edit" ? (
              <TextInput
                className="flex-1 text-github-lightText dark:text-github-darkText"
                placeholder="# Goal\nWrite down your rules..."
                placeholderTextColor={color.muted}
                multiline
                textAlignVertical="top"
                value={plan}
                onChangeText={setPlan}
              />
            ) : (
              <ScrollView>
                {plan.trim().length > 0 ? (
                  <Markdown style={markdownStyle}>{plan}</Markdown>
                ) : (
                  <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
                    Markdown preview will appear here.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};
