var TrelloAPI = (function() {
    
    var _TrelloPromise = function( method, path, params ) {
        return new Promise(function( resolve, reject ) {
            Trello.rest(method, path, params, function(data){
                resolve( data );
            }, function(error) {
                reject( error );
            });
        });
    }; // as promise for chainability
    
    function _onFail( error ) {
        console.log( error );
    }
    
    function _onBoards( boardName, data ) {
        var board = data.filter(function(datum){
            return datum.name === boardName;
        });
        
        board = board[ 0 ];
        
        
        return new Promise(function(resolve, reject){
            if ( typeof board === 'undefined' ) {
                reject('Board name not found');
                return;
            }
            
            resolve(board);
        });
    }
    
    function _getCards( board ) {
        return _TrelloPromise('GET', 'boards/'+board.id+'/cards', this.opts)
            .then(function(cards){
                var allCards = cards.map(function(card){
                    return {
                        name: card.name,
                        desc: card.desc,
                        id: card.id
                    };
                });
                
                return new Promise(function(resolve, reject) {
                    if ( allCards.length === 0 ) {
                        reject('No cards found');
                        return;
                    }
                    
                    _getAttachment.call( this, allCards[0].id)
                        .then(function(attachmentUrls){
                            allCards[ 0 ].attachments = attachmentUrls;
                        
                            resolve(allCards);
                        });
                    
                }.bind(this));
            }.bind(this), _onFail);
    }
    
    function _getAttachment( cardId)/*, smallMode ) */{
        return _TrelloPromise('GET', 'cards/'+cardId+'/attachments', this.opts)
            .then(function(attachments) {
                var attachmentUrls = attachments.map(function(attachment){
                    /*if ( smallMode ) {
                        return attachment.previews[1].url;
                    }*/
                    return attachment.previews[ 5 ].url;
                });
                
                return new Promise(function(resolve, reject) {
                    resolve( attachmentUrls );
                });
            }, _onFail);
    }
    
    function TrelloAPI( key, accessToken ) {
        this.key = key;
        this.accessToken = accessToken;
        this.opts = {
            key: this.key,
            token: this.accessToken
        };
    }
    
    TrelloAPI.prototype.getCard = function( cardId, callback ) {
        var opts = $.extend({}, this.opts, {
            fields: 'name,id,desc'
        });
        
        var cardData;
        _TrelloPromise('GET', 'cards/'+cardId, opts)
            .then(function(data){
                cardData = data;
                return _getAttachment.call(this, cardData.id);
            }.bind(this))
            .then(function(attachmentUrls){
                cardData.attachments = attachmentUrls;
                if ( !callback ) return;
                callback( cardData );
            });
    };

    TrelloAPI.prototype.getAllCardAttachments = function( cards, callback ) {
        var attach = [];

        cards.reduce(function(promise, card, idx){
            return promise.then(function(data){
                if ( data !== 1 ) {
                    var newCard = cards[ idx - 1 ];
                    newCard.attachments = data;
                    attach.push( newCard );
                    if ( callback ) {
                        callback( newCard, idx-1 );
                    }
                }


                return _getAttachment.call( this, card.id, true );
            }.bind(this));
        }.bind(this), new Promise(function(resolve, reject){
            resolve(1);
        })).then(function(){
            if ( !callback ) return;

            // callback( attach );
        });
    };
    
    TrelloAPI.prototype.getAllCards = function( boardName, callback ) {
        var opts = this.opts;
        
        _TrelloPromise('GET', 'members/me/boards', this.opts )
            .then(_onBoards.bind(this, boardName), _onFail )
            .then(_getCards.bind(this), _onFail)
            .then(function(cards){
                if ( !callback ) return;
                
                callback( cards );
            }, _onFail);
    };

    return {
        init: function( key, accessToken ) {
            return new TrelloAPI( key, accessToken );
        }
    };    
})();
