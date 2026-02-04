import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useAvatarUpload = () => {
    const { user, updateAvatar } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadAvatar = async (file: File): Promise<string | null> => {
        if (!user) {
            setError('Not authenticated');
            return null;
        }

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('File must be an image');
            return null;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('File size must be less than 2MB');
            return null;
        }

        try {
            setIsUploading(true);
            setError(null);

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;

            // Update user profile with avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                // Still continue - the avatar was uploaded
            }

            // Update auth context
            updateAvatar(publicUrl);

            return publicUrl;
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setError('Failed to upload avatar');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteAvatar = async (): Promise<boolean> => {
        if (!user || !user.avatar_url) return false;

        try {
            setIsUploading(true);

            // Extract file path from URL
            const url = new URL(user.avatar_url);
            const pathParts = url.pathname.split('/avatars/');
            if (pathParts.length < 2) return false;

            const filePath = pathParts[1];

            // Delete from storage
            await supabase.storage.from('avatars').remove([filePath]);

            // Clear profile avatar
            await supabase
                .from('profiles')
                .update({ avatar_url: null, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            // Update auth context
            updateAvatar(null);

            return true;
        } catch (err) {
            console.error('Error deleting avatar:', err);
            setError('Failed to delete avatar');
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadAvatar,
        deleteAvatar,
        isUploading,
        error,
    };
};
