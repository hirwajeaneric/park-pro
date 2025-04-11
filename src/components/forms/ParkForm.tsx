/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPark } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { CreateParkForm } from '@/types';

const ParkFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    location: z.string().min(1, 'Location is required'),
    description: z.string().min(1, 'Description is required'),
});

export default function ParkForm() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm<CreateParkForm>({
        resolver: zodResolver(ParkFormSchema),
        defaultValues: {
            name: '',
            location: '',
            description: '',
        },
    });

    const mutation = useMutation({
        mutationFn: createPark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parks'] });
            toast.success('Park created successfully');
            router.push('/admin/parks');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create park');
        },
    });

    const onSubmit = (data: CreateParkForm) => {
        mutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Creating...' : 'Create Park'}
                </Button>
            </form>
        </Form>
    );
}