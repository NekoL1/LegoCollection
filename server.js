const legoData = require("./modules/legoSets");
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs'); //A4: Updating  server.js  to "set" the "view engine" setting to use the value: "ejs"
app.use(express.urlencoded({ extended: true })); //application will be using urlencoded form data

const env = require("dotenv");
env.config();


const HTTP_PORT = process.env.PORT || 8080;

legoData.initialize()
  .then(() => {

    //got to the home page
    app.get('/', (req, res) => {
      res.render(path.join(__dirname, 'views', 'home'), { page: '/' });
 // A4 :  change all of  "res.sendFile()" functions to "res.render()"
    });

    // go to the about page
    app.get('/about', (req, res) => {
      res.render(path.join(__dirname, 'views', 'about'), { page: '/about' });// A4 :  change all of  "res.sendFile()" functions to "res.render()"
    });

    // Serve all Lego sets or sets by theme
    app.get('/lego/sets', (req, res) => {
      const theme = req.query.theme;

      if (theme) {
        legoData.getSetsByTheme(theme)
          .then((data) => {
            if(data.length === 0){
              return res.status(404).render("404", {message:"Can not found the theme. "});
            }
            res.render('sets', { sets: data }); // Render the 'sets.ejs' view with the 'data' stored in a 'sets' variable
          })
          .catch((err) => {
            res.status(404).render("404", {message: "I'm sorry, we're unable to find the theme what you're looking for"});
          });
      } else {
        legoData.getAllSets()
          .then((data) => {
            res.render('sets', { sets: data }); // Render the 'sets.ejs' view with the 'data' stored in a 'sets' variable
          })
          .catch((err) => {
            res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
          });
      }
    });

   //get "/lego/sets/:num" to retur a set by setNum
    app.get('/lego/sets/:num', (req, res) => {
      const setNum = req.params.num;
  
      legoData.getSetByNum(setNum)
        .then((data) => {
          if(data){
            res.render('set', {set: data});
          }else{
            res.status(404).render("404", {message: "I'm sorry, we're unable to find the id that you're looking for"});
          }    
        })
        .catch((err) => {
          res.status(404).render("404", {message: "I'm sorry, we're unable to find the id that you're looking for"});
        });
    });

//  routes  for "/lego/addSet"
    app.get("/lego/addSet", async (req, res) => {
      try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { themes });
      } catch (err) {
        res.render("500", { message: `Error: ${err.message}` });
      }
    });

    app.post("/lego/addSet",  async (req, res) => {
      try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
      } catch (err) {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`,
        });
      }
    });


//  routes  for "/lego/editSet"
    app.get("/lego/editSet/:set_num", async (req, res) => {
      try {
        const set = await legoData.getSetByNum(req.params.set_num);
        const themes = await legoData.getAllThemes();
        res.render("editSet", { themes, set });
      } catch (err) {
        res.status(404).render("404", { message: err.message });
      }
    });

    app.post("/lego/editSet", async (req, res) => {
      try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
      } catch (err) {
        res.status(500).render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`,
        });
      }
    });


  // route for delete
  app.get("/lego/deleteSet/:num", async(req,res) => {
    try{
      await legoData.deleteSet(req.params.num); // Use req.params.num instead of req.params.set_num
      res.redirect("/lego/sets");
    }catch(err){
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})


    // Handle 404 errors
    app.use((req, res) => {
      res.status(404).render("404", {message: "Oops! The page you're looking for doesn't exist."});
    });

      // start for server
    app.listen(HTTP_PORT, () => {
      console.log(`Server is listening at http://localhost:${HTTP_PORT}`);
    });
  })
  .catch(error => {
  console.error('Error initializing Lego data:', error);
  });