'use client';

import { useState } from 'react';
import { Clock, CheckCircle, Layers } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────
type Difficulty = 'Beginner-friendly' | 'Some experience needed' | 'Advanced';

interface SimplePlaybook {
  id: number;
  name: string;
  whoNeedsThis: string;
  price: string;
  difficulty: Difficulty;
  description: string;
  timeEstimate: string;
  whatYouGet: [string, string, string];
}

// ─── Difficulty badge styles ────────────────────────────────────
const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  'Beginner-friendly': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Some experience needed': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

// ─── Inline playbook data ───────────────────────────────────────
const PLAYBOOKS: SimplePlaybook[] = [
  {
    id: 1,
    name: 'Private Ops Office',
    whoNeedsThis: 'Newly rich people overwhelmed by managing everything',
    price: '$15-30K/mo',
    difficulty: 'Beginner-friendly',
    description:
      'Help busy wealthy people run their complicated lives \u2014 manage homes, staff, travel, and emergencies.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 2,
    name: 'Ecosystem Orchestrator',
    whoNeedsThis: 'Ultra-rich families with too many service providers',
    price: '$20-40K/mo',
    difficulty: 'Advanced',
    description:
      'Be the one person who coordinates all their lawyers, bankers, doctors, and property managers.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 3,
    name: 'Family Cyber Command',
    whoNeedsThis: 'Families worried about hackers and scammers',
    price: '$10-25K/mo',
    difficulty: 'Some experience needed',
    description:
      'Protect wealthy families from AI-powered scams, wire fraud, and identity theft.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 4,
    name: 'Footprint Reduction',
    whoNeedsThis: 'Public figures who want more privacy',
    price: '$8-18K/mo',
    difficulty: 'Beginner-friendly',
    description:
      'Remove personal information from the internet and stop companies from tracking wealthy people.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 5,
    name: 'Household Workforce',
    whoNeedsThis: 'People with lots of household staff',
    price: '$12-22K/mo',
    difficulty: 'Some experience needed',
    description:
      'Help wealthy families hire, manage, and protect themselves from insider risks with their staff.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 6,
    name: 'Family Risk Council',
    whoNeedsThis: 'Family offices focused only on investments',
    price: '$15-35K/qtr',
    difficulty: 'Advanced',
    description:
      'Build the risk management system they\u2019re missing \u2014 covering everything except investments.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 7,
    name: 'Next-Gen Studio',
    whoNeedsThis: 'Wealthy families worried about succession',
    price: '$25-60K project',
    difficulty: 'Advanced',
    description:
      'Help families pass wealth to the next generation without conflict or confusion.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 8,
    name: 'Medical Navigation',
    whoNeedsThis: 'Busy executives frustrated with healthcare',
    price: '$8-20K/mo',
    difficulty: 'Beginner-friendly',
    description:
      'Coordinate doctors, specialists, and medical records so wealthy people get better care faster.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 9,
    name: 'Property Resilience',
    whoNeedsThis: 'Owners of expensive homes in risky areas',
    price: '$10-20K/yr',
    difficulty: 'Beginner-friendly',
    description:
      'Help wealthy homeowners get better insurance, protect their properties, and handle claims.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
  {
    id: 10,
    name: 'Travel Reliability',
    whoNeedsThis: 'Families who travel constantly',
    price: '$6-15K/mo',
    difficulty: 'Beginner-friendly',
    description:
      'Make sure travel goes smoothly \u2014 handle disruptions, medical needs, and complex logistics.',
    timeEstimate: 'You could be earning in as little as 6 weeks',
    whatYouGet: [
      'A ready-to-send proposal',
      'Scripts for your first conversation',
      'A step-by-step delivery guide',
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────
export default function SimplePlaybooksContent() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Ready-made service templates</h1>
        <p className="text-sm text-gray-400 mt-1">
          Each template is a complete business-in-a-box. Pick one and we walk you through
          everything.
        </p>
      </div>

      {/* 2-column card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {PLAYBOOKS.map((pb) => (
          <div
            key={pb.id}
            className={`relative bg-[#111827] border rounded-xl overflow-hidden transition-all hover:border-emerald-500/40 ${
              selected === pb.id
                ? 'border-emerald-500/60 ring-1 ring-emerald-500/20'
                : 'border-[#1e2a3a]'
            }`}
          >
            <div className="p-5">
              {/* Name + Price row */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-white leading-tight">{pb.name}</h3>
                <span className="text-lg font-bold text-emerald-400 whitespace-nowrap ml-3">
                  {pb.price}
                </span>
              </div>

              {/* Who needs this */}
              <p className="text-sm text-gray-400 mb-3">
                <span className="text-gray-500 font-medium">Who needs this:</span> {pb.whoNeedsThis}
              </p>

              {/* Difficulty badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${DIFFICULTY_STYLES[pb.difficulty]}`}
                >
                  {pb.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{pb.description}</p>

              {/* Time estimate */}
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-400">{pb.timeEstimate}</span>
              </div>

              {/* What you get */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  What you get
                </p>
                <ul className="space-y-1.5">
                  {pb.whatYouGet.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA button */}
              <button
                onClick={() => setSelected(pb.id)}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                Use this template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Playbook Composer label */}
      <div className="border border-dashed border-[#1e2a3a] rounded-xl p-6 flex items-center justify-center gap-3 hover:border-emerald-500/30 transition-colors cursor-pointer">
        <Layers className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-400 font-medium">
          Combine two services into one bigger offer
        </span>
      </div>
    </div>
  );
}
