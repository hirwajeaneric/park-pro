/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActivity } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { CreateActivityRequest } from '@/types';
import { ImageUpload } from '../ui/image-upload';

const CreateActivityFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
    description: z.string(),
    picture: z.string().url({ message: 'Must be a valid URL' }),
    capacityPerDay: z.coerce.number({ invalid_type_error: 'Capacity must be a number' }).positive('Capacity must be positive'),
});

export default function CreateActivityForm() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const form = useForm<CreateActivityRequest>({
        resolver: zodResolver(CreateActivityFormSchema),
        defaultValues: {
            name: '',
            price: 0,
            description: '',
            picture: '',
            capacityPerDay: undefined,
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateActivityRequest) => createActivity(JSON.parse(localStorage.getItem('park-data') as string).id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', JSON.parse(localStorage.getItem('park-data') as string).id] });
            toast.success('Activity created successfully');
            router.push('/finance/activities');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create activity');
        },
    });

    const onSubmit = (data: CreateActivityRequest) => {
        mutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 max-w-md">
                <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter activity name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control as any}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="Enter price" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control as any}
                    name="picture"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Receipt</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    endpoint="resumeUpload"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control as any}
                    name="capacityPerDay"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacity Per Day</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter capacity per day" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Creating...' : 'Create Activity'}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/activities')}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}