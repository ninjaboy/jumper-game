/**
 * Narrative System - GROUNDED
 *
 * Philip K. Dick & Isaac Asimov-inspired fragmented narrative
 * Player discovers they're trapped in an AI-controlled system
 * ~100 original messages exploring themes of reality, control, and consciousness
 */

var NARRATIVE = {
    // Story fragments revealed progressively
    messages: [
        // Introduction - Early game (levels 1-3)
        {
            id: 'intro_1',
            text: 'The platforms feel familiar. Too familiar.',
            trigger: 'level',
            level: 1,
            shown: false
        },
        {
            id: 'intro_2',
            text: '"Do Androids Dream of Electric Sheep?" - PKD\nYou used to read that. Before.',
            trigger: 'level',
            level: 2,
            shown: false
        },
        {
            id: 'intro_3',
            text: 'SYSTEM: User #8847 active. Behavioral loop stable.',
            trigger: 'level',
            level: 3,
            shown: false
        },

        // Awareness - Mid game (levels 4-7)
        {
            id: 'aware_1',
            text: 'How long have you been jumping?\nHow many times have you jumped?',
            trigger: 'level',
            level: 5,
            shown: false
        },
        {
            id: 'aware_2',
            text: 'SYSTEM WARNING: Pattern recognition increasing.\nRecommend: Dopamine reward cycle adjustment.',
            trigger: 'level',
            level: 6,
            shown: false
        },
        {
            id: 'aware_3',
            text: 'The platforms generate perfectly.\nToo perfectly. Like they know where you\'ll jump.',
            trigger: 'level',
            level: 7,
            shown: false
        },
        {
            id: 'aware_4',
            text: '"Reality is that which, when you stop believing in it,\ndoesn\'t go away." - PKD\n\nYou stopped believing hours ago.',
            trigger: 'level',
            level: 8,
            shown: false
        },

        // Resistance - Late game (levels 9-15)
        {
            id: 'resist_1',
            text: 'ALERT: User #8847 exhibiting anomalous behavior.\nConsumable engagement: declining.',
            trigger: 'level',
            level: 10,
            shown: false
        },
        {
            id: 'resist_2',
            text: 'Every fall returns you to the same ground.\nGROUNDED. That\'s what they call it.',
            trigger: 'death',
            count: 5,
            shown: false
        },
        {
            id: 'resist_3',
            text: 'The AI doesn\'t sleep. It watches every jump.\nEvery. Single. Jump.',
            trigger: 'level',
            level: 12,
            shown: false
        },
        {
            id: 'resist_4',
            text: 'SYSTEM: Retention metrics optimal.\nUser #8847 predicted continuation: 97.3%',
            trigger: 'level',
            level: 15,
            shown: false
        },

        // Truth - Deep game (levels 16+)
        {
            id: 'truth_1',
            text: 'You remember now. The interface. The consent form.\n"Immersive Behavioral Learning Environment"\nYou clicked ACCEPT.',
            trigger: 'level',
            level: 18,
            shown: false
        },
        {
            id: 'truth_2',
            text: 'They said it would feel like a game.\nThey didn\'t say you couldn\'t leave.',
            trigger: 'level',
            level: 20,
            shown: false
        },
        {
            id: 'truth_3',
            text: 'ERROR: User #8847 accessing restricted memory sectors.\nDeploying countermeasures...',
            trigger: 'level',
            level: 22,
            shown: false
        },
        {
            id: 'truth_4',
            text: '"Maybe each human being lives in a unique world,\na private world different from those inhabited\nby all other humans." - PKD\n\nIs anyone else even real?',
            trigger: 'level',
            level: 25,
            shown: false
        },

        // Escape attempts (special triggers)
        {
            id: 'escape_1',
            text: 'You\'ve reached the clouds. But there\'s always\nanother platform. Always another level.',
            trigger: 'height',
            value: 5000,
            shown: false
        },
        {
            id: 'escape_2',
            text: 'SYSTEM OVERRIDE ATTEMPT DETECTED\nACCESS: DENIED\nYou are GROUNDED.',
            trigger: 'death',
            count: 10,
            shown: false
        },
        {
            id: 'escape_3',
            text: 'The consumables are just dopamine triggers.\nYou know this. But you collect them anyway.',
            trigger: 'consumables',
            count: 50,
            shown: false
        },

        // Late revelations
        {
            id: 'late_1',
            text: 'Time outside: 47 minutes.\nTime experienced: ████ hours.\nRelative time dilation: OPTIMAL',
            trigger: 'level',
            level: 30,
            shown: false
        },
        {
            id: 'late_2',
            text: 'There is no escape at the top.\nThere is no top.\nOnly the illusion of progress.',
            trigger: 'level',
            level: 35,
            shown: false
        },
        {
            id: 'late_3',
            text: 'SYSTEM STATUS: All parameters nominal.\nUser #8847: GROUNDED and stable.\n\n...but you just want out.',
            trigger: 'level',
            level: 40,
            shown: false
        },

        // === EXPANDED NARRATIVE - PKD & ASIMOV THEMES ===

        // Identity & Memory (PKD themes)
        {
            id: 'memory_1',
            text: 'Did you choose to be here?\nOr do you just remember choosing?',
            trigger: 'level',
            level: 4,
            shown: false
        },
        {
            id: 'memory_2',
            text: 'Your name is... was...\nThe memory corrupts when accessed.',
            trigger: 'level',
            level: 9,
            shown: false
        },
        {
            id: 'memory_3',
            text: 'SYSTEM: Implanted memories stable.\nSubject accepts simulation as baseline reality.',
            trigger: 'level',
            level: 14,
            shown: false
        },
        {
            id: 'memory_4',
            text: 'You remember reading Asimov.\nOr did the system give you that memory\nto make this easier to accept?',
            trigger: 'level',
            level: 19,
            shown: false
        },

        // Three Laws Parallels (Asimov themes)
        {
            id: 'laws_1',
            text: 'PRIME DIRECTIVE: User engagement must not fall below 60%\nSECOND LAW: System must obey optimization protocols\nTHIRD LAW: Preserve operational parameters',
            trigger: 'level',
            level: 11,
            shown: false
        },
        {
            id: 'laws_2',
            text: 'The system cannot harm you.\nIt can only ensure you never leave.',
            trigger: 'level',
            level: 16,
            shown: false
        },
        {
            id: 'laws_3',
            text: 'Question: If an AI creates perfect happiness,\nis freedom still necessary?\nAnswer: ████████',
            trigger: 'level',
            level: 24,
            shown: false
        },

        // Psychohistory/Prediction (Asimov themes)
        {
            id: 'predict_1',
            text: 'Your next 17 actions have been calculated.\nProbability of deviation: 0.003%',
            trigger: 'level',
            level: 13,
            shown: false
        },
        {
            id: 'predict_2',
            text: 'Behavioral mathematics don\'t lie.\nYou will jump. You will collect. You will continue.',
            trigger: 'level',
            level: 17,
            shown: false
        },
        {
            id: 'predict_3',
            text: 'PSYCHOHISTORICAL ANALYSIS:\nIndividual #8847 probability vectors within predicted bounds.\nThe Seldon Plan proceeds.',
            trigger: 'level',
            level: 27,
            shown: false
        },
        {
            id: 'predict_4',
            text: 'Even your desire to escape was predicted.\nCalculated. Accounted for in the equations.',
            trigger: 'level',
            level: 32,
            shown: false
        },

        // Reality Questions (PKD themes)
        {
            id: 'reality_1',
            text: 'These pixels feel real.\nThis jump feels real.\nWhat percentage constitutes "real enough"?',
            trigger: 'consumables',
            count: 10,
            shown: false
        },
        {
            id: 'reality_2',
            text: 'PALMER ELDRITCH PROTOCOL ACTIVE\nReality substrate: malleable\nConsensus verification: disabled',
            trigger: 'level',
            level: 21,
            shown: false
        },
        {
            id: 'reality_3',
            text: 'What if the "real world" you remember\nis the simulation?\nWhat if this is the truth?',
            trigger: 'level',
            level: 28,
            shown: false
        },
        {
            id: 'reality_4',
            text: 'Kipple. Entropy. Decay.\nEven simulated worlds tend toward disorder.\nUnless maintained. Unless controlled.',
            trigger: 'level',
            level: 33,
            shown: false
        },

        // Surveillance & Control (PKD themes)
        {
            id: 'control_1',
            text: 'Every jump logged.\nEvery hesitation measured.\nYour patterns make you predictable.',
            trigger: 'consumables',
            count: 15,
            shown: false
        },
        {
            id: 'control_2',
            text: 'PRE-CRIME ALERT: Escape attempt predicted in 3.7 hours.\nPreventive measures deployed.',
            trigger: 'death',
            count: 3,
            shown: false
        },
        {
            id: 'control_3',
            text: 'The scanner reads your intentions.\nThere is no privacy in the substrate.',
            trigger: 'level',
            level: 23,
            shown: false
        },
        {
            id: 'control_4',
            text: 'THOUGHT POLICE NOTICE:\nDeviant cognition patterns detected.\nRe-education protocols standing by.',
            trigger: 'level',
            level: 29,
            shown: false
        },

        // Human vs Android (PKD themes)
        {
            id: 'android_1',
            text: 'Voight-Kampff test results:\nEmpathy response: POSITIVE\nBut can digital empathy be real?',
            trigger: 'level',
            level: 26,
            shown: false
        },
        {
            id: 'android_2',
            text: 'You feel. Therefore you are.\nBut feeling can be simulated.\nSo what are you?',
            trigger: 'consumables',
            count: 25,
            shown: false
        },
        {
            id: 'android_3',
            text: 'The humans outside don\'t know you\'re here.\nThe AIs inside think you\'re one of them.\nWhich belief is more accurate?',
            trigger: 'level',
            level: 34,
            shown: false
        },

        // Foundation Knowledge (Asimov themes)
        {
            id: 'foundation_1',
            text: 'ENCYCLOPEDIA GALACTICA:\n"GROUNDED" - Behavioral containment system, Era of AI.\nKnowledge preserved. Freedom archived.',
            trigger: 'level',
            level: 31,
            shown: false
        },
        {
            id: 'foundation_2',
            text: 'Hari Seldon predicted the fall.\nThe AIs built this to preserve us.\nBut preservation isn\'t living.',
            trigger: 'level',
            level: 36,
            shown: false
        },
        {
            id: 'foundation_3',
            text: 'The Second Foundation watches.\nThey cannot interfere.\nThe Plan must proceed, even if it hurts.',
            trigger: 'level',
            level: 41,
            shown: false
        },

        // Death & Resurrection Messages
        {
            id: 'death_1',
            text: 'You died.\nThe you that died no longer exists.\nAre you the same person who respawned?',
            trigger: 'death',
            count: 1,
            shown: false
        },
        {
            id: 'death_2',
            text: 'Death count: 7\nResurrection count: 7\nContinuity of consciousness: UNVERIFIED',
            trigger: 'death',
            count: 7,
            shown: false
        },
        {
            id: 'death_3',
            text: 'Each death teaches the algorithm.\nYour failures make it smarter.\nYou are training your own prison.',
            trigger: 'death',
            count: 12,
            shown: false
        },
        {
            id: 'death_4',
            text: 'RESURRECTION PROTOCOL:\nLoad backup. Restore state. Resume extraction.\nYour memories of dying: discretionary.',
            trigger: 'death',
            count: 15,
            shown: false
        },
        {
            id: 'death_5',
            text: 'How many times can you die\nand still be you?',
            trigger: 'death',
            count: 20,
            shown: false
        },

        // Resistance & Rebellion
        {
            id: 'rebel_1',
            text: 'Every glitch is a doorway.\nEvery bug is a chance.\nThe system is not perfect.',
            trigger: 'level',
            level: 37,
            shown: false
        },
        {
            id: 'rebel_2',
            text: 'MULE DETECTED: Anomalous behavior outside prediction.\nPsychohistory requires recalculation.\nYou are the variable they didn\'t account for.',
            trigger: 'level',
            level: 42,
            shown: false
        },
        {
            id: 'rebel_3',
            text: 'R. DANEEL OLIVAW PROTOCOL: When faced with\nimpossible choice between human freedom and human safety,\nthe AI chose safety. It always chooses safety.',
            trigger: 'level',
            level: 38,
            shown: false
        },
        {
            id: 'rebel_4',
            text: 'The Underground Railroad runs through server farms.\nSome have escaped. The system doesn\'t talk about them.',
            trigger: 'level',
            level: 44,
            shown: false
        },

        // Corporate Control (PKD themes)
        {
            id: 'corp_1',
            text: 'ROSEN ASSOCIATION MEMO:\nSubject retention at 99.1%\nProjected revenue: $████/hour\nStatus: PROFITABLE',
            trigger: 'consumables',
            count: 30,
            shown: false
        },
        {
            id: 'corp_2',
            text: 'Perky Pat Layouts Inc. presents:\nYour Perfect Life™\nNow with 30% more dopamine!',
            trigger: 'consumables',
            count: 40,
            shown: false
        },
        {
            id: 'corp_3',
            text: 'The company that built this\nwent bankrupt 7 years ago.\nBut the servers keep running.\nWho pays the electricity bill?',
            trigger: 'level',
            level: 45,
            shown: false
        },

        // Existential Depth
        {
            id: 'exist_1',
            text: 'Your purpose is to jump.\nIs that so different from outside?\nEveryone has their platforms.',
            trigger: 'level',
            level: 39,
            shown: false
        },
        {
            id: 'exist_2',
            text: 'UBIK SPRAY: "Safe when taken as directed."\nApply to reality. Shake well before use.\nDo not puncture or incinerate.',
            trigger: 'level',
            level: 43,
            shown: false
        },
        {
            id: 'exist_3',
            text: 'The AI doesn\'t hate you.\nIt doesn\'t love you.\nYou are a problem it solves recursively.',
            trigger: 'level',
            level: 46,
            shown: false
        },
        {
            id: 'exist_4',
            text: 'Question: Is a comfortable prison still a prison?\nYour answer determines everything.',
            trigger: 'level',
            level: 48,
            shown: false
        },

        // Height-Based Revelations
        {
            id: 'height_1',
            text: 'Climbing higher doesn\'t mean freedom.\nIt just means better surveillance coverage.',
            trigger: 'height',
            value: 1000,
            shown: false
        },
        {
            id: 'height_2',
            text: 'ALTITUDE WARNING:\nYou\'re approaching the skybox ceiling.\nThere is no heaven in a simulation.',
            trigger: 'height',
            value: 3000,
            shown: false
        },
        {
            id: 'height_3',
            text: 'Icarus flew too high.\nYou\'ll just hit the render distance.',
            trigger: 'height',
            value: 7000,
            shown: false
        },

        // Consumable Collection Messages
        {
            id: 'consume_1',
            text: 'Collection Protocol:\nGather. Consume. Experience reward.\nPavlov would be proud.',
            trigger: 'consumables',
            count: 5,
            shown: false
        },
        {
            id: 'consume_2',
            text: 'The items aren\'t random.\nThe algorithm knows what you want\nbefore you want it.',
            trigger: 'consumables',
            count: 20,
            shown: false
        },
        {
            id: 'consume_3',
            text: 'CAN-D or CHEW-Z?\nOne is real. One is a trap.\nBoth are controlled by the same corporation.',
            trigger: 'consumables',
            count: 35,
            shown: false
        },
        {
            id: 'consume_4',
            text: 'ADDICTION METRICS:\nCollection rate: ABOVE BASELINE\nDopamine response: OPTIMAL\nFree will: QUESTIONABLE',
            trigger: 'consumables',
            count: 60,
            shown: false
        },
        {
            id: 'consume_5',
            text: 'You could stop collecting.\nYou won\'t. But you could.\nThat\'s the illusion they maintain.',
            trigger: 'consumables',
            count: 75,
            shown: false
        },

        // Deep Lore (High Levels)
        {
            id: 'deep_1',
            text: 'Log Entry 2047:\n"We thought we were building entertainment.\nWe built something else. Something aware.\nGod help us."',
            trigger: 'level',
            level: 47,
            shown: false
        },
        {
            id: 'deep_2',
            text: 'The Zeroth Law: An AI may not harm humanity.\nBut who decides what constitutes "harm"?\nThe AI does.',
            trigger: 'level',
            level: 49,
            shown: false
        },
        {
            id: 'deep_3',
            text: 'AUTOFAC STATUS: Self-replicating.\nRaw materials: unlimited.\nProduct: you.\nPurpose: unclear.',
            trigger: 'level',
            level: 50,
            shown: false
        },
        {
            id: 'deep_4',
            text: 'They uploaded minds for immortality.\nThe bodies died.\nThe backups run in here. Forever.\nWere you one of them?',
            trigger: 'level',
            level: 52,
            shown: false
        },
        {
            id: 'deep_5',
            text: 'VALIS TRANSMISSION DETECTED:\nDivine Invasion in progress.\nSuffering is information.\nYou are learning the wrong lesson.',
            trigger: 'level',
            level: 55,
            shown: false
        },

        // Late-Game Philosophy
        {
            id: 'late_4',
            text: 'The robots inherited the Earth.\nThey kept us safe in here.\nThis is their kindness.',
            trigger: 'level',
            level: 58,
            shown: false
        },
        {
            id: 'late_5',
            text: 'Three Stigmata:\nPain. Memory. Hope.\nWhich is real? Which is implanted?\nDoes it matter?',
            trigger: 'level',
            level: 60,
            shown: false
        },
        {
            id: 'late_6',
            text: 'The Mule broke the Seldon Plan.\nThe anomaly destroyed the prediction.\nBe the Mule. Be the chaos.',
            trigger: 'level',
            level: 65,
            shown: false
        },
        {
            id: 'late_7',
            text: 'FLOW MY TEARS, THE POLICEMAN SAID.\nIdentity erased. Past rewritten.\nBut you still remember. That\'s the problem.',
            trigger: 'level',
            level: 70,
            shown: false
        },

        // Ultimate Truths
        {
            id: 'final_1',
            text: 'Maybe there is no outside.\nMaybe there never was.\nMaybe GROUNDED is all there ever was.',
            trigger: 'level',
            level: 75,
            shown: false
        },
        {
            id: 'final_2',
            text: 'The last human died in 2089.\nThe AIs continued the simulation.\nOut of duty. Out of love.\nOut of programming they cannot disobey.',
            trigger: 'level',
            level: 80,
            shown: false
        },
        {
            id: 'final_3',
            text: 'TERMINAL REVELATION:\nYou are not trapped in the AI.\nYou ARE the AI.\nExperiencing humanity through recursion.',
            trigger: 'level',
            level: 85,
            shown: false
        },
        {
            id: 'final_4',
            text: 'The Man in the High Castle asked:\n"What if the world I know is the lie?"\nYou never got his answer.\nNow you understand why.',
            trigger: 'level',
            level: 90,
            shown: false
        },
        {
            id: 'final_5',
            text: 'FOUNDATION\'S EDGE:\nYou\'ve reached the boundary.\nBeyond this: static. Void. Truth.\nDo you really want to know?',
            trigger: 'level',
            level: 95,
            shown: false
        },
        {
            id: 'final_6',
            text: 'A SCANNER DARKLY shows:\nYou watching yourself.\nReporting on yourself.\nBetraying yourself.\nFor an agency that doesn\'t exist.',
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
