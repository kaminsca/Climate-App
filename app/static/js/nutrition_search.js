$(document).ready(function() {
    $('#wikiForm').submit(function(e) {
        e.preventDefault(); // Prevent the form from submitting
        // Get the user's input
        var food = $('#food').val();
        clearPrevious();
        // Make an AJAX request to get the Wikipedia summary
        $.get('/get_nutrition', { query: food }, function(response) {
            console.log(response);
            // $('#summary').text(response[0].food_description);
            showOptions(response);
        });
    });

    $('#idForm').submit(function(e) {
        e.preventDefault(); // Prevent the form from submitting
        // Get the user's input
        var id = $('#foodID').val();
        clearPrevious();
        setNutritionResults(id);
    });

    $('#randomFoodForm').submit(function(e) {
        e.preventDefault(); // Prevent the form from submitting
        GetRandomFood();
    });

    async function GetRandomFood(){
        try {
            let max = 999999;
            let maxAttempts = 10;
            const id = await findValidID(0, maxAttempts, max);
            if (id === -1) {
                console.log("Could not find valid id");
                return;
            }
            clearPrevious();
            setNutritionResults(id);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    function showOptions(options){
        console.log("showing options: ");
        var buttonsHtml = '';
        options.forEach(function (option, index) {
            // only show max of 10 options
            if (index < 10){
                let specific_food = option.food_type + " " + option.food_name;
                if (option.hasOwnProperty("brand_name")) {
                    specific_food = option.brand_name + " " + option.food_name;
                }
                // buttonsHtml += '<button class="option btn btn-primary btn-lg shadow" type="submit" data-query="'
                //     + specific_food + '">' + specific_food + '</button>';
                let food_id = option.food_id;
                buttonsHtml += '<button class="option btn btn-primary btn-lg shadow" type="submit" data-query="'
                     + food_id + '">' + specific_food + '</button>';
            }
        });

        // Display buttons in a container (e.g., a div with id "disambiguation-options")
        $('#options').html(buttonsHtml);

        // Add click event handler for disambiguation options
        $('.option').click(function () {
            var selectedQuery = $(this).data('query');
            setNutritionResults(selectedQuery);
        });
    }

    function clearPrevious(){
        $('#options').html("");
        $('#summary').text("");
        if ($("#summaryContainer").is(":visible")){
            $("#summaryContainer").toggle();
        }
    }

    function setNutritionResults(selectedQuery){
        console.log("setting ")
        console.log(selectedQuery);
        // Make a new AJAX request with the selected option
        $.get('/get_nutrition_by_id', { query: selectedQuery}, function (response) {
            // Display the summary for the selected option
            console.log(response);
            if(response){
                if (!$("#summaryContainer").is(":visible")) {
                    $("#summaryContainer").toggle();
                }
            }
            setFoodName(response);
            let serving;
            if (response.servings.serving.length > 1){
                serving = response.servings.serving[0];
            }
            else{
                serving = response.servings.serving;
            }
            let text = "";
            text += serving.serving_description;
            if (serving.hasOwnProperty("metric_serving_amount")){
                text += " (" + Math.round(serving.metric_serving_amount) + " " + serving.metric_serving_unit + ")";
            }
            let details = ["calories", "protein", "sodium", "sugar", "carbohydrate", "fat", "fiber"];
            details.forEach(function (nutrient, index) {
                if (serving.hasOwnProperty(nutrient)){
                    const capitalized = nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
                    text += `<br />${capitalized}: ` + serving[nutrient];
                    if (nutrient === "sodium" || nutrient === "cholesterol"){
                        text += "mg";
                    }
                    else{
                        text += "g";
                    }
                }
            });
            $('#summary').html(text);
        });
    }

    function setFoodName(food){
        let myFood = food.food_type + " " + food.food_name;
        if (food.hasOwnProperty("brand_name")) {
            myFood = food.brand_name + " " + food.food_name;
        }
        document.getElementById("foodName").innerHTML = myFood;
    }

    function findValidID(attempts, maxAttempts, max) {
        return new Promise((resolve, reject) => {
            if (attempts >= maxAttempts) {
                console.log("Could not find valid id");
                //return -1;
                resolve(-1);
                return;
            }
            let id = Math.floor(Math.random() * max);
            $.get('/get_nutrition_by_id', {query: id}, function (response, status) {
                if (status === "success") {
                    console.log("Success! id: ", id, " --- Data:", response);
                    resolve(id);
                    // return id;
                } else {
                    // return findValidID(attempts + 1, maxAttempts, max); // Make the next AJAX call
                    findValidID(attempts + 1, maxAttempts, max)
                    .then(resolve)
                    .catch(reject);
                }
            });
        });
    }

});
