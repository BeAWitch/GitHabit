import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Link } from "expo-router";
import { Octicons } from "@expo/vector-icons";

import { HabitFormModal } from "@/components/HabitFormModal";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useHabitStore } from "@/store/habitStore";
import { formatRelativeTime } from "@/utils/dateFormatter";
const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
] as const;

const SORT_OPTIONS = [
  { label: "Last updated", value: "lastUpdated" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name", value: "name" },
] as const;

export default function Habits() {
  const { color } = useThemeColors();
  const { habits, habitStats, categories, fetchData, fetchHabitDetail } = useHabitStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]["value"]>("all");
  const [sortOption, setSortOption] = useState<(typeof SORT_OPTIONS)[number]["value"]>("lastUpdated");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<"type" | "sort" | "category" | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const typeButtonRef = useRef<View>(null);
  const sortButtonRef = useRef<View>(null);
  const categoryButtonRef = useRef<View>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredHabits = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesSearch = (habit: (typeof habits)[number]) => {
      if (!normalizedQuery) return true;
      return [habit.name, habit.description, habit.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    };

    const matchesType = (habit: (typeof habits)[number]) => {
      if (typeFilter === "all") return true;
      return habit.status === typeFilter;
    };

    const matchesCategory = (habit: (typeof habits)[number]) => {
      if (categoryFilter === null) return true;
      return habit.categoryId === categoryFilter;
    };

    const sortedHabits = habits
      .filter((habit) => matchesSearch(habit) && matchesType(habit) && matchesCategory(habit))
      .sort((a, b) => {
        if ((b.pinned ?? 0) !== (a.pinned ?? 0)) {
          return (b.pinned ?? 0) - (a.pinned ?? 0);
        }

        if (sortOption === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortOption === "newest") {
          return b.createdAt - a.createdAt;
        }

        if (sortOption === "oldest") {
          return a.createdAt - b.createdAt;
        }

        const aUpdated = habitStats[a.id]?.lastTimestamp ?? 0;
        const bUpdated = habitStats[b.id]?.lastTimestamp ?? 0;
        return bUpdated - aUpdated;
      });

    return sortedHabits;
  }, [habits, habitStats, searchQuery, sortOption, typeFilter, categoryFilter]);

  const openMenu = (menu: "type" | "sort" | "category", anchorRef: React.RefObject<View | null>) => {
    if (activeMenu === menu) {
      setActiveMenu(null);
      return;
    }

    requestAnimationFrame(() => {
      anchorRef.current?.measureInWindow((x, y, width, height) => {
        setMenuAnchor({ x, y, width, height });
        setActiveMenu(menu);
      });
    });
  };

  const categoryOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    ],
    [categories]
  );

  const activeMenuOptions = activeMenu === "type"
    ? TYPE_FILTERS
    : activeMenu === "sort"
    ? SORT_OPTIONS
    : categoryOptions;

  const activeMenuValue = activeMenu === "type"
    ? typeFilter
    : activeMenu === "sort"
    ? sortOption
    : categoryFilter === null
    ? "all"
    : String(categoryFilter);

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
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setActiveMenu(null)}
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

      {/* Filter / Sort Row */}
      <View className="mb-4">
        <View className="flex-row flex-wrap items-center">
          <View ref={typeButtonRef} collapsable={false} className="mr-2 mb-2">
            <TouchableOpacity
              className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1 rounded-md"
              onPress={() => openMenu("type", typeButtonRef)}
            >
              <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
                Type: {TYPE_FILTERS.find((option) => option.value === typeFilter)?.label}
              </Text>
              <Octicons name="triangle-down" size={14} color={color.text} />
            </TouchableOpacity>
          </View>
          <View ref={sortButtonRef} collapsable={false} className="mr-2 mb-2">
            <TouchableOpacity
              className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-3 py-1 rounded-md"
              onPress={() => openMenu("sort", sortButtonRef)}
            >
              <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
                Sort: {SORT_OPTIONS.find((option) => option.value === sortOption)?.label}
              </Text>
              <Octicons name="triangle-down" size={14} color={color.text} />
            </TouchableOpacity>
          </View>
          <View ref={categoryButtonRef} collapsable={false} className="mr-2 mb-2">
            <TouchableOpacity
              className="flex-row items-center bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder px-2 py-1 rounded-md"
              onPress={() => openMenu("category", categoryButtonRef)}
            >
              <Text className="text-sm font-semibold text-github-lightText dark:text-github-darkText mr-2">
                Category: {categoryFilter === null
                  ? "All"
                  : categories.find((category) => category.id === categoryFilter)?.name || "All"}
              </Text>
              <Octicons name="triangle-down" size={14} color={color.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Habit List */}
      <ScrollView>
        {filteredHabits.length === 0 ? (
          <View className="border border-github-lightBorder dark:border-github-darkBorder rounded-md p-4">
            <Text className="text-sm text-github-lightMuted dark:text-github-darkMuted">
              No habits found.
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit) => {
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
      <HabitFormModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <Modal
        visible={activeMenu !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveMenu(null)}
      >
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setActiveMenu(null)}
          />
          {menuAnchor && (
            <View
              className="bg-github-lightCanvas dark:bg-github-darkCanvas border border-github-lightBorder dark:border-github-darkBorder rounded-md overflow-hidden"
              style={{
                position: "absolute",
                top: menuAnchor.y + menuAnchor.height + 8,
                left: menuAnchor.x,
                minWidth: menuAnchor.width,
                zIndex: 10,
              }}
            >
              {activeMenuOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className="flex-row items-center justify-between px-3 py-2"
                  onPress={() => {
                    if (activeMenu === "type") {
                      setTypeFilter(option.value as (typeof TYPE_FILTERS)[number]["value"]);
                    } else if (activeMenu === "sort") {
                      setSortOption(option.value as (typeof SORT_OPTIONS)[number]["value"]);
                    } else {
                      setCategoryFilter(option.value === "all" ? null : Number(option.value));
                    }
                    setActiveMenu(null);
                  }}
                >
                  <Text className="text-sm text-github-lightText dark:text-github-darkText">
                    {option.label}
                  </Text>
                  {activeMenuValue === option.value && (
                    <Octicons name="check" size={14} color={color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
