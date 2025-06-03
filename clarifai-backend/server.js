const express = require('express');
const fetch = require('node-fetch'); // Ensure you're using node-fetch v2 for CommonJS
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const { hash } = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory database (not for production)
const dataBase = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            password: 'bananas',
            email: 'sally@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],

    login: [{
        id: '987',
        hash: '',
        email: 'john@gmail.com'
    }]
};

// Clarifai API configuration
const PAT = '1577e7ab454c403c8e10e311cef3b366'; // NOTE: Store this in environment variables in production
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

app.post('/api/clarifai', async (req, res) => {
    const { imageUrl, id } = req.body;

    if (!imageUrl || !id) {
        return res.status(400).json({ error: 'Image URL and user ID are required' });
    }

    const user = dataBase.users.find(user => user.id === id);
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const raw = JSON.stringify({
        user_app_id: {
            user_id: USER_ID,
            app_id: APP_ID,
        },
        inputs: [
            {
                data: {
                    image: {
                        url: imageUrl,
                    },
                },
            },
        ],
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Key ${PAT}`,
        },
        body: raw,
    };

    try {
        const response = await fetch(
            `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
            requestOptions
        );
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.status?.description || 'API request failed');
        }

        // Increment entries if faces are detected
        const regions = result.outputs?.[0]?.data?.regions;
        let updatedEntries = user.entries;

        if (regions && regions.length > 0) {
            user.entries++;
            updatedEntries = user.entries;
            console.log('Updated user:', user); // Debug log
        }

        // Return Clarifai result and updated entries
        res.json({
            clarifaiResult: result,
            entries: updatedEntries
        });
    } catch (error) {
        console.error('Error in /api/clarifai:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Sign in route - fixed logic
app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const user = dataBase.users.find(user => user.email === email && user.password === password);

    if (user) {
        res.json({ status: 'success', user: user });
    } else {
        res.status(400).json('error logging in');
    }
});

// Register route - fixed response
app.post('/register', (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json('Incorrect form submission');
    }
    bcrypt.hash(password, null, null, function (err, hash) {
        console.log(hash)
    })

    const newUser = {
        id: (dataBase.users.length + 1).toString(),
        name,
        email,
        password: password,
        entries: 0,
        joined: new Date()
    };

    dataBase.users.push(newUser);
    res.json(newUser);
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    dataBase.users.forEach(user => {
        if (user.id === id) {
            res.json(user);
        } else {
            res.status(404).json('No such user');
        }
    })
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    const user = dataBase.users.find(user => user.id === id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json('No such user');
    }
});

app.post('/image', (req, res) => {
    const { id } = req.body;
    const user = dataBase.users.find(user => user.id === id);

    if (user) {
        user.entries++;
        res.json(user.entries);
    } else {
        res.status(400).json('not found');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
