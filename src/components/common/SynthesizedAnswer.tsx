import { Streamdown } from "streamdown";

interface SynthesizedAnswerProps {
  content: string;
}

/**
 * Renders LLM output as actual markdown (bold, bullets, headings) instead of
 * raw text with literal asterisks — gemma2:2b consistently emits markdown-
 * style formatting that a plain <p> can't display.
 */
export function SynthesizedAnswer({ content }: SynthesizedAnswerProps) {
  return (
    <div
      className="text-sm leading-relaxed text-[var(--text-primary)] [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-2 [&_strong]:font-semibold [&_strong]:text-[var(--text-primary)] [&_em]:italic [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_code]:font-mono [&_code]:text-xs [&_code]:bg-[var(--surface-2)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded"
    >
      <Streamdown>{content}</Streamdown>
    </div>
  );
}

export default SynthesizedAnswer;
