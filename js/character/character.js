(function(){
    class CharSexModule {
        constructor(opts) {
            this.fetishes = opts.fetishes || {}
            this.stats = {
                penetrative: opts.stats.penetrative || 0,
                vaginal: opts.stats.vaginal || 0,
                anal: opts.stats.anal || 0,
                oral: opts.stats.oral || 0,
                hand: opts.stats.hand || 0
            }
            this.virginity = {
                penis: opts.virginity.penis || true ,
                vagina: opts.virginity.vagina || true,
                oral: opts.virginity.oral || true,
                anal: opts.virginity.anal ||true
            }
            this.sightwatch = ['penis','vagina','chest','nipples','clit','anus']
            this.seen = {} // {slot:[id]} this tracks who has seen our bodyparts
        }
        
    }
    LT.Character = class Character {
        constructor(opts) {
            opts = opts || {};
            this.id = opts.id;
            this.names = opts.names || { masculine: "Unknown", androgynous: "Unknown", feminine: "Unknown" };
            this.surname = opts.surname || "Unknown";
            this.gender = opts.gender;
            this.femininityValue = opts.femininityValue || 50;
            this.orientation = opts.orientation;
            this.personality = opts.personality;
            this.birthday = opts.birthday;
            this.stats = {
                level: opts.level || 1,
                experience: opts.experience || 0,
                experienceForLevel: opts.experienceForLevel || 100,
                maxHealth: LT.maxHealthOf(this),
                health: this.maxHealth,
                maxMana: LT.maxManaOf(this),
                mana: this.maxMana,
            }
            this.attributes = {
                physique: opts.physique || 10,
                arcane: opts.arcane || 10,
                corruption: opts.corruption || 0,
                arousal: opts.arousal || 0,
                lust: opts.lust || 10,
            }
            this.essences = opts.essences || 0;
            this.money = opts.money || 0;
            this.location = opts.location || null;
            this.knownSpells = opts.knownSpells || [];
            
            this.slots = structuredClone(LT.slots)
            this.wardrobe = opts.wardrobe || [];
            this.items = opts.items || [];
            this.equipped = opts.equipped || {};

            this.mainWeapon = opts.mainWeapon || null;
            this.offhandWeapon = opts.offhandWeapon || null;
            this.weapons = opts.weapons || [];
            
            this.occupation = opts.occupation || null;
            this.sex = CharSexModule({
                stats = {
                    penetrative:0,
                    vaginal:0,
                    anal:0,
                    oral:0,
                    hand:0
                },
                virginity = {
                    penis:true,
                    vagina:true,
                    oral:true,
                    anal:true
                },
            });
            this.flags = {}

        }

    }

})();