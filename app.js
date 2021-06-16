//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-mohit:test123@cluster0-pur6v.mongodb.net/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true });

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const work = new Item({
  name : "Work"
});

const study = new Item({
  name : "Study"
});

const play = new Item({
  name : "Play"
});

const defaultItems = [work,study,play];

const listSchema = {
  name:String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.deleteOne({_id:"5e42cbf30040941f3109345d"}, function(err){
//   console.log("deleted");
// });

app.get("/", function(req, res) {

  Item.find({}, function(err, items){
    if(items.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully inserted the docs");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listTitle === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listTitle}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Deleted successfully");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err, foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        const list = new List({
          name : customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list",{listTitle:foundList.name, newListItems:foundList.items });
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
