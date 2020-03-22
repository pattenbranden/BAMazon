var mysql = require("mysql");
var inquirer = require("inquirer");
// MYSQL CONNECTION OBJECT
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "",
    password: "",
    database: "BAMAZON_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayProducts();
});

const SQLMaster = {
    search: function (params) {

    },
    show: function (params) {
        // query the database for all items being auctioned
        connection.query("SELECT " + params + " FROM inventory", function (err, results) {
            if (err) throw err;
        });
    },
    add: function () {
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
                    choices: ["Electronics", "Housewares", "Grocery", "Produce", "Automotive", "RETURN"]
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
                connection.query(
                    "INSERT INTO Products ?",
                    {
                        product_name: answer.item,
                        department_name: answer.dept,
                        price: answer.price || 0,
                        stock_quantity: answer.inventory || 0
                    },
                    function (err) {
                        if (err) throw err;
                        console.log(answer.inventory +" "+ answer.item + " for the " + answer.dept + "has been added, for $" + answer.price + "ea.");
                    }
                );
            });

    }
                    
                



}
module.exports = SQLMaster
