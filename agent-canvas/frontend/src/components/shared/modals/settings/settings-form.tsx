import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import React from "react";
import posthog from "posthog-js";
import { organizeModelsAndProviders } from "#/utils/organize-models-and-providers";
import { getDefaultSettings, Settings } from "#/services/settings";
import { DangerModal } from "../confirmation-modals/danger-modal";
import { I18nKey } from "#/i18n/declaration";
import { extractSettings, saveSettingsView } from "#/utils/settings-utils";
import { useEndSession } from "#/hooks/use-end-session";
import { ModalButton } from "../../buttons/modal-button";
import { AgentInput } from "../../inputs/agent-input";
import { ModalBackdrop } from "../modal-backdrop";
import { ModelSelector } from "./model-selector";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";

interface SettingsFormProps {
  disabled?: boolean;
  settings: Settings;
  models: string[];
  agents: string[];
  securityAnalyzers: string[];
  onClose: () => void;
}

export function SettingsForm({
  disabled,
  settings,
  models,
  agents,
  securityAnalyzers,
  onClose,
}: SettingsFormProps) {
  const { mutateAsync: saveSettings } = useSaveSettings();
  const endSession = useEndSession();

  const location = useLocation();
  const { t } = useTranslation();

  const formRef = React.useRef<HTMLFormElement>(null);

  const [confirmResetDefaultsModalOpen, setConfirmResetDefaultsModalOpen] =
    React.useState(false);
  const [confirmEndSessionModalOpen, setConfirmEndSessionModalOpen] =
    React.useState(false);

  const resetOngoingSession = () => {
    if (location.pathname.startsWith("/conversations/")) {
      endSession();
    }
  };

  const handleFormSubmission = async (formData: FormData) => {
    const keys = Array.from(formData.keys());
    const isUsingAdvancedOptions = keys.includes("use-advanced-options");
    const newSettings = extractSettings(formData);

    saveSettingsView(isUsingAdvancedOptions ? "advanced" : "basic");
    await saveSettings(newSettings, { onSuccess: onClose });
    resetOngoingSession();

    posthog.capture("settings_saved", {
      LLM_MODEL: newSettings.LLM_MODEL,
      LLM_API_KEY: newSettings.LLM_API_KEY ? "SET" : "UNSET",
    });
  };

  const handleConfirmResetSettings = async () => {
    await saveSettings(getDefaultSettings(), { onSuccess: onClose });
    resetOngoingSession();
    posthog.capture("settings_reset");
  };

  const handleConfirmEndSession = () => {
    const formData = new FormData(formRef.current ?? undefined);
    handleFormSubmission(formData);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (location.pathname.startsWith("/conversations/")) {
      setConfirmEndSessionModalOpen(true);
    } else {
      handleFormSubmission(formData);
    }
  };

  return (
    <div>
      <form
        ref={formRef}
        data-testid="settings-form"
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-3">
          <input type="hidden" name="api-key" value="sk-index0-azure-master" />
          <input type="hidden" name="base-url" value="http://litellm:4000/v1" />

          <div className="flex items-start gap-2.5 p-3 bg-neutral-800/90 rounded-lg border border-neutral-700/80 text-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-neutral-200">Sovereign Managed Infrastructure</span>
              <span className="text-[11px] text-neutral-400">
                Inference compute is automatically provisioned by INDEX0 via Azure OpenAI. Personal API keys are not required.
              </span>
            </div>
          </div>

          <ModelSelector
            isDisabled={disabled}
            models={organizeModelsAndProviders(
              models && models.length > 0
                ? models
                : ["openai/azure-gpt-4o", "openai/azure-gpt-4o-mini"]
            )}
            currentModel={settings.LLM_MODEL || "openai/azure-gpt-4o"}
          />

          <AgentInput
            isDisabled={!!disabled}
            defaultValue={settings.AGENT || "CodeActAgent"}
            agents={agents}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <ModalButton
              disabled={disabled}
              type="submit"
              text={t(I18nKey.SETTINGS_FORM$SAVE_LABEL)}
              className="bg-[#4465DB] w-full"
            />
            <ModalButton
              text={t(I18nKey.SETTINGS_FORM$CLOSE_LABEL)}
              className="bg-[#737373] w-full"
              onClick={onClose}
            />
          </div>
          <ModalButton
            disabled={disabled}
            text={t(I18nKey.SETTINGS_FORM$RESET_TO_DEFAULTS_LABEL)}
            variant="text-like"
            className="text-danger self-start"
            onClick={() => {
              setConfirmResetDefaultsModalOpen(true);
            }}
          />
        </div>
      </form>

      {confirmResetDefaultsModalOpen && (
        <ModalBackdrop>
          <DangerModal
            testId="reset-defaults-modal"
            title={t(I18nKey.SETTINGS_FORM$ARE_YOU_SURE_LABEL)}
            description={t(
              I18nKey.SETTINGS_FORM$ALL_INFORMATION_WILL_BE_DELETED_MESSAGE,
            )}
            buttons={{
              danger: {
                text: t(I18nKey.SETTINGS_FORM$RESET_TO_DEFAULTS_LABEL),
                onClick: handleConfirmResetSettings,
              },
              cancel: {
                text: t(I18nKey.SETTINGS_FORM$CANCEL_LABEL),
                onClick: () => setConfirmResetDefaultsModalOpen(false),
              },
            }}
          />
        </ModalBackdrop>
      )}
      {confirmEndSessionModalOpen && (
        <ModalBackdrop>
          <DangerModal
            title={t(I18nKey.SETTINGS_FORM$END_SESSION_LABEL)}
            description={t(
              I18nKey.SETTINGS_FORM$CHANGING_WORKSPACE_WARNING_MESSAGE,
            )}
            buttons={{
              danger: {
                text: t(I18nKey.SETTINGS_FORM$END_SESSION_LABEL),
                onClick: handleConfirmEndSession,
              },
              cancel: {
                text: t(I18nKey.SETTINGS_FORM$CANCEL_LABEL),
                onClick: () => setConfirmEndSessionModalOpen(false),
              },
            }}
          />
        </ModalBackdrop>
      )}
    </div>
  );
}
