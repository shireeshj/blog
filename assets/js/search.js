// this file helps in searching

// this template came from cloudcannon's course, search for searching using lunr.js
// link to git repo: https://github.com/CloudCannon/bakery-store-jekyll-template/tree/lunrjs

  // Fetch and filter search results
  async function searchPosts() {
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");
    const query = input.value.trim();
  
    // Exit if the query is empty
    if (!query) {
      dropdown.style.display = "none"; // Hide dropdown if query is empty
      dropdown.innerHTML = ""; // Clear previous results
      return;
    }
  
    try {
      // Fetch the search data
      const response = await fetch("search.json");
      const posts = await response.json();
  
      // Log the query and post data for debugging
      console.log("Query:", query);
      console.log("Posts:", posts);
  
      // Filter posts based on the query
      const results = posts.filter(post => {
        const title = post.title ? post.title.toLowerCase() : '';
        const category = post.category ? post.category.toLowerCase() : '';
        const content = post.content ? post.content.toLowerCase() : '';
  
        const matches = (
          title.includes(query.toLowerCase()) ||
          category.includes(query.toLowerCase()) ||
          content.includes(query.toLowerCase())
        );
  
        return matches;
      });
  
      // Log the results after filtering for debugging
      console.log("Filtered Results:", results);
  
      // If there are results, display the dropdown
      if (results.length > 0) {
        dropdown.style.display = "block"; // Show dropdown
        dropdown.innerHTML = results
          .map(
            result => `
              <a href="${result.url}" class="dropdown-item">
                <strong>${result.title}</strong><br />
              </a>
            `
          )
          .join(""); // Create dropdown items from the results
      }else {
        dropdown.style.display = "block"; // Ensure dropdown is visible
        dropdown.innerHTML = `<p class="dropdown-item">No result found</p>`; // Show "No result found"
      }
  
      // Log the final dropdown content for debugging
      console.log("Dropdown HTML:", dropdown.innerHTML);
  
    } catch (error) {
      console.error("Error fetching or parsing search data:", error);
      dropdown.style.display = "none"; // Hide dropdown on error
    }
  }
  
//// for console testing only ////

//// copy paste the below code in console one section at a time ////

//// then see the value of searchTerm, searchResults, results, window.store ////


/*

============================================

// work starts from here,
// this is step 1

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }
  }

  var searchTerm = getQueryVariable('query');
// above line returns all the words typed in by the user, seperated by space
// datatype of searchTerm is string, not array

============================================

function displaySearchResults(results, store) {
    var searchResults = document.getElementById('search-results');

    if (results.length) { // Are there any results?
      var appendString = '';

      for (var i = 0; i < results.length; i++) {  // Iterate over the results
        var item = store[results[i].ref];

        //the heading first
        appendString += '<li><a href="/blog' + item.url + '"><h3>' + item.title + '</h3></a>';

        //content of the post, truncated to first 150 characters
        appendString += '<p>' + item.content.substring(0, 150) + '...</p></li>';
      }

      searchResults.innerHTML = appendString;
    }

    else {
      searchResults.innerHTML = '<li>No results found</li>';
    }

  }


  if (searchTerm) {
    document.getElementById('search-box').setAttribute("value", searchTerm);

    // Initalize lunr with the fields it will be searching on. I've given title
    // a boost of 10 to indicate matches on this field are more important.

    var idx = lunr(function () {
      this.field('id');
      this.field('category', { boost: 100});
      this.field('title', { boost: 10 });
      this.field('content');

      //below line is not working
      //this.ref('url');
    });


    for (var key in window.store) { // Add the data to lunr
      idx.add({
        'id': key,
        'title': window.store[key].title,
        'author': window.store[key].author,
        'category': window.store[key].category,
        'content': window.store[key].content
      });

      var results = idx.search(searchTerm); // Get lunr to perform a search
      displaySearchResults(results, window.store); // We'll write this in the next section
    }
  }
*/
