/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useState } from 'react';
import { storage } from '@/configs/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Loader2, Upload } from 'lucide-react';

const CreateActivityFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
    description: z.string(),
    picture: z.string().min(1, 'Image is required').url({ message: 'Must be a valid URL' }),
    capacityPerDay: z.coerce.number({ invalid_type_error: 'Capacity must be a number' }).positive('Capacity must be positive'),
});

export default function CreateActivityForm() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);

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

    const uploadImage = async (file: File): Promise<string> => {
        const storageRef = ref(storage, `activities/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                reject,
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const imageUrl = await uploadImage(file);
            form.setValue('picture', imageUrl, { shouldValidate: true });
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

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
                            <FormLabel>Cover Image</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="hidden"
                                            id="activity-image-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploading}
                                            onClick={() => document.getElementById('activity-image-upload')?.click()}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Image
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {field.value && (
                                        <div className="mt-2">
                                            <img src={field.value} alt="Activity cover" className="w-full h-48 object-cover rounded-md" />
                                        </div>
                                    )}
                                </div>
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