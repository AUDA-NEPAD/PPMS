import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Outcome,
  Output,
  Activity,
  OutcomeIndicator
} from '../../types';
import { PARTNERS_DATABASE } from '../../data/mockData';
import {
  calculateOutputBudget,
  calculateOutcomeBudget,
  calculateTotalProjectBudget
} from '../../utils/budgetCalculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BudgetRollupSummary } from './BudgetRollupSummary';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Target,
  Activity as ActivityIcon,
  Calendar,
  User,
  DollarSign,
  BarChart2,
  FolderTree,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResultsFrameworkSectionProps {
  outcomes: Outcome[];
  onChangeOutcomes: (outcomes: Outcome[]) => void;
  estimatedCost: number;
  currency?: string;
  currentUser: { name: string };
  isLocked?: boolean;
}

export const ResultsFrameworkSection: React.FC<ResultsFrameworkSectionProps> = ({
  outcomes = [],
  onChangeOutcomes,
  estimatedCost = 0,
  currency = 'USD',
  currentUser,
  isLocked = false
}) => {
  const { partners } = useApp();
  // Expansion state - all expanded by default
  const [expandedOutcomes, setExpandedOutcomes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    outcomes.forEach((o) => {
      init[o.id] = true;
    });
    return init;
  });

  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    outcomes.forEach((o) => {
      o.outputs?.forEach((outp) => {
        init[outp.id] = true;
      });
    });
    return init;
  });

  // Modal / Form state for Adding Outcome
  const [showAddOutcomeModal, setShowAddOutcomeModal] = useState(false);
  const [newOutcomeNumber, setNewOutcomeNumber] = useState(`Outcome ${outcomes.length + 1}`);
  const [newOutcomeNarrative, setNewOutcomeNarrative] = useState('');
  const [newOutcomeAssumptions, setNewOutcomeAssumptions] = useState('');

  // Edit Outcome State
  const [editingOutcome, setEditingOutcome] = useState<Outcome | null>(null);
  const [editOutcomeNumber, setEditOutcomeNumber] = useState('');
  const [editOutcomeNarrative, setEditOutcomeNarrative] = useState('');
  const [editOutcomeAssumptions, setEditOutcomeAssumptions] = useState('');

  // Active form for adding output
  const [addingOutputForOutcomeId, setAddingOutputForOutcomeId] = useState<string | null>(null);
  const [newOutputNumber, setNewOutputNumber] = useState('');
  const [newOutputNarrative, setNewOutputNarrative] = useState('');
  const [newOutputTarget, setNewOutputTarget] = useState('');
  const [newOutputTimeline, setNewOutputTimeline] = useState('');
  const [newOutputResponsible, setNewOutputResponsible] = useState(currentUser.name);

  // Edit Output State
  const [editingOutput, setEditingOutput] = useState<{ outcomeId: string; output: Output } | null>(null);
  const [editOutputNumber, setEditOutputNumber] = useState('');
  const [editOutputNarrative, setEditOutputNarrative] = useState('');
  const [editOutputTarget, setEditOutputTarget] = useState('');
  const [editOutputTimeline, setEditOutputTimeline] = useState('');
  const [editOutputResponsible, setEditOutputResponsible] = useState('');

  // Active form for adding indicator
  const [addingIndicatorForOutcomeId, setAddingIndicatorForOutcomeId] = useState<string | null>(null);
  const [newIndNumber, setNewIndNumber] = useState('');
  const [newIndName, setNewIndName] = useState('');
  const [newIndDefinition, setNewIndDefinition] = useState('');
  const [newIndBaselineVal, setNewIndBaselineVal] = useState('');
  const [newIndBaselineDate, setNewIndBaselineDate] = useState('2026-01-01');
  const [newIndTargetVal, setNewIndTargetVal] = useState('');
  const [newIndTargetDate, setNewIndTargetDate] = useState('2028-12-31');
  const [newIndUnit, setNewIndUnit] = useState('');
  const [newIndDataSource, setNewIndDataSource] = useState('');
  const [newIndFrequency, setNewIndFrequency] = useState('Annual');
  const [newIndResponsible, setNewIndResponsible] = useState(currentUser.name);

  // Active form for adding activity
  const [addingActivityForOutputId, setAddingActivityForOutputId] = useState<string | null>(null);
  const [newActNumber, setNewActNumber] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newActPartner, setNewActPartner] = useState<string>(partners[0]?.name || 'Direct AUDA-NEPAD Implementation');
  const [newActTarget, setNewActTarget] = useState('');
  const [newActStart, setNewActStart] = useState('2027-01-01');
  const [newActEnd, setNewActEnd] = useState('2027-12-31');
  const [newActTimeline, setNewActTimeline] = useState('12 months');
  const [newActCost, setNewActCost] = useState<number>(500000);
  const [newActStatus, setNewActStatus] = useState<Activity['status']>('Planned');

  // Edit Activity State
  const [editingActivity, setEditingActivity] = useState<{
    outcomeId: string;
    outputId: string;
    activity: Activity;
  } | null>(null);
  const [editActNumber, setEditActNumber] = useState('');
  const [editActDesc, setEditActDesc] = useState('');
  const [editActPartner, setEditActPartner] = useState('');
  const [editActTarget, setEditActTarget] = useState('');
  const [editActStart, setEditActStart] = useState('');
  const [editActEnd, setEditActEnd] = useState('');
  const [editActTimeline, setEditActTimeline] = useState('');
  const [editActCost, setEditActCost] = useState<number>(0);
  const [editActStatus, setEditActStatus] = useState<Activity['status']>('Planned');
  const [editActNotes, setEditActNotes] = useState('');

  // Edit Indicator State
  const [editingIndicator, setEditingIndicator] = useState<{
    outcomeId: string;
    indicator: OutcomeIndicator;
  } | null>(null);
  const [editIndNumber, setEditIndNumber] = useState('');
  const [editIndName, setEditIndName] = useState('');
  const [editIndDefinition, setEditIndDefinition] = useState('');
  const [editIndBaselineVal, setEditIndBaselineVal] = useState('');
  const [editIndBaselineDate, setEditIndBaselineDate] = useState('');
  const [editIndTargetVal, setEditIndTargetVal] = useState('');
  const [editIndTargetDate, setEditIndTargetDate] = useState('');
  const [editIndUnit, setEditIndUnit] = useState('');
  const [editIndDataSource, setEditIndDataSource] = useState('');
  const [editIndFrequency, setEditIndFrequency] = useState('');
  const [editIndResponsible, setEditIndResponsible] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle helpers - default all expanded unless explicitly false
  const toggleOutcome = (id: string) => {
    setExpandedOutcomes((prev) => {
      const current = prev[id] !== false;
      return {
        ...prev,
        [id]: !current
      };
    });
  };

  const toggleOutput = (id: string) => {
    setExpandedOutputs((prev) => {
      const current = prev[id] !== false;
      return {
        ...prev,
        [id]: !current
      };
    });
  };

  const expandAll = () => {
    const oMap: Record<string, boolean> = {};
    const opMap: Record<string, boolean> = {};
    outcomes.forEach((o) => {
      oMap[o.id] = true;
      o.outputs?.forEach((outp) => {
        opMap[outp.id] = true;
      });
    });
    setExpandedOutcomes(oMap);
    setExpandedOutputs(opMap);
    showToast('All Outcomes and Outputs expanded.');
  };

  const collapseAll = () => {
    const oMap: Record<string, boolean> = {};
    const opMap: Record<string, boolean> = {};
    outcomes.forEach((o) => {
      oMap[o.id] = false;
      o.outputs?.forEach((outp) => {
        opMap[outp.id] = false;
      });
    });
    setExpandedOutcomes(oMap);
    setExpandedOutputs(opMap);
    showToast('All Outcomes and Outputs collapsed.');
  };

  // Outcome CRUD Handlers
  const handleAddOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutcomeNarrative.trim()) return;

    const newOutcome: Outcome = {
      id: `out-${Date.now()}`,
      outcomeNumber: newOutcomeNumber || `Outcome ${outcomes.length + 1}`,
      narrative: newOutcomeNarrative.trim(),
      assumptions: newOutcomeAssumptions.trim(),
      indicators: [],
      outputs: []
    };

    const updated = [...outcomes, newOutcome];
    onChangeOutcomes(updated);
    setExpandedOutcomes((prev) => ({ ...prev, [newOutcome.id]: true }));
    setNewOutcomeNarrative('');
    setNewOutcomeAssumptions('');
    setNewOutcomeNumber(`Outcome ${updated.length + 1}`);
    setShowAddOutcomeModal(false);
  };

  const handleStartEditOutcome = (outcome: Outcome) => {
    if (isLocked) return;
    setEditingOutcome(outcome);
    setEditOutcomeNumber(outcome.outcomeNumber);
    setEditOutcomeNarrative(outcome.narrative);
    setEditOutcomeAssumptions(outcome.assumptions || '');
  };

  const handleSaveEditOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutcome || !editOutcomeNarrative.trim()) return;

    const updated = outcomes.map((o) =>
      o.id === editingOutcome.id
        ? {
            ...o,
            outcomeNumber: editOutcomeNumber.trim() || o.outcomeNumber,
            narrative: editOutcomeNarrative.trim(),
            assumptions: editOutcomeAssumptions.trim()
          }
        : o
    );

    onChangeOutcomes(updated);
    setEditingOutcome(null);
    showToast(`Strategic Outcome "${editOutcomeNumber || editingOutcome.outcomeNumber}" updated successfully.`);
  };

  const handleDeleteOutcome = (outcomeId: string) => {
    if (isLocked) return;
    if (window.confirm('Are you sure you want to delete this Outcome and all associated indicators, outputs, and activities?')) {
      onChangeOutcomes(outcomes.filter((o) => o.id !== outcomeId));
    }
  };

  // Output CRUD Handlers
  const handleAddOutput = (outcomeId: string) => {
    if (!newOutputNarrative.trim()) return;

    const targetOutcome = outcomes.find((o) => o.id === outcomeId);
    const existingOutputCount = targetOutcome?.outputs?.length || 0;
    const outcomeIndex = outcomes.findIndex((o) => o.id === outcomeId) + 1;

    const newOutp: Output = {
      id: `outp-${Date.now()}`,
      outputNumber: newOutputNumber || `Output ${outcomeIndex}.${existingOutputCount + 1}`,
      narrative: newOutputNarrative.trim(),
      target: newOutputTarget.trim(),
      timeline: newOutputTimeline.trim() || '2027 - 2028',
      responsiblePerson: newOutputResponsible.trim() || currentUser.name,
      activities: []
    };

    const updated = outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      return {
        ...o,
        outputs: [...(o.outputs || []), newOutp]
      };
    });

    onChangeOutcomes(updated);
    setExpandedOutputs((prev) => ({ ...prev, [newOutp.id]: true }));
    setAddingOutputForOutcomeId(null);
    setNewOutputNarrative('');
    setNewOutputTarget('');
    setNewOutputTimeline('');
    setNewOutputNumber('');
  };

  const handleStartEditOutput = (outcomeId: string, output: Output) => {
    if (isLocked) return;
    setEditingOutput({ outcomeId, output });
    setEditOutputNumber(output.outputNumber);
    setEditOutputNarrative(output.narrative);
    setEditOutputTarget(output.target || '');
    setEditOutputTimeline(output.timeline || '');
    setEditOutputResponsible(output.responsiblePerson || currentUser.name);
  };

  const handleSaveEditOutput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutput || !editOutputNarrative.trim()) return;

    const updated = outcomes.map((o) => {
      if (o.id !== editingOutput.outcomeId) return o;
      return {
        ...o,
        outputs: o.outputs?.map((op) =>
          op.id === editingOutput.output.id
            ? {
                ...op,
                outputNumber: editOutputNumber.trim() || op.outputNumber,
                narrative: editOutputNarrative.trim(),
                target: editOutputTarget.trim(),
                timeline: editOutputTimeline.trim(),
                responsiblePerson: editOutputResponsible.trim()
              }
            : op
        )
      };
    });

    onChangeOutcomes(updated);
    setEditingOutput(null);
    showToast(`Output "${editOutputNumber || editingOutput.output.outputNumber}" updated successfully.`);
  };

  const handleDeleteOutput = (outcomeId: string, outputId: string) => {
    if (isLocked) return;
    if (window.confirm('Delete Output and all of its associated budget activities?')) {
      const updated = outcomes.map((o) => {
        if (o.id !== outcomeId) return o;
        return {
          ...o,
          outputs: o.outputs?.filter((op) => op.id !== outputId) || []
        };
      });
      onChangeOutcomes(updated);
    }
  };

  // Activity CRUD Handlers
  const handleAddActivity = (outcomeId: string, outputId: string) => {
    if (!newActDesc.trim()) return;

    const targetOutcome = outcomes.find((o) => o.id === outcomeId);
    const targetOutput = targetOutcome?.outputs?.find((op) => op.id === outputId);
    const actCount = targetOutput?.activities?.length || 0;
    const outputNumStr = targetOutput?.outputNumber.replace(/[^0-9.]/g, '') || '1.1';

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      activityNumber: newActNumber || `ACT-${outputNumStr}.${actCount + 1}`,
      description: newActDesc.trim(),
      leadPartner: newActPartner,
      target: newActTarget.trim(),
      startDate: newActStart,
      endDate: newActEnd,
      timeline: newActTimeline.trim(),
      cost: Number(newActCost) || 0,
      currency,
      status: newActStatus,
      notes: ''
    };

    const updated = outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      return {
        ...o,
        outputs: o.outputs?.map((op) => {
          if (op.id !== outputId) return op;
          return {
            ...op,
            activities: [...(op.activities || []), newActivity]
          };
        })
      };
    });

    onChangeOutcomes(updated);
    setAddingActivityForOutputId(null);
    setNewActDesc('');
    setNewActTarget('');
    setNewActNumber('');
    setNewActCost(500000);
  };

  const handleStartEditActivity = (outcomeId: string, outputId: string, act: Activity) => {
    if (isLocked) return;
    setEditingActivity({ outcomeId, outputId, activity: act });
    setEditActNumber(act.activityNumber);
    setEditActDesc(act.description);
    setEditActPartner(act.leadPartner || partners[0]?.name || 'Direct AUDA-NEPAD Implementation');
    setEditActTarget(act.target || '');
    setEditActStart(act.startDate || '2027-01-01');
    setEditActEnd(act.endDate || '2027-12-31');
    setEditActTimeline(act.timeline || '12 months');
    setEditActCost(act.cost || 0);
    setEditActStatus(act.status || 'Planned');
    setEditActNotes(act.notes || '');
  };

  const handleSaveEditActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !editActDesc.trim()) return;

    const updated = outcomes.map((o) => {
      if (o.id !== editingActivity.outcomeId) return o;
      return {
        ...o,
        outputs: o.outputs?.map((op) => {
          if (op.id !== editingActivity.outputId) return op;
          return {
            ...op,
            activities: op.activities?.map((act) =>
              act.id === editingActivity.activity.id
                ? {
                    ...act,
                    activityNumber: editActNumber.trim() || act.activityNumber,
                    description: editActDesc.trim(),
                    leadPartner: editActPartner,
                    target: editActTarget.trim(),
                    startDate: editActStart,
                    endDate: editActEnd,
                    timeline: editActTimeline.trim(),
                    cost: Number(editActCost) || 0,
                    status: editActStatus,
                    notes: editActNotes.trim()
                  }
                : act
            )
          };
        })
      };
    });

    onChangeOutcomes(updated);
    setEditingActivity(null);
    showToast(`Activity "${editActNumber || editingActivity.activity.activityNumber}" updated successfully.`);
  };

  const handleUpdateActivityCost = (
    outcomeId: string,
    outputId: string,
    activityId: string,
    newCost: number
  ) => {
    if (isLocked) return;
    const updated = outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      return {
        ...o,
        outputs: o.outputs?.map((op) => {
          if (op.id !== outputId) return op;
          return {
            ...op,
            activities: op.activities?.map((act) =>
              act.id === activityId ? { ...act, cost: Number(newCost) || 0 } : act
            )
          };
        })
      };
    });
    onChangeOutcomes(updated);
  };

  const handleDeleteActivity = (
    outcomeId: string,
    outputId: string,
    activityId: string
  ) => {
    if (isLocked) return;
    const updated = outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      return {
        ...o,
        outputs: o.outputs?.map((op) => {
          if (op.id !== outputId) return op;
          return {
            ...op,
            activities: op.activities?.filter((act) => act.id !== activityId) || []
          };
        })
      };
    });
    onChangeOutcomes(updated);
  };

  // Indicator Handlers
  const handleAddIndicator = (outcomeId: string) => {
    if (!newIndName.trim()) return;

    const newInd: OutcomeIndicator = {
      id: `ind-${Date.now()}`,
      indicatorNumber: newIndNumber || `IND-${Date.now().toString().slice(-3)}`,
      name: newIndName.trim(),
      definition: newIndDefinition.trim(),
      baselineValue: newIndBaselineVal.trim(),
      baselineDate: newIndBaselineDate,
      targetValue: newIndTargetVal.trim(),
      targetDate: newIndTargetDate,
      unitOfMeasurement: newIndUnit.trim(),
      dataSource: newIndDataSource.trim(),
      frequency: newIndFrequency,
      responsiblePerson: newIndResponsible.trim() || currentUser.name
    };

    const updated = outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      return {
        ...o,
        indicators: [...(o.indicators || []), newInd]
      };
    });

    onChangeOutcomes(updated);
    setAddingIndicatorForOutcomeId(null);
    setNewIndName('');
    setNewIndDefinition('');
    setNewIndBaselineVal('');
    setNewIndTargetVal('');
    setNewIndUnit('');
    setNewIndDataSource('');
  };

  const handleDeleteIndicator = (outcomeId: string, indId: string) => {
    if (isLocked) return;
    const updated = outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      return {
        ...o,
        indicators: o.indicators?.filter((i) => i.id !== indId) || []
      };
    });
    onChangeOutcomes(updated);
  };

  const handleStartEditIndicator = (outcomeId: string, ind: OutcomeIndicator) => {
    if (isLocked) return;
    setEditingIndicator({ outcomeId, indicator: ind });
    setEditIndNumber(ind.indicatorNumber);
    setEditIndName(ind.name);
    setEditIndDefinition(ind.definition || '');
    setEditIndBaselineVal(ind.baselineValue || '');
    setEditIndBaselineDate(ind.baselineDate || '2026-01-01');
    setEditIndTargetVal(ind.targetValue || '');
    setEditIndTargetDate(ind.targetDate || '2028-12-31');
    setEditIndUnit(ind.unitOfMeasurement || '');
    setEditIndDataSource(ind.dataSource || '');
    setEditIndFrequency(ind.frequency || 'Annual');
    setEditIndResponsible(ind.responsiblePerson || currentUser.name);
  };

  const handleSaveEditIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndicator || !editIndName.trim()) return;

    const updated = outcomes.map((o) => {
      if (o.id !== editingIndicator.outcomeId) return o;
      return {
        ...o,
        indicators: o.indicators?.map((i) =>
          i.id === editingIndicator.indicator.id
            ? {
                ...i,
                indicatorNumber: editIndNumber.trim() || i.indicatorNumber,
                name: editIndName.trim(),
                definition: editIndDefinition.trim(),
                baselineValue: editIndBaselineVal.trim(),
                baselineDate: editIndBaselineDate,
                targetValue: editIndTargetVal.trim(),
                targetDate: editIndTargetDate,
                unitOfMeasurement: editIndUnit.trim(),
                dataSource: editIndDataSource.trim(),
                frequency: editIndFrequency,
                responsiblePerson: editIndResponsible.trim() || currentUser.name
              }
            : i
        )
      };
    });

    onChangeOutcomes(updated);
    setEditingIndicator(null);
    showToast(`Indicator "${editIndNumber || editingIndicator.indicator.indicatorNumber}" updated successfully.`);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      {/* Real-time Budget Roll-Up Executive Header */}
      <BudgetRollupSummary
        outcomes={outcomes}
        estimatedCost={estimatedCost}
        currency={currency}
      />

      {/* Main Hierarchy Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              2.4 Results Framework & Activities Tree
            </h4>
            <p className="text-[11px] text-slate-500">
              Interactive 3-tier hierarchy: Strategic Outcomes ➔ Direct Outputs ➔ Budgeted Activities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            title="Expand all Outcomes and nested Outputs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Expand All</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            title="Collapse all Outcomes and nested Outputs"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-700" />
            <span>Collapse All</span>
          </button>

          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowAddOutcomeModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Strategic Outcome</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Save Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-700 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Strategic Outcome Modal */}
      {showAddOutcomeModal && !isLocked && (
        <form
          onSubmit={handleAddOutcome}
          className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Define New Strategic Outcome</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddOutcomeModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Outcome Label *
              </label>
              <input
                type="text"
                required
                value={newOutcomeNumber}
                onChange={(e) => setNewOutcomeNumber(e.target.value)}
                placeholder="e.g. Outcome 1"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Outcome Narrative Statement *
              </label>
              <input
                type="text"
                required
                value={newOutcomeNarrative}
                onChange={(e) => setNewOutcomeNarrative(e.target.value)}
                placeholder="State the high-level transformative change achieved..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Critical Assumptions & Enablers (Optional)
            </label>
            <textarea
              rows={2}
              value={newOutcomeAssumptions}
              onChange={(e) => setNewOutcomeAssumptions(e.target.value)}
              placeholder="What external conditions, political commitments, or market factors are assumed?"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddOutcomeModal(false)}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Strategic Outcome</span>
            </button>
          </div>
        </form>
      )}

      {/* OUTCOMES LIST (3-Tier Hierarchical View) */}
      {outcomes.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <h5 className="font-bold text-slate-800 text-sm">No Strategic Outcomes Defined</h5>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Establish the results framework by adding your first outcome, its indicators, and nested output activities.
          </p>
          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowAddOutcomeModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
            >
              Add First Outcome
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {outcomes.map((outcome) => {
            const isOutcomeExpanded = expandedOutcomes[outcome.id] !== false;
            const outcomeTotalBudget = calculateOutcomeBudget(outcome);
            const totalOutputsCount = outcome.outputs?.length || 0;
            const totalActivitiesCount =
              outcome.outputs?.reduce((s, op) => s + (op.activities?.length || 0), 0) || 0;

            return (
              <div
                key={outcome.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* LEVEL 1: OUTCOME HEADER */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div
                    onClick={() => toggleOutcome(outcome.id)}
                    className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-[280px]"
                  >
                    <button
                      type="button"
                      className="p-1 rounded-lg hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                    >
                      {isOutcomeExpanded ? (
                        <ChevronDown className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                          {outcome.outcomeNumber}
                        </span>
                        <h4
                          onClick={(e) => {
                            if (!isLocked) {
                              e.stopPropagation();
                              handleStartEditOutcome(outcome);
                            }
                          }}
                          className={`font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 ${
                            !isLocked ? 'hover:text-amber-800 cursor-pointer' : ''
                          }`}
                          title={!isLocked ? "Click to edit Outcome" : undefined}
                        >
                          <span>{outcome.narrative}</span>
                          {!isLocked && (
                            <span className="p-0.5 text-slate-400 hover:text-amber-700 transition-colors" title="Edit Outcome">
                              <Edit2 className="w-3 h-3" />
                            </span>
                          )}
                        </h4>
                      </div>
                      {outcome.assumptions && (
                        <p className="text-[11px] text-slate-500 italic">
                          Assumptions: {outcome.assumptions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Level 1 Subtotal & Actions */}
                  <div className="flex items-center gap-3">
                    {/* Metrics pill */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Outcome Roll-Up:
                      </span>
                      <span className="font-mono font-extrabold text-emerald-800 text-xs">
                        {formatCurrency(outcomeTotalBudget, currency)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">
                        {totalOutputsCount} Outputs / {totalActivitiesCount} Activities
                      </span>
                    </div>

                    {!isLocked && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditOutcome(outcome);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                          title="Edit Strategic Outcome"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit Outcome</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingOutputForOutcomeId(outcome.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Output</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOutcome(outcome.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Delete Outcome"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* OUTCOME CONTENT (Indicators & Outputs) */}
                {isOutcomeExpanded && (
                  <div className="p-5 space-y-6">
                    {/* SUB-SECTION A: OUTCOME INDICATORS TABLE */}
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-indigo-600" />
                          <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                            Outcome Key Performance Indicators (KPIs)
                          </h5>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {outcome.indicators?.length || 0}
                          </span>
                        </div>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              setAddingIndicatorForOutcomeId(
                                addingIndicatorForOutcomeId === outcome.id ? null : outcome.id
                              )
                            }
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Indicator</span>
                          </button>
                        )}
                      </div>

                      {/* Add Indicator Form Drawer */}
                      {addingIndicatorForOutcomeId === outcome.id && !isLocked && (
                        <div className="p-3 bg-white rounded-xl border border-indigo-300 shadow-xs space-y-3 animate-in fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Indicator Code
                              </label>
                              <input
                                type="text"
                                value={newIndNumber}
                                onChange={(e) => setNewIndNumber(e.target.value)}
                                placeholder="e.g. IND-01"
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Indicator Name / Metric *
                              </label>
                              <input
                                type="text"
                                required
                                value={newIndName}
                                onChange={(e) => setNewIndName(e.target.value)}
                                placeholder="e.g. Volume of cross-border trade transactions settled via PAPSS"
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Baseline Value
                              </label>
                              <input
                                type="text"
                                value={newIndBaselineVal}
                                onChange={(e) => setNewIndBaselineVal(e.target.value)}
                                placeholder="e.g. 50,000"
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Target Value *
                              </label>
                              <input
                                type="text"
                                required
                                value={newIndTargetVal}
                                onChange={(e) => setNewIndTargetVal(e.target.value)}
                                placeholder="e.g. 5,000,000"
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Unit of Measurement
                              </label>
                              <input
                                type="text"
                                value={newIndUnit}
                                onChange={(e) => setNewIndUnit(e.target.value)}
                                placeholder="e.g. Metric tons, USD, count"
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Data Source / Verification
                              </label>
                              <input
                                type="text"
                                value={newIndDataSource}
                                onChange={(e) => setNewIndDataSource(e.target.value)}
                                placeholder="e.g. Afreximbank PAPSS Monthly Clearing"
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setAddingIndicatorForOutcomeId(null)}
                              className="px-3 py-1 text-slate-600 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddIndicator(outcome.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                            >
                              Save Indicator
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Indicators Table */}
                      {!outcome.indicators || outcome.indicators.length === 0 ? (
                        <p className="text-slate-400 text-center py-2 text-[11px]">
                          No indicators registered yet for this outcome.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                                <th className="py-1.5 px-2">Code</th>
                                <th className="py-1.5 px-2">Indicator Name</th>
                                <th className="py-1.5 px-2">Baseline</th>
                                <th className="py-1.5 px-2">Target</th>
                                <th className="py-1.5 px-2">Unit</th>
                                <th className="py-1.5 px-2">Data Source</th>
                                <th className="py-1.5 px-2">Responsible</th>
                                {!isLocked && <th className="py-1.5 px-2 text-right">Action</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {outcome.indicators.map((ind) => (
                                <tr key={ind.id} className="hover:bg-white transition-colors">
                                  <td className="py-2 px-2 font-mono font-bold text-indigo-900">
                                    {ind.indicatorNumber}
                                  </td>
                                  <td className="py-2 px-2 font-medium text-slate-800">
                                    {ind.name}
                                  </td>
                                  <td className="py-2 px-2 text-slate-600">
                                    {ind.baselineValue}
                                  </td>
                                  <td className="py-2 px-2 font-bold text-emerald-700">
                                    {ind.targetValue}
                                  </td>
                                  <td className="py-2 px-2 text-slate-500">
                                    {ind.unitOfMeasurement || '-'}
                                  </td>
                                  <td className="py-2 px-2 text-slate-500">
                                    {ind.dataSource || '-'}
                                  </td>
                                  <td className="py-2 px-2 text-slate-600">
                                    {ind.responsiblePerson}
                                  </td>
                                  {!isLocked && (
                                    <td className="py-2 px-2 text-right whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditIndicator(outcome.id, ind)}
                                        className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors mr-1 cursor-pointer"
                                        title="Edit Indicator"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteIndicator(outcome.id, ind.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                                        title="Delete Indicator"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* SUB-SECTION B: ADD OUTPUT FORM DRAWER */}
                    {addingOutputForOutcomeId === outcome.id && !isLocked && (
                      <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-300 space-y-3 animate-in slide-in-from-top-1">
                        <div className="flex items-center justify-between pb-1 border-b border-sky-200">
                          <h5 className="font-bold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-sky-600" />
                            <span>Add Output under {outcome.outcomeNumber}</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => setAddingOutputForOutcomeId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Output Number
                            </label>
                            <input
                              type="text"
                              value={newOutputNumber}
                              onChange={(e) => setNewOutputNumber(e.target.value)}
                              placeholder="e.g. Output 1.1"
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Output Narrative Deliverable *
                            </label>
                            <input
                              type="text"
                              required
                              value={newOutputNarrative}
                              onChange={(e) => setNewOutputNarrative(e.target.value)}
                              placeholder="Deliverable description or physical asset..."
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Key Performance Target
                            </label>
                            <input
                              type="text"
                              value={newOutputTarget}
                              onChange={(e) => setNewOutputTarget(e.target.value)}
                              placeholder="e.g. 5 border crossing facilities upgraded"
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Delivery Timeline
                            </label>
                            <input
                              type="text"
                              value={newOutputTimeline}
                              onChange={(e) => setNewOutputTimeline(e.target.value)}
                              placeholder="e.g. Q1 2027 - Q4 2027"
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Responsible Person
                            </label>
                            <input
                              type="text"
                              value={newOutputResponsible}
                              onChange={(e) => setNewOutputResponsible(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-sky-200">
                          <button
                            type="button"
                            onClick={() => setAddingOutputForOutcomeId(null)}
                            className="px-3 py-1 text-slate-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddOutput(outcome.id)}
                            className="px-3.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Create Output
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION C: NESTED OUTPUTS LIST */}
                    {(!outcome.outputs || outcome.outputs.length === 0) ? (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                        No outputs configured under this outcome. Click "Add Output" above to begin activity costing.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {outcome.outputs.map((outp) => {
                          const isOutputExpanded = expandedOutputs[outp.id] !== false;
                          const outputTotalBudget = calculateOutputBudget(outp);
                          const isAddingActivity = addingActivityForOutputId === outp.id;

                          return (
                            <div
                              key={outp.id}
                              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                            >
                              {/* LEVEL 2: OUTPUT HEADER */}
                              <div className="p-3 bg-sky-50/40 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                                <div
                                  onClick={() => toggleOutput(outp.id)}
                                  className="flex items-center gap-2.5 cursor-pointer select-none flex-1 min-w-[240px]"
                                >
                                  <button
                                    type="button"
                                    className="p-0.5 rounded hover:bg-sky-100 text-sky-800 cursor-pointer"
                                  >
                                    {isOutputExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-bold text-sky-900 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-200">
                                        {outp.outputNumber}
                                      </span>
                                      <span
                                        onClick={(e) => {
                                          if (!isLocked) {
                                            e.stopPropagation();
                                            handleStartEditOutput(outcome.id, outp);
                                          }
                                        }}
                                        className={`font-bold text-slate-900 text-xs inline-flex items-center gap-1.5 ${
                                          !isLocked ? 'hover:text-amber-800 cursor-pointer' : ''
                                        }`}
                                        title={!isLocked ? "Click to edit Output" : undefined}
                                      >
                                        <span>{outp.narrative}</span>
                                        {!isLocked && (
                                          <span className="p-0.5 text-slate-400 hover:text-amber-700 transition-colors" title="Edit Output">
                                            <Edit2 className="w-2.5 h-2.5" />
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                      <span>Target: {outp.target || 'TBD'}</span>
                                      <span>•</span>
                                      <span>Timeline: {outp.timeline || 'TBD'}</span>
                                      <span>•</span>
                                      <span>Lead: {outp.responsiblePerson}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Level 2 Subtotal & Action */}
                                <div className="flex items-center gap-2.5">
                                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-sky-200 text-xs font-mono font-bold text-sky-900">
                                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">
                                      Subtotal:
                                    </span>
                                    <span>{formatCurrency(outputTotalBudget, currency)}</span>
                                  </div>

                                  {!isLocked && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEditOutput(outcome.id, outp);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                                        title="Edit Output Deliverable"
                                      >
                                        <Edit2 className="w-3 h-3 text-amber-700" />
                                        <span>Edit Output</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAddingActivityForOutputId(
                                            isAddingActivity ? null : outp.id
                                          )
                                        }
                                        className="flex items-center gap-1 px-2 py-0.8 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 cursor-pointer shadow-2xs"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Activity</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteOutput(outcome.id, outp.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                        title="Delete Output"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* LEVEL 3: ACTIVITIES TABLE & DRAWER */}
                              {isOutputExpanded && (
                                <div className="p-3 bg-slate-50/30 space-y-3">
                                  {/* Add Activity Form Drawer */}
                                  {isAddingActivity && !isLocked && (
                                    <div className="p-3 bg-white rounded-xl border-2 border-emerald-500 shadow-xs space-y-3 animate-in fade-in">
                                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                        <h6 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Record Budgeted Activity</span>
                                        </h6>
                                        <button
                                          type="button"
                                          onClick={() => setAddingActivityForOutputId(null)}
                                          className="p-1 text-slate-400 hover:text-slate-600"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                            Activity Code
                                          </label>
                                          <input
                                            type="text"
                                            value={newActNumber}
                                            onChange={(e) => setNewActNumber(e.target.value)}
                                            placeholder="e.g. ACT-1.1.1"
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                                          />
                                        </div>
                                        <div className="md:col-span-3">
                                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                            Activity Description & Scope *
                                          </label>
                                          <input
                                            type="text"
                                            required
                                            value={newActDesc}
                                            onChange={(e) => setNewActDesc(e.target.value)}
                                            placeholder="Detailed specification of the intervention..."
                                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                            Lead Partner / Agency
                                          </label>
                                          <select
                                            value={newActPartner}
                                            onChange={(e) => setNewActPartner(e.target.value)}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                          >
                                            <option value="Direct AUDA-NEPAD Implementation">
                                              Direct AUDA-NEPAD Implementation
                                            </option>
                                            {partners.map((p) => (
                                              <option key={p.id} value={p.name}>
                                                {p.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                            Target Metric / Milestone
                                          </label>
                                          <input
                                            type="text"
                                            value={newActTarget}
                                            onChange={(e) => setNewActTarget(e.target.value)}
                                            placeholder="e.g. 1 feasibility study executed"
                                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                            Budget Cost ({currency}) *
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            step={10000}
                                            required
                                            value={newActCost}
                                            onChange={(e) => setNewActCost(Number(e.target.value))}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-800"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                            Execution Status
                                          </label>
                                          <select
                                            value={newActStatus}
                                            onChange={(e) => setNewActStatus(e.target.value as Activity['status'])}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                          >
                                            <option value="Planned">Planned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Deferred">Deferred</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                        <button
                                          type="button"
                                          onClick={() => setAddingActivityForOutputId(null)}
                                          className="px-3 py-1 text-slate-600 text-xs font-semibold"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAddActivity(outcome.id, outp.id)}
                                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                                        >
                                          Insert Activity & Roll Up
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Activities Table */}
                                  {(!outp.activities || outp.activities.length === 0) ? (
                                    <div className="text-center py-2 text-[11px] text-slate-400 italic">
                                      No activities added to {outp.outputNumber}. Output budget is currently $0.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                          <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-100/60">
                                            <th className="py-2 px-3">Activity ID</th>
                                            <th className="py-2 px-3 min-w-[200px]">Description</th>
                                            <th className="py-2 px-3">Lead Partner</th>
                                            <th className="py-2 px-2 text-center">Dates</th>
                                            <th className="py-2 px-3 text-right">Cost ({currency})</th>
                                            <th className="py-2 px-2 text-center">Status</th>
                                            {!isLocked && <th className="py-2 px-2 text-right">Action</th>}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/60">
                                          {outp.activities.map((act) => (
                                            <tr key={act.id} className="hover:bg-white transition-colors">
                                              <td className="py-2 px-3 font-mono font-bold text-slate-800 text-[11px]">
                                                {act.activityNumber}
                                              </td>
                                              <td className="py-2 px-3 text-slate-800 font-medium">
                                                <div
                                                  onClick={() => {
                                                    if (!isLocked) {
                                                      handleStartEditActivity(outcome.id, outp.id, act);
                                                    }
                                                  }}
                                                  className={`inline-flex items-center gap-1.5 ${
                                                    !isLocked ? 'hover:text-amber-800 cursor-pointer' : ''
                                                  }`}
                                                  title={!isLocked ? "Click to edit Activity" : undefined}
                                                >
                                                  <span>{act.description}</span>
                                                  {!isLocked && (
                                                    <span className="p-0.5 text-slate-400 hover:text-amber-700 transition-colors" title="Edit Activity">
                                                      <Edit2 className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="py-2 px-3 text-slate-600 text-[11px]">
                                                {act.leadPartner}
                                              </td>
                                              <td className="py-2 px-2 text-center text-[10px] text-slate-500 whitespace-nowrap">
                                                {act.startDate ? formatDate(act.startDate) : 'TBD'} –{' '}
                                                {act.endDate ? formatDate(act.endDate) : 'TBD'}
                                              </td>
                                              {/* Interactive Live Budget Input / Display */}
                                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                                {isLocked ? (
                                                  <span className="font-mono font-extrabold text-emerald-800">
                                                    {formatCurrency(act.cost, currency)}
                                                  </span>
                                                ) : (
                                                  <div className="flex items-center justify-end gap-1">
                                                    <span className="text-[10px] text-slate-400">$</span>
                                                    <input
                                                      type="number"
                                                      min={0}
                                                      step={1000}
                                                      value={act.cost}
                                                      onChange={(e) =>
                                                        handleUpdateActivityCost(
                                                          outcome.id,
                                                          outp.id,
                                                          act.id,
                                                          Number(e.target.value)
                                                        )
                                                      }
                                                      className="w-24 p-1 text-right bg-white border border-slate-300 rounded font-mono font-bold text-xs text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                  </div>
                                                )}
                                              </td>
                                              <td className="py-2 px-2 text-center">
                                                <span
                                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                    act.status === 'Completed'
                                                      ? 'bg-emerald-100 text-emerald-800'
                                                      : act.status === 'In Progress'
                                                      ? 'bg-sky-100 text-sky-800'
                                                      : act.status === 'Deferred'
                                                      ? 'bg-rose-100 text-rose-800'
                                                      : 'bg-slate-100 text-slate-700'
                                                  }`}
                                                >
                                                  {act.status}
                                                </span>
                                              </td>
                                              {!isLocked && (
                                                <td className="py-2 px-2 text-right whitespace-nowrap">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleStartEditActivity(
                                                        outcome.id,
                                                        outp.id,
                                                        act
                                                      )
                                                    }
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs mr-1.5"
                                                    title="Edit Activity"
                                                  >
                                                    <Edit2 className="w-3 h-3 text-amber-700" />
                                                    <span>Edit</span>
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleDeleteActivity(
                                                        outcome.id,
                                                        outp.id,
                                                        act.id
                                                      )
                                                    }
                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                    title="Delete Activity"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </td>
                                              )}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT OUTCOME MODAL */}
      {editingOutcome && !isLocked && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Edit Strategic Outcome
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update outcome identifier, core transformation statement, and assumptions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOutcome(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOutcome} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Outcome Label / Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={editOutcomeNumber}
                  onChange={(e) => setEditOutcomeNumber(e.target.value)}
                  placeholder="e.g. Outcome 1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Outcome Narrative Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editOutcomeNarrative}
                  onChange={(e) => setEditOutcomeNarrative(e.target.value)}
                  placeholder="State the transformative institutional, economic, or social change..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-amber-500 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Critical Assumptions & Enablers
                </label>
                <textarea
                  rows={2}
                  value={editOutcomeAssumptions}
                  onChange={(e) => setEditOutcomeAssumptions(e.target.value)}
                  placeholder="External factors, policies, or stakeholder commitments assumed..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOutcome(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Outcome Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OUTPUT MODAL */}
      {editingOutput && !isLocked && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-700 rounded-xl border border-sky-200">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Edit Output Deliverable
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Modify output identifier, narrative specification, targets, and delivery leads.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOutput(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOutput} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Output Code / Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={editOutputNumber}
                    onChange={(e) => setEditOutputNumber(e.target.value)}
                    placeholder="e.g. Output 1.1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono font-bold focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Responsible Focal Person / Lead Unit
                  </label>
                  <input
                    type="text"
                    value={editOutputResponsible}
                    onChange={(e) => setEditOutputResponsible(e.target.value)}
                    placeholder="e.g. Project Lead / Directorate"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Output Narrative Deliverable *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editOutputNarrative}
                  onChange={(e) => setEditOutputNarrative(e.target.value)}
                  placeholder="Concrete deliverable, tangible facility, regulatory treaty, or completed asset..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Key Performance Target / Milestone
                  </label>
                  <input
                    type="text"
                    value={editOutputTarget}
                    onChange={(e) => setEditOutputTarget(e.target.value)}
                    placeholder="e.g. 5 border crossing facilities upgraded"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Delivery Horizon / Timeline
                  </label>
                  <input
                    type="text"
                    value={editOutputTimeline}
                    onChange={(e) => setEditOutputTimeline(e.target.value)}
                    placeholder="e.g. Q1 2027 - Q4 2028"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOutput(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Output Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTIVITY MODAL */}
      {editingActivity && !isLocked && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Edit Budgeted Activity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update scope of work, implementing partner, costing, milestone timeline, and status.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditActivity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Activity Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editActNumber}
                    onChange={(e) => setEditActNumber(e.target.value)}
                    placeholder="e.g. ACT-1.1.1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Lead Implementation Partner *
                  </label>
                  <select
                    value={editActPartner}
                    onChange={(e) => setEditActPartner(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Direct AUDA-NEPAD Implementation">
                      Direct AUDA-NEPAD Implementation
                    </option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Activity Description & Technical Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editActDesc}
                  onChange={(e) => setEditActDesc(e.target.value)}
                  placeholder="Articulate key inputs, consultancy services, civil works, or technical workshops..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Budget Cost ({currency}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={editActCost}
                    onChange={(e) => setEditActCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Execution Status
                  </label>
                  <select
                    value={editActStatus}
                    onChange={(e) => setEditActStatus(e.target.value as Activity['status'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Target Milestone / Output
                  </label>
                  <input
                    type="text"
                    value={editActTarget}
                    onChange={(e) => setEditActTarget(e.target.value)}
                    placeholder="e.g. 1 completed report"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editActStart}
                    onChange={(e) => setEditActStart(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editActEnd}
                    onChange={(e) => setEditActEnd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Timeline Span
                  </label>
                  <input
                    type="text"
                    value={editActTimeline}
                    onChange={(e) => setEditActTimeline(e.target.value)}
                    placeholder="e.g. 12 months"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Operational Notes & Comments
                </label>
                <textarea
                  rows={2}
                  value={editActNotes}
                  onChange={(e) => setEditActNotes(e.target.value)}
                  placeholder="Procurement notes, consultant requisitions, partner counterpart funding details..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Activity Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INDICATOR MODAL */}
      {editingIndicator && !isLocked && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Edit Outcome KPI Indicator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Modify indicator metric, baselines, targets, and verification sources.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingIndicator(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditIndicator} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Indicator Code
                  </label>
                  <input
                    type="text"
                    value={editIndNumber}
                    onChange={(e) => setEditIndNumber(e.target.value)}
                    placeholder="e.g. IND-01"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Indicator Name / Metric *
                  </label>
                  <input
                    type="text"
                    required
                    value={editIndName}
                    onChange={(e) => setEditIndName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Indicator Definition / Methodology
                </label>
                <textarea
                  rows={2}
                  value={editIndDefinition}
                  onChange={(e) => setEditIndDefinition(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Baseline Value
                  </label>
                  <input
                    type="text"
                    value={editIndBaselineVal}
                    onChange={(e) => setEditIndBaselineVal(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Target Value *
                  </label>
                  <input
                    type="text"
                    required
                    value={editIndTargetVal}
                    onChange={(e) => setEditIndTargetVal(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    value={editIndUnit}
                    onChange={(e) => setEditIndUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Data Source
                  </label>
                  <input
                    type="text"
                    value={editIndDataSource}
                    onChange={(e) => setEditIndDataSource(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Reporting Frequency
                  </label>
                  <input
                    type="text"
                    value={editIndFrequency}
                    onChange={(e) => setEditIndFrequency(e.target.value)}
                    placeholder="e.g. Annual, Quarterly"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Responsible Person / Unit
                  </label>
                  <input
                    type="text"
                    value={editIndResponsible}
                    onChange={(e) => setEditIndResponsible(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingIndicator(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Indicator Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
