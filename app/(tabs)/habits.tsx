import { useEffect, useState } from "react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";

import { Octicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { formatRelativeTime } from "@/utils/dateFormatter";

export default function Repositories() {
  const { color } = useThemeColors();
  const { habits, categories, habitStats, fetchData, fetchHabitDetail, addHabit } = useHabitStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [unitType, setUnitType] = useState<"count" | "binary">("count");
  const [unitLabel, setUnitLabel] = useState("");
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set default category when categories load or modal opens
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId, isModalVisible]);

  const handleCreateHabit = () => {
    if (!name.trim() || selectedCategoryId === null) return;
    
    addHabit(
      name.trim(),
      description.trim(),
      plan.trim(),
      unitType,
      unitLabel.trim() || (unitType === "count" ? "times" : "done"),
      selectedCategoryId
    );
    
    // Reset form and close
    setName("");
    setDescription("");
    setPlan("");
    setUnitType("count");
    setUnitLabel("");
    if (categories.length > 0) setSelectedCategoryId(categories[0].id);
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-github-lightBg dark:bg-github-darkBg p-4">
      {/* Header & Controls */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Search Input */}
        <View className="flex-1 bg-github-lightCanvas dark:bg-github-darkCanvas flex-row items-center border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-0 mr-3">
          <TextInput
            className="flex-1 text-github-lightText dark:text-github-darkText ml-2"
            placeholder="Find a habit..."
            placeholderTextColor={color.muted}
          />
          <Octicons name="search" size={16} color={color.muted} />
        </View>

        {/* New Habit Button */}
        <TouchableOpacity
          className="px-4 py-2 rounded-md flex-row items-center"
          style={{ backgroundColor: color.primary }}
          onPress={() => setModalVisible(true)}
        >
          <Octicons name="repo" size={16} color="white" className="mr-2" />
          <Text className="text-white font-bold ml-1">New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter / Sort Row Placeholder */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1 rounded-md mr-2">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
            Type: All
          </Text>
          <Octicons name="triangle-down" size={14} color={color.text} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1 rounded-md">
          <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
            Sort: Last updated
          </Text>
          <Octicons name="triangle-down" size={14} color={color.text} />
        </TouchableOpacity>
      </View>

      {/* Habit List */}
      <ScrollView>
        {habits.length === 0 ? (
          <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
              No habits yet.
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const stats = habitStats[habit.id];
            const lastUpdated = stats?.lastTimestamp ?? null;
            return (
              <View
                key={habit.id}
                className="border-b border-github-lightBorder dark:border-github-darkBorder py-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Link
                    href={`/habit/${habit.id}`}
                    asChild
                    onPress={() => fetchHabitDetail(habit.id)}
                  >
                    <TouchableOpacity>
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: color.link }}
                      >
                        {habit.name}
                      </Text>
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity>
                    <Octicons
                      name="kebab-horizontal"
                      size={16}
                      color={color.muted}
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted mb-3">
                  {habit.description || "No description"}
                </Text>
                <View className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: habit.color || color.primary }}
                  />
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted mr-4">
                    {habit.categoryName || "Default"}
                  </Text>
                  <Text className="text-xs text-github-lightMuted dark:text-github-darkMuted">
                    Updated {formatRelativeTime(lastUpdated)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* New Habit Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center bg-black/50 p-4"
        >
          <View className="bg-github-lightBg dark:bg-github-darkBg rounded-lg border border-github-lightBorder dark:border-github-darkBorder max-h-[80%]">
            <View className="flex-row items-center justify-between p-4 border-b border-github-lightBorder dark:border-github-darkBorder">
              <Text className="text-lg font-semibold text-github-lightText dark:text-github-darkText">
                Create a new habit
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Octicons name="x" size={20} color={color.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
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

              <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                Detailed Plan (optional)
              </Text>
              <TextInput
                className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md px-3 py-2 text-github-lightText dark:text-github-darkText mb-4"
                placeholder="# Goal&#10;Write down your rules..."
                placeholderTextColor={color.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={plan}
                onChangeText={setPlan}
              />

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mb-1">
                    Unit Type
                  </Text>
                  <View className="flex-row bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden">
                    <TouchableOpacity
                      className={`flex-1 py-2 items-center ${
                        unitType === "count"
                          ? "bg-github-lightBorder dark:bg-github-darkBorder"
                          : ""
                      }`}
                      onPress={() => setUnitType("count")}
                    >
                      <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
                        Count
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-2 items-center ${
                        unitType === "binary"
                          ? "bg-github-lightBorder dark:bg-github-darkBorder"
                          : ""
                      }`}
                      onPress={() => setUnitType("binary")}
                    >
                      <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText">
                        Binary
                      </Text>
                    </TouchableOpacity>
                  </View>
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
            </ScrollView>

            <View className="p-4 border-t border-github-lightBorder dark:border-github-darkBorder flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md mr-3"
                onPress={() => setModalVisible(false)}
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
                onPress={handleCreateHabit}
              >
                <Text className="font-bold text-white">Create habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
