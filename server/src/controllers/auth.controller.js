import { allowedRoles, User } from '../models/User.js';

function validateRole(role) {
  if (!allowedRoles.includes(role)) {
    const error = new Error('Role must be either hr or student');
    error.statusCode = 400;
    throw error;
  }
}

export async function register(req, res, next) {
  try {
    const { uid, email: firebaseEmail, name: firebaseName, picture } = req.firebaseUser;
    const { name, email, role } = req.body;

    validateRole(role);

    if (!name || name.trim().length < 2) {
      const error = new Error('Name must contain at least 2 characters');
      error.statusCode = 400;
      throw error;
    }

    if (email && email.toLowerCase() !== firebaseEmail.toLowerCase()) {
      const error = new Error('Email does not match authenticated Firebase user');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          email: firebaseEmail,
          role,
          avatarUrl: picture || ''
        },
        $set: {
          name: name.trim() || firebaseName || firebaseEmail.split('@')[0],
          lastLoginAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({ user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { uid } = req.firebaseUser;
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: { lastLoginAt: new Date() } },
      { new: true }
    );

    if (!user) {
      const error = new Error('Account profile not found. Please sign up first.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function providerAuth(req, res, next) {
  try {
    const { uid, email, name, picture } = req.firebaseUser;
    const { role = 'student' } = req.body;

    validateRole(role);

    const fallbackName = name || email?.split('@')[0] || 'TalentOS User';
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          email,
          name: fallbackName,
          role,
          avatarUrl: picture || ''
        },
        $set: {
          lastLoginAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({ user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });

    if (!user) {
      const error = new Error('Account profile not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}
