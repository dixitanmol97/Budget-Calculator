
//BUDGET CONTROLLER
var budgetController = (function() {
    var Expense = function(id,description,value,percentage) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = percentage
        return this;
    };
    
    var Income = function(id,description,value) {
        this.id = id;
        this.description = description,
        this.value = value
        return this;
    };

    function addTotal(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        
        data.total[type] = sum;
    }
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        total: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type,des,val) {
            var ID,newItem;
            // get ID
            if(data.allItems[type].length == 0){
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }

            //Create New Item
            if(type==='inc'){
                newItem = new Income(ID,des,val);
            } else {
                newItem = new Expense(ID,des,val,0);
            }

            //Update in database
            data.allItems[type].push(newItem);

            return newItem;
        },
        deleteItem: function (type,id) {
            var ids,iD;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            ID = ids.indexOf(id);

            data.allItems[type].splice(ID,1);

        },
        testing: function(){
            console.log(data);
        },
        calculateBudget: function(){
            //Calculate Tot Input,Expenses
            addTotal('inc');
            addTotal('exp');

            data.budget = data.total.inc - data.total.exp;
            if(data.total.inc > 0)
                data.percentage = Math.round((data.total.exp / data.total.inc)*100);
            else
                data.percentage = -1;
        },
        calculatePercentages: function(){
            data.allItems['exp'].forEach(function(current){
                if(data.total.inc === 0)
                    current.percentage = -1;
                else
                    current.percentage = Math.round((current.value/data.total['inc'])*100);
            });
        },
        returnPercentages: function() {
            var perc = data.allItems['exp'].map(function(current){
                return current.percentage;
            });
            return perc;
        },
        returnBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totInc: data.total.inc,
                totExp: data.total.exp
            };
        }

    };
})();





//UI CONTROLLER
var uiController = (function () {
    var x=2;
    var DOMstring = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        button: '.add__btn',
        income: '.income__list',
        expenses: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        controller: '.container',
        itemPerc: '.item__percentage'
    };

    return {
        getInputFields: function(){
            return {
                type: document.querySelector(DOMstring.type).value,
                description: document.querySelector(DOMstring.description).value,
                value: parseFloat(document.querySelector(DOMstring.value).value)
            };
        },
        getDOMstring: function(){
            return DOMstring;
        },
        addNewElement: function(object,type) {
            var html,newHtml,element;

            if(type === 'inc'){
                element = DOMstring.income;

                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }  
            else {
                element = DOMstring.expenses;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%description%', object.description);
            newHtml = newHtml.replace(' %value% ', object.value);
            newHtml = newHtml.replace('%id%',object.id);
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        removeElement: function(selectorid) {
            var el;

            el=document.getElementById(selectorid);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMstring.description + ', ' + DOMstring.value);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,arr) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayPercentages: function() {
            var nodeList, prec;
            
            nodeList = document.querySelectorAll(DOMstring.itemPerc);
            perc = budgetController.returnPercentages();

            var nodeListforEach = function (list,callback){
                for(var i = 0;i<list.length;i++)
                    callback(list[i], i);
            };
            
            nodeListforEach(nodeList, function (current, index){
                if(perc[index] > 0)
                    current.textContent = perc[index] + '%';
                else
                    current.textContent = '--';
            });
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstring.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstring.incomeLabel).textContent = obj.totInc;
            document.querySelector(DOMstring.expenseLabel).textContent = obj.totExp;

            if(obj.percentage > 0)
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstring.percentageLabel).textContent = '--';
        }
    };
})();





//GLOBAL CONTROLLER
var controller = (function(uictrl,budgetctrl) {
    var x=1;

    
    var setEventListeners = function() {
        var DOM = uictrl.getDOMstring();

        document.querySelector(DOM.button).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function (event){
            if(event.keyCode === 13 || event.which === 13)
                ctrlAddItem();
        });

        document.querySelector(DOM.controller).addEventListener('click',ctrlDeleteItem);
    };

    var budgetUpdate = function() {
        var budget;
        
        // 1.) Calculate Budget.
        budgetctrl.calculateBudget();
        
        // 2.) Return Budget.
        budget = budgetctrl.returnBudget();

        // 3.) Update Budget on UI.
        uictrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        
        //Calculate and update percentages
        budgetctrl.calculatePercentages();

        //Update UI
        uictrl.displayPercentages();
    };

    var ctrlAddItem = function() {
            
            var input, newItem;

            //1.) Get Input from UI
            input = uictrl.getInputFields();

            if(input.description !== "" && !isNaN(input.value) && input.value > 0){
                
                //2.) Add Input to budget.
                newItem = budgetctrl.addItem(input.type, input.description, input.value);
                
                //3.) Add input to UI.
                uictrl.addNewElement(newItem,input.type);

                //4.) Clear Fields
                uictrl.clearFields();
                
                //Update Budget
                budgetUpdate();

                //Update Percentages
                updatePercentages();
            }
    };

    var ctrlDeleteItem = function (event) {
        var itemID,splitID,ID,type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            console.log(type);

            // Delete from Budget
            budgetctrl.deleteItem(type,ID);

            // Delete from UI
            uictrl.removeElement(itemID);

            //Update Budget and UI
            budgetUpdate();

            //Update Percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            uictrl.displayBudget({
                budget: 0,
                percentage: -1,
                totInc: 0,
                totExp: 0
            });   
            setEventListeners();
        }
    }

})(uiController,budgetController);

controller.init();