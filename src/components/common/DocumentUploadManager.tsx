import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Plus,
  Shield,
  FileCheck,
  X
} from 'lucide-react';

interface DocumentUploadManagerProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  currentUser: { name: string };
  readOnly?: boolean;
}

export const DocumentUploadManager: React.FC<DocumentUploadManagerProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
  currentUser,
  readOnly = false
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('Concept Note');
  const [description, setDescription] = useState('');
  const [confidentiality, setConfidentiality] = useState<DocumentItem['confidentiality']>(
    'Institutional Public'
  );
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileType, setFileType] = useState('PDF');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const validTypes = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'txt'];
      const ext = f.name.split('.').pop()?.toLowerCase() || '';

      if (!validTypes.includes(ext)) {
        setErrorMessage(`Unsupported file format .${ext}. Please upload PDF, Word, Excel, or PowerPoint.`);
        return;
      }

      if (f.size > 30 * 1024 * 1024) {
        setErrorMessage('File size exceeds 30 MB institutional limit.');
        return;
      }

      setErrorMessage('');
      setSelectedFile(f);
      setFileName(f.name);
      setFileType(ext.toUpperCase());
      setFileSize(`${(f.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      setErrorMessage('Please provide or select a document file.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      initiativeId: '',
      fileName,
      fileType,
      fileSize,
      category,
      uploadedBy: currentUser.name,
      uploadDate: new Date().toISOString(),
      description: description || 'Supporting technical brief and annex.',
      version: '1.0',
      confidentiality
    };

    onAddDocument(newDoc);
    setShowUploadModal(false);
    setSelectedFile(null);
    setFileName('');
    setDescription('');
    setErrorMessage('');
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Supporting Institutional Documentation ({documents.length})
          </h4>
          <p className="text-[11px] text-slate-500">
            Concept notes, GIS surveys, risk matrices, stakeholder consultative records.
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
          <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
          <p className="font-semibold text-slate-600 text-xs">No documents attached yet</p>
          {!readOnly && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click 'Upload Document' or use the 'AI-Assisted Document Import' to attach source notes.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start gap-3 shadow-2xs group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 truncate block text-xs">
                    {doc.fileName}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    v{doc.version}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{doc.category}</span>
                  <span>•</span>
                  <span>{doc.fileSize}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">{doc.confidentiality}</span>
                </div>

                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>

                <div className="text-[10px] text-slate-400 mt-1">
                  By {doc.uploadedBy} on {formatDate(doc.uploadDate)}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => alert(`Simulating secure download of ${doc.fileName}`)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete document ${doc.fileName}?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Dialog */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-100">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <span className="font-bold text-sm">Upload Supporting Document</span>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Select Document File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Document Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Concept Note">Concept Note</option>
                  <option value="Project Document">Project Document</option>
                  <option value="Risk Matrix">Risk Matrix</option>
                  <option value="Appraisal Report">Appraisal Report</option>
                  <option value="CEO Directive">CEO Directive</option>
                  <option value="MoU">Memorandum of Understanding (MoU)</option>
                  <option value="Financing Agreement">Financing Agreement</option>
                  <option value="Amendment Request">Amendment Request</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Confidentiality Level *
                </label>
                <select
                  value={confidentiality}
                  onChange={(e) => setConfidentiality(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Institutional Public">Institutional Public</option>
                  <option value="Internal Restrictive">Internal Restrictive</option>
                  <option value="Executive Confidential">Executive Confidential</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Description / Content Summary
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Provide brief notes on the contents or annex structure..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition-colors"
                >
                  Attach to Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
