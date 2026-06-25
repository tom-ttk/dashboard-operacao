import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Gauge,
  Users,
  BarChart3,
  Target,
} from "lucide-react";

const weekdaysPt = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const weekdayFullNames: Record<string, string> = {
  Seg: "Segunda-feira",
  Ter: "Terça-feira",
  Qua: "Quarta-feira",
  Qui: "Quinta-feira",
  Sex: "Sexta-feira",
  Sáb: "Sábado",
  Dom: "Domingo",
};

function formatPct(value: number) {
  return `${value.toFixed(1).replace(".", ",")} %`;
}

function formatNum(value: number) {
  return value.toFixed(1).replace(".", ",");
}

function formatInt(value: number) {
  return Math.round(value).toString();
}

function coverageColorClass(value: number) {
  if (value <= 50) return "text-red-600";
  if (value <= 70) return "text-orange-500";
  return "text-emerald-600";
}

function buildDates(year: number, monthIndex: number, days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, monthIndex, i + 1);
    const weekday = weekdaysPt[date.getDay() === 0 ? 6 : date.getDay() - 1];
    return { day: i + 1, date, weekday };
  });
}

const june2026 = buildDates(2026, 5, 30);

const ptCurrent = [4, 4, 5, 6, 5, 5, 5, 4, 4, 5, 4, 5, 4, 5, 5, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 5, 4, 5, 5, 5];
const ftCurrent = [9, 8, 9, 9, 7, 8, 8, 8, 8, 7, 7, 8, 7, 8, 8, 9, 9, 9, 7, 8, 8, 9, 8, 9, 12, 8, 8, 8, 9, 9];

const ptTarget = [7, 7, 7, 7, 8, 8, 8, 7, 7, 7, 7, 7, 8, 8, 8, 7, 7, 7, 7, 7, 8, 8, 8, 7, 7, 7, 7, 8, 8, 8];
const ftTarget = Array.from({ length: 30 }, () => 15);

const vacancyPt = [2, 3, 2, 1, 0, 0, 1, 2, 0, 0, 3, 1, 3, 2, 2, 0, 3, 1, 2, 2, 2, 1, 2, 2, 2, 0, 3, 3, 2, 1];
const vacancyFt = [1, 2, 1, 0, 2, 1, 3, 0, 0, 2, 0, 0, 2, 1, 1, 0, 0, 0, 3, 0, 1, 1, 0, 3, 2, 0, 0, 1, 0, 0];

type DayRow = {
  day: number;
  weekday: string;
  actual: number;
  target: number;
  deficit: number;
  vacancyPt: number;
  vacancyFt: number;
  vacancyTotal: number;
  ptCurrent: number;
  ftCurrent: number;
  ptTarget: number;
  ftTarget: number;
};

export default function App() {
  const [monthName] = useState("Junho / 2026");
  const [selectedDay, setSelectedDay] = useState(11);

  const rows = useMemo<DayRow[]>(() => {
    return june2026.map((d, idx) => {
      const actual = ptCurrent[idx] + ftCurrent[idx];
      const target = ptTarget[idx] + ftTarget[idx];
      const deficit = target - actual;
      const vacancyPtDay = vacancyPt[idx];
      const vacancyFtDay = vacancyFt[idx];
      const vacancyTotal = vacancyPtDay + vacancyFtDay;

      return {
        day: d.day,
        weekday: d.weekday,
        actual,
        target,
        deficit,
        vacancyPt: vacancyPtDay,
        vacancyFt: vacancyFtDay,
        vacancyTotal,
        ptCurrent: ptCurrent[idx],
        ftCurrent: ftCurrent[idx],
        ptTarget: ptTarget[idx],
        ftTarget: ftTarget[idx],
      };
    });
  }, []);

  const selectedRow = useMemo(() => rows.find((row) => row.day === selectedDay) ?? rows[0], [rows, selectedDay]);

  const dayAnalysis = useMemo(() => {
    if (!selectedRow) return null;
    const coverage = (selectedRow.actual / selectedRow.target) * 100;
    return {
      coverage,
      deficit: selectedRow.deficit,
      actual: selectedRow.actual,
      target: selectedRow.target,
      ptCurrent: selectedRow.ptCurrent,
      ptTarget: selectedRow.ptTarget,
      ftCurrent: selectedRow.ftCurrent,
      ftTarget: selectedRow.ftTarget,
      weekdayLabel: weekdayFullNames[selectedRow.weekday] ?? selectedRow.weekday,
    };
  }, [selectedRow]);

  const metrics = useMemo(() => {
    const totalActual = rows.reduce((sum, row) => sum + row.actual, 0);
    const totalTarget = rows.reduce((sum, row) => sum + row.target, 0);
    const totalDeficit = rows.reduce((sum, row) => sum + row.deficit, 0);
    const totalVacancyPt = rows.reduce((sum, row) => sum + row.vacancyPt, 0);
    const totalVacancyFt = rows.reduce((sum, row) => sum + row.vacancyFt, 0);
    const totalVacancyAll = totalVacancyPt + totalVacancyFt;

    const avgActual = totalActual / rows.length;
    const avgTarget = totalTarget / rows.length;
    const avgGap = totalDeficit / rows.length;

    return {
      totalActual,
      totalTarget,
      totalDeficit,
      totalVacancyPt,
      totalVacancyFt,
      totalVacancyAll,
      avgActual,
      avgTarget,
      avgGap,
    };
  }, [rows]);

  const dailyOperationData = useMemo(
    () =>
      rows.map((row) => ({
        day: row.day,
        equipe1115: row.ptCurrent,
        equipe1218: row.ftCurrent,
        gap: row.deficit,
        meta: row.target,
      })),
    [rows]
  );

  const currentVacancyPt = 11;
  const currentVacancyFt = 27;
  const currentVacancyAll = 38;

  const coveragePieData = selectedRow
    ? [
        { name: "Presentes", value: selectedRow.actual },
        { name: "Falta", value: Math.max(0, selectedRow.deficit) },
      ]
    : [
        { name: "Presentes", value: 0 },
        { name: "Falta", value: 0 },
      ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">Dashboard de Operação & Cobertura</h1>
                  <p className="mt-1 text-sm text-white/80">
                    Comparativo entre o cenário atual e o cenário ideal da operação.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Período analisado</p>
              <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                <CalendarDays className="h-5 w-5" /> {monthName}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard icon={<Users className="h-5 w-5" />} label="Média atual" value={formatNum(metrics.avgActual)} helper="equipes por dia" />
          <KpiCard icon={<Target className="h-5 w-5" />} label="Média ideal" value={formatNum(metrics.avgTarget)} helper="equipes por dia" />
          <KpiCard icon={<Activity className="h-5 w-5" />} label="Gap médio" value={formatNum(metrics.avgGap)} helper="equipes por dia" />
          <KpiCard icon={<AlertTriangle className="h-5 w-5" />} label="Vagas PT atuais" value={formatInt(currentVacancyPt)} helper="abertas hoje" />
          <KpiCard icon={<AlertTriangle className="h-5 w-5" />} label="Vagas FT atuais" value={formatInt(currentVacancyFt)} helper="abertas hoje" />
          <KpiCard icon={<AlertTriangle className="h-5 w-5" />} label="Total de vagas abertas" value={formatInt(currentVacancyAll)} helper="PT + FT" />
        </div>

        <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Atual x Real por dia</h2>
            <p className="text-sm text-slate-500">
              Comparativo diário entre equipes 11h–15h, equipes 12h–18h, gap atual e meta operacional.
            </p>
          </div>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyOperationData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={(value) => `Dia ${value}`} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatInt(Number(value))} />
                <Tooltip formatter={(value: any) => formatInt(Number(value))} labelFormatter={(label) => `Dia ${label}`} />
                <Legend />
                <Line type="monotone" dataKey="equipe1115" name="11h–15h" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="equipe1218" name="12h–18h" stroke="#16a34a" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="gap" name="Gap Atual" stroke="#ef4444" strokeWidth={3} dot={false} />
                <Line
                  type="monotone"
                  dataKey="meta"
                  name="Meta"
                  stroke="#f97316"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-5 grid gap-5 xl:grid-cols-5">
          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Análise por dia</h2>
                <p className="text-sm text-slate-500">Escolha um dia e veja o detalhamento da operação.</p>
              </div>
              <div className="min-w-[160px]">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0"
                >
                  {rows.map((row) => (
                    <option key={row.day} value={row.day}>
                      Dia {row.day} ({row.weekday})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {dayAnalysis && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-700">Resumo do dia</div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <MetricChip label="Atual" value={formatInt(dayAnalysis.actual)} color="green" />
                    <MetricChip label="Ideal" value={formatInt(dayAnalysis.target)} color="amber" />
                    <MetricChip label="Gap" value={formatInt(dayAnalysis.deficit)} color="red" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    No <strong>{dayAnalysis.weekdayLabel}</strong>, você teve {formatInt(dayAnalysis.actual)} equipes e o ideal era {formatInt(dayAnalysis.target)}. A diferença foi de {formatInt(dayAnalysis.deficit)} equipes.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-700">Detalhe por turno</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span>Equipes Part-time atual / ideal</span>
                      <strong className="text-red-600">{formatInt(dayAnalysis.ptCurrent)} / {formatInt(dayAnalysis.ptTarget)}</strong>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span>Equipes Full-time atual / ideal</span>
                      <strong className="text-red-600">{formatInt(dayAnalysis.ftCurrent)} / {formatInt(dayAnalysis.ftTarget)}</strong>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span>Cobertura do dia</span>
                      <strong className={coverageColorClass(dayAnalysis.coverage)}>{formatPct(dayAnalysis.coverage)}</strong>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    O <strong>gap</strong> é a diferença entre o ideal e o atual. Se o gap é 4, significa que faltam 4 equipes para atingir a meta daquele dia.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
            <h2 className="mb-1 text-lg font-bold text-slate-900">Cobertura do dia</h2>
            <p className="mb-3 text-sm text-slate-500">Verde = equipes presentes. Vermelho = falta para o ideal.</p>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coveragePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#16a34a" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(value: any) => formatInt(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Presentes</div>
                <div className="mt-1 text-2xl font-black text-emerald-700">{formatInt(selectedRow.actual)}</div>
              </div>
              <div className="rounded-2xl bg-red-50 p-3 ring-1 ring-red-100">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Faltam</div>
                <div className="mt-1 text-2xl font-black text-red-700">{formatInt(selectedRow.deficit)}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> leitura do dia selecionado
              </div>

              <div className="mt-2 text-sm text-slate-600">
                <strong className={coverageColorClass(dayAnalysis ? dayAnalysis.coverage : 0)}>
                  {formatPct(dayAnalysis ? dayAnalysis.coverage : 0)}
                </strong>{" "}
                de cobertura no dia selecionado.
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Presentes = <strong>{formatInt(selectedRow.actual)}</strong> equipes (
                <strong>{formatInt(selectedRow.ptCurrent)}</strong> part-time +{" "}
                <strong>{formatInt(selectedRow.ftCurrent)}</strong> full-time).
              </div>
            </div>
          </section>
        </div>

        <section className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-bold text-slate-900">Leitura rápida da operação</h2>
          <p className="mb-4 text-sm text-slate-500">Resumo objetivo do cenário atual.</p>

          <div className="grid gap-4 md:grid-cols-2">
            <ComparisonBox title="Equipes Part-time" actualValue={formatInt(ptCurrent.reduce((a, b) => a + b, 0) / ptCurrent.length)} idealValue={formatInt(ptTarget.reduce((a, b) => a + b, 0) / ptTarget.length)} />
            <ComparisonBox title="Equipes Full-time" actualValue={formatInt(ftCurrent.reduce((a, b) => a + b, 0) / ftCurrent.length)} idealValue={formatInt(ftTarget.reduce((a, b) => a + b, 0) / ftTarget.length)} />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Gauge className="h-4 w-4 text-blue-600" /> Medição de impacto
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O gap médio diário da operação é de <strong>{formatNum(metrics.avgGap)}</strong> equipes.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Total de vagas abertas atuais: <strong>{formatInt(currentVacancyAll)}</strong>.
            </p>
          </div>
        </section>
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">Tabela analítica por dia</h2>
            <p className="text-sm text-slate-500">Base para comparação e leitura detalhada.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Dia</th>
                  <th className="px-4 py-3 text-left font-semibold">Semana</th>
                  <th className="px-4 py-3 text-right font-semibold">Atual</th>
                  <th className="px-4 py-3 text-right font-semibold">Ideal</th>
                  <th className="px-4 py-3 text-right font-semibold">Gap</th>
                  <th className="px-4 py-3 text-right font-semibold">Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const coverage = (row.actual / row.target) * 100;
                  return (
                    <tr key={row.day} className="border-t border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium">{row.day}</td>
                      <td className="px-4 py-3">{row.weekday}</td>
                      <td className="px-4 py-3 text-right">{formatInt(row.actual)}</td>
                      <td className="px-4 py-3 text-right">{formatInt(row.target)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${row.deficit > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {formatInt(row.deficit)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${coverageColorClass(coverage)}`}>{formatPct(coverage)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-red-50 p-2 text-red-700 ring-1 ring-red-100">{icon}</div>
      </div>
      <div className="mt-4 text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{helper}</div>
    </div>
  );
}

function ComparisonBox({
  title,
  actualValue,
  idealValue,
}: {
  title: string;
  actualValue: string;
  idealValue: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">Atual</div>
          <div className="mt-1 text-3xl font-black text-red-600">{actualValue}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Ideal</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{idealValue}</div>
        </div>
      </div>
    </div>
  );
}

function MetricChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "green" | "red" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  } as const;

  return (
    <div className={`rounded-2xl px-3 py-2 ring-1 ${colors[color]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{label}</div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}
