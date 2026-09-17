import React from 'react';
import { User, FunctionCallLog } from '../types';
import { VipSubscriptionSection } from './VipSubscriptionSection';

interface AiStudioHubProps {
  functionLogs?: FunctionCallLog[];
  onExecuteManualTool?: (toolName: 'ban_user' | 'start_game' | 'send_virtual_gift', args: Record<string, any>) => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onTestEntranceInRoom?: (tierLevel: number, message: string) => void;
}

export const AiStudioHub: React.FC<AiStudioHubProps> = ({
  currentUser,
  onUpdateUser,
  onTestEntranceInRoom,
}) => {
  return (
    <div className="space-y-4 text-slate-100">
      <VipSubscriptionSection
        currentUser={currentUser}
        onUpdateUser={onUpdateUser}
        onTestEntranceInRoom={onTestEntranceInRoom}
      />
    </div>
  );
};
