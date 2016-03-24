/* CURRENTLY IN: javascript/main.js */


function runTrelloCMS() {
	var trelloCMS = $('.trello-cms');

	if ( trelloCMS.length === 0 ) return;

	var trelloCards;
	var currentTrelloCard = 0;

	// if we are here, then run our trello code

	var accessToken = 'fd025120631f65e5545097630d333b6a370ff875effe0876a2b36ce410b6a124'; // use insturctions above
	var key = 'c4a24ef226c3216e0f06a34a2ff7e85f';

	var tAPI = TrelloAPI.init( key, accessToken );
	tAPI.getAllCards('Dana\'s Website', function( cards ) {

		trelloCards = cards;
	    console.log('hello wrold', cards, cards[0].attachments[0]);
	    var getPic = getUrl( cards[currentTrelloCard].attachments[0] );

	    $('.page-content--pic').css("background-image", getPic );
	    
	});

	$('.js-right').on('click', function() {
		
		currentTrelloCard++;

		if (currentTrelloCard > (trelloCards.length-1) ) {
			currentTrelloCard = 0;
		}

		var newCard = trelloCards[ currentTrelloCard ];

		tAPI.getCard(newCard.id, function( card ) {
			var getPic = getUrl( card.attachments[0] );

		    $('.page-content--pic').css("background-image", getPic );
		});
	});
	$('.js-left').on('click', function() {
		
		currentTrelloCard--;

		if (currentTrelloCard < 0) {
			currentTrelloCard = trelloCards.length - 1;
		}

		var newCard = trelloCards[ currentTrelloCard ];

		tAPI.getCard(newCard.id, function( card ) {
			var getPic = getUrl( card.attachments[0] );

		    $('.page-content--pic').css("background-image", getPic );
		});

	});
	$('.js-gallery').on('click', function() {

		$('.gallery-view').css('display', 'flex');
		$('.slider-view').hide();
		$('.mdl-button').hide();

		tAPI.getAllCardAttachments( trelloCards, function( card, cardIdx ) {
			console.log( card );

			var cardImage = $('<div/>');
			cardImage.addClass('demo-card-image mdl-card mdl-shadow--2dp');
			var getPic = getUrl( card.attachments[0] );
			cardImage.css('background-image', getPic);
			cardImage.attr('data-num', cardIdx );

			/*HIDING IMAGE TITLE
			var cardTitle = $('<div/>');
			cardTitle.addClass('mdl-card__title mdl-card--expand');
			

			var cardAction = $('<div/>');
			cardAction.addClass('mdl-card__actions');

			var cardFileName = $('<span/>');
			cardFileName.addClass('demo-card-image__filename');
			cardFileName.text( card.name );

			cardAction.append( cardFileName );
			cardImage.append(cardTitle);
			cardImage.append( cardAction );
			*/

			$('.gallery-view').append( cardImage );

			/*
				<div class="demo-card-image mdl-card mdl-shadow--2dp">
				  <div class="mdl-card__title mdl-card--expand"></div>
				  <div class="mdl-card__actions">
				    <span class="demo-card-image__filename">Image.jpg</span>
				  </div>
				</div>
			*/
		});
	});

	$('body').on('click', '.demo-card-image', function() {
		
		currentTrelloCard = $( this ).attr('data-num');
		
		var newCard = trelloCards[ currentTrelloCard ];

		tAPI.getCard(newCard.id, function( card ) {
			var getPic = getUrl( card.attachments[0] );

		    $('.page-content--pic').css("background-image", getPic );
		});
		
		
		// unswap the slider-view and gallery-view
		// set slider-view to display flex
		// set gallery-view to display none (look up, we do this backwards before)
		$('.slider-view').css('display', 'flex');
		$('.gallery-view').hide();
		$('.js-left').show();
		$('.js-right').show();
		$('.js-gallery').show();
	});
}

function getUrl(attachment){
	return "url('"+attachment+"')";
}

runTrelloCMS();
