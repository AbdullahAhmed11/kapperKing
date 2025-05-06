import { useEffect } from 'react'; // Removed React default import
import { useLoyaltyStore, LoyaltyMember, LoyaltyPointLog } from '@/lib/store/loyalty'; // Import LoyaltyPointLog type
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

// TODO: Add LoyaltyPointLog type to loyalty.ts store and fetch action

interface LoyaltyPointHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: LoyaltyMember | null;
}

// Removed local placeholder type

export function LoyaltyPointHistory({ open, onOpenChange, member }: LoyaltyPointHistoryProps) {
  // Use state and actions from the store
  const { pointLog, loadingPointLog, error: errorLog, fetchPointLogByClientId } = useLoyaltyStore();
  // Renamed loadingLog -> loadingPointLog, errorLog -> error

  useEffect(() => {
    if (open && member?.id) {
      console.log(`TODO: Fetch point history for client ${member.id}`);
      fetchPointLogByClientId(member.id); // Call the fetch action
    }
  }, [open, member?.id, fetchPointLogByClientId]); // Add dependency

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Points History for {member?.firstName} {member?.lastName}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {loadingPointLog && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>}
          {errorLog && <div className="text-center py-4 text-red-600"><AlertCircle className="h-6 w-6 mx-auto mb-2"/>{errorLog}</div>}
          {!loadingPointLog && !errorLog && pointLog.length === 0 && (
             <p className="text-center text-gray-500 py-4">No points history found.</p>
          )}
          {!loadingPointLog && !errorLog && pointLog.length > 0 && (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Date</TableHead>
                   <TableHead>Reason</TableHead>
                   <TableHead className="text-right">Points Change</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {pointLog.map(log => (
                   <TableRow key={log.id}>
                     <TableCell>{format(new Date(log.created_at), 'PPp')}</TableCell>
                     <TableCell>{log.reason}</TableCell>
                     <TableCell className={`text-right font-medium ${log.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {log.points_change > 0 ? '+' : ''}{log.points_change}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}