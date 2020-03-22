var mysql = require("mysql");
var inquirer = require("inquirer");
// var SQLMaster = require("./sqlfunctions")

// MYSQL CONNECTION OBJECT
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "D5n6sa4R2211",
    database: "BAMAZONDB"
});
function addItem() { //Add an item to the inventory, conviniently
    // prompt for info about the item being put in inventory
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the item you would like to submit?"
            },
            {
                name: "dept",
                type: "list",
                message: "What Department is this product for?",
                choices: ["Electronics", "Housewares", "Grocery", "Produce", "Automotive", new inquirer.Separator(), "RETURN"]
            },
            {
                name: "price",
                type: "input",
                message: "How much are you charging?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "inventory",
                type: "input",
                message: "How many do you have on hand?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.dept,
                    price: answer.price || 0,
                    stock_quantity: answer.inventory || 0
                },
                function (err) {
                    if (err) throw err;
                    console.log("products table updated successfully!");
                    // re-prompt the user to add another item.
                    start();
                }
            );
        });
}
function custWelcome() { // greets the guest and offers the view all or search options
    inquirer
        .prompt({
            name: "custGreet",
            type: "list",
            message: "Hello! welcome to BAMazon, previously ACME Corp, known \nto provide totally legit products world wide since forever. \n Would you like to check out the goods?",
            choices: ["View ALL the things", "Buy a thing", new inquirer.Separator(), "RETURN"]
        })
        .then(function (answer) {
            // Deviates into the View screen, or the Search screen
            if (answer.custGreet === "View ALL the things") {
                postInventory();
            } else if (answer.custGreet === "Buy a thing") {
                purchaseItem();
            } else {
                start();
            }
        });
}
function postInventory() { //Shows user the inventory with all data
    connection.query(
        "SELECT * FROM products",
        function (error, results, fields) {
            if (error) throw error;
            for (let i = 0; i < results.length; i++) {
                console.log("" + results[i].id + ". " + results[i].product_name + " in the " + results[i].department_name + " department for $" + results[i].price + " with " + results[i].stock_quantity + " on hand.");

            };
            purchaseItem();
        });
}
function purchaseItem() { //Asks the user for the ID and quantity of item to purchase
    inquirer
        .prompt([
            {
                name: "itemID",
                type: "number",
                message: "Enter the ID number for the item you'd like to purchase"
            },
            {
                name: "purchaseQuantity",
                type: "number",
                message: "How many would you like to buy?"
            }
        ])
        .then(function (answer) {
            //runs the table updater
            var id = answer.itemID
            var orderQuantity = answer.purchaseQuantity
            updateTable(orderQuantity, id);
        });
}
function updateTable(orderQuantity, id) {// selects all results with an id matching the id that was passed from the purchaseItem prompt
    
    connection.query(
        "SELECT * FROM products WHERE ?",
        {
            id: id
        },
        function (error, res) {
            var difference = (res[0].stock_quantity - orderQuantity)
            var price = (orderQuantity * res[0].price)
            if (error) throw error;
            //check if stock is sufficient
            if (res[0].stock_quantity < orderQuantity) {
                console.log("Insufficient quantity!")
            } else {
                //updates the products table, setting the stock quantity to reflect the subtracted inventory at the row where the id matches the id passed by the purchaseItem prompt
                connection.query(
                    "UPDATE products SET ? WHERE ?",[
                    {
                        stock_quantity: difference
                    },
                    {
                        id: id
                    }
                    ],
                    function (err, res) {
                        if (err) throw err;
                    });
            };
                        console.log("Purchase of " + orderQuantity + " " + res[0].product_name + ".\nYour total is : $" + price)
            
            custWelcome();

        }
    );
}
function searchPrompt() { //Not functional - future plans

    inquirer
        .prompt({
            name: "searchTerm",
            type: "input",
            message: "Enter item name:"
        })
        .then(function (answer) {
            // Deviates into the View screen, or the Search screen
            if (answer.searchTerm === "") {
                console.log("Please enter a search term.")
                searchPrompt();
            } else {
                //this would run a function that querys SQL to SELECT * FROM products WHERE ?, {product_name: answer.searchTerm}
                //this would only work for exact matches. neew to figure out how to search entire colomn and return partial matches.
                searchDatabase(answer.searchTerm)
            }
        });
}
function start() { // offer login or guest options - future plans
    console.log("starting")
    inquirer
        .prompt({
            name: "login",
            type: "list",
            message: "Welcome! Please log in, or continue as a guest!",
            choices: ["Log-in", "Guest"]
        })
        .then(function (answer) {
            // based on their answer, greet with either login or custWelcome functions
            if (answer.login === "Log-in") {
                login();
            }
            else {
                custWelcome();

            }
        });
}
function login() { //input credentials - future plans
    inquirer
        .prompt([
            {
            name: "login",
            type: "input",
            message: "Enter your username"
        },
        {
            name: "password",
            type: "password",
            message: "Enter your password: "
        }
        ])
        .then(function (answer) {
            if (answer.login === "user on mysql table") {
                //need to set up SELECT * FROM usersDB WHERE, {username: answer.login}, then check the row's password colomn data and compair it to answer.password.
                staffWelcome();
            } else {
                console.log("not implemented yet")
                start()
            }
        });
}

custWelcome();
// addItem()
// start()