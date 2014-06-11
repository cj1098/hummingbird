// Generated by CoffeeScript 1.6.3
Hummingbird.UserIndexController = Ember.ArrayController.extend({
  needs: "user",
  user: Ember.computed.alias('controllers.user'),
  waifu_slug: function () {
    var waifu_slug;
    waifu_slug = this.get('user.waifuSlug');
    return "/anime/" + waifu_slug;
  }.property('user.waifuSlug'),
  hasWaifu: Ember.computed.any('user.waifu'),
  hasLocation: Ember.computed.any('user.location'),
  hasWebsite: Ember.computed.any('user.website'),
  unselectingWaifu: false,

  bioCharsLeft: function () {
    return this.get('bioCharCounter') !== 0;
  }.property('bioCharCounter'),
  bioCharCounter: function () {
    var newLength, newString, remLength;
    newString = this.get('user.miniBio');
    if (newString === null || newString === void 0) {
      newString = "";
    }
    newLength = newString.length;
    remLength = 160 - newLength;
    if (remLength <= 0) {
      this.set('user.miniBio', newString.slice(0, 160));
      remLength = 0;
    }
    return remLength;
  }.property('user.miniBio'),

  sortProperties: ['createdAt'],
  sortAscending: false,
  newPost: "",
  inFlight: false,
  favorite_anime: [],
  favorite_anime_page: 1,
  isEditing: false,
  editingFavorites: false,
  selectChoices: ["Waifu", "Husbando"],
  selectedWaifu: null,
  can_load_more: function () {
    var page;
    page = this.get('favorite_anime_page');
    if (page * 6 + 1 <= this.get('favorite_anime').length) {
      return true;
    } else {
      return false;
    }
  }.property('favorite_anime_page', 'favorite_anime'),

  favorite_anime_list: function () {
    var animes = this.get('favorite_anime')
      , page = this.get('favorite_anime_page');

    // if using the goPrev and goNext page style, slice the array into a chunk 
    // animes = animes.slice( (page - 1) * 6, page * 6);

    // if using loadMoreFavorite_animes, slice the array from [0] to the page
    animes = animes.slice(0, page * 6);

    return animes;
  }.property('favorite_anime', 'favorite_anime_page'),


  actions: {
    unselectWaifu: function () {
      this.set('unselectingWaifu', true);
      return this.set('user.waifu', null);
    },
    editUserInfo: function () {
      return this.set('isEditing', true);
    },
    saveUserInfo: function () {
      this.set('unselectingWaifu', false);
      this.get('user.content').save();
      return this.set('isEditing', false);
    },
    editFav: function () {
      return this.set('editingFavorites', true);
    },
    doneEditingFav: function () {
      var data, list, url, _this;
      this.set('editingFavorites', false);
      url = "/api/v1/users/" + this.get('currentUser.id') + '/favorite_anime/update';
      list = this.get('favorite_anime_list');
      _this = this;
      data = {};

      list.forEach(function (item) {
        return data[item.fav_id] = {
          id: item.fav_id,
          user_id: _this.get('currentUser.id'),
          fav_rank: item.fav_rank
        };
      });

      // FIXME this should be using ember-data
      return Ember.$.ajax({
        url: url,
        data: {
          data: data
        },
        method: 'POST',
        failure: function () {
          return console.log("Failed to Update Favorites Ranks");
        }
      });
    },

    didSelectWaifu: function (character) {
      this.set('selectedWaifu', character);
      this.get('user').set('waifu', character.value);
      return this.get('user').set('waifuCharId', character.char_id);
    },
    loadMoreFavorite_animes: function () {
      var page;
      page = this.get('favorite_anime_page');
      if (page * 6 + 1 <= this.get('favorite_anime').length) {
        ++page;
        return this.set('favorite_anime_page', page);
      }
    },

    goPrevPage: function () {
      var page;
      page = this.get('favorite_anime_page');
      if (page > 1) {
        --page;
        return this.set('favorite_anime_page', page);
      }
    },
    goNextPage: function () {
      var page;
      page = this.get('favorite_anime_page');
      if (page * 6 + 1 <= this.get('favorite_anime').length) {
        ++page;
        return this.set('favorite_anime_page', page);
      }
    },

    // FIXME This is _broken_.
    submitPost: function (post) {
      var newPost, _this;
      _this = this;
      newPost = this.get('newPost');

      if (newPost.length > 0) {
        this.set('inFlight', true);
        return Ember.$.ajax({
          url: "/users/" + _this.get('user.id') + "/comment.json",
          data: {
            comment: newPost
          },
          type: "POST",
          success: function (payload) {
            var stories;
            stories = _this.store.find('story', {
              user_id: _this.get('userInfo.id')
            });
            _this.setProperties({
              newPost: "",
              inFlight: false
            });
            window.location.href = window.location.href;
          },
          failure: function () {
            return alert("Failed to save comment");
          }
        });
      } else {

      }
    }
  },

  animeBreakdown: function(){
    return [{
      value: parseInt(this.get('userInfo.animeWatched')),
      color:"#ec8661"
    },{
      value : (parseInt(this.get('userInfo.animeTotal')) - parseInt(this.get('userInfo.animeWatched'))),
      color : "#f7cab9"
    }];
  }.property(),

  animeOptions: function(){
    return {
      percentageInnerCutout : 75,
      segmentShowStroke : false,
      segmentStrokeWidth : 0,
      animation : false
    }
  }.property(),

  lifeSpentOnAnimeFmt: function () {
    var days, hours, minutes, months, str, years;
    minutes = this.get('userInfo.lifeSpentOnAnime');

    if (minutes === 0)
      return "0 minutes";

    years = months = days = hours = 0;
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    days = Math.floor(hours / 24);
    hours = hours % 24;
    months = Math.floor(days / 30);
    days = days % 30;
    years = Math.floor(months / 12);
    months = months % 12;

    str = "";
    if (years > 0) {
      str += years + " " + (years === 1 ? "year" : "years");
    }
    if (months > 0) {
      if (str.length > 0) {
        str += ", ";
      }
      str += months + " " + (months === 1 ? "month" : "months");
    }
    if (days > 0) {
      if (str.length > 0) {
        str += ", ";
      }
      str += days + " " + (days === 1 ? "day" : "days");
    }
    if (hours > 0) {
      if (str.length > 0) {
        str += ", ";
      }
      str += hours + " " + (hours === 1 ? "hour" : "hours");
    }
    if (minutes > 0) {
      if (str.length > 0) {
        str += " and ";
      }
      str += minutes + " " + (minutes === 1 ? "minute" : "minutes");
    }

    return str;
  }.property('userInfo.lifeSpentOnAnime'),

  viewingSelf: function () {
    return this.get('controllers.user.id') === this.get('currentUser.id');
  }.property('model.id')
});
