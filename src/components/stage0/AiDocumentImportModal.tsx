import React, { useState } from 'react';
import {
  extractConceptFromDocument,
  ExtractedConceptData
} from '../../services/aiDocumentExtractor';
import { DocumentItem } from '../../types';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  ArrowRight,
  X,
  Loader2,
  FileCheck
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AiDocumentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtractedData: (
    data: Record<string, any>,
    sourceDocument: DocumentItem
  ) => void;
  currentUser: { name: string };
}

export const AiDocumentImportModal: React.FC<AiDocumentImportModalProps> = ({
  isOpen,
  onClose,
  onApplyExtractedData,
  currentUser
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<{
    data: ExtractedConceptData;
    summary: string;
  } | null>(null);

  // Field acceptance states
  const [acceptedFields, setAcceptedFields] = useState<Record<string, boolean>>({
    title: true,
    classification: true,
    directorate: true,
    regions: true,
    countries: true,
    strategicObjective: true,
    implementationPeriod: true,
    problemStatement: true,
    affectedParties: true,
    importanceStatement: true,
    consequencesOfInaction: true,
    proposedIntervention: true,
    expectedBeneficiaries: true,
    expectedResults: true,
    estimatedCost: true,
    currency: true,
    possibleFundingPartners: true,
    fundingNotes: true
  });

  // Local editable values in review screen
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [editingField, setEditingField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (uploadedFile: File) => {
    // Validate file type
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some((ext) =>
      uploadedFile.name.toLowerCase().endsWith(ext)
    );
    if (!hasValidExt) {
      alert('Please upload a valid document file (.pdf, .docx, .txt).');
      return;
    }

    if (uploadedFile.size > 25 * 1024 * 1024) {
      alert('File size exceeds the 25 MB institutional threshold.');
      return;
    }

    setFile(uploadedFile);
    setExtracting(true);

    try {
      const res = await extractConceptFromDocument(uploadedFile);
      setExtractedResult({ data: res.extractedData, summary: res.rawSummary });

      // Initialize edited values
      const initialVals: Record<string, any> = {};
      Object.entries(res.extractedData).forEach(([key, field]) => {
        initialVals[key] = (field as any).value;
      });
      setEditedValues(initialVals);
    } catch (err) {
      alert('Failed to extract document content. Please try another file.');
    } finally {
      setExtracting(false);
    }
  };

  const handleToggleAccept = (fieldKey: string) => {
    setAcceptedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleApply = () => {
    if (!file || !extractedResult) return;

    // Filter only accepted fields
    const appliedData: Record<string, any> = {};
    Object.keys(acceptedFields).forEach((key) => {
      if (acceptedFields[key]) {
        appliedData[key] = editedValues[key];
      }
    });

    // Create preserved document item
    const preservedDoc: DocumentItem = {
      id: `doc-import-${Date.now()}`,
      initiativeId: '',
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'PDF',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      category: 'Concept Note',
      uploadedBy: currentUser.name,
      uploadDate: new Date().toISOString(),
      description: `Original source document imported via AI Document Extraction: ${extractedResult.summary}`,
      version: '1.0',
      confidentiality: 'Institutional Public'
    };

    onApplyExtractedData(appliedData, preservedDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI-Assisted Document Import</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  Concept Note Parser
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload existing project brief or concept paper to extract structured governance fields with confidence scoring.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!file ? (
            /* Upload Drop Area */
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-10 text-center bg-slate-50/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Upload Concept Note or Project Document
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Supports PDF, Microsoft Word (.docx), or formatted plain text files up to 25 MB.
              </p>

              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-colors">
                <FileText className="w-4 h-4" />
                <span>Select File from Computer</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span>✓ OCR Text Extraction</span>
                <span>✓ AUDA-NEPAD Strategic Alignment</span>
                <span>✓ Preserves Original Artifact</span>
              </div>
            </div>
          ) : extracting ? (
            /* Extraction In Progress */
            <div className="p-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  Analyzing Document & Extracting Fields...
                </h3>
                <p className="text-xs text-slate-500">
                  Parsing sections, identifying geographic targets, estimating budgets, and mapping strategic objectives.
                </p>
              </div>
              <div className="w-64 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : extractedResult ? (
            /* Extraction Review Screen (Requirement 1.7) */
            <div className="space-y-6">
              {/* Summary Banner */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-indigo-950">
                    File Parsed: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </div>
                  <p className="text-indigo-800 mt-0.5 leading-relaxed">
                    {extractedResult.summary}
                  </p>
                  <p className="text-[11px] text-indigo-700 mt-1 font-medium">
                    Review each proposed value below. You can toggle acceptance, edit field contents directly, or reject unneeded values before applying to the form.
                  </p>
                </div>
              </div>

              {/* Confidence Legend */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">
                  Field Extraction Review ({Object.values(acceptedFields).filter(Boolean).length} Accepted)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    High (85%+)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Medium (70-84%)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Low (&lt;70% - Review recommended)
                  </span>
                </div>
              </div>

              {/* Fields Table / Card List */}
              <div className="space-y-3">
                {Object.entries(extractedResult.data).map(([fieldKey, rawField]) => {
                  const field = rawField as any;
                  const isAccepted = acceptedFields[fieldKey] ?? true;
                  const currentValue = editedValues[fieldKey];
                  const isEditing = editingField === fieldKey;

                  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (field.confidenceLevel === 'Medium') {
                    badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';
                  } else if (field.confidenceLevel === 'Low') {
                    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                  }

                  const formatFieldName = (key: string) => {
                    return key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());
                  };

                  return (
                    <div
                      key={fieldKey}
                      className={`p-3.5 rounded-xl border transition-all text-xs ${
                        isAccepted
                          ? field.confidenceLevel === 'Low'
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAccept(fieldKey)}
                            className={`p-1 rounded-md transition-colors ${
                              isAccepted
                                ? 'text-emerald-600 hover:text-emerald-700'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title={isAccepted ? 'Accepted - click to reject' : 'Rejected - click to accept'}
                          >
                            {isAccepted ? (
                              <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className="font-bold text-slate-900">
                            {formatFieldName(fieldKey)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}
                          >
                            {Math.round(field.confidence * 100)}% Confidence ({field.confidenceLevel})
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setEditingField(isEditing ? null : fieldKey)
                            }
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Edit extracted value"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Value Display / Edit */}
                      <div className="mt-2 pl-6">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={
                                Array.isArray(currentValue)
                                  ? currentValue.join(', ')
                                  : currentValue
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditedValues((prev) => ({
                                  ...prev,
                                  [fieldKey]: Array.isArray(currentValue)
                                    ? val.split(',').map((s) => s.trim())
                                    : typeof field.value === 'number'
                                    ? parseFloat(val) || 0
                                    : val
                                }));
                              }}
                              className="w-full p-2 text-xs border border-indigo-300 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                              rows={3}
                            />
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => setEditingField(null)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 text-white rounded-md"
                              >
                                Done Editing
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-700 font-medium leading-relaxed">
                            {Array.isArray(currentValue) ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {currentValue.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : typeof currentValue === 'number' ? (
                              <span className="font-mono font-bold text-emerald-700">
                                {formatCurrency(currentValue, editedValues.currency || 'USD')}
                              </span>
                            ) : (
                              <span>{String(currentValue)}</span>
                            )}
                          </div>
                        )}

                        {field.sourceSnippet && (
                          <div className="text-[10px] text-slate-400 mt-1 italic">
                            Source excerpt: "{field.sourceSnippet}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setExtractedResult(null);
            }}
            className="text-slate-500 hover:text-slate-800 font-medium"
          >
            {file ? '← Choose Different Document' : 'Cancel'}
          </button>

          {extractedResult && (
            <div className="flex items-center gap-3">
              <span className="text-slate-500 hidden sm:inline text-[11px]">
                Preserves original uploaded document in record
              </span>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Apply Extracted Values to Concept Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
