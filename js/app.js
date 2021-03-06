// Add foundation dynamic functionality on page
$(document).foundation();

// Set the API base url
var API_URL = "https://loopback-rest-api-demo-ziad-saab.c9.io/api";

// Get a reference to the <div id="app">. This is where we will output our stuff
var $app = $('#app');

// Get underscore library
var _ = require('underscore');

// Data retrieval functions
function getAddressBooks(pageNumber) {
    var skipNb = pageNumber * 5;
    var filter = '?filter={"order": "name ASC", "limit": 5, "skip": ' + skipNb + '}';
    return $.getJSON(API_URL + '/AddressBooks' + filter);
}

function getAddressBook(id) {
    return $.getJSON(API_URL + '/AddressBooks/' + id);
}

function getEntries(addressBookId, pageNumber) {
    var skipNb = pageNumber * 5;
    var filter = '?filter={"order": "lastName ASC", "limit": 5, "skip": ' + skipNb + '}';
    return $.getJSON(API_URL + '/AddressBooks/' + addressBookId + '/entries' + filter);
}

function getEntry(entryId) {
    var filter = '?filter={"include":["addresses","phones","emails"]}';
    return $.getJSON(API_URL + '/Entries/' + entryId + filter);
}
// End data retrieval functions

// Functions that display things on the screen (views)
function displayAddressBooksList(pageNumber) {
    getAddressBooks(pageNumber).then(
        function(addressBooks) {

            $app.html(''); // Clear the #app div
            $app.append('<h2>Address Books List</h2>');
            $app.append('<ul>');

            addressBooks.forEach(function(ab) {
                $app.find('ul').append('<li class = "list" data-id="' + ab.id + '">' + ab.name + '</li>');
            });

            $app.find('li').on('click', function() {
                var addressBookId = $(this).data('id');
                console.log(addressBookId);
                displayAddressBook(addressBookId, 0, pageNumber);
            });

            if (addressBooks.length === 0) {
                $app.append("<div>No more addressbooks, please return to the previous page.</div>");
            }

            var $prevButton = $('<a href="#" class="button">Previous Page</a>');
            var $nextButton = $('<a href="#" class="button">Next Page</a>');

            $app.append($prevButton);
            $app.append($nextButton);

            if (pageNumber > 0) {
                $prevButton.on("click", function() {
                    displayAddressBooksList(pageNumber - 1);
                });
            }
            else {
                $prevButton.toggleClass("disabled");
            }

            if (addressBooks.length === 5) {
                $nextButton.on("click", function() {
                    displayAddressBooksList(pageNumber + 1);
                });
            }
            else {
                $nextButton.toggleClass("disabled");
            }
        }
    )
}


function displayAddressBook(addressBookId, pageNumber, pageAb) {
    if (!pageAb) pageAb = 0;

    getEntries(addressBookId, pageNumber).then(
        function(entries) {

            $app.html(''); // Clear the #app div

            var $backButton = $('<a href="#" class="button expand">Back to the Address Books list</a>');
            $app.append($backButton);
            $backButton.on("click", function() {
                displayAddressBooksList(pageAb);
            });

            $app.append('<h2>Entries List of the Address Book ' + addressBookId + '</h2>');
            $app.append('<ul>');

            //console.log(entries);

            entries.forEach(function(e) {
                $app.find('ul').append('<li class = "list" data-id="' + e.id + '">' + e.lastName + ' ' + e.firstName + '</li>');
            });

            $app.find('li').on('click', function() {
                var entryId = $(this).data('id');
                displayEntry(entryId);
            });

            if (entries.length === 0) {
                $app.append("<div>No more entries, please return to the previous page.</div>");
            }

            var $prevButton = $('<a href="#" class="button">Previous Page</a>');
            var $nextButton = $('<a href="#" class="button">Next Page</a>');

            $app.append($prevButton);
            $app.append($nextButton);

            if (pageNumber > 0) {
                $prevButton.on("click", function() {
                    displayAddressBook(addressBookId, pageNumber - 1);
                });
            }
            else {
                $prevButton.toggleClass("disabled");
            }

            if (entries.length === 5) {
                $nextButton.on("click", function() {
                    displayAddressBook(addressBookId, pageNumber + 1);
                });
            }
            else {
                $nextButton.toggleClass("disabled");
            }

        }
    )
}

function displayEntry(entryId) {
    getEntry(entryId).then(
        function(entry) {
            
            $app.html(''); // Clear the #app div

            // console.log(entry);

            var $backButton = $('<a href="#" class="button expand">Back to the Entries list</a>');
            $app.append($backButton);
            $backButton.on("click", function() {
                displayAddressBook(entry.addressBookId, 0);
            });

            var entryTemplate = _.template( $('#entry-template').html() );
            var entryTable = entryTemplate(entry);
            $app.append(entryTable);

            $app.find('i.fi-pencil').on("click", function() {
                var tr = $(this).parent().parent();
                //console.log(tr);
                tr.toggleClass("edit");
                tr.toggleClass("view");
            })
        }
    )
}


// End functions that display views


// Start the app by displaying all the addressbooks
displayAddressBooksList(0);