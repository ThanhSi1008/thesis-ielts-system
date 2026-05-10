import { Keyboard } from 'lucide-react';

export interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  placeholder?: string;
}

export default function DictationInput({
  value,
  onChange,
  disabled,
  inputRef,
  placeholder = "Type what you hear...",
}: DictationInputProps) {
  return (
    <div className="p-6 bg-gray-50 shrink-0">
      <div className="relative max-w-3xl mx-auto">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full h-24 p-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 resize-none transition-all disabled:opacity-50 disabled:bg-gray-100"
          spellCheck={false}
        />
        <div className="flex justify-end mt-2 items-center gap-2 text-sm text-gray-400 font-medium">
          <Keyboard className="w-4 h-4" />
          <span>Press Enter to advance</span>
        </div>
      </div>
    </div>
  );
}
