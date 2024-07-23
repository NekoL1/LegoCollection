require("dotenv").config(); //This will allow us to access the DB_USER, DB_DATABASE
const Sequelize = require("sequelize");

const setData = require("../data/setData");
const themeData = require("../data/themeData");

//and create the "sequelize" object
// const sequelize = new Sequelize({
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   username: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   dialect: "postgres",
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false, 
//     },
//   },
// });
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: {rejectUnauthorized: false, },
  }
});


//create the two "models" required for our Assignment according 
//to the below specification (Column Name / Sequelize Data Type)
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
});




//create an association between the two:
Set.belongsTo(Theme, { foreignKey: "theme_id" });

// Create a variable called "sets", initialized to an empty array
// let sets = [];

// Fill the "sets" array (declared above), by adding copies of all the setData objects
function initialize() {
  sets = []; // Reset the sets array
  return new Promise((resolve, reject) => {
    setData.forEach((set) => {
      const theme = themeData.find((theme) => theme.id === set.theme_id);

      if (theme) {
        let setTheme = { ...set, theme: theme.name };
        sets.push(setTheme);
        resolve(sets);
      }
    });

    // Resolve after the forEach loop completes
   
  });
}

// Simply return the complete "sets" array
async function getAllSets() {
  try{
    const sets = await Set.findAll({include: [Theme]});
    return sets;
  }catch(error){
    console.error("get all sets error: ", error);
    throw error;
  }
}


/* Return a specific "set" object from the "sets" array,
   whose "set_num" value matches the value of the "setNum" parameter */
async function getSetByNum(setNum) {
  try{
    const set = await Set.findOne({
      where: { set_num: setNum},
      include: [Theme],
    });

    if(set){ 
      return set;
    }else{
      throw `Unable to find requested set: ${setNum}`;
    }
  }catch(err){
    console.error("getting set by set_num error:", err);
  }
}

/* Return an array of objects from the "sets" array
   whose "theme" value matches the "theme" parameter.
   However, the "theme" parameter may contain only part of the "theme" string,
   and case is ignored. */
async function getSetsByTheme(theme) {
  try {
    const sets = await Set.findAll({
      include: [Theme],
      where: {
        "$Theme.name$": {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    });

    if (sets.length > 0) {
      return sets;
    } else {
      throw `Unable to find requested sets: ${theme}`;
    }
  } catch (error) {
    console.error("getting set by theme error:", error);
    throw error; // Rethrow the error after logging
  }
}


const addSet = async(setData) =>{
  try{
      console.log(setData);
      await Set.create(setData);
  }catch(err){
      throw err.errors[0].message;
  }
}

const getAllThemes = async () =>{
  try{
    const themes = await Theme.findAll();
    return themes;
  }catch(err){
    throw err;
  }
}

const editSet = async (setNum, setData) => {
  try {
    await Set.update(setData, { where: { set_num: setNum } });
  } catch (err) {
    throw err.errors[0].message;
  }
};


//remove (delete)
const deleteSet = async (setNum) =>{
  try{
    await Set.destroy({where: {set_num: setNum}});
  }catch(err){
    throw err.errors[0].message; 
  }
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  getAllThemes,
  editSet,
  deleteSet
};



