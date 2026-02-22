import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
type Request = ExpressRequest<any, any, any, any>;
type Response = ExpressResponse;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { validateEmail, validatePassword } from '../utils/validation';

const router = express.Router();

// Register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, universityId, departmentId, year, studentId } = req.body;

  // Log received data for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Registration request received:', {
      email: email ? 'provided' : 'missing',
      password: password ? 'provided' : 'missing',
      firstName: firstName ? 'provided' : 'missing',
      lastName: lastName ? 'provided' : 'missing',
      year,
      studentId
    });
  }

  // Validation - trim strings to remove whitespace
  const trimmedEmail = email?.toString().trim();
  const trimmedPassword = password?.toString().trim();
  const trimmedFirstName = firstName?.toString().trim();
  const trimmedLastName = lastName?.toString().trim();

  // Check which fields are missing
  const missingFields: string[] = [];
  if (!trimmedEmail) missingFields.push('email');
  if (!trimmedPassword) missingFields.push('password');
  if (!trimmedFirstName) missingFields.push('firstName');
  if (!trimmedLastName) missingFields.push('lastName');

  if (missingFields.length > 0) {
    throw createError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }

  // Use trimmed values
  const finalEmail = trimmedEmail;
  const finalPassword = trimmedPassword;
  const finalFirstName = trimmedFirstName;
  const finalLastName = trimmedLastName;

  if (!validateEmail(finalEmail)) {
    throw createError('Invalid email format. Please enter a valid email address.', 400);
  }

  if (!validatePassword(finalPassword)) {
    throw createError('Password must be at least 8 characters long.', 400);
  }

  // Check if user already exists
  // Attempt to match university domain (optional)
  const emailDomain = finalEmail.split('@')[1];
  const university = emailDomain
    ? await prisma.university.findFirst({
      where: {
        domain: emailDomain,
        isActive: true
      }
    })
    : null;

  // Hash password
  const hashedPassword = await bcrypt.hash(finalPassword, 12);

  // Parse year/semester
  let parsedYear: number | undefined;
  if (year !== undefined && year !== null && year !== '') {
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : Number(year);
    if (!isNaN(yearNum) && yearNum > 0 && yearNum <= 8) {
      parsedYear = yearNum;
    } else if (yearNum > 8) {
      parsedYear = yearNum;
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: finalEmail }
  });

  let user;

  if (existingUser) {
    if (existingUser.isVerified) {
      throw createError('User already exists with this email', 409);
    }

    // Update existing unverified user
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        firstName: finalFirstName,
        lastName: finalLastName,
        ...(university ? { universityId: university.id } : {}),
        ...(departmentId && departmentId.trim() !== '' ? { departmentId: departmentId.trim() } : {}),
        ...(parsedYear ? { year: parsedYear } : {}),
        ...(studentId && studentId.trim() !== '' ? { studentId: studentId.trim() } : {}),
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        createdAt: true
      }
    });
  } else {
    // Create new user
    try {
      user = await prisma.user.create({
        data: {
          email: finalEmail,
          password: hashedPassword,
          firstName: finalFirstName,
          lastName: finalLastName,
          ...(university ? { universityId: university.id } : {}),
          ...(departmentId && departmentId.trim() !== '' ? { departmentId: departmentId.trim() } : {}),
          ...(parsedYear ? { year: parsedYear } : {}),
          ...(studentId && studentId.trim() !== '' ? { studentId: studentId.trim() } : {}),
          isVerified: false // Always require verification
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          createdAt: true
        }
      });
    } catch (dbError: any) {
      console.error('Database error during user creation:', dbError);
      if (dbError.code === 'P2002') {
        throw createError('User with this email already exists', 409);
      }
      throw createError('Failed to create user account. Please try again.', 500);
    }
  }

  // Automatically assign STUDENT role to new registrations (only if new user or role missing)
  try {
    const studentRole = await prisma.role.findUnique({
      where: { name: 'STUDENT' }
    });

    if (studentRole) {
      // Check if user already has the role
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          roleId: studentRole.id
        }
      });

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: studentRole.id
          }
        });
      }
    }
  } catch (roleError: any) {
    console.warn('Failed to assign STUDENT role:', roleError.message);
    // Continue even if role assignment fails
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 15);

  // Update user with OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCode: otp,
      verificationCodeExpiresAt: otpExpires,
      isVerified: false // Always require verification
    }
  });

  // Send OTP email (Non-blocking to prevent frontend timeouts)
  console.log('******************************************');
  console.log(`  CRITICAL: OTP FOR ${finalEmail} IS: ${otp}`);
  console.log('******************************************');
  console.log(`[Auth] Triggering OTP delivery for: ${finalEmail}`);
  emailService.sendOTP(finalEmail, otp).then(sent => {
    console.log(`[Auth] OTP delivery result for ${finalEmail}: ${sent ? 'SUCCESS' : 'FAILED'}`);
  }).catch(err => {
    console.error(`[Auth] OTP delivery error for ${finalEmail}:`, err.message);
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for the verification code.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: false
      }
    }
  });
}));

// Login - Enhanced with better error handling
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbConnError: any) {
      console.error('❌ Database connection error:', dbConnError);
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please try again later.'
      });
    }

    // Check if input is email or username
    const isEmail = normalizedEmail.includes('@');

    let user: any;
    try {
      if (isEmail) {
        user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        });
      } else {
        // Search by username using raw query to bypass client validation if not regenerated
        // Note: We use raw query because the Prisma Client might not be updated yet
        const users: any[] = await prisma.$queryRaw`
          SELECT * FROM users WHERE username = ${normalizedEmail} LIMIT 1
        `;

        if (users && users.length > 0) {
          user = users[0];

          // Fetch roles separately since raw query doesn't include relations
          const userRoles = await prisma.userRole.findMany({
            where: { userId: user.id },
            include: {
              role: true
            }
          });

          // Attach roles to user object match typical structure
          user.roles = userRoles;
        } else {
          user = null;
        }
      }
    } catch (dbError: any) {
      console.error('❌ Database query error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database query failed. Please try again later.'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not registered or invalid password'
      });
    }

    // Check if email is verified - NEW CHECK
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified. Please verify your email to login.',
        isVerified: false,
        email: user.email // Return email so client can trigger resend/verify flow
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Check password - handle both hashed and plain text (for migration)
    let isPasswordValid = false;
    try {
      // Try bcrypt comparison first
      if (user.password && user.password.startsWith('$2')) {
        // Password is hashed
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plain text password (should not happen in production)
        console.warn('⚠️  Plain text password detected for user:', normalizedEmail);
        isPasswordValid = password === user.password;

        // If plain text matches, hash it for future use
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
          console.log('✅ Password hashed for user:', normalizedEmail);
        }
      }
    } catch (bcryptError: any) {
      console.error('❌ Password comparison error:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Authentication error. Please try again.'
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    // @ts-ignore - jwt.sign type issue with options
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get user roles safely - format as array of objects with id and name
    let userRoles: Array<{ id: string; name: string }> = [];
    try {
      if (user.roles && Array.isArray(user.roles)) {
        userRoles = user.roles
          .map((ur: any) => {
            if (ur.role) {
              return {
                id: ur.role.id,
                name: ur.role.name
              };
            }
            return null;
          })
          .filter(Boolean) as Array<{ id: string; name: string }>;
      }
    } catch (rolesError) {
      console.warn('Error processing roles:', rolesError);
      // Continue with empty roles array
    }

    // Return success response
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage || null,
          isVerified: user.isVerified,
          year: user.year || null,
          studentId: user.studentId || null,
          roles: userRoles
        }
      }
    });
  } catch (error: any) {
    // Log error but don't expose details
    console.error('❌ Login error:', error.message);
    console.error('Error stack:', error.stack);

    // Return generic error message
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
}));

// Verify Email
// Verify Email with OTP
router.post('/verify-email', asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw createError('Email and OTP are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.isVerified) {
    return res.json({
      success: true,
      message: 'Email is already verified'
    });
  }

  if (!user.verificationCode || !user.verificationCodeExpiresAt) {
    throw createError('No verification code found. Please request a new one.', 400);
  }

  if (user.verificationCode !== otp) {
    throw createError('Invalid verification code', 400);
  }

  if (new Date() > user.verificationCodeExpiresAt) {
    throw createError('Verification code has expired', 400);
  }

  // Update user as verified and clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null
    }
  });

  return res.json({
    success: true,
    message: 'Email verified successfully. You can now login.'
  });
}));

// Resend OTP
router.post('/resend-otp', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Security: Don't reveal if user doesn't exist
    return res.json({
      success: true,
      message: 'If an account with this email exists, a new code has been sent.'
    });
  }

  if (user.isVerified) {
    return res.json({
      success: true,
      message: 'Account is already verified.'
    });
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 15);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCode: otp,
      verificationCodeExpiresAt: otpExpires
    }
  });

  // Send email (Non-blocking)
  console.log(`[Auth] Resending OTP to: ${email}`);
  console.log(`[Auth] DEV-INFO: New OTP code is: ${otp}`);
  setTimeout(() => {
    emailService.sendOTP(email, otp).catch((error) => {
      console.error('Failed to send OTP:', error);
    });
  }, 0);

  return res.json({
    success: true,
    message: 'A new verification code has been sent to your email.'
  });
}));

// Forgot Password
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }

  // Generate reset token
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  // @ts-ignore - jwt.sign type issue with options
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password-reset' },
    jwtSecret,
    { expiresIn: '1h' }
  );

  // Send reset email (Non-blocking)
  setTimeout(() => {
    emailService.sendPasswordResetEmail(email, resetToken).catch((error) => {
      console.error('Failed to send reset email:', error);
    });
  }, 0);

  return res.json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link.'
  });
}));

// Reset Password
router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw createError('Token and password are required', 400);
  }

  if (!validatePassword(password)) {
    throw createError('Password must be at least 8 characters long', 400);
  }

  // Verify token
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  const decoded = jwt.verify(token, jwtSecret) as any;

  if (decoded.type !== 'password-reset') {
    throw createError('Invalid reset token', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw createError('Invalid reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// Change Password
router.post('/change-password', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400);
  }

  if (!validatePassword(newPassword)) {
    throw createError('New password must be at least 8 characters long', 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw createError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Logout
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // But we can log the logout action for audit purposes
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      isVerified: true,
      year: true,
      studentId: true,
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      createdAt: true
    }
  });

  res.json({
    success: true,
    user
  });
}));

export default router;

