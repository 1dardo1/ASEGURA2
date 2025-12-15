export interface EventEffect {
  description: string;
  moneyChange?: number;
  salaryChange?: number;
  rentChange?: number;
  insuranceType?: string;
  insuranceCost?: number;
  requiresDecision?: boolean;
  fromDB?: boolean;
}

export interface DBEvent {
  _id: number;
  tipo: string;
  texto: string;
  cantidad: number;
  variable: 'money' | 'salary' | 'rent';
  descuento: number;
}


// Seguros comprables (casillas específicas) - CON description
export const INSURANCE_EVENTS: Record<number, EventEffect> = {
  // Casillas 1,12: SALUD (200€)
  1: { 
    description: "¿Comprar Seguro SALUD por 200€?", 
    insuranceType: "SALUD", 
    insuranceCost: 200, 
    requiresDecision: true 
  },
  12: { 
    description: "¿Comprar Seguro SALUD por 200€?", 
    insuranceType: "SALUD", 
    insuranceCost: 200, 
    requiresDecision: true 
  },
  
  // Casillas 3,14: VIDA (300€)
  3: { 
    description: "¿Comprar Seguro VIDA por 300€?", 
    insuranceType: "VIDA", 
    insuranceCost: 300, 
    requiresDecision: true 
  },
  14: { 
    description: "¿Comprar Seguro VIDA por 300€?", 
    insuranceType: "VIDA", 
    insuranceCost: 300, 
    requiresDecision: true 
  },
  
  // Casillas 4,15: COCHE (400€)
  4: { 
    description: "¿Comprar Seguro COCHE por 400€?", 
    insuranceType: "COCHE", 
    insuranceCost: 400, 
    requiresDecision: true 
  },
  15: { 
    description: "¿Comprar Seguro COCHE por 400€?", 
    insuranceType: "COCHE", 
    insuranceCost: 400, 
    requiresDecision: true 
  },
  
  // Casillas 6,17: VIAJE (400€)
  6: { 
    description: "¿Comprar Seguro VIAJE por 400€?", 
    insuranceType: "VIAJE", 
    insuranceCost: 400, 
    requiresDecision: true 
  },
  17: { 
    description: "¿Comprar Seguro VIAJE por 400€?", 
    insuranceType: "VIAJE", 
    insuranceCost: 400, 
    requiresDecision: true 
  },
  
  // Casillas 8,19: HOGAR (500€)
  8: { 
    description: "¿Comprar Seguro HOGAR por 500€?", 
    insuranceType: "HOGAR", 
    insuranceCost: 500, 
    requiresDecision: true 
  },
  19: { 
    description: "¿Comprar Seguro HOGAR por 500€?", 
    insuranceType: "HOGAR", 
    insuranceCost: 500, 
    requiresDecision: true 
  },
  
  // Casillas 9,20: RESPONSABILIDAD_CIVIL (200€)
  9: { 
    description: "¿Comprar Seguro RESPONSABILIDAD CIVIL por 200€?", 
    insuranceType: "RESPONSABILIDAD_CIVIL", 
    insuranceCost: 200, 
    requiresDecision: true 
  },
  20: { 
    description: "¿Comprar Seguro RESPONSABILIDAD CIVIL por 200€?", 
    insuranceType: "RESPONSABILIDAD_CIVIL", 
    insuranceCost: 200, 
    requiresDecision: true 
  },
  
  // Casillas 10,21: CAJA_AHORRO (50€)
  10: { 
    description: "¿Comprar Seguro CAJA AHORRO por 50€?", 
    insuranceType: "CAJA_AHORROS", 
    insuranceCost: 50, 
    requiresDecision: true 
  },
  21: { 
    description: "¿Comprar Seguro CAJA AHORRO por 50€?", 
    insuranceType: "CAJA_AHORROS", 
    insuranceCost: 50, 
    requiresDecision: true 
  }
};

// Casillas fijas (Sueldo/Alquiler)
export const FIXED_EVENTS: Record<number, EventEffect> = {
  0: { 
    description: "¡Recibes tu sueldo por completar la vuelta!" 
  },
  11: { 
    description: "Debes pagar tu alquiler mensual" 
  }
};

// Casillas que cargan eventos de BD
export const DB_EVENT_TILES = [2, 5, 7, 13, 16, 18];

/**
 * Obtiene evento para una casilla específica
 */
export function getEventForTile(tile: number): EventEffect | null {
  // 1. Eventos fijos (sueldo/alquiler)
  if (FIXED_EVENTS[tile]) return FIXED_EVENTS[tile];
  
  // 2. Seguros comprables
  if (INSURANCE_EVENTS[tile]) return INSURANCE_EVENTS[tile];
  
  // 3. Eventos de BD
  if (DB_EVENT_TILES.includes(tile)) {
    return { 
      fromDB: true, 
      description: "Cargando evento de base de datos..." 
    };
  }
  
  return null;
}
