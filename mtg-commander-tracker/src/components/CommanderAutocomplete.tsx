import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ScryfallCard {
  id: string;
  name: string;
  colors: string[];
  color_identity: string[];
  image_uris?: {
    small: string;
    normal: string;
  };
}

interface CommanderAutocompleteProps {
  onSelect: (commander: string, colors: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CommanderAutocomplete({
  onSelect,
  placeholder = "Search for a commander...",
  className = "",
}: CommanderAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Debounced search function
  const searchCommanders = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);

    try {
      // Search for legendary creatures that can be commanders
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          `${searchQuery} type:legendary type:creature`
        )}&order=name&unique=cards`
      );

      if (response.ok) {
        const data = await response.json();
        const commanders = data.data || [];

        setSuggestions(commanders.slice(0, 10)); // Limit to 10 results
        setShowDropdown(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error fetching commanders:", error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      searchCommanders(value);
    }, 300); // 300ms delay
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectCommander(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Convert color identity to string format
  const formatColors = (colorIdentity: string[]): string => {
    return colorIdentity.join("");
  };

  // Handle commander selection
  const selectCommander = (commander: ScryfallCard) => {
    setQuery(commander.name);
    setShowDropdown(false);
    setSelectedIndex(-1);

    const colors = formatColors(commander.color_identity);
    onSelect(commander.name, colors);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((commander, index) => (
            <div
              key={commander.id}
              onClick={() => selectCommander(commander)}
              className={`px-3 py-2 cursor-pointer flex items-center space-x-3 hover:bg-blue-50 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              {/* Commander image */}
              {commander.image_uris?.small && (
                <Image
                  src={commander.image_uris.small}
                  alt={commander.name}
                  width={100}
                  height={200}
                />
              )}

              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {commander.name}
                </div>
                <div className="text-sm text-gray-500">
                  Colors:{" "}
                  {commander.color_identity.length > 0
                    ? commander.color_identity.join("")
                    : "Colorless"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown &&
        !isLoading &&
        query.length >= 2 &&
        suggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
            <div className="text-gray-500 text-sm">No commanders found for</div>
          </div>
        )}
    </div>
  );
}
