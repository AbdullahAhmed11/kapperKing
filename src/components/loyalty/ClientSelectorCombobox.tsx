import React, { useState, useEffect } from 'react';
import { useClientStore, Client } from '@/lib/store/clients';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // For conditional classes

interface ClientSelectorComboboxProps {
  salonId: string;
  selectedClientId: string | null;
  onClientSelected: (clientId: string | null) => void;
  // Optional: Filter out clients already in the loyalty program?
  // filterExistingMembers?: boolean; 
}

export function ClientSelectorCombobox({ salonId, selectedClientId, onClientSelected }: ClientSelectorComboboxProps) {
  const { clients, fetchClients, loading } = useClientStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Fetch clients when the combobox might be opened or salonId changes
    if (salonId) {
      fetchClients(salonId);
    }
  }, [salonId, fetchClients]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedClient
            ? `${selectedClient.firstName} ${selectedClient.lastName} (${selectedClient.email})`
            : "Select client to enroll..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
             <CommandEmpty>No client found.</CommandEmpty>
             <CommandGroup>
               {loading && <CommandItem disabled>Loading...</CommandItem>}
               {!loading && clients.map((client) => (
                 <CommandItem
                   key={client.id}
                   value={`${client.firstName} ${client.lastName} ${client.email}`} // Value for searching
                   onSelect={() => {
                     onClientSelected(client.id === selectedClientId ? null : client.id); // Allow deselecting
                     setOpen(false);
                   }}
                 >
                   <Check
                     className={cn(
                       "mr-2 h-4 w-4",
                       selectedClientId === client.id ? "opacity-100" : "opacity-0"
                     )}
                   />
                   {client.firstName} {client.lastName} ({client.email})
                 </CommandItem>
               ))}
             </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}