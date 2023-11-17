$(document).ready(function() {
    $('#wikiForm').submit(function(e) {
        e.preventDefault(); // Prevent the form from submitting

        // Get the user's input
        var food = $('#food').val();

        // Make an AJAX request to get the Wikipedia summary
        $.get('/get_nutrition', { query: food }, function(response) {
            console.log(response);
            // $('#summary').text(response[0].food_description);
            showOptions(response);
        });
    });
    function showOptions(options){
        console.log("showing options: ");
        var buttonsHtml = '';
        options.forEach(function (option, index) {
            specific_food = option.food_type + " " + option.food_name;
            if (option.hasOwnProperty("brand_name")) {
                specific_food = option.brand_name + " " + option.food_name;
            }
            buttonsHtml += '<button class="option btn btn-primary btn-lg shadow" type="submit" data-query="'
                + specific_food + '">' + specific_food + '</button>';
        });

        // Display buttons in a container (e.g., a div with id "disambiguation-options")
        $('#options').html(buttonsHtml);

        // Add click event handler for disambiguation options
        $('.option').click(function () {
            var selectedQuery = $(this).data('query');
            console.log(selectedQuery);
            // Make a new AJAX request with the selected option
            $.get('/get_nutrition', { query: selectedQuery}, function (response) {
                // Display the summary for the selected option
                $('#summary').text(response[0].food_description);
            });
        });
    }
});
