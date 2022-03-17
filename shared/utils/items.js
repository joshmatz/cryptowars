const { ethers } = require("ethers");
const weaponsString = require("../constants/items/weaponsString");
const armorsString = require("../constants/items/armorsString");
const boostsString = require("../constants/items/boostsString");
const shillsString = require("../constants/items/shillsString");
const vehiclesString = require("../constants/items/vehiclesString");
const consumablesString = require("../constants/items/consumablesString");

const weaponClass = 1;

const classMap = {
  IS_NOT_SET: 0,
  WEAPON: 1,
  ARMOR: 2,
  VEHICLE: 3,
  SHILL: 4,
  BOOST: 5,
  CONSUMABLE: 6,
};

const rarityMap = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
};

const attackIndex = 1;
const defenseIndex = 2;
const rarityIndex = 4;
const locationIndex = 6;

const getItemInfo = (itemClass, rawItem) => {
  const parsedItem = rawItem.split("\t");
  const rarity = rarityMap[parsedItem[rarityIndex]];
  const attack = parseInt(parsedItem[attackIndex], 10);
  const defense = parseInt(parsedItem[defenseIndex], 10);

  return {
    name: parsedItem[0],
    class: itemClass,
    attack,
    defense,
    rarity,
  };
};

const weapons = weaponsString.split(/\r\n|\r|\n/).map((ri, index) => {
  return getItemInfo(classMap.WEAPON, ri);
});

const armor = armorsString.split(/\r\n|\r|\n/).map((ri, index) => {
  //   console.log("armor", { index });

  return getItemInfo(classMap.ARMOR, ri);
});

const vehicles = vehiclesString.split(/\r\n|\r|\n/).map((ri, index) => {
  //   console.log("vehicle", { index });
  return getItemInfo(classMap.VEHICLE, ri);
});

const consumables = consumablesString.split(/\r\n|\r|\n/).map((ri, index) => {
  //   console.log("consumable", { index });
  return getItemInfo(classMap.CONSUMABLE, ri);
});

// const boosts = boostsString.split(/\r\n|\r|\n/).map((ri, index) => {
//   console.log("boost", { index });
//   return getItemInfo(classMap.BOOST, ri);
// });

const shills = shillsString.split(/\r\n|\r|\n/).map((ri, index) => {
  //   console.log("shill", { index });
  return getItemInfo(classMap.SHILL, ri);
});

const things = {
  itemTypes: [...weapons, ...armor, ...vehicles, ...consumables, ...shills],
  weapons,
  armor,
  vehicles,
  consumables,
  //   boosts,
  shills,
};

module.exports = things;
