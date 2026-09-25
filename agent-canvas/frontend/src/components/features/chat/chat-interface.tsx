import { useDispatch, useSelector } from "react-redux";
import React from "react";
import posthog from "posthog-js";
import { convertImageToBase64 } from "#/utils/convert-image-to-base-64";
import { FeedbackActions } from "../feedback/feedback-actions";
import { createChatMessage } from "#/services/chat-service";
import { InteractiveChatBox } from "./interactive-chat-box";
import { addUserMessage } from "#/state/chat-slice";
import { RootState } from "#/store";
import { AgentState } from "#/types/agent-state";
import { generateAgentStateChangeEvent } from "#/services/agent-state-service";
import { FeedbackModal } from "../feedback/feedback-modal";
import { useScrollToBottom } from "#/hooks/use-scroll-to-bottom";
import { TypingIndicator } from "./typing-indicator";
import { useWsClient } from "#/context/ws-client-provider";
import { Messages } from "./messages";
import { ChatSuggestions } from "./chat-suggestions";
import { ActionSuggestions } from "./action-suggestions";
import { ContinueButton } from "#/components/shared/buttons/continue-button";
import { ScrollToBottomButton } from "#/components/shared/buttons/scroll-to-bottom-button";
import { LoadingSpinner } from "#/components/shared/loading-spinner";
import { useSettings } from "#/hooks/query/use-settings";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { DEFAULT_SETTINGS } from "#/services/settings";

function getEntryPoint(
  hasRepository: boolean | null,
  hasImportedProjectZip: boolean | null,
): string {
  if (hasRepository) return "github";
  if (hasImportedProjectZip) return "zip";
  return "direct";
}

export function ChatInterface() {
  const { send, isLoadingMessages } = useWsClient();
  const dispatch = useDispatch();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollDomToBottom, onChatBodyScroll, hitBottom } =
    useScrollToBottom(scrollRef);

  const { messages } = useSelector((state: RootState) => state.chat);
  const { curAgentState } = useSelector((state: RootState) => state.agent);

  const [feedbackPolarity, setFeedbackPolarity] = React.useState<
    "positive" | "negative"
  >("positive");
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = React.useState(false);
  const [messageToSend, setMessageToSend] = React.useState<string | null>(null);
  const { selectedRepository, importedProjectZip } = useSelector(
    (state: RootState) => state.initialQuery,
  );

  const handleSendMessage = async (content: string, files: File[]) => {
    if (messages.length === 0) {
      posthog.capture("initial_query_submitted", {
        entry_point: getEntryPoint(
          selectedRepository !== null,
          importedProjectZip !== null,
        ),
        query_character_length: content.length,
        uploaded_zip_size: importedProjectZip?.length,
      });
    } else {
      posthog.capture("user_message_sent", {
        session_message_count: messages.length,
        current_message_length: content.length,
      });
    }
    const promises = files.map((file) => convertImageToBase64(file));
    const imageUrls = await Promise.all(promises);

    const timestamp = new Date().toISOString();
    const pending = true;
    dispatch(addUserMessage({ content, imageUrls, timestamp, pending }));
    send(createChatMessage(content, imageUrls, timestamp));
    setMessageToSend(null);
  };

  const handleStop = () => {
    posthog.capture("stop_button_clicked");
    send(generateAgentStateChangeEvent(AgentState.STOPPED));
  };

  const handleSendContinueMsg = () => {
    handleSendMessage("Continue", []);
  };

  const onClickShareFeedbackActionButton = async (
    polarity: "positive" | "negative",
  ) => {
    setFeedbackModalIsOpen(true);
    setFeedbackPolarity(polarity);
  };

  const isWaitingForUserInput =
    curAgentState === AgentState.AWAITING_USER_INPUT ||
    curAgentState === AgentState.FINISHED;

  const { data: settings } = useSettings();
  const { mutate: saveSettings } = useSaveSettings();

  const currentModel = settings?.LLM_MODEL || DEFAULT_SETTINGS.LLM_MODEL;
  const isMini = currentModel.toLowerCase().includes("mini");
  const formattedModel = isMini ? "azure-gpt-4o-mini" : "azure-gpt-4o";

  const toggleModel = () => {
    const nextModel = isMini
      ? "openai/azure-gpt-4o"
      : "openai/azure-gpt-4o-mini";
    saveSettings({
      ...(settings || DEFAULT_SETTINGS),
      LLM_MODEL: nextModel,
      LLM_BASE_URL: "http://litellm:4000/v1",
      LLM_API_KEY: "sk-index0-litellm-dev",
    });
  };

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Sovereign Model Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-700/60 bg-neutral-900/60 backdrop-blur-md select-none shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
            Model
          </span>
          <button
            type="button"
            onClick={toggleModel}
            title="Click to toggle model between Azure GPT-4o and GPT-4o Mini"
            className="group flex items-center gap-1.5 bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700 hover:border-emerald-500/60 px-2 py-0.5 rounded-md text-xs font-mono text-emerald-300 transition-all duration-150 cursor-pointer shadow-sm"
          >
            <span>⚡</span>
            <span className="font-semibold">{formattedModel}</span>
            <span className="text-[10px] text-neutral-400 group-hover:text-emerald-400 font-sans ml-0.5">
              ⇄
            </span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full border border-neutral-700/50">
          <span className="text-neutral-300 font-medium">INDEX0 Sovereign</span>
          <span className="text-neutral-500">•</span>
          <span className="text-emerald-400 font-medium">Managed</span>
        </div>
      </div>

      {messages.length === 0 && (
        <ChatSuggestions onSuggestionsClick={setMessageToSend} />
      )}

      <div
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        className="flex flex-col grow overflow-y-auto overflow-x-hidden px-4 pt-4 gap-2"
      >
        {isLoadingMessages && (
          <div className="flex justify-center">
            <LoadingSpinner size="small" />
          </div>
        )}

        {!isLoadingMessages && (
          <Messages
            messages={messages}
            isAwaitingUserConfirmation={
              curAgentState === AgentState.AWAITING_USER_CONFIRMATION
            }
          />
        )}

        {isWaitingForUserInput && (
          <ActionSuggestions
            onSuggestionsClick={(value) => handleSendMessage(value, [])}
          />
        )}
      </div>

      <div className="flex flex-col gap-[6px] px-4 pb-4">
        <div className="flex justify-between relative">
          <FeedbackActions
            onPositiveFeedback={() =>
              onClickShareFeedbackActionButton("positive")
            }
            onNegativeFeedback={() =>
              onClickShareFeedbackActionButton("negative")
            }
          />

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0">
            {messages.length > 2 &&
              curAgentState === AgentState.AWAITING_USER_INPUT && (
                <ContinueButton onClick={handleSendContinueMsg} />
              )}
            {curAgentState === AgentState.RUNNING && <TypingIndicator />}
          </div>

          {!hitBottom && <ScrollToBottomButton onClick={scrollDomToBottom} />}
        </div>

        <InteractiveChatBox
          onSubmit={handleSendMessage}
          onStop={handleStop}
          isDisabled={
            curAgentState === AgentState.LOADING ||
            curAgentState === AgentState.AWAITING_USER_CONFIRMATION
          }
          mode={curAgentState === AgentState.RUNNING ? "stop" : "submit"}
          value={messageToSend ?? undefined}
          onChange={setMessageToSend}
        />
      </div>

      <FeedbackModal
        isOpen={feedbackModalIsOpen}
        onClose={() => setFeedbackModalIsOpen(false)}
        polarity={feedbackPolarity}
      />
    </div>
  );
}
