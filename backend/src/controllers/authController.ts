import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/connection';
import { z } from 'zod'; // Make sure to install: npm install zod

/**
 * Schema for password change validation
 */
const passwordChangeSchema = z.object({
  userId: z.string().uuid({ message: 'Valid user ID is required' }),
  currentPassword: z.string().min(8, { message: 'Current password must be at least 8 characters' }),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
});

/**
 * Change user password with proper authorization checks
 * Only the user themselves or an admin can change a user's password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = passwordChangeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: validationResult.error.errors 
      });
    }

    const { userId, currentPassword, newPassword } = validationResult.data;
    
    // Authorization check: Only allow users to change their own password or admins to change any password
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // If not changing own password, verify admin/root privileges
    if (req.user.id !== userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();
      
      if (!profile || (profile.role !== 'admin' && profile.role !== 'root')) {
        return res.status(403).json({ 
          error: 'Permission denied', 
          message: 'You can only change your own password' 
        });
      }
    }
    
    // Verify current password if user is changing their own password
    if (req.user.id === userId) {
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: req.user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        return res.status(401).json({ 
          error: 'Current password is incorrect',
          message: 'Please provide your current password correctly'
        });
      }
    }
    
    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (updateError) {
      return res.status(500).json({ 
        error: 'Password update failed',
        message: updateError.message 
      });
    }
    
    // Log the password change
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: req.user.id,
        action: 'password_change',
        target_id: userId,
        details: {
          changedBy: req.user.id,
          isAdminAction: req.user.id !== userId,
        },
        severity: 'info',
      });
    
    return res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Error changing password:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
};

/**
 * Request password reset email
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Send password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // We don't want to reveal if the email exists in our system for security reasons
    return res.status(200).json({
      message: 'If this email exists in our system, a password reset link has been sent',
    });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Return user profile without sensitive information
    return res.status(200).json({
      id: profile.id,
      username: profile.username,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      twoFactorEnabled: profile.two_factor_enabled || false,
      createdAt: profile.created_at,
      lastLogin: profile.last_login,
    });
  } catch (err) {
    console.error('Error getting current user:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
};
