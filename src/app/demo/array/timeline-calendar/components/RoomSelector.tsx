'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Room } from '../types';

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoom?: string;
  onRoomChange: (roomId: string | undefined) => void;
}

/**
 * 会议室选择器组件
 */
export function RoomSelector({ rooms, selectedRoom, onRoomChange }: RoomSelectorProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">会议室</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={selectedRoom === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => onRoomChange(undefined)}
          className="w-full cursor-pointer justify-start"
        >
          全部会议室
        </Button>
        {rooms.map((room) => (
          <Button
            key={room.id}
            variant={selectedRoom === room.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onRoomChange(room.id)}
            className="w-full cursor-pointer justify-between"
          >
            <span>{room.name}</span>
            <span className="text-xs opacity-70">{room.capacity}人</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
