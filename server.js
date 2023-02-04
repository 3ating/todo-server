const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const cors = require("cors");

const app = express();

var corOptions = {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
};

app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors(corOptions));
app.use(
    express.json({
        type: ["application/json", "text/plain"],
    })
);

mongoose.connect("mongodb+srv://yiting:Kk309612028@cluster0.ljkmi.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = mongoose.Schema(
    {
        text: String,
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        versionKey: false,
    }
);

itemsSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    text: "eat",
});
const item2 = new Item({
    text: "sleep",
});
const item3 = new Item({
    text: "eat and sleep",
});

const defaultItems = [item1, item2, item3];

app.route("/")

    .get(function (req, res) {
        Item.find({}, function (err, foundItems) {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully savevd default items to DB.");
                    }
                });
            }

            if (!err) {
                res.send(foundItems);
            } else {
                res.send(err);
            }
        });
    })

    .post(function (req, res) {
        const newItem = new Item({
            text: req.body.text,
        });
        newItem.save({}, function (err) {
            if (!err) {
                res.send("Successfully post the items.");
            } else {
                res.send(err);
            }
        });
        console.log("success to save data to server");
    })

    .delete(function (req, res) {
        Item.deleteOne({ _id: req.body.id }, function (err) {
            if (!err) {
                res.send("Successfully deleted the items.");
            } else {
                res.send(err);
            }
        });
    });

app.patch("/", (req, res) => {
    Item.findByIdAndUpdate(
        {
            _id: req.body.id,
        },
        {
            completed: req.body.completed,
        },
        function (err, item) {
            if (!err) {
                res.send(`Successfully changed the item status to ${item.completed}.`);
            } else {
                res.send(err);
            }
        }
    );
});

const PORT = process.env.PORT || 3001;
if (PORT == null || PORT == "") {
    PORT = 3001;
}

app.listen(PORT, function () {
    console.log(`Successed to connect localhost ${PORT}`);
});
