import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';

const AppointmentAddForm = () => {
    const [services, setServices] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getServices = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/1`);
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Failed to fetch services.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getServices();
    }, []);

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="service">Service</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {selectedService
                                ? services.find((service) => service.id === selectedService)?.name
                                : "Select service..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search services..." />
                            <CommandEmpty>No services found.</CommandEmpty>
                            <CommandGroup>
                                <CommandList>
                                    {isLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : (
                                        services.map((service) => (
                                            <CommandItem
                                                key={service.id}
                                                value={service.id}
                                                onSelect={() => {
                                                    setSelectedService(
                                                        service.id === selectedService ? null : service.id
                                                    );
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={
                                                        "mr-2 h-4 w-4 " +
                                                        (selectedService === service.id ? "opacity-100" : "opacity-0")
                                                    }
                                                />
                                                {service.name}
                                            </CommandItem>
                                        ))
                                    )}
                                </CommandList>
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Display selected service details if needed */}
            {selectedService && (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">
                        {services.find((s) => s.id === selectedService)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {services.find((s) => s.id === selectedService)?.description}
                    </p>
                    <p className="text-sm font-medium mt-2">
                        €{services.find((s) => s.id === selectedService)?.price}
                    </p>
                </div>
            )}
        </div>
    );
}

export default AppointmentAddForm;