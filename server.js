const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/budget', { useNewUrlParser: true, useUnifiedTopology: true });

const budgetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // Validate hexadecimal color code
                return /^#[0-9A-Fa-f]{6}$/i.test(v);
            },
            message: props => `${props.value} is not a valid hexadecimal color code!`
        }
    }
});

const Budget = mongoose.model('Budget', budgetSchema);

app.use('/', express.static('public1'));


// Fetching data endpoint
app.get('/budget', async (req, res) => {
    try {
        const budgets = await Budget.find();
        res.json({ myBudget: budgets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Updating data endpoint
app.put('/budget/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { value, color } = req.body;

        const updatedBudget = await Budget.findByIdAndUpdate(id, { value, color }, { new: true });

        if (!updatedBudget) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({ message: 'Entry updated successfully', updatedBudget });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Adding a new data endpoint
app.post('/add-budget', async (req, res) => {
    try {
        const { title, value, color } = req.body;

        const newBudget = new Budget({ title, value, color });
        const savedBudget = await newBudget.save();

        res.status(201).json({ message: 'Entry added successfully', savedBudget });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});
