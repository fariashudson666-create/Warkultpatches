import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2, Check } from 'lucide-react';
import { readFileAsOptimizedDataUrl } from '../utils/fileUpload';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helpText?: string;
  presets?: { title: string; url: string }[];
  aspectRatioClass?: string;
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  required = false,
  helpText,
  presets,
  aspectRatioClass = 'aspect-16/9'
}: ImageUploadInputProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar a imagem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        
        {/* Toggle Mode Button */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              uploadMode === 'file'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Arquivo Direto</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              uploadMode === 'url'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Colar URL</span>
          </button>
        </div>
      </div>

      {uploadMode === 'file' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 gap-2 text-blue-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-semibold">Otimizando e carregando imagem...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1 gap-1.5 text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Clique para selecionar do computador ou arraste aqui
              </p>
              <p className="text-[11px] text-slate-400">
                Suporta PNG, JPG, WEBP, GIF (otimização automática)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="url"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
      )}

      {helpText && (
        <p className="text-[11px] text-slate-500">{helpText}</p>
      )}

      {/* Preset Suggestions */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400">Sugestões rápidas:</span>
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(preset.url)}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors cursor-pointer"
            >
              {preset.title}
            </button>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group mt-2">
          <div className={`${aspectRatioClass} w-full max-h-48 overflow-hidden flex items-center justify-center bg-slate-950/5`}>
            <img
              src={value}
              alt="Prévia da imagem selecionada"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              Imagem pronta
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              title="Remover imagem"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
