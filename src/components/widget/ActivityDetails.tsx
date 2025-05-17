// components/ActivityDetails.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateActivity, deleteActivity } from '@/lib/api';
import { ActivityResponse } from '@/types';
import { z } from 'zod';
import { format } from 'date-fns';
import { FileUpload } from '../ui/file-upload';

const UpdateActivityFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
    description: z.string(),
    picture: z.string().url({ message: 'Must be a valid URL' }),
    capacityPerDay: z.coerce.number({ invalid_type_error: 'Capacity must be a number' }).positive('Capacity must be positive'),
});

type UpdateActivityFormData = z.infer<typeof UpdateActivityFormSchema>;

export default function ActivityDetails({ activity }: { activity: ActivityResponse }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const form = useForm<UpdateActivityFormData>({
        resolver: zodResolver(UpdateActivityFormSchema),
        defaultValues: {
            name: activity.name,
            price: activity.price,
            description: activity.description || '',
            picture: activity.picture || '',
            capacityPerDay: activity.capacityPerDay || undefined,
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateActivityFormData) => updateActivity(activity.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', activity.parkId] });
            toast.success('Activity updated successfully');
        },
        onError: (error: Error) => {
            throw error;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteActivity(activity.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', activity.parkId] });
            toast.success('Activity deleted successfully');
            router.push('/activities');
        },
        onError: (error: Error) => {
            throw error;
        },
    });

    const onSubmit = (data: UpdateActivityFormData) => {
        updateMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold">Activity Details</h2>
                <Button variant="outline" onClick={() => router.push('/finance/activities')}>
                    Back to Activities
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{activity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>Price:</strong> ${activity.price.toFixed(2)}</p>
                    <p><strong>Description:</strong> {activity.description || 'N/A'}</p>
                    <p><strong>Picture:</strong> {activity.picture ? <a href={activity.picture} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Cover Picture</a> : 'N/A'}</p>
                    <p><strong>Capacity Per Day:</strong> {activity.capacityPerDay || 'Unlimited'}</p>
                    <p><strong>Created At:</strong> {format(new Date(activity.createdAt), 'MMM dd, yyyy')}</p>
                    <p><strong>Updated At:</strong> {format(new Date(activity.updatedAt), 'MMM dd, yyyy')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Update Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter price" {...field} />
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
                                            <Textarea placeholder="Enter description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="picture"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image</FormLabel>
                                        <FormControl>
                                            <FileUpload
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
                                control={form.control}
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
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Updating...' : 'Update Activity'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteMutation.mutate()}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Activity'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}