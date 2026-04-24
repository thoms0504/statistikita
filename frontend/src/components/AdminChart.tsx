'use client';

import { useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import cloud from 'd3-cloud';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#f97316'];
const chartText = 'var(--chart-text)';
const chartMuted = 'var(--chart-muted)';
const chartGrid = 'var(--chart-grid)';
const chartTooltipBg = 'var(--chart-tooltip-bg)';
const chartBorder = 'var(--chart-border)';

// ─── Bar Chart ───────────────────────────────────────────────
interface BarChartProps {
  data: { date?: string; name?: string; count: number }[];
  title: string;
  xKey?: string;
}

export function AdminBarChart({ data, title, xKey = 'date' }: BarChartProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: chartMuted }} axisLine={{ stroke: chartGrid }} tickLine={{ stroke: chartGrid }} />
          <YAxis tick={{ fontSize: 11, fill: chartMuted }} axisLine={{ stroke: chartGrid }} tickLine={{ stroke: chartGrid }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${chartBorder}`, backgroundColor: chartTooltipBg, color: chartText }} />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Pie Chart ───────────────────────────────────────────────
interface PieChartProps {
  data: { name: string; count: number }[];
  title: string;
}

export function AdminPieChart({ data, title }: PieChartProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${chartBorder}`, backgroundColor: chartTooltipBg, color: chartText }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart
interface LineChartProps {
  data: Record<string, string | number | undefined>[];
  title: string;
  xKey?: string;
  height?: number;
  lines: { key: string; label: string; color: string }[];
}

export function AdminLineChart({ data, title, xKey = 'date', height = 220, lines }: LineChartProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: chartMuted }} axisLine={{ stroke: chartGrid }} tickLine={{ stroke: chartGrid }} />
          <YAxis tick={{ fontSize: 11, fill: chartMuted }} axisLine={{ stroke: chartGrid }} tickLine={{ stroke: chartGrid }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${chartBorder}`, backgroundColor: chartTooltipBg, color: chartText }} />
          <Legend wrapperStyle={{ fontSize: 11, color: chartMuted }} />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Word Cloud
interface CloudWord {
  text: string;
  value: number;
  x?: number;
  y?: number;
  rotate?: number;
  size?: number;
}

interface WordCloudProps {
  words: CloudWord[];
  title: string;
}

export function AdminWordCloud({ words, title }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const WIDTH = 500;
  const HEIGHT = 220;

  useEffect(() => {
    if (!words || words.length === 0 || !svgRef.current) return;

    const svg = svgRef.current;
    // Clear previous render
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const maxVal = Math.max(...words.map(w => w.value), 1);

    const layout = cloud<CloudWord>()
      .size([WIDTH, HEIGHT])
      .words(words.map(w => ({ ...w })))
      .padding(4)
      .rotate(() => (Math.random() > 0.7 ? 90 : 0))
      .fontSize(w => Math.max(12, Math.min(42, 12 + (w.value / maxVal) * 30)))
      .on('end', (placed) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${WIDTH / 2},${HEIGHT / 2})`);

        placed.forEach((w, i) => {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('transform', `translate(${w.x ?? 0},${w.y ?? 0}) rotate(${w.rotate ?? 0})`);
          text.setAttribute('font-size', `${w.size ?? 14}px`);
          text.setAttribute('font-weight', '600');
          text.setAttribute('fill', COLORS[i % COLORS.length]);
          text.setAttribute('style', 'cursor:default');
          text.textContent = w.text ?? '';
          g.appendChild(text);
        });

        svg.appendChild(g);
      });

    layout.start();
  }, [words]);

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">{title}</h3>
      {words.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">
          Belum ada data
        </div>
      ) : (
        <svg
          ref={svgRef}
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </div>
  );
}
