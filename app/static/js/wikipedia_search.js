$(document).ready(function() {
    $('#wikiForm').submit(function(e) {
        e.preventDefault(); // Prevent the form from submitting

        // Get the user's input
        var query = $('#query').val();
        clearPrevious();

        // Make an AJAX request to get the Wikipedia summary
        $.get('/get_wikipedia_summary', { query: query }, function(response) {
            // Check if the response contains a disambiguation error
            if (response.error && response.error.code === "disambiguation") {
                // Handle disambiguation error by showing buttons for each option
                showDisambiguationOptions(response.error.options);
            } else {
                // Display the summary if there's no disambiguation error
                $('#summary').text(response.summary);
            }
        });
    });
    // Function to show buttons for each disambiguation option
    function showDisambiguationOptions(options) {
        var buttonsHtml = '';
        options.forEach(function (option, index) {
            buttonsHtml += '<button class="disambiguation-option btn btn-primary btn-lg shadow" type="submit" data-query="' + option + '">' + option + '</button>';
        });

        // Display buttons in a container (e.g., a div with id "disambiguation-options")
        $('#disambiguation-options').html(buttonsHtml);

        // Add click event handler for disambiguation options
        $('.disambiguation-option').click(function () {
            var selectedQuery = $(this).data('query');
            console.log(selectedQuery);
            // Make a new AJAX request with the selected option
            $.get('/get_wikipedia_summary', { query: selectedQuery}, function (response) {
                // Display the summary for the selected option
                $('#summary').text(response.summary);
            });
        });
    }

    function clearPrevious(){
        $('#disambiguation-options').html("");
        $('#summary').text("");
    }
});
