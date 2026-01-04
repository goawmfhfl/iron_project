export type ModalType = "LOGIN_REQUIRED" | "PREMIUM_REQUIRED" | "CUSTOM";

export interface ModalAction {
  label: string;
  onClick: () => void;
}

export interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  primaryAction: ModalAction;
  secondaryAction?: ModalAction;
}
