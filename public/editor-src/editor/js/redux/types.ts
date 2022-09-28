import {
  Authorized,
  Block,
  DeviceMode,
  ExtraFontStyle,
  Fonts,
  GlobalBlock,
  Page,
  Project,
  Style,
  SyncAllowed,
  UserRole
} from "visual/types";
import { HistoryEnhancerState } from "./history/types";

export enum StoreChanged {
  pending = "pending",
  changed = "changed",
  unchanged = "unchanged"
}

// WARNING: this is a work in progress.
// Types should be added as we go on
export type ReduxState = {
  project: Project;
  page: Page;
  globalBlocks: {
    [key: string]: GlobalBlock;
  };
  changedGBIds: string[];
  blocksOrder: string[];
  blocksData: {
    [key: string]: Block;
  };
  fonts: Fonts;
  ui: {
    deviceMode: DeviceMode;
    leftSidebar: {
      isOpen: boolean;
      drawerContentType: string | null | undefined; // TODO: converted to a union of actual drawer type later
    };
    rightSidebar: {
      isOpen: boolean;
      lock: "manual" | "auto" | undefined;
      alignment: "right" | "left";
      activeTab: string | undefined;
    };
    showHiddenElements: boolean;
    currentRole: UserRole;
    currentLanguage: string;
  };
  styles: Style[];
  extraFontStyles: ExtraFontStyle[];
  authorized: Authorized;
  syncAllowed: SyncAllowed;
  copiedElement: {
    path: (string | number)[];
    value: {
      items: Block[];
    };
  };
  storeWasChanged: StoreChanged;

  // below any are temporary and needed for ReduxStateWithHistory
  // they will be removed once we finish with ReduxState types
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  pageBlocks: any;
  currentStyleId: any;
  currentStyle: any;
  globalBlocksUpdates: any;
  /* eslint-enable  @typescript-eslint/no-explicit-any */
};

// this is temporary and will be automatically infered after
// we move all the reducers to ts and finish with all ReduxState types
export type ReduxStateWithHistory = HistoryEnhancerState<
  ReduxState,
  | "pageBlocks"
  | "currentStyleId"
  | "currentStyle"
  | "extraFontStyles"
  | "globalBlocksUpdates"
>;
