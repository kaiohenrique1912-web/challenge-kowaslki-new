// Design system @qa/ui — documentação em docs/design-system.md.
// CSS global (fonte + tokens + base): importe uma vez na app → `import "@qa/ui/styles.css"`.

// Base
export { Badge, type BadgeProps } from "./components/Badge/Badge.tsx";
export { Button, type ButtonProps } from "./components/Button/Button.tsx";
export { Checkbox, type CheckboxProps } from "./components/Checkbox/Checkbox.tsx";
export { Chip, type ChipProps } from "./components/Chip/Chip.tsx";
export {
  CounterSelector,
  type CounterSelectorProps,
} from "./components/CounterSelector/CounterSelector.tsx";
export { Drawer, type DrawerProps } from "./components/Drawer/Drawer.tsx";
export { IconButton, type IconButtonProps } from "./components/IconButton/IconButton.tsx";
export { Input, type InputProps } from "./components/Input/Input.tsx";
export { type DialogProps, Modal } from "./components/Modal/Modal.tsx";
export {
  Pagination,
  type PaginationProps,
  pageItems,
} from "./components/Pagination/Pagination.tsx";
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
export { Tag, type TagProps } from "./components/Tag/Tag.tsx";
export { Toggle, type ToggleProps } from "./components/Toggle/Toggle.tsx";
export { Tooltip, type TooltipProps } from "./components/Tooltip/Tooltip.tsx";

// Domínio (imóveis)
export {
  FavoriteButton,
  type FavoriteButtonProps,
} from "./domain/FavoriteButton/FavoriteButton.tsx";
export { FilterBar, type FilterBarProps, type QuickFilter } from "./domain/FilterBar/FilterBar.tsx";
export {
  formatClusterCount,
  MapCluster,
  type MapClusterProps,
  MapPin,
  type MapPinProps,
} from "./domain/MapMarkers/MapMarkers.tsx";
export { PhotoCarousel, type PhotoCarouselProps } from "./domain/PhotoCarousel/PhotoCarousel.tsx";
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

// Ícones, tokens e utilitários
export { ICON_NAMES, Icon, type IconName, type IconProps } from "./icons/Icon.tsx";
export { breakpoints, tokens } from "./tokens/tokens.ts";
export { cx } from "./utils/cx.ts";
