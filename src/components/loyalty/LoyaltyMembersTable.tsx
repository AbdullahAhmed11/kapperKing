import React, { useState } from 'react';
import { useLoyaltyStore, LoyaltyMember } from '@/lib/store/loyalty'; // Import store
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react'; // For actions dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
// Removed duplicate Dialog import below
import { Label } from '@/components/ui/label'; // Import Label
import { Input } from '@/components/ui/input'; // Import Input
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Loader2 } from 'lucide-react'; // Import Loader2
import { useForm } from 'react-hook-form'; // Import useForm
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoyaltyPointHistory } from './LoyaltyPointHistory'; // Import history component

// TODO: Implement Add Points / Redeem Reward Modals/Actions

// Schema for adjustment form
const adjustmentSchema = z.object({
  points: z.number().int().refine(val => val !== 0, { message: "Points must be non-zero" }),
  reason: z.string().min(1, 'Reason is required'),
});
type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

export function LoyaltyMembersTable() {
  // State for adjustment dialog
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustingMember, setAdjustingMember] = useState<LoyaltyMember | null>(null);
  // State for history dialog (renamed for consistency)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyMember, setHistoryMember] = useState<LoyaltyMember | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const adjustmentForm = useForm<AdjustmentFormData>({ resolver: zodResolver(adjustmentSchema) });

  // Get fetch action for point logs
  const { adjustPoints, fetchPointLogByClientId } = useLoyaltyStore();

  // Removed duplicate declaration below
  // Note: Data fetching is triggered in the parent LoyaltyPage component
  const { members, loadingMembers } = useLoyaltyStore();

  const handleOpenAdjustDialog = (member: LoyaltyMember) => {
     setAdjustingMember(member);
     adjustmentForm.reset({ points: 0, reason: '' }); // Reset form
     setShowAdjustDialog(true);
  };

  const handleAdjustSubmit = async (data: AdjustmentFormData) => {
     if (!adjustingMember) return;
     setIsAdjusting(true);
     // Call the actual store action
     const success = await adjustPoints(adjustingMember.id, data.points, data.reason);
     setIsAdjusting(false);
     if (success) {
        setShowAdjustDialog(false);
     }
  };

  // Correct handler for opening history dialog and fetching data
  const handleOpenHistoryDialog = async (member: LoyaltyMember) => {
     setHistoryMember(member); // Use correct state setter
     setShowHistoryDialog(true); // Use correct state setter
     await fetchPointLogByClientId(member.id); // Fetch logs when opening
  };

  return (
    <div>
      {/* TODO: Add Search and Filter controls here */}
      <div className="mb-4 flex justify-end">
         <Button variant="outline" disabled>Filter</Button> {/* Placeholder */}
         {/* Add Member button might be better placed in header of LoyaltyPage */}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Recent Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingMembers && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">Loading members...</TableCell>
            </TableRow>
          )}
          {!loadingMembers && members.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">No loyalty members found.</TableCell>
            </TableRow>
          )}
          {!loadingMembers && members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
              <TableCell>
                 {member.loyalty_tier?.name ? (
                    <Badge variant="secondary">{member.loyalty_tier.name}</Badge>
                 ) : (
                    <span className="text-gray-500">-</span>
                 )}
              </TableCell>
              <TableCell>{member.loyalty_points}</TableCell>
              <TableCell>{format(new Date(member.created_at), 'yyyy-MM-dd')}</TableCell> {/* Assuming join date is client created_at */}
              <TableCell className="text-gray-500">{member.recent_activity || '-'}</TableCell> {/* Placeholder */}
              <TableCell className="text-right">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleOpenAdjustDialog(member)}>Adjust Points</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleOpenHistoryDialog(member)}>View History</DropdownMenuItem>
                       {/* Add other actions like Assign Tier manually? */}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Adjustment Dialog */}
      {adjustingMember && (
         <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Adjust Points for {adjustingMember.firstName} {adjustingMember.lastName}</DialogTitle>
                  <DialogDescription>Enter a positive number to add points or a negative number to subtract points.</DialogDescription>
               </DialogHeader>
               <form onSubmit={adjustmentForm.handleSubmit(handleAdjustSubmit)} className="space-y-4 py-2">
                  <div>
                     <Label htmlFor="points">Points (+/-)</Label>
                     <Input id="points" type="number" {...adjustmentForm.register('points', { valueAsNumber: true })} className="mt-1" placeholder="e.g., 50 or -20"/>
                     {adjustmentForm.formState.errors.points && <p className="mt-1 text-sm text-red-600">{adjustmentForm.formState.errors.points.message}</p>}
                  </div>
                   <div>
                     <Label htmlFor="reason">Reason</Label>
                     <Textarea id="reason" {...adjustmentForm.register('reason')} className="mt-1" placeholder="e.g., Manual correction, Birthday bonus"/>
                     {adjustmentForm.formState.errors.reason && <p className="mt-1 text-sm text-red-600">{adjustmentForm.formState.errors.reason.message}</p>}
                  </div>
                  <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isAdjusting}>Cancel</Button>
                     </DialogClose>
                     <Button type="submit" disabled={isAdjusting}>
                        {isAdjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Apply Adjustment
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      )}
      {/* Point History Dialog - Use correct state and props */}
      <LoyaltyPointHistory
         open={showHistoryDialog}
         onOpenChange={setShowHistoryDialog}
         member={historyMember}
      />
    </div>
  );
}