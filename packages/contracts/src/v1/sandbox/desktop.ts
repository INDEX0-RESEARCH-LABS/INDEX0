/**
 * Desktop Sandbox Contracts — @index0/contracts/v1/sandbox/desktop
 * Authoritative schema definitions for desktop automation, browser actions, and visual testing.
 */

export type DesktopActionType =
  | "click"
  | "double_click"
  | "triple_click"
  | "middle_click"
  | "right_click"
  | "mouse_down"
  | "mouse_up"
  | "move_cursor"
  | "type"
  | "key_press"
  | "key_down"
  | "key_up"
  | "drag"
  | "sleep"
  | "screenshot"
  | "navigate";

export interface IDesktopAction {
  action: DesktopActionType;
  x?: number;
  y?: number;
  text?: string;
  key?: string;
  durationMs?: number;
  url?: string;
}

export interface IDesktopScreenshotContract {
  /** Base64-encoded PNG image data. */
  base64: string;
  width: number;
  height: number;
  timestamp: string;
}

export interface IDesktopSessionState {
  sessionId: string;
  screenWidth: number;
  screenHeight: number;
  activeUrl?: string;
  isReady: boolean;
}
