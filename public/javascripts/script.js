//----- NEXT STEPS -----
// <i class="fa fa-coffee" aria-hidden="true"></i>
// <i class="fa fa-glass" aria-hidden="true"></i>
// <i class="fa fa-cutlery" aria-hidden="true"></i>
// <i class="fa fa-building" aria-hidden="true"></i>

let SEARCH_CITY;
let CITIES = [
	{city: "New York, NY", path: "newyork"},
	{city: "Chicago, IL", path: "chicago"},
	{city: "Boston, MA", path: "boston"},
	{city: "Miami, FL", path: "miami"},
	{city: "Nashville, TN", path: "nashville"},
	{city: "Indianapolis, IN", path: "indianapolis"},
	{city: "Las Vegas, NV", path: "lasvegas"},
	{city: "Los Angelas, CA", path: "losangelas"},
	{city: "Portland, OR", path: "portland"},
	{city: "Seattle, WA", path: "seattle"},



];


function takeSearchTerm(searchCity){
	for (let i=0; i<CITIES.length; i++){
		if (searchCity == CITIES[i]['city']){
			SEARCH_CITY = CITIES[i];
		}
	}
}

//function that handles the click of the Submit button
function handleSubmitClick(){
	$('.js-search-buttons').on('click','.js-city-button', e => {

		console.log('handleSubmitClick ran');
		e.preventDefault();
		e.stopPropagation();
		$('.js-search-buttons').slideUp("slow", function(){
			let searchText = $(e.currentTarget).text();
			takeSearchTerm(searchText);
			cityYelpPlaces();
			cityYelpEvents();
			cityTwitterResults();
			handleTabs();
			bingNews();
			$('#city-menu-button').removeClass('hidden');
			$('#city-menu-button').toggleClass('active');
		});
	});
};

$('#city-menu-button').click(function(){
	$('.js-search-buttons').slideToggle("slow");
	$('#city-menu-button').toggleClass('active');

});


// $('.js-search-buttons').on('click','.js-city-button', function(){
// 	console.log('BUTTON WAS CLICKED');
	 
// });

//function that returns search results for city for coffee, bars, restaurants, and things to do
//Known Issues: None
function cityYelpPlaces(){
	console.log('cityYelpPlaces ran');
	$('.js-yelp-tabs').html("");
	$('.js-yelp-results').html(``);
	let searchTerms = [
		{term: 'coffee', icon: '<i class="fa fa-coffee fa-2x" aria-hidden="true"></i>' }, 
		{term: 'restaurants', icon:'<i class="fa fa-utensils fa-2x" aria-hidden="true"></i>'}, 
		{term: 'nightlife', icon:'<i class="fa fa-glass-martini fa-2x" aria-hidden="true"></i>'}, 
		{term: 'things to do', icon:'<i class="fa fa-building fa-2x" aria-hidden="true"></i>'}];
	let resultsToRender = ``;
	for (let i=0; i<searchTerms.length; i++){
		$.ajax({
            url: "/searchYelpPlaces",
            type: 'POST',
            data: {
            	search: searchTerms[i]['term'],
            	location: SEARCH_CITY['city']
            },
            success: function(res) {
                // console.log(res);
            	renderYelpPlacesHtml(res, searchTerms[i]);
            	$('.js-yelp-tabs :first-child').addClass("current");
				$('.js-yelp-results ul:first-of-type').addClass("current");


            }
        });

	}

};

function bingNews(){
	console.log('bingNews ran');
	$('.js-bing-results').html("");
	$.ajax({
            url: "/bingNews",
            type: 'POST',
            data: {
            	location: SEARCH_CITY['city']
            },
            success: function(res) {
                console.log(res);
                renderBingResults(res);
            }
        });
}

//function that returns event results for city
//this uses a different API endpoint than the search API
//currently hardcoded to test "indianapolis-in-us"
//Known Issues: currently not working... see routes/index.js
function cityYelpEvents(){
	console.log('cityYelpEvents ran');
	$('.js-yelp-events').html(``);
	let resultsToRender = ``;
	$.ajax({
		url: "/searchYelpEvents",
		type: 'POST',
		data: {
			search: "events",
			location: SEARCH_CITY['city']
		},
		success: function(res) {
                console.log(res);
                renderYelpEventsHtml(res);

            }
        });

};

// HOW do we display these results in the typical Twitter styling, including anchor links to handles and hashtags???
// Tweet HTML/CSS: https://codepen.io/jsweetie/pen/dXLyYG, 
//If there is a space in the city name (e.g. New York), the space needs to be removed - this can be addressed with hard-coded button search options
function cityTwitterResults(){
	console.log('cityTwitterResults ran');
	$('.js-twitter-results').html(``);
	let resultsToRender = ``;
	let searchTerm=`#${SEARCH_CITY['path']}`;
	$.ajax({
            url: "/searchTwitter",
            type: 'POST',
            data: {
            	search: SEARCH_CITY['path'],
            	result_type: "popular"
            },
            success: function(res) {
            	console.log(res);
            	renderTwitterHtml(res, searchTerm);

            }
        });

}

//function to structure and render HTML for YelpPlaces results
//TO-DO: modify terms to be more descriptive and to have less redundancy
function renderYelpPlacesHtml(res, searchTerm){
	console.log('renderYelpPlacesHtml ran');
	let htmlToRender = "";
	let numberOfResults = 5;
	for (let i=0; i<numberOfResults; i++){
		htmlToRender += `
		<li class="list-container">
			<a class="results-img-link" href=${res[i]['url']} target="_blank"><img class="results-img" src=${res[i]['image_url']} alt="${res[i]['name']} image"></a>
			<a class="results-link" href=${res[i]['url']} target="_blank">${res[i]['name']}</a>
		</li>`;


	}
	// <li class="tab-link" data-tab="${searchTerm.replace(/\s+/g, '')}">${searchTerm.replace(/\s+/g, '')}</li>;
	let headerTab =`
	<li class="tab-link" data-tab="${searchTerm['term'].replace(/\s+/g, '')}">${searchTerm['icon']}</li>`;
	let htmlToPass = 
		// <h3 class="yelp-results-header">${searchTerm}</h3>
		`
		<ul class="yelp-results-list" id="${searchTerm['term'].replace(/\s+/g, '')}">
			${htmlToRender}
		</ul>`;
	$('.js-yelp-tabs').append(headerTab);
	$('.js-yelp-results').append(htmlToPass);
}


function renderBingResults(res){
	console.log('renderBingResults ran');
	let htmlToRender = "";
	let numberOfResults = 5;
	for (let i=0; i<numberOfResults; i++){
		let resultImage;
		if (res.value[i].image != undefined){
			resultImage = `<a class="" href=${res.value[i]['url']} target="_blank"><img class="results-img" src=${res.value[i].image.thumbnail.contentUrl} alt="story image"></a>` 
		} else {
			resultImage = "";
		}
		htmlToRender += `
		<li class="list-container">
			${resultImage}
			<a class="results-link news-text" href=${res.value[i]['url']} target="_blank">${res.value[i]['name']}</a>
		</li>`
		// <a class="results-link" href=${res.value[i]['url']} target="_blank">${res.value[i]['name']}</a>
	}
	console.log(htmlToRender);
	let htmlToPass = `
		<h3 class="bing-results-header">news</h3>
		<ul class="bing-results-list">
			${htmlToRender}
		</ul>`;
	$('.js-bing-results').append(htmlToPass);
}

//function to structure and render HTML for YelpEvents results
//TO-DO: modify terms to be more descriptive and to have less redundancy
function renderYelpEventsHtml(res){
	console.log('renderYelpEventsHtml ran');
	let htmlToRender = "";
	let numberOfResults = 5;
	for (let i=0; i<numberOfResults; i++){
		htmlToRender += `
		<li class="list-container">
			<a class="results-img-link" href=${res[i]['url']} target="_blank"><img class="results-img" src=${res[i]['image_url']} alt="${res[i]['name']} photo"></a>
			<a class="results-link" href=${res[i]['url']} target="_blank">${res[i]['name']}</a>
		</li>`
	}
	let htmlToPass = `
		<h3 class="yelp-results-header">events</h3>
		<ul class="yelp-events-list">
			${htmlToRender}
		</ul>`;
	$('.js-yelp-events').append(htmlToPass);
}

//takes in tweets object and current tweet and reformats it to include links
function tweetFormat(tweet){
	console.log("tweetFormat ran");
	let tweetText = tweet.text;
	let hashtags = tweet.entities.hashtags;
	let urls = tweet.entities.urls;
	let userMentions = tweet.entities.user_mentions;

  	for (let i=0; i<hashtags.length; i++){
    	tweetText = tweetText.replace(`#${hashtags[i].text}`, `<a href=https://twitter.com/search?q=%23${hashtags[i].text} target="_blank">#${hashtags[i].text}</a>`);
  	}
  	for (let i=0; i<urls.length; i++){
    	tweetText = tweetText.replace(`${urls[i].url}`, `<a href=${urls[i].url} target="_blank">${urls[i].url}</a>`);
  	}
  	for (let i=0; i<userMentions.length; i++){
    	tweetText = tweetText.replace(`@${userMentions[i].screen_name}`, `<a href=https://twitter.com/search?q=%40${userMentions[i].screen_name} target="_blank">@${userMentions[i].screen_name}</a>`);
  	}
	return tweetText;
}

//function to stucutre and render HTML for Twitter Results
//TO-DO: insert anchor links
//TO-DO: include user images
function renderTwitterHtml(res, searchTerm){
	console.log('renderTwitterHtml ran');
	let htmlToRender = "";
	let numberOfResults = 5;
	for (let i=0; i<Math.min(numberOfResults, res.statuses.length); i++){
		let currentTweet = res.statuses[i];
		// let currentTweet = `${res.statuses[i].text}`;
		let formattedTweet = tweetFormat(currentTweet);
		htmlToRender += `
		<li class="list-container">
			<a class="results-img-link" href=${res.statuses[i].user.url} target="_blank"><img class="results-img" src=${res.statuses[i].user.profile_image_url_https} alt="tweet photo"></a>
			<p class="tweet-text">${formattedTweet}</p>
		</li>`
	}
	let htmlToPass = `
		<h3><a href="https://twitter.com/search/?q=%23${SEARCH_CITY['path']}" target="_blank">${searchTerm}</a></h3>
		<ul class="twitter-results-list">
			${htmlToRender}
		</ul>`;
	// console.log(htmlToPass);
	$('.js-twitter-results').append(htmlToPass);
}

//changes tab results content
function handleTabs(){
	console.log('handleTabs ran');
	$('ul.js-yelp-tabs').on('click', '.tab-link', function(){
		console.log('tab clicked');
		let tab_id = $(this).attr('data-tab');
		$('ul.js-yelp-tabs li').removeClass('current');
		$('.yelp-results-list').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	});
}

function renderButtons(cities){
	let citiesButtons = "";
	for (let i=0; i<cities.length; i++){
		citiesButtons += `
		<button class="js-city-button city-button" type="submit" value=${cities[i]['city']}>${cities[i]['city']}</button>
		`
	}
	$('.js-search-buttons').append(citiesButtons);
		// $('.js-search-buttons').html(citiesButtons);

}

handleSubmitClick();
renderButtons(CITIES);

