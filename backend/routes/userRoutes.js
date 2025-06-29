require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { usersContainer } = require('../cosmos');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();





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
    const { Email, Password, Enabled } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    const user = {
        id: uuidv4(),
        UserId: uuidv4(),
        Email,
        Password:  crypto.createHash('md5').update(Password + process.env.PASSWORD_HASH_SALT).digest('hex'),
        Enabled: Enabled ?? true
    };

    try {
        await usersContainer.items.create(user);
        res.status(201).json(user);
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Failed to create user." });
    }
});


router.put('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { Email, Password, Enabled } = req.body;

    try {
        const { resource: existingUser } = await container.item(id, id).read();

        if (!existingUser) {
            return res.status(404).json({ message: "User not found." });
        }

        existingUser.Email = Email ?? existingUser.Email;
        if (Password) {
            existingUser.Password = crypto.createHash('md5').update(Password + process.env.PASSWORD_HASH_SALT).digest('hex');
        }
        existingUser.Enabled = Enabled ?? existingUser.Enabled;

        await usersContainer.item(id, id).replace(existingUser);
        res.json(existingUser);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Failed to update user." });
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
