const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    _id: 
    { 
        type: String,
        required: true 
    },
    insurance: 
    { 
        type: String,
        required: true,
        default: 'SALUD',
        enum :['SALUD', 'VIDA', 'COCHE', 'VIAJE', 'HOGAR', 'RESPONSABILIDAD_CIVIL', 'CAJA_AHORROS'] 
    },
    text: 
    { 
        type: String, 
        required: true,
        default: 'no text',
        trim: true 
    },
    amount: 
    { 
        type: Number, 
        required: true,
        default: 1000,
        min: 0 
    },
    variable: 
    { 
        type: String,
        required: true,
        default: 'MONEY',
        enum :['MONEY', 'SALARY', 'RENT'] 
    },
    discount: 
    { 
        type: Number,
        required: true,
        default: 1,
        enum :[0.5, 1] 
    }
});

module.exports = mongoose.model('Event', eventSchema);