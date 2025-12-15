const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    _id: 
    { 
        type: String,
        required: true 
    },
    name: 
    { 
        type: String, 
        required: true,
        default: 'no name',
        trim: true 
    },
    money: 
    { 
        type: Number, 
        required: true,
        default: 1000,
        min: 0 
    },
    salary: 
    { 
        type: Number, 
        required: true,
        default: 500,
        min: 0 
    },
    rent: 
    { 
        type: Number, 
        required: true,
        default: 100,
        min: 0  
    },
    position: 
    { 
        type: Number, 
        required: true,
        default: 0,
        min: 0, 
        max: 22 
    },
    insurances: 
    { 
        type: [String],
        required: true,
        default: [],
        enum :['SALUD', 'VIDA', 'COCHE', 'VIAJE', 'HOGAR', 'RESPONSABILIDAD_CIVIL', 'CAJA_AHORROS'] 
    },
    skip: 
    { 
        type: Boolean, 
        required: true,
        default: false
    },
    turn: 
    { 
        type: Boolean, 
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Player', playerSchema);
