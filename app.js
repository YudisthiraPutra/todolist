//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name:{
    type: String,
    required: true
  }
};

const listSchema = {
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
};

const List = mongoose.model("list", listSchema);

const Item = mongoose.model("item", itemSchema);

const mic = new Item({
  name: "Welcome to your to do list"
});

const mic2 = new Item({
  name:"Hit + to add to-do"
});

const mic3 = new Item({
  name:"<-- Hit this to delete"
});

const defaultArr=[mic, mic2,mic3];

// Item.insertMany(defaultArr) 
//   .then(function()
//   {
//     console.log("all in");
//   })
//   .catch(function(err)
//   {
//     console.log(err);
//   })

app.get("/", function(req, res) {
  Item.find()
  .then(function(items){
    if(items.length === 0)
    {
      Item.insertMany(defaultArr) 
        .then(function()
        {
          console.log("all in");
        })
        .catch(function(err)
        {
          console.log(err);
        })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "today", newListItems: items});
    }
  })
  .catch(function(err){
    console.log(err);
  });
});

// res.render("list", {listTitle: "today", newListItems: foundItems}); 


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);

  const addedItem = new Item ({
    name: itemName
  });

  if(listName === "today")
  {
    addedItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then(function(found)
    {
      found.items.push(addedItem);
      found.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete", function(req, res)
{
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName == "today")
  {
    Item.findByIdAndRemove({_id:checkedItem})
    .then(function()
    {
      console.log("deleted");
    })
    .catch(function(err)
    {
      console.log(err);
    })
  res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItem}}})
    .then(function(found)
    {
      res.redirect("/"+listName);
    })
    .catch(function(err)
    {
      console.log(err);
    })
  }
})

app.get('/:typeList', function(req, res)
{
  const customList = _.capitalize(req.params.typeList);
  List.findOne({name:customList})
    .then(function(found){
      if(!found)
      {
        const listItem = new List({
          name: customList,
          items:defaultArr
        });
        listItem.save();
        res.redirect("/"+customList);
      }
      else{
        res.render("list", {listTitle: customList, newListItems: found.items});
      }
    })
    .catch(function(err)
    {
      console.log(err);
    })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
