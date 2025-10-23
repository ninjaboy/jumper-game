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
