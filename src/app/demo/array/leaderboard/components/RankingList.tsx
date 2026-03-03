'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RankEntry } from '../types';

interface RankingListProps {
  entries: RankEntry[];
}

/**
 * 排行榜列表组件
 */
export function RankingList({ entries }: RankingListProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-black';
      case 2:
        return 'bg-slate-400 text-black';
      case 3:
        return 'bg-orange-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const formatScore = (score: number) => score.toLocaleString();

  const getWinRate = (wins: number, total: number) => {
    return total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : '0%';
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">排行榜</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="border-b border-slate-700">
                <th className="px-4 py-2 text-left text-slate-400 w-16">排名</th>
                <th className="px-4 py-2 text-left text-slate-400">玩家</th>
                <th className="px-4 py-2 text-right text-slate-400 w-24">积分</th>
                <th className="px-4 py-2 text-right text-slate-400 w-20">胜率</th>
                <th className="px-4 py-2 text-center text-slate-400 w-16">变化</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.player.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold text-sm ${getRankStyle(entry.rank)}`}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${entry.player.avatarColor}`}
                      >
                        {entry.player.nickname.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{entry.player.nickname}</div>
                        <div className="text-xs text-slate-500">
                          Lv.{entry.player.level}
                          {entry.player.guild && ` · ${entry.player.guild}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right text-cyan-400 font-mono">
                    {formatScore(entry.player.score)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300">
                    {getWinRate(entry.player.wins, entry.player.totalGames)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      {entry.rankChange > 0 ? (
                        <span className="flex items-center text-green-400 text-xs">
                          <ArrowUp className="w-3 h-3" />
                          {entry.rankChange}
                        </span>
                      ) : entry.rankChange < 0 ? (
                        <span className="flex items-center text-red-400 text-xs">
                          <ArrowDown className="w-3 h-3" />
                          {Math.abs(entry.rankChange)}
                        </span>
                      ) : (
                        <Minus className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
