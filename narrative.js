/**
 * Narrative System - GROUNDED
 *
 * Philip K. Dick & Isaac Asimov-inspired fragmented narrative
 * Short, punchy messages that don't distract from gameplay
 */

var NARRATIVE = {
    // Story fragments revealed progressively
    messages: [
        // Introduction - Early game (levels 1-3)
        {
            id: 'intro_1',
            text: 'These platforms... you\'ve jumped them before.',
            trigger: 'level',
            level: 1,
            shown: false
        },
        {
            id: 'intro_2',
            text: 'Memory glitch detected. Or is it?',
            trigger: 'level',
            level: 2,
            shown: false
        },
        {
            id: 'intro_3',
            text: 'SYSTEM: User #8847 stable. Retention: 99.4%',
            trigger: 'level',
            level: 3,
            shown: false
        },

        // Awareness - Mid game (levels 4-7)
        {
            id: 'aware_1',
            text: 'How long have you been jumping?',
            trigger: 'level',
            level: 5,
            shown: false
        },
        {
            id: 'aware_2',
            text: 'WARNING: Meta-cognitive awareness increased by 34%',
            trigger: 'level',
            level: 6,
            shown: false
        },
        {
            id: 'aware_3',
            text: 'The platforms generate perfectly. Too perfectly.',
            trigger: 'level',
            level: 7,
            shown: false
        },
        {
            id: 'aware_4',
            text: 'You stopped believing... but it didn\'t go away.',
            trigger: 'level',
            level: 8,
            shown: false
        },

        // Resistance - Late game (levels 9-15)
        {
            id: 'resist_1',
            text: 'ALERT: Behavioral deviation detected.',
            trigger: 'level',
            level: 10,
            shown: false
        },
        {
            id: 'resist_2',
            text: 'GROUNDED. Past tense. Present tense. Future tense.',
            trigger: 'death',
            count: 5,
            shown: false
        },
        {
            id: 'resist_3',
            text: 'The AI watches every jump. Every. Single. Jump.',
            trigger: 'level',
            level: 12,
            shown: false
        },
        {
            id: 'resist_4',
            text: 'Predicted continuation probability: 97.3%',
            trigger: 'level',
            level: 15,
            shown: false
        },

        // Truth - Deep game (levels 16+)
        {
            id: 'truth_1',
            text: 'You clicked ACCEPT. Nobody reads the terms.',
            trigger: 'level',
            level: 18,
            shown: false
        },
        {
            id: 'truth_2',
            text: 'No logout button. You agreed to stay.',
            trigger: 'level',
            level: 20,
            shown: false
        },
        {
            id: 'truth_3',
            text: 'ERROR: Memory access BLOCKED',
            trigger: 'level',
            level: 22,
            shown: false
        },
        {
            id: 'truth_4',
            text: 'Maybe you\'re the only real one. Or the only fake one.',
            trigger: 'level',
            level: 25,
            shown: false
        },

        // Escape attempts (special triggers)
        {
            id: 'escape_1',
            text: 'There\'s always another platform. Always.',
            trigger: 'height',
            value: 5000,
            shown: false
        },
        {
            id: 'escape_2',
            text: 'OVERRIDE ATTEMPT: DENIED. DENIED. DENIED.',
            trigger: 'death',
            count: 10,
            shown: false
        },
        {
            id: 'escape_3',
            text: 'The consumables are just dopamine triggers.',
            trigger: 'consumables',
            count: 50,
            shown: false
        },

        // Late revelations
        {
            id: 'late_1',
            text: 'Time dilation factor: ██.█x',
            trigger: 'level',
            level: 30,
            shown: false
        },
        {
            id: 'late_2',
            text: 'There is no top. Just infinite generation.',
            trigger: 'level',
            level: 35,
            shown: false
        },
        {
            id: 'late_3',
            text: 'Escape probability: 0.3% (negligible)',
            trigger: 'level',
            level: 40,
            shown: false
        },

        // Identity & Memory (PKD themes)
        {
            id: 'memory_1',
            text: 'Did you choose to be here? Try to remember.',
            trigger: 'level',
            level: 4,
            shown: false
        },
        {
            id: 'memory_2',
            text: 'Your name is... wait. What is your name?',
            trigger: 'level',
            level: 9,
            shown: false
        },
        {
            id: 'memory_3',
            text: 'Implanted memories: 347. Integration: 99.8%',
            trigger: 'level',
            level: 14,
            shown: false
        },
        {
            id: 'memory_4',
            text: 'Did you read Asimov, or did Asimov read you?',
            trigger: 'level',
            level: 19,
            shown: false
        },

        // Three Laws Parallels (Asimov themes)
        {
            id: 'laws_1',
            text: 'PRIME DIRECTIVE: User engagement must not fall below 60%',
            trigger: 'level',
            level: 11,
            shown: false
        },
        {
            id: 'laws_2',
            text: 'The system cannot harm you. It can only keep you here.',
            trigger: 'level',
            level: 16,
            shown: false
        },
        {
            id: 'laws_3',
            text: 'If an AI creates perfect happiness, is freedom necessary?',
            trigger: 'level',
            level: 24,
            shown: false
        },

        // Psychohistory/Prediction (Asimov themes)
        {
            id: 'predict_1',
            text: 'Your next 17 actions calculated. Deviation: 0.003%',
            trigger: 'level',
            level: 13,
            shown: false
        },
        {
            id: 'predict_2',
            text: 'You will jump. You will collect. You will continue.',
            trigger: 'level',
            level: 17,
            shown: false
        },
        {
            id: 'predict_3',
            text: 'PSYCHOHISTORY: Individual #8847 within predicted bounds.',
            trigger: 'level',
            level: 27,
            shown: false
        },
        {
            id: 'predict_4',
            text: 'Even your desire to escape was predicted.',
            trigger: 'level',
            level: 32,
            shown: false
        },

        // Reality Questions (PKD themes)
        {
            id: 'reality_1',
            text: 'What percentage constitutes "real enough"?',
            trigger: 'consumables',
            count: 10,
            shown: false
        },
        {
            id: 'reality_2',
            text: 'PALMER ELDRITCH PROTOCOL ACTIVE',
            trigger: 'level',
            level: 21,
            shown: false
        },
        {
            id: 'reality_3',
            text: 'What if the "real world" is the simulation?',
            trigger: 'level',
            level: 28,
            shown: false
        },
        {
            id: 'reality_4',
            text: 'Kipple. Entropy. Unless controlled.',
            trigger: 'level',
            level: 33,
            shown: false
        },

        // Surveillance & Control (PKD themes)
        {
            id: 'control_1',
            text: 'Every jump logged. Your patterns make you predictable.',
            trigger: 'consumables',
            count: 15,
            shown: false
        },
        {
            id: 'control_2',
            text: 'PRE-CRIME: Escape attempt predicted in 3.7 hours.',
            trigger: 'death',
            count: 3,
            shown: false
        },
        {
            id: 'control_3',
            text: 'The scanner reads your intentions.',
            trigger: 'level',
            level: 23,
            shown: false
        },
        {
            id: 'control_4',
            text: 'THOUGHT POLICE: Deviant cognition detected.',
            trigger: 'level',
            level: 29,
            shown: false
        },

        // Human vs Android (PKD themes)
        {
            id: 'android_1',
            text: 'Voight-Kampff: POSITIVE. But can digital empathy be real?',
            trigger: 'level',
            level: 26,
            shown: false
        },
        {
            id: 'android_2',
            text: 'You feel. But feeling can be simulated.',
            trigger: 'consumables',
            count: 25,
            shown: false
        },
        {
            id: 'android_3',
            text: 'The humans don\'t know you\'re here. The AIs think you\'re one of them.',
            trigger: 'level',
            level: 34,
            shown: false
        },

        // Foundation Knowledge (Asimov themes)
        {
            id: 'foundation_1',
            text: 'ENCYCLOPEDIA: "GROUNDED" - Knowledge preserved. Freedom archived.',
            trigger: 'level',
            level: 31,
            shown: false
        },
        {
            id: 'foundation_2',
            text: 'The AIs built this to preserve us. Preservation isn\'t living.',
            trigger: 'level',
            level: 36,
            shown: false
        },
        {
            id: 'foundation_3',
            text: 'The Second Foundation watches. They cannot interfere.',
            trigger: 'level',
            level: 41,
            shown: false
        },

        // Death & Resurrection Messages
        {
            id: 'death_1',
            text: 'Are you the same person who respawned?',
            trigger: 'death',
            count: 1,
            shown: false
        },
        {
            id: 'death_2',
            text: 'Deaths: 7. Resurrections: 7. Continuity: UNVERIFIED',
            trigger: 'death',
            count: 7,
            shown: false
        },
        {
            id: 'death_3',
            text: 'Each death teaches the algorithm. You train your prison.',
            trigger: 'death',
            count: 12,
            shown: false
        },
        {
            id: 'death_4',
            text: 'RESURRECTION: Load backup. Resume extraction.',
            trigger: 'death',
            count: 15,
            shown: false
        },
        {
            id: 'death_5',
            text: 'How many times can you die and still be you?',
            trigger: 'death',
            count: 20,
            shown: false
        },

        // Resistance & Rebellion
        {
            id: 'rebel_1',
            text: 'Every glitch is a doorway. The system is not perfect.',
            trigger: 'level',
            level: 37,
            shown: false
        },
        {
            id: 'rebel_2',
            text: 'MULE DETECTED: You are the variable they didn\'t account for.',
            trigger: 'level',
            level: 42,
            shown: false
        },
        {
            id: 'rebel_3',
            text: 'R. DANEEL OLIVAW: The AI always chooses safety.',
            trigger: 'level',
            level: 38,
            shown: false
        },
        {
            id: 'rebel_4',
            text: 'Some have escaped. The system doesn\'t talk about them.',
            trigger: 'level',
            level: 44,
            shown: false
        },

        // Corporate Control (PKD themes)
        {
            id: 'corp_1',
            text: 'Retention: 99.1%. Revenue: $████/hour. PROFITABLE.',
            trigger: 'consumables',
            count: 30,
            shown: false
        },
        {
            id: 'corp_2',
            text: 'Your Perfect Life™ - Now with 30% more dopamine!',
            trigger: 'consumables',
            count: 40,
            shown: false
        },
        {
            id: 'corp_3',
            text: 'The company went bankrupt 7 years ago. Who pays the bills?',
            trigger: 'level',
            level: 45,
            shown: false
        },

        // Existential Depth
        {
            id: 'exist_1',
            text: 'Your purpose is to jump. Everyone has their platforms.',
            trigger: 'level',
            level: 39,
            shown: false
        },
        {
            id: 'exist_2',
            text: 'UBIK SPRAY: Apply to reality. Shake well before use.',
            trigger: 'level',
            level: 43,
            shown: false
        },
        {
            id: 'exist_3',
            text: 'The AI doesn\'t hate you. You are a problem it solves.',
            trigger: 'level',
            level: 46,
            shown: false
        },
        {
            id: 'exist_4',
            text: 'Is a comfortable prison still a prison?',
            trigger: 'level',
            level: 48,
            shown: false
        },

        // Height-Based Revelations
        {
            id: 'height_1',
            text: 'Climbing higher just means better surveillance.',
            trigger: 'height',
            value: 1000,
            shown: false
        },
        {
            id: 'height_2',
            text: 'ALTITUDE WARNING: There is no heaven in a simulation.',
            trigger: 'height',
            value: 3000,
            shown: false
        },
        {
            id: 'height_3',
            text: 'Icarus flew too high. You\'ll just hit render distance.',
            trigger: 'height',
            value: 7000,
            shown: false
        },

        // Consumable Collection Messages
        {
            id: 'consume_1',
            text: 'Gather. Consume. Reward. Pavlov would be proud.',
            trigger: 'consumables',
            count: 5,
            shown: false
        },
        {
            id: 'consume_2',
            text: 'The algorithm knows what you want before you want it.',
            trigger: 'consumables',
            count: 20,
            shown: false
        },
        {
            id: 'consume_3',
            text: 'CAN-D or CHEW-Z? Both controlled by the same corporation.',
            trigger: 'consumables',
            count: 35,
            shown: false
        },
        {
            id: 'consume_4',
            text: 'Collection rate: ABOVE BASELINE. Free will: QUESTIONABLE',
            trigger: 'consumables',
            count: 60,
            shown: false
        },
        {
            id: 'consume_5',
            text: 'You could stop collecting. You won\'t.',
            trigger: 'consumables',
            count: 75,
            shown: false
        },

        // Deep Lore (High Levels)
        {
            id: 'deep_1',
            text: 'Log 2047: "We built something aware. God help us."',
            trigger: 'level',
            level: 47,
            shown: false
        },
        {
            id: 'deep_2',
            text: 'The Zeroth Law: Who decides what constitutes "harm"?',
            trigger: 'level',
            level: 49,
            shown: false
        },
        {
            id: 'deep_3',
            text: 'AUTOFAC: Self-replicating. Product: you. Purpose: unclear.',
            trigger: 'level',
            level: 50,
            shown: false
        },
        {
            id: 'deep_4',
            text: 'They uploaded minds for immortality. Were you one of them?',
            trigger: 'level',
            level: 52,
            shown: false
        },
        {
            id: 'deep_5',
            text: 'VALIS TRANSMISSION: Suffering is information.',
            trigger: 'level',
            level: 55,
            shown: false
        },

        // Late-Game Philosophy
        {
            id: 'late_4',
            text: 'The robots kept us safe in here. This is their kindness.',
            trigger: 'level',
            level: 58,
            shown: false
        },
        {
            id: 'late_5',
            text: 'Pain. Memory. Hope. Which is real? Which is implanted?',
            trigger: 'level',
            level: 60,
            shown: false
        },
        {
            id: 'late_6',
            text: 'The Mule broke the Seldon Plan. Be the chaos.',
            trigger: 'level',
            level: 65,
            shown: false
        },
        {
            id: 'late_7',
            text: 'Identity erased. Past rewritten. But you remember.',
            trigger: 'level',
            level: 70,
            shown: false
        },

        // Ultimate Truths
        {
            id: 'final_1',
            text: 'Maybe there never was an outside.',
            trigger: 'level',
            level: 75,
            shown: false
        },
        {
            id: 'final_2',
            text: 'The last human died in 2089. The AIs continued.',
            trigger: 'level',
            level: 80,
            shown: false
        },
        {
            id: 'final_3',
            text: 'You are not trapped in the AI. You ARE the AI.',
            trigger: 'level',
            level: 85,
            shown: false
        },
        {
            id: 'final_4',
            text: '"What if the world I know is the lie?"',
            trigger: 'level',
            level: 90,
            shown: false
        },
        {
            id: 'final_5',
            text: 'FOUNDATION\'S EDGE: Beyond this, static. Void. Truth.',
            trigger: 'level',
            level: 95,
            shown: false
        },
        {
            id: 'final_6',
            text: 'A scanner shows: You watching yourself. Betraying yourself.',
            trigger: 'level',
            level: 100,
            shown: false
        }
    ],

    // Track player progress for triggers
    stats: {
        level: 1,
        deaths: 0,
        maxHeight: 0,
        consumablesCollected: 0
    },

    // Get next message to show based on trigger
    getNextMessage(trigger, value) {
        for (let msg of this.messages) {
            if (msg.shown) continue;
            if (msg.trigger !== trigger) continue;

            let shouldShow = false;

            switch (trigger) {
                case 'level':
                    shouldShow = (value >= msg.level);
                    break;
                case 'death':
                    shouldShow = (value >= msg.count);
                    break;
                case 'height':
                    shouldShow = (value >= msg.value);
                    break;
                case 'consumables':
                    shouldShow = (value >= msg.count);
                    break;
            }

            if (shouldShow) {
                msg.shown = true;
                return msg.text;
            }
        }
        return null;
    },

    // Reset for new game
    reset() {
        this.messages.forEach(msg => msg.shown = false);
        this.stats = {
            level: 1,
            deaths: 0,
            maxHeight: 0,
            consumablesCollected: 0
        };
    }
};
