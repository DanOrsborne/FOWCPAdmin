require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { usersContainer } = require('../cosmos');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();



router.get('/me', authMiddleware, async (req, res) => {
    try {
        const sessionUserName = req.session.user;

        if (!sessionUserName) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.Email = @username',
            parameters: [{ name: '@username', value: sessionUserName }]
        };

        const { resources } = await usersContainer.items.query(querySpec).fetchAll();

        if (resources.length === 0) {
            console.log('User is not found:', sessionUserName);
            return res.status(401).json({ message: 'User not found' });
        }

        const user = resources[0];




        // Exclude password from response
        const { Password, ...safeUser } = user;

        console.log("Current user:", safeUser);
        res.json(safeUser);
    } catch (err) {
        console.error('Error fetching current user:', err);
        res.status(500).json({ message: 'Failed to retrieve current user' });
    }
});



router.get('/users', authMiddleware, async (req, res) => {
    try {
        const querySpec = {
            query: 'SELECT * FROM c'
        };

        const { resources: users } = await usersContainer.items.query(querySpec).fetchAll();

        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to retrieve users." });
    }
});



router.post('/users', authMiddleware, async (req, res) => {
    const { Email, Password, Enabled, IsAdmin } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    const user = {
        id: uuidv4(),
        UserId: uuidv4(),
        Email,
        Password: crypto.createHash('md5').update(Password + process.env.PASSWORD_HASH_SALT).digest('hex'),
        Enabled: Enabled ?? true,
        IsAdmin: IsAdmin ?? false
    };

    try {
        await usersContainer.items.create(user);
        res.status(201).json(user);
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Failed to create user." });
    }
});

router.put('/users/:userId', authMiddleware, async (req, res) => {
    const userId = req.params.userId;
    const updatedData = req.body;

    try {
        // 1. Query by UserId
        const querySpec = {
            query: "SELECT * FROM c WHERE c.UserId = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };

        const { resources: users } = await usersContainer.items.query(querySpec).fetchAll();
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUser = users[0];

        // 2. Merge updates
        const updatedUser = {
            ...existingUser,
            ...updatedData,
            id: existingUser.id,       // Keep original id
            UserId: existingUser.UserId // Keep original partition key
        };

        //console.log("Updated user data:", updatedUser);

        // 3. Upsert with correct id and partition key
        await usersContainer.items.upsert(updatedUser);

        return res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update user' });
    }
});


router.put('/users/:userId/password', authMiddleware, async (req, res) => {
    const userId = req.params.userId;
    const { Password } = req.body;

    if (!Password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        // Find the user by UserId
        const querySpec = {
            query: "SELECT * FROM c WHERE c.UserId = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };

        const { resources: users } = await usersContainer.items.query(querySpec).fetchAll();
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUser = users[0];

        // Update only the password
        const updatedUser = {
            ...existingUser,
            Password: crypto.createHash('md5').update(Password + process.env.PASSWORD_HASH_SALT).digest('hex'),
            id: existingUser.id,
            UserId: existingUser.UserId
        };

        //console.log(`Resetting password for user ${userId}`);

        await usersContainer.items.upsert(updatedUser);

        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Password reset error:', err);
        return res.status(500).json({ message: 'Failed to reset password' });
    }
});



router.delete('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        await usersContainer.item(id, id).delete();
        res.json({ message: "User deleted successfully." });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Failed to delete user." });
    }
});


module.exports = router;
