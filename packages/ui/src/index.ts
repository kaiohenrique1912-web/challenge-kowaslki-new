// Design system @qa/ui — documentação em docs/design-system.md.
// CSS global (fonte + tokens + base): importe uma vez na app → `import "@qa/ui/styles.css"`.

// Base
export { Badge, type BadgeProps } from "./components/Badge/Badge.tsx";
export {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbProps,
} from "./components/Breadcrumb/Breadcrumb.tsx";
export { Button, type ButtonProps } from "./components/Button/Button.tsx";
export { Checkbox, type CheckboxProps } from "./components/Checkbox/Checkbox.tsx";
export { Chip, type ChipProps } from "./components/Chip/Chip.tsx";
export {
  ChoiceChips,
  type ChoiceChipsProps,
  type ChoiceOption,
} from "./components/ChoiceChips/ChoiceChips.tsx";
export {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
} from "./components/Combobox/Combobox.tsx";
export {
  CounterSelector,
  type CounterSelectorProps,
} from "./components/CounterSelector/CounterSelector.tsx";
export { Drawer, type DrawerProps } from "./components/Drawer/Drawer.tsx";
export {
  ExpandableText,
  type ExpandableTextProps,
} from "./components/ExpandableText/ExpandableText.tsx";
export { IconButton, type IconButtonProps } from "./components/IconButton/IconButton.tsx";
export { Input, type InputProps } from "./components/Input/Input.tsx";
export { type DialogProps, Modal } from "./components/Modal/Modal.tsx";
export {
  Pagination,
  type PaginationProps,
  pageItems,
} from "./components/Pagination/Pagination.tsx";
export { Popover, type PopoverProps } from "./components/Popover/Popover.tsx";
export {
  RangeField,
  type RangeFieldProps,
  type RangeValue,
} from "./components/RangeField/RangeField.tsx";
export { RangeSlider, type RangeSliderProps } from "./components/RangeSlider/RangeSlider.tsx";
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from "./components/SegmentedControl/SegmentedControl.tsx";
export { Select, type SelectOption, type SelectProps } from "./components/Select/Select.tsx";
export { Skeleton, type SkeletonProps } from "./components/Skeleton/Skeleton.tsx";
export { Spinner, type SpinnerProps } from "./components/Spinner/Spinner.tsx";
export {
  StatusMessage,
  type StatusMessageProps,
} from "./components/StatusMessage/StatusMessage.tsx";
export { Tag, type TagProps } from "./components/Tag/Tag.tsx";
export { Toggle, type ToggleProps } from "./components/Toggle/Toggle.tsx";
export { Tooltip, type TooltipProps } from "./components/Tooltip/Tooltip.tsx";

// Domínio (imóveis)
export { AddressCard, type AddressCardProps } from "./domain/AddressCard/AddressCard.tsx";
export { AmenityList, type AmenityListProps } from "./domain/AmenityList/AmenityList.tsx";
export {
  AppHeader,
  type AppHeaderLink,
  type AppHeaderProps,
} from "./domain/AppHeader/AppHeader.tsx";
export {
  FavoriteButton,
  type FavoriteButtonProps,
} from "./domain/FavoriteButton/FavoriteButton.tsx";
export { FilterBar, type FilterBarProps, type QuickFilter } from "./domain/FilterBar/FilterBar.tsx";
export {
  AmenitiesFilter,
  AreaFilter,
  FilterPanel,
  type FilterPanelProps,
  type FilterSectionProps,
  MinCountFilter,
  MonthlyCostFilter,
  PriceFilter,
  PropertyTypesFilter,
  PublishedWithinFilter,
  RANGE_SCALES,
  RentedFilter,
  YesNoFilter,
} from "./domain/FilterPanel/FilterPanel.tsx";
export {
  formatClusterCount,
  MapCluster,
  type MapClusterProps,
  MapPin,
  type MapPinProps,
  mapClusterLabel,
} from "./domain/MapMarkers/MapMarkers.tsx";
export { PhotoCarousel, type PhotoCarouselProps } from "./domain/PhotoCarousel/PhotoCarousel.tsx";
export {
  PriceSummary,
  type PriceSummaryProps,
  type PriceSummaryRow,
} from "./domain/PriceSummary/PriceSummary.tsx";
export { PriceTag, type PriceTagProps } from "./domain/PriceTag/PriceTag.tsx";
export {
  PropertyBadges,
  type PropertyBadgesProps,
} from "./domain/PropertyBadges/PropertyBadges.tsx";
export {
  PropertyCard,
  type PropertyCardData,
  type PropertyCardProps,
  PropertyCardSkeleton,
} from "./domain/PropertyCard/PropertyCard.tsx";
export {
  PropertyFeatures,
  type PropertyFeaturesProps,
} from "./domain/PropertyFeatures/PropertyFeatures.tsx";
export {
  PropertyGallery,
  type PropertyGalleryProps,
} from "./domain/PropertyGallery/PropertyGallery.tsx";
export { ResultsHeader, type ResultsHeaderProps } from "./domain/ResultsHeader/ResultsHeader.tsx";
export {
  SearchLayout,
  type SearchLayoutProps,
  type SearchView,
} from "./domain/SearchLayout/SearchLayout.tsx";
export { SortMenu, type SortMenuProps } from "./domain/SortMenu/SortMenu.tsx";

// Ícones, tokens e utilitários
export { ICON_NAMES, Icon, type IconName, type IconProps } from "./icons/Icon.tsx";
export { breakpoints, tokens } from "./tokens/tokens.ts";
export { cx } from "./utils/cx.ts";
