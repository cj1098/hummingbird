Hummingbird.LibraryEntry = DS.Model.extend
  anime: DS.belongsTo('anime')
  status: DS.attr('string')
  rating: DS.attr('number')
  episodesWatched: DS.attr('number')
  private: DS.attr('boolean')
  rewatching: DS.attr('boolean')
  rewatchCount: DS.attr('number')
  notes: DS.attr('string')
  lastWatched: DS.attr('date')

  positiveRating: (-> @get('rating') >= 3.6).property('rating')
  negativeRating: (-> @get('rating') <= 2.4).property('rating')
  neutralRating: (-> @get('rating') > 2.4 and @get('rating') < 3.6).property('rating')
