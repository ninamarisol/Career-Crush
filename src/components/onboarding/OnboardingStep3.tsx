import { motion } from 'framer-motion';
import { ArrowRight, Upload, FileText } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStep3Props {
  onNext: () => void;
}

export function OnboardingStep3({ onNext }: OnboardingStep3Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-black">Upload your resume 📄</h2>
        </div>
        <p className="text-muted-foreground">
          We'll use this to help match you with the right roles.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150",
          isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
          file && "border-success bg-success/10"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-2">
            <FileText className="h-12 w-12 mx-auto text-success" />
            <p className="font-bold">{file.name}</p>
            <p className="text-sm text-muted-foreground">Click to change</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="font-bold">Drop your PDF here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <ButtonRetro variant="outline" onClick={onNext} className="flex-1">
          Skip for now
        </ButtonRetro>
        <ButtonRetro onClick={onNext} className="flex-1">
          Next Step
          <ArrowRight className="h-4 w-4" />
        </ButtonRetro>
      </div>
    </motion.div>
  );
}
