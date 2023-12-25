var StickyTableDirective = function () { return ({
    restrict: 'A',
    link: function ($scope, $element) {
        $element.stickyTableHeaders();
        $scope.$on('$destroy', function () {
            $element.stickyTableHeaders('destroy');
        });
    }
}); };
var myModule = angular.module('myModule', ['ngRoute']);
myModule.directive('stickyTable', StickyTableDirective);
myModule.controller('PersonaController', ['$scope', PersonaController]);
myModule.controller('PersonaListController', ['$scope', PersonaListController]);
myModule.config(function ($routeProvider) {
    $routeProvider.when('/list', { templateUrl: '/assets/data/persona/P5andP5Rlist.html', controller: PersonaListController });
    $routeProvider.when('/skill', { templateUrl: '/assets/data/persona/skill.html', controller: SkillListController });
    $routeProvider.when('/persona/:persona_name', { templateUrl: '/assets/data/persona/persona.html', controller: PersonaController });
    $routeProvider.when('/setting', { templateUrl: '/assets/data/persona/setting.html', controller: SettingController });
});
myModule.run(function ($rootScope, $location, $route, $window) {
    $rootScope.$on('$locationChangeStart', function (event) {
        if (!$location.path()) {
            $location.path('/list');
            $route.reload();
        }
        else {
            $window.scrollTo(0, 0);
        }
    });
});


function addStatProperties(persona) {
    persona.strength = persona.stats[0];
    persona.magic = persona.stats[1];
    persona.endurance = persona.stats[2];
    persona.agility = persona.stats[3];
    persona.luck = persona.stats[4];
}
function addElementProperties(persona) {
    var properties = ['physical', 'gun', 'fire', 'ice', 'electric', 'wind', 'psychic', 'nuclear', 'bless', 'curse'];
    var elemsValue = { "wk": 0, "-": 1, "rs": 2, "nu": 3, "rp": 4, "ab": 5 };
    for (var i = 0; i < properties.length; i++) {
        persona[properties[i]] = persona.elems[i];
        persona[properties[i] + 'Value'] = elemsValue[persona.elems[i]];
    }
}
function isDlcPersonaOwned(dlcPersona) {
    if (!localStorage["dlcPersona"])
        return false;
    return JSON.parse(localStorage["dlcPersona"])[dlcPersona] === true;
}
/**
 * List of persona with DLC persona potentially removed based on user config
 */
var customPersonaList = (function () {
    var arr = [];
    for (var key in personaMap) {
        if (personaMap.hasOwnProperty(key)) {
            var persona = personaMap[key];
            if (persona.dlc && !isDlcPersonaOwned(key)) {
                continue;
            }
            persona.name = key;
            addStatProperties(persona);
            addElementProperties(persona);
            arr.push(persona);
        }
    }
    return arr;
})();
var fullPersonaList = (function () {
    var arr = [];
    for (var key in personaMap) {
        if (personaMap.hasOwnProperty(key)) {
            var persona = personaMap[key];
            persona.name = key;
            addStatProperties(persona);
            addElementProperties(persona);
            arr.push(persona);
        }
    }
    return arr;
})();
var skillList = (function () {
    var arr = [];
    for (var key in skillMap) {
        if (skillMap.hasOwnProperty(key)) {
            var skill = skillMap[key];
            skill.name = key;
            skill.elemDisplay = capitalizeFirstLetter(skill.element);
            skill.costDisplay = getSkillCost(skill);
            skill.personaDisplay = getSkillPersonaList(skill);
            if (skill.talk) {
                skill.talkDisplay = createPersonaLink(skill.talk);
            }
            if (skill.fuse) {
                if (typeof skill.fuse === 'string') {
                    skill.fuseDisplay = createPersonaLink(skill.fuse);
                }
                else { // it's an array
                    var arr_1 = [];
                    for (var i = 0; i < skill.fuse.length; i++) {
                        arr_1.push(createPersonaLink(skill.fuse[i]));
                    }
                    skill.fuseDisplay = arr_1.join(", ");
                }
            }
            arr.push(skill);
        }
    }
    return arr;
})();
/**
 * Persona by arcana based on customPersonaList
 */
var customPersonaeByArcana = (function () {
    var personaeByArcana_ = {};
    for (var i = 0; i < customPersonaList.length; i++) {
        var persona = customPersonaList[i];
        if (!personaeByArcana_[persona.arcana]) {
            personaeByArcana_[persona.arcana] = [];
        }
        personaeByArcana_[persona.arcana].push(persona);
    }
    for (var key in personaeByArcana_) {
        personaeByArcana_[key].sort(function (a, b) { return a.level - b.level; });
    }
    // Make sure this is always there regardless of DLC setting
    if (!personaeByArcana_['World']) {
        personaeByArcana_['World'] = [];
    }
    return personaeByArcana_;
})();
var arcanaMap = (function () {
    var map = {};
    for (var i = 0; i < arcana2Combos.length; i++) {
        var combo = arcana2Combos[i];
        if (!map[combo.source[0]])
            map[combo.source[0]] = {};
        map[combo.source[0]][combo.source[1]] = combo.result;
        if (!map[combo.source[1]])
            map[combo.source[1]] = {};
        map[combo.source[1]][combo.source[0]] = combo.result;
    }
    return map;
})();
var getResultArcana = function (arcana1, arcana2) {
    return arcanaMap[arcana1][arcana2];
};
var special2Combos = (function () {
    var combos = [];
    for (var i = 0; i < specialCombos.length; i++) {
        if (specialCombos[i].sources.length == 2) {
            combos.push(specialCombos[i]);
        }
    }
    return combos;
})();
function getElems(personaName) {
    var elems = personaMap[personaName].elems;
    for (var i = 0; i < elems.length; i++) {
        if (elems[i] == 'wk')
            elems[i] = 'Weak';
        else if (elems[i] == 'rs')
            elems[i] = 'Resist';
        else if (elems[i] == 'ab')
            elems[i] = 'Absorb';
        else if (elems[i] == 'rp')
            elems[i] = 'Repel';
        else if (elems[i] == 'nu')
            elems[i] = 'Null';
    }
    return elems;
}
function getSkills(personaName) {
    var skills = personaMap[personaName].skills;
    var sorted = [];
    for (var name_1 in skills) {
        if (skills.hasOwnProperty(name_1)) {
            sorted.push([name_1, skills[name_1]]);
        }
    }
    sorted.sort(function (a, b) {
        return a[1] - b[1];
    });
    var resSkills = [];
    for (var i = 0; i < sorted.length; i++) {
        var skillData = skillMap[sorted[i][0]];
        resSkills.push({
            name: sorted[i][0],
            level: sorted[i][1],
            description: skillData.effect,
            unique: skillData.unique,
            elem: capitalizeFirstLetter(skillData.element),
            cost: getSkillCost(skillData)
        });
    }
    if (personaMap[personaName].trait) {
        var traitData = skillMap[personaMap[personaName].trait];
        resSkills.unshift({
            name: personaMap[personaName].trait,
            level: 0,
            description: traitData.effect,
            unique: traitData.unique,
            elem: "Trait",
            cost: "-"
        });
    }
    return resSkills;
}
function getSkillCardInfo(skillCard) {
    var skillData = [];
    var skill = skillMap[skillCard];
    skillData.push({
        name: skillCard,
        description: skill.effect,
        elem: capitalizeFirstLetter(skill.element),
        cost: getSkillCost(skill)
    })

    return skillData;
}
function getItem(itemName) {
    var itemData = [];
    var item = itemMap[itemName];
    itemData.push({
        name: itemName,
        type: item.type,
        description: item.description
    })
    return itemData;
}
function getInheritance(inheritanceType) {
    return inheritanceChart[inheritanceType];
}

function getSkillPersonaList(skill) {
    var arr = [];
    for (var key in skill.personas) {
        if (skill.personas.hasOwnProperty(key)) {
            var level = skill.personas[key];
            var keyHref = createPersonaLink(key);
            arr.push(keyHref + (level !== 0 ? " (" + level + ")" : ""));
        }
    }
    var str = arr.join(", ");
    if (skill.note) {
        str = (str ? (str + ". ") : "") + skill.note;
    }
    return str;
}
function createPersonaLink(personaName) {
    return "<a href='#/persona/" + personaName + "'>" + personaName + "</a>";
}
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function getSkillCost(skill) {
    if (skill.element !== 'passive' && skill.element !== 'trait') {
        if (skill.cost < 100) {
            return String(skill.cost) + '% HP';
        }
        else {
            return String(skill.cost / 100) + ' SP';
        }
    }
    else {
        return "-";
    }
}


var FusionCalculator = /** @class */ (function () {
    function FusionCalculator(personaeByArcana) {
        this.personaeByArcana = personaeByArcana;
    }
    /**
     * Fuse 2 persona. This can handle normal fusion, rare fusion or special fusion.
     * @param persona1 First persona to fuse
     * @param persona2 Second persona to fuse
     * @returns {PersonaData} The result persona, or null if the fusion is not possible
     */
    FusionCalculator.prototype.fuse = function (persona1, persona2) {
        // special fusion
        var result = this.getSpecialFuseResult(persona1, persona2);
        if (result !== null) {
            return result;
        }
        // rare fusion
        if ((persona1.rare && !persona2.rare) || (!persona1.rare && persona2.rare)) {
            var rarePersona = persona1.rare ? persona1 : persona2;
            var normalPersona = persona1.rare ? persona2 : persona1;
            result = this.fuseRare(rarePersona, normalPersona);
            return result;
        }
        // either both rare or both normal => normal fusion
        result = this.fuseNormal(persona1, persona2);
        return result;
    };
    /**
     * Get all 2-fusion recipes with the given persona as one of the ingredients
     * @param persona The persona to fuse from
     * @returns {Recipe[]} The list of recipes. In each recipe's sources, the given persona
     * is guaranteed to be the first one.
     */
    FusionCalculator.prototype.getAllResultingRecipesFrom = function (persona) {
        var recipes = [];
        for (var i = 0; i < customPersonaList.length; i++) {
            var result = this.fuse(persona, customPersonaList[i]);
            if (result !== null) {
                var recipe = {
                    sources: [persona, customPersonaList[i]],
                    result: result
                };
                this.addRecipe(recipe, recipes, false);
            }
        }
        return recipes;
    };
    /**
     * Return the result persona if 2 given persona are part of a special formula
     * @param persona1 The first persona
     * @param persona2 The second persona
     * @returns {boolean} the result persona if persona1 + persona2 is a special formula, false otherwise
     */
    FusionCalculator.prototype.getSpecialFuseResult = function (persona1, persona2) {
        for (var x = 0; x < special2Combos.length; x++) {
            var combo = special2Combos[x];
            if (((persona1.name === combo.sources[0] && persona2.name === combo.sources[1]) ||
                (persona2.name === combo.sources[0] && persona1.name === combo.sources[1]))) {
                return personaMap[combo.result];
            }
        }
        return null;
    };
    /**
     * Fuse 2 persona. Doesn't handle rare fusion and special fusion.
     * @param persona1 First persona to fuse
     * @param persona2 Second persona to fuse
     * @returns The result persona, or null when the fusion is not possible,
     * the fusion is a rare fusion, or the fusion is a special fusion.
     */
    FusionCalculator.prototype.fuseNormal = function (persona1, persona2) {
        // don't handle rare fusion between a normal persona and a rare persona
        if ((persona1.rare && !persona2.rare) || (persona2.rare && !persona1.rare)) {
            return null;
        }
        // don't handle 2-persona-special fusions
        if (this.getSpecialFuseResult(persona1, persona2) !== null) {
            return null;
        }
        var level = 1 + Math.floor((persona1.level + persona2.level) / 2);
        var arcana = getResultArcana(persona1.arcana, persona2.arcana);
        if (!arcana) {
            // only Judgement + [Justice/Strength/Chariot/Death] can result in this
            return null;
        }
        var personae = this.personaeByArcana[arcana];
        var persona = null;
        var found = false;
        if (persona1.arcana === persona2.arcana) {
            // same-arcana down-rank fusion
            for (var i = personae.length - 1; i >= 0; i--) {
                persona = personae[i];
                if (persona.level <= level) {
                    if (persona.special || persona.rare || persona === persona1 || persona === persona2)
                        continue;
                    found = true;
                    break;
                }
            }
        }
        else {
            // different-arcana fusion
            for (var i = 0; i < personae.length; i++) {
                persona = personae[i];
                if (persona.level >= level) {
                    if (persona.special || persona.rare)
                        continue;
                    found = true;
                    break;
                }
            }
        }
        return found ? persona : null;
    };
    ;
    /**
     * Fuse a rare persona with a normal persona.
     * @param rarePersona The rare persona
     * @param mainPersona The normal persona
     * @returns The result persona, or null when the fusion is not possible.
     */
    FusionCalculator.prototype.fuseRare = function (rarePersona, mainPersona) {
        var modifier = rareCombos[mainPersona.arcana][rarePersonae.indexOf(rarePersona.name)];
        var personae = this.personaeByArcana[mainPersona.arcana];
        var mainPersonaIndex = personae.indexOf(mainPersona);
        var newPersona = personae[mainPersonaIndex + modifier];
        if (!newPersona) {
            return null;
        }
        while (newPersona && (newPersona.special || newPersona.rare)) {
            if (modifier > 0)
                modifier++;
            else if (modifier < 0)
                modifier--;
            newPersona = personae[mainPersonaIndex + modifier];
        }
        if (!newPersona) {
            return null;
        }
        return newPersona;
    };
    ;
    /**
     * Get the recipe for a special persona
     * @param persona The special persona
     * @returns {Array} An array of 1 element containing the recipe for the persona
     */
    FusionCalculator.prototype.getSpecialRecipe = function (persona) {
        if (!persona.special) {
            throw new Error("Persona is not special!)");
        }
        var allRecipe = [];
        for (var i = 0; i < specialCombos.length; i++) {
            var combo = specialCombos[i];
            if (persona.name === combo.result) {
                var recipe = {
                    sources: [],
                    result: personaMap[combo.result]
                };
                for (var j = 0; j < combo.sources.length; j++) {
                    recipe.sources.push(personaMap[combo.sources[j]]);
                }
                this.addRecipe(recipe, allRecipe, true);
                return allRecipe;
            }
        }
    };
    /**
     * Get the list of all recipes for the given persona
     * @param persona The resulting persona
     * @returns {Array} List of all recipes for the given persona
     */
    FusionCalculator.prototype.getRecipes = function (persona) {
        var _this = this;
        var allRecipe = [];
        // Rare persona can't be fused
        if (persona.rare) {
            return allRecipe;
        }
        // Check special recipes.
        if (persona.special) {
            return this.getSpecialRecipe(persona);
        }
        var recipes = this.getArcanaRecipes(persona.arcana);
        recipes = recipes.filter(function (value, index, array) {
            return _this.isGoodRecipe(value, persona);
        });
        for (var i = 0; i < recipes.length; i++) {
            this.addRecipe(recipes[i], allRecipe, true);
        }
        return allRecipe;
    };
    /**
     * Return true if the given recipe is good for the expected result.
     * A recipe is good if the sources are different from the expected result,
     * and the actual result is the same as the expected result.
     * @param recipe The recipe to check
     * @param expectedResult The expected resulting persona
     * @returns {boolean} true if the recipe is good for the given persona, false otherwise
     */
    FusionCalculator.prototype.isGoodRecipe = function (recipe, expectedResult) {
        if (recipe.sources[0].name === expectedResult.name)
            return false;
        if (recipe.sources[1].name === expectedResult.name)
            return false;
        return recipe.result.name === expectedResult.name;
    };
    /**
     * Get all recipes that result in a persona in the given arcana
     * @param arcana The result arcana
     * @returns {Array} the list of recipes
     */
    FusionCalculator.prototype.getArcanaRecipes = function (arcana) {
        var recipes = [];
        var arcanaCombos = arcana2Combos.filter(function (x) { return x.result === arcana; });
        // fuse 2 persona normally (including down-rank)
        for (var i = 0, combo = null; combo = arcanaCombos[i]; i++) {
            var personae1 = this.personaeByArcana[combo.source[0]];
            var personae2 = this.personaeByArcana[combo.source[1]];
            for (var j = 0, persona1 = null; persona1 = personae1[j]; j++) {
                for (var k = 0, persona2 = null; persona2 = personae2[k]; k++) {
                    // for same arcana fusion only consider k > j to avoid duplicates
                    if (persona1.arcana === persona2.arcana && k <= j)
                        continue;
                    // rare fusion will be handled separately
                    if (persona1.rare && !persona2.rare)
                        continue;
                    if (persona2.rare && !persona1.rare)
                        continue;
                    var result = this.fuseNormal(persona1, persona2);
                    if (!result)
                        continue;
                    recipes.push({
                        sources: [persona1, persona2],
                        result: result
                    });
                }
            }
        }
        // rare fusion where one persona is a rare one and the other is a normal one
        for (var i = 0; i < rarePersonae.length; i++) {
            var rarePersona = personaMap[rarePersonae[i]];
            var personae = this.personaeByArcana[arcana];
            for (var j = 0; j < personae.length; j++) {
                var mainPersona = personae[j];
                if (rarePersona === mainPersona)
                    continue;
                var result = this.fuseRare(rarePersona, mainPersona);
                if (!result)
                    continue;
                recipes.push({
                    sources: [rarePersona, mainPersona],
                    result: result
                });
            }
        }
        return recipes;
    };
    /**
     * Add a recipe to a list of recipe. Before adding, add an estimated cost
     * to the recipe and sort the recipe's sources.
     * @param recipe The recipe to add
     * @param allRecipes List of recipes to add to
     * @param sortIngredients if true the ingredient list will be sorted
     */
    FusionCalculator.prototype.addRecipe = function (recipe, allRecipes, sortIngredients) {
        // add an approximated cost
        recipe.cost = this.getApproxCost(recipe);
        if (sortIngredients) {
            // Sort ingredients so that highest level persona is first
            recipe.sources.sort(function (a, b) { return b.level - a.level; });
        }
        // help with rare persona fusion warning
        var isAllRare = true;
        for (var i = 0; i < recipe.sources.length; i++) {
            isAllRare = isAllRare && recipe.sources[i].rare;
        }
        recipe.isAllRare = isAllRare;
        allRecipes.push(recipe);
    };
    FusionCalculator.prototype.getApproxCost = function (recipe) {
        var cost = 0;
        for (var i = 0, source = null; source = recipe.sources[i]; i++) {
            var level = source.level;
            cost += (27 * level * level) + (126 * level) + 2147;
        }
        return cost;
    };
    return FusionCalculator;
}());


var PersonaController = /** @class */ (function () {
    function PersonaController($scope, $routeParams, $filter) {
        var personaName = $routeParams.persona_name;
        this.$filter = $filter;
        this.$scope = $scope;
        this.$scope.Math = Math;
        this.$scope.personaName = personaName;
        this.$scope.persona = personaMap[personaName];
        if (!this.$scope.persona)
            return;
        var calc = new FusionCalculator(customPersonaeByArcana);
        this.$scope.perPage = 20;
        // fusion to
        var fusionToRecipes = calc.getRecipes(this.$scope.persona);
        fusionToRecipes.sort(function (a, b) { return a.cost - b.cost; });
        for (var i = 0, recipe = null; recipe = fusionToRecipes[i]; i++) {
            recipe.num = i;
        }
        var fusionTo = {
            allRecipes: fusionToRecipes,
            recipes: fusionToRecipes,
            numRecipes: fusionToRecipes.length,
            lastPage: Math.floor(fusionToRecipes.length / this.$scope.perPage),
            pageNum: 0,
            filterStr: ""
        };
        this.$scope.fusionTo = fusionTo;
        this.$scope.$watch('fusionTo.filterStr', this.getPaginateAndFilterFunc(false).bind(this));
        this.$scope.$watch('fusionTo.filterStr', this.getResetPageFunc(false).bind(this));
        this.$scope.$watch('fusionTo.pageNum', this.getPaginateAndFilterFunc(false).bind(this));
        // fusion from
        var fusionFromRecipes = calc.getAllResultingRecipesFrom(this.$scope.persona);
        fusionFromRecipes.sort(function (a, b) { return a.cost - b.cost; });
        for (var i = 0, recipe = null; recipe = fusionFromRecipes[i]; i++) {
            recipe.num = i;
        }
        var fusionFrom = {
            allRecipes: fusionFromRecipes,
            recipes: fusionFromRecipes,
            numRecipes: fusionFromRecipes.length,
            lastPage: Math.floor(fusionFromRecipes.length / this.$scope.perPage),
            pageNum: 0,
            filterStr: ""
        };
        this.$scope.fusionFrom = fusionFrom;
        this.$scope.$watch('fusionFrom.filterStr', this.getPaginateAndFilterFunc(true).bind(this));
        this.$scope.$watch('fusionFrom.filterStr', this.getResetPageFunc(true).bind(this));
        this.$scope.$watch('fusionFrom.pageNum', this.getPaginateAndFilterFunc(true).bind(this));
        // stats
        var compediumEntry = personaMap[personaName];
        this.$scope.persona.stats = compediumEntry.stats;
        this.$scope.persona.statsHeader = ["Strength", "Magic", "Endurance", "Agility", "Luck"];
        //item data
        var item = compediumEntry.item;
        if(compediumEntry.skillCard) {
            this.$scope.persona.itemData = getSkillCardInfo(item);
            if(compediumEntry.itemr) {
                var itemr = compediumEntry.itemr;
                this.$scope.persona.itemDataR = getSkillCardInfo(itemr);
            }
            this.$scope.persona.itemDataHeader = ["Type", "Name", "Effect", "Cost"];
        }
        else {
            this.$scope.persona.itemData = getItem(item);
            if(compediumEntry.itemr) {
                var itemr = compediumEntry.itemr;
                this.$scope.persona.itemDataR = getItem(itemr);
            }
            this.$scope.persona.itemDataHeader = ["Type", "Name", "Description"];
        }
        // elements
        // split the table into 2 for mobile
        var elems = getElems(personaName);
        this.$scope.persona.elems = elems;
        this.$scope.persona.elems1 = elems.slice(0, 5);
        this.$scope.persona.elems2 = elems.slice(5);
        // split the table into 2 for mobile
        var elemsHeader = ["Physical", "Gun", "Fire", "Ice", "Electric", "Wind", "Psychic", "Nuclear", "Bless", "Curse"];
        this.$scope.persona.elemsHeader = elemsHeader;
        this.$scope.persona.elemsHeader1 = elemsHeader.slice(0, 5);
        this.$scope.persona.elemsHeader2 = elemsHeader.slice(5);
        // Note: skillList are skills in a sorted list for displaying with Angular.
        // It's different from the existing skills property which is a map.
        this.$scope.persona.skillList = getSkills(personaName);

        //inheritance data
        var inheritanceHeader = ["Physical", "Gun", "Fire", "Ice", "Electric", "Wind", "Psychic", "Nuclear", "Bless", "Curse", "Healing", "Ailment"];
        this.$scope.persona.inheritanceHeader = inheritanceHeader;
        this.$scope.persona.inheritanceHeader1 = inheritanceHeader.slice(0,6);
        this.$scope.persona.inheritanceHeader2 = inheritanceHeader.slice(6);

        if(compediumEntry.inherits) {
            var inheritanceType = compediumEntry.inherits;
            var inheritance = getInheritance(inheritanceType);
            this.$scope.persona.inheritance = inheritance;
            this.$scope.persona.inheritance1 = inheritance.slice(0,6);
            this.$scope.persona.inheritance2 = inheritance.slice(6);
        }
    }
    PersonaController.prototype.paginateAndFilter = function (fusionFromTo, filterFunc) {
        if (fusionFromTo.pageNum < 0)
            fusionFromTo.pageNum = 0;
        if (fusionFromTo.pageNum > fusionFromTo.lastPage)
            fusionFromTo.pageNum = fusionFromTo.lastPage;
        if (fusionFromTo.filterStr) {
            fusionFromTo.recipes = this.$filter('filter')(fusionFromTo.allRecipes, filterFunc(fusionFromTo.filterStr));
        }
        else {
            fusionFromTo.recipes = fusionFromTo.allRecipes;
        }
        var totalPageCount = Math.ceil(fusionFromTo.recipes.length / this.$scope.perPage);
        fusionFromTo.lastPage = Math.max(0, totalPageCount - 1);
        fusionFromTo.numRecipes = fusionFromTo.recipes.length;
        fusionFromTo.recipes = fusionFromTo.recipes.slice(fusionFromTo.pageNum * this.$scope.perPage, fusionFromTo.pageNum * this.$scope.perPage + this.$scope.perPage);
    };
    PersonaController.prototype.getPaginateAndFilterFunc = function (isFusionFrom) {
        var _this = this;
        return function (newVal, oldVal, scope) { return _this.paginateAndFilter(isFusionFrom ? scope.fusionFrom : scope.fusionTo, _this.getRecipeFilterFunc(isFusionFrom)); };
    };
    PersonaController.prototype.getRecipeFilterFunc = function (isFusionFrom) {
        var containsIgnoreCase = function (str, filter) { return str.toLowerCase().indexOf(filter.toLowerCase()) !== -1; };
        if (isFusionFrom) {
            return function (filterString) { return function (recipe, index, array) {
                return containsIgnoreCase(recipe.sources[1].name, filterString) || containsIgnoreCase(recipe.result.name, filterString);
            }; };
        }
        else {
            return function (filterString) { return function (recipe, index, array) {
                for (var i = 0; i < recipe.sources.length; i++) {
                    if (containsIgnoreCase(recipe.sources[i].name, filterString)) {
                        return true;
                    }
                }
                return false;
            }; };
        }
    };
    PersonaController.prototype.resetPage = function (fusionFromTo) {
        fusionFromTo.pageNum = 0;
    };
    PersonaController.prototype.getResetPageFunc = function (isFusionFrom) {
        var _this = this;
        return function (newVal, oldVal, scope) { return _this.resetPage(isFusionFrom ? scope.fusionFrom : scope.fusionTo); };
    };
    return PersonaController;
}());


var PersonaListController = /** @class */ (function () {
    function PersonaListController($scope) {
        this.$scope = $scope;
        $scope.fullPersonaList = fullPersonaList;
        // set the default sort param
        $scope.sortBy = 'level';
        $scope.sortReverse = false;
        $scope.sortFunc = this.getSortValue.bind(this);
    }
    PersonaListController.prototype.getSortValue = function (item) {
        var sortBy = this.$scope.sortBy;
        if (sortBy === "arcana") {
            var arcanaIndex = Object.keys(rareCombos).indexOf(item.arcana);
            var arcanaValue = arcanaIndex >= 10 ? arcanaIndex.toString() : "0" + arcanaIndex;
            var level = 100 - item.level;
            var levelValue = level >= 10 ? level.toString() : ("0" + level);
            return arcanaValue + levelValue;
        }
        else {
            return item[sortBy];
        }
    };
    return PersonaListController;
}());


var SettingController = /** @class */ (function () {
    function SettingController($scope) {
        $scope.dlcPersona = dlcPersona;
        $scope.save = this.save;
        for (var i = 0; i < dlcPersona.length; i++) {
            dlcPersona[i][2] = (isDlcPersonaOwned(dlcPersona[i][0]) ? "y" : "n");
        }
    }
    SettingController.prototype.save = function () {
        var config = {};
        var checkboxes = document.getElementsByClassName("dlcCheckbox");
        for (var i = 0; i < checkboxes.length; i++) {
            var checkbox = checkboxes[i];
            var name1 = checkbox.name.split(",")[0];
            var name2 = checkbox.name.split(",")[1];
            var value = checkbox.checked;
            config[name1] = value;
            config[name2] = value;
            localStorage["dlcPersona"] = JSON.stringify(config);
        }
        window.location.href = GLOBAL_IS_ROYAL ? "/persona/p5r.html" : "/persona/p5.html";
    };
    return SettingController;
}());




var SkillListController = /** @class */ (function () {
    function SkillListController($scope, $sce) {
        $scope.skillList = skillList;
        if (!SkillListController.sceDone) {
            for (var i = 0; i < skillList.length; i++) {
                skillList[i].personaDisplay = $sce.trustAsHtml(skillList[i].personaDisplay);
                skillList[i].talkDisplay = $sce.trustAsHtml(skillList[i].talkDisplay);
                skillList[i].fuseDisplay = $sce.trustAsHtml(skillList[i].fuseDisplay);
            }
            SkillListController.sceDone = true;
        }
        // set the default sort param
        $scope.sortBy = 'name';
        $scope.reverse = false;
    }
    SkillListController.sceDone = false;
    return SkillListController;
}());








