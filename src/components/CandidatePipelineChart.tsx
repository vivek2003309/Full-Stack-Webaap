import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plane, 
  Filter, 
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { Application, StageNumber, STAGE_NAMES } from '../types';

interface CandidatePipelineChartProps {
  candidates: Application[];
  selectedStage: number | '' | null;
  onSelectStage: (stage: number | '') => void;
}

const STAGE_CONFIG: Record<StageNumber, { label: string; shortName: string; color: string; hoverColor: string }> = {
  1: { label: 'Application Review', shortName: '1. Review', color: '#38bdf8', hoverColor: '#0ea5e9' },
  2: { label: 'Interview & Trade Test', shortName: '2. Trade Test', color: '#818cf8', hoverColor: '#6366f1' },
  3: { label: 'Medical Fitness (GAMCA)', shortName: '3. Medical', color: '#2dd4bf', hoverColor: '#14b8a6' },
  4: { label: 'Visa Applied', shortName: '4. Visa Applied', color: '#f59e0b', hoverColor: '#d97706' },
  5: { label: 'Visa Approved', shortName: '5. Visa Approved', color: '#10b981', hoverColor: '#059669' },
  6: { label: 'PCC & Emigration Clearance', shortName: '6. PCC/POE', color: '#06b6d4', hoverColor: '#0891b2' },
  7: { label: 'Ticket & Deployment', shortName: '7. Ready to Fly', color: '#eab308', hoverColor: '#ca8a04' },
};

export const CandidatePipelineChart: React.FC<CandidatePipelineChartProps> = ({
  candidates,
  selectedStage,
  onSelectStage
}) => {
  // Aggregate candidate counts across stages 1 to 7
  const { chartData, totalCandidates, stageCounts, bottleneckStage, deploymentReadyCount } = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

    candidates.forEach(c => {
      const stage = Number(c.currentStage || 1);
      if (stage >= 1 && stage <= 7) {
        counts[stage] = (counts[stage] || 0) + 1;
      } else {
        counts[1] = (counts[1] || 0) + 1;
      }
    });

    const total = candidates.length;

    const data = ([1, 2, 3, 4, 5, 6, 7] as StageNumber[]).map(st => {
      const count = counts[st] || 0;
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
      return {
        stage: st,
        name: STAGE_CONFIG[st].shortName,
        fullName: STAGE_CONFIG[st].label,
        count,
        percentage: Number(pct),
        color: STAGE_CONFIG[st].color,
        hoverColor: STAGE_CONFIG[st].hoverColor
      };
    });

    // Find highest count stage for bottleneck insight
    let maxStage = 1;
    let maxCount = -1;
    ([1, 2, 3, 4, 5, 6, 7] as StageNumber[]).forEach(st => {
      if (counts[st] > maxCount) {
        maxCount = counts[st];
        maxStage = st;
      }
    });

    const readyCount = (counts[5] || 0) + (counts[6] || 0) + (counts[7] || 0);

    return {
      chartData: data,
      totalCandidates: total,
      stageCounts: counts,
      bottleneckStage: {
        stage: maxStage,
        name: STAGE_CONFIG[maxStage as StageNumber].label,
        count: maxCount
      },
      deploymentReadyCount: readyCount
    };
  }, [candidates]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isSelected = selectedStage === item.stage;

      return (
        <div className="bg-slate-950/95 border border-slate-700 shadow-xl rounded-xl p-3 text-xs z-50 backdrop-blur-md min-w-[200px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-amber-300">Stage {item.stage}</span>
            <span 
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${item.color}25`, color: item.color }}
            >
              {item.percentage}% of Pipeline
            </span>
          </div>
          <div className="font-semibold text-white mb-1">{item.fullName}</div>
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Candidates in Stage:</span>
            <span className="font-mono font-bold text-white text-sm">{item.count}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-amber-400/90 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>{isSelected ? 'Click to clear filter' : 'Click bar to filter candidate table'}</span>
          </div>
        </div>
      );
    };
    return null;
  };

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      
      {/* Top Header & Key Recruitment Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
              <span>Recruitment Pipeline & Stage Distribution</span>
              {selectedStage && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                  <span>Filtered: Stage {selectedStage}</span>
                  <button 
                    type="button" 
                    onClick={() => onSelectStage('')}
                    className="hover:text-white ml-0.5 cursor-pointer"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual breakdown of all active candidates across 7 official overseas deployment milestones. Click any bar or stage pill to instantly filter the candidate roster.
          </p>
        </div>

        {/* 3 Quick Pipeline Metric Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Total */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Total:</span>
            <span className="font-mono font-bold text-white">{totalCandidates}</span>
          </div>

          {/* Highest Volume Bottleneck */}
          <div 
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs cursor-pointer hover:border-amber-500/40 transition"
            onClick={() => onSelectStage(bottleneckStage.stage)}
            title={`Highest stage volume: ${bottleneckStage.name}. Click to view.`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400">Top Stage:</span>
            <span className="font-bold text-amber-300 text-[11px]">
              Stage {bottleneckStage.stage} ({bottleneckStage.count})
            </span>
          </div>

          {/* Deployment Ready */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <Plane className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Ready / Visa:</span>
            <span className="font-mono font-bold text-emerald-400">{deploymentReadyCount}</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      <div className="w-full h-56 sm:h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const clickedStage = state.activePayload[0].payload.stage;
                if (selectedStage === clickedStage) {
                  onSelectStage('');
                } else {
                  onSelectStage(clickedStage);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
              interval={0}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
            <Bar 
              dataKey="count" 
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              animationDuration={800}
            >
              {chartData.map((entry) => {
                const isSelected = selectedStage === entry.stage;
                const isAnySelected = selectedStage !== '' && selectedStage !== null && selectedStage !== undefined;
                
                // Dim other bars when a specific stage is filtered
                const barOpacity = isAnySelected ? (isSelected ? 1.0 : 0.35) : 0.9;

                return (
                  <Cell 
                    key={`stage-bar-${entry.stage}`}
                    fill={entry.color}
                    fillOpacity={barOpacity}
                    stroke={isSelected ? '#fbbf24' : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Quick-Filter Stage Chips */}
      <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => onSelectStage('')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            !selectedStage
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <span>All Stages</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            !selectedStage ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {totalCandidates}
          </span>
        </button>

        {chartData.map((item) => {
          const isSelected = selectedStage === item.stage;
          return (
            <button
              key={`filter-chip-stage-${item.stage}`}
              type="button"
              onClick={() => onSelectStage(isSelected ? '' : item.stage)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 border-2 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800/80'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
              <span 
                className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                style={{ 
                  backgroundColor: `${item.color}25`, 
                  color: item.color 
                }}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
