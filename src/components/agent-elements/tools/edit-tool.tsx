import React, { memo } from "react";
import { TextShimmer } from "../text-shimmer";
import type { TimelineStep, StepState } from "../types/timeline";
import { useToolComplete } from "../hooks/use-tool-complete";
import { IconChevronDown } from "@tabler/icons-react";
import { FileExtIcon } from "../icons/file-ext-icon";
import {
  mapToolInvocationToStep,
  mapToolStateToStepState,
} from "../utils/tool-adapters";
import { ToolApprovalFooter, type ToolApproval } from "./tool-approval-footer";

export type EditToolDiffCardProps = {
  step: Extract<TimelineStep, { type: "tool-call" }>;
  state: StepState;
  onComplete: () => void;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  isCollapsible?: boolean;
  approval?: ToolApproval;
};

export function EditToolDiffCard({
  step,
  state,
  onComplete,
  input,
  output,
  isCollapsible = false,
  approval,
}: EditToolDiffCardProps) {
  useToolComplete(state === "animating", step.duration, onComplete);
  const isPending = state === "animating";
  const fileName = step.filePath?.split("/").pop() ?? step.toolDetail;
  const hasFileName = Boolean(fileName);
  const isWrite = step.toolName === "Write";
  const [isExpanded, setIsExpanded] = React.useState(!isCollapsible);

  React.useEffect(() => {
    setIsExpanded(!isCollapsible);
  }, [isCollapsible]);

  const diffLines = React.useMemo(() => {
    if (step.diffLines && step.diffLines.length > 0) {
      return step.diffLines;
    }
    const oldContent = (input?.old_string || output?.old_content || "") as string;
    const newContent = (input?.new_string || output?.content || "") as string;

    const lines: Array<{ type: "add" | "remove" | "context"; content: string }> = [];
    if (oldContent) {
      oldContent.split("\n").slice(0, 8).forEach((l) => lines.push({ type: "remove", content: l }));
    }
    if (newContent) {
      newContent.split("\n").slice(0, 8).forEach((l) => lines.push({ type: "add", content: l }));
    }
    return lines;
  }, [step.diffLines, input, output]);

  return (
    <div className="an-edit-tool-card rounded-an-tool-border-radius border border-an-tool-border-color bg-an-tool-background dark:bg-black overflow-hidden select-none">
      <div
        className={
          "flex items-center justify-between px-2.5 py-0 h-7 bg-an-tool-background " +
          (isPending && diffLines.length === 0
            ? ""
            : "border-b border-an-tool-border-color")
        }
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasFileName && (
            <FileExtIcon filename={fileName} className="w-3 h-3 shrink-0" />
          )}
          {isPending && diffLines.length === 0 ? (
            <TextShimmer as="span" duration={1.2} className="text-xs">
              Generating...
            </TextShimmer>
          ) : isPending ? (
            <TextShimmer as="span" duration={1.2} className="text-xs">
              {isWrite ? "Creating" : "Editing"} {fileName}
            </TextShimmer>
          ) : (
            <span className="text-xs text-an-tool-color-muted truncate">
              {isWrite ? "Created" : "Edited"} {fileName}
            </span>
          )}
        </div>
        {step.diffStats && !isPending && (
          <span className="text-[11px] font-mono text-an-tool-color-muted inline-flex gap-2">
            {step.diffStats.split(" ").map((token) => (
              <span
                key={token}
                className={
                  token.startsWith("+")
                    ? "text-emerald-500 font-bold"
                    : token.startsWith("-")
                    ? "text-rose-500 font-bold"
                    : undefined
                }
              >
                {token}
              </span>
            ))}
          </span>
        )}
      </div>

      {diffLines.length > 0 ? (
        <div className="p-2.5 font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto bg-black/40 space-y-0.5">
          {diffLines.map((line, idx) => (
            <div
              key={idx}
              className={
                line.type === "add"
                  ? "text-emerald-400 bg-emerald-950/20 px-1 rounded"
                  : line.type === "remove"
                  ? "text-rose-400 bg-rose-950/20 px-1 rounded"
                  : "text-slate-400 px-1"
              }
            >
              <span className="select-none text-slate-500 inline-block w-4">
                {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
              </span>
              {line.content}
            </div>
          ))}
        </div>
      ) : null}

      {approval && <ToolApprovalFooter isPending={isPending} {...approval} />}
    </div>
  );
}

export type EditToolProps = {
  part: any;
  isCollapsible?: boolean;
};

export const EditTool = memo(function EditTool({
  part,
  isCollapsible = false,
}: EditToolProps) {
  const approval = (part.input?.approval ?? part.args?.approval) as
    | ToolApproval
    | undefined;
  const toolName = (part.type as string)?.replace("tool-", "") || "Edit";
  const step = mapToolInvocationToStep(part.toolCallId ?? part.id ?? "edit", {
    toolName,
    args: part.input ?? part.args ?? {},
    state:
      part.state === "output-available"
        ? "result"
        : part.state === "input-streaming"
          ? "partial-call"
          : "call",
    result: part.output ?? part.result,
  });
  const stepState = mapToolStateToStepState(
    part.state === "output-available"
      ? "result"
      : part.state === "input-streaming"
        ? "partial-call"
        : "call",
  );
  const noop = () => {};

  return (
    <EditToolDiffCard
      step={step}
      state={stepState}
      onComplete={noop}
      input={part.input ?? part.args}
      output={part.output ?? part.result}
      isCollapsible={isCollapsible}
      approval={approval}
    />
  );
});

export default EditTool;
