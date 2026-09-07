import { Textarea } from "@/components/ui/textarea";
import { SEQUENCE_LENGTH } from "@/lib/sequence";
import { motion, useReducedMotion } from "motion/react";

interface SequenceInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export default function SequenceInput({
  value,
  onChange,
  error,
}: SequenceInputProps) {
  const reduceMotion = useReducedMotion();

  const handleChange = (raw: string) => {
    const cleaned = raw.toUpperCase().replace(/[^ATGC]/g, "");
    onChange(cleaned);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="sequence-input"
        className="text-sm font-medium text-foreground"
      >
        Promoter sequence ({SEQUENCE_LENGTH} bp)
      </label>
      <motion.div
        whileFocus={reduceMotion ? undefined : { scale: 1.01 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-md"
      >
        <Textarea
          id="sequence-input"
          data-ocid="sequence.input"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC"
          className="min-h-28 resize-y font-mono text-base transition-[color,box-shadow] duration-300 ease-out focus-visible:shadow-[var(--glow-ring)]"
          aria-invalid={!!error}
          aria-describedby={error ? "sequence-error" : undefined}
        />
      </motion.div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span data-ocid="sequence_counter">
          {value.length} / {SEQUENCE_LENGTH} bp
        </span>
        <span className="font-mono">A · T · G · C</span>
      </div>
      {error && (
        <p
          id="sequence-error"
          data-ocid="sequence.error"
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
