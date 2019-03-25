function searchFilm(myQuery) {
  $.ajax({
    url:"https://api.themoviedb.org/3/search/movie?api_key=e99307154c6dfb0b4750f6603256716d",
    method:"GET",
    data:{query:myQuery,language:"it-IT"},
    success:function(data,state){
      if (data.results.length>0) {
        var results=data.results;
        populateUI(results);
      } else {
        alert("La ricerca non ha fornito alcun risultato!");
      }
    },
    error:function(request,state,error){
      console.log(request);
      console.log(state);
      console.log(error);
    }
  });
}

function populateUI(results) {
  var infoWrapper=$(".info-wrapper");
  var filmInfoTemplate=$("#film-info-template").html();
  var compiled=Handlebars.compile(filmInfoTemplate);

  for (var i = 0; i < results.length; i++) {
    var film=results[i];
    var stars=getStars(film.vote_average);
    var noStars=5-stars;
    var arrStars=getArrStars(stars);
    var arrNoStars=getArrStars(noStars);

    var inData={
      title:film.title,
      originalTitle:film.original_title,
      language:getLanguage(film.original_language),
      stars:arrStars,
      noStars:arrNoStars
    }

    var filmInfo= compiled(inData);
    infoWrapper.append(filmInfo);
  }
}

function getArrStars(stars) {
  var arrStars=[];

  for (var i = 0; i < stars; i++) {
    arrStars.push("");
  }

  return arrStars;
}

function getStars(rating) {
  var stars=Math.ceil(rating);
  stars=stars/2;
  stars=Math.ceil(stars);
  return stars;
}

function getLanguage(myLanguage){
  var language;

  switch (myLanguage) {
    case "it":
    language="Italiano"
    break;
    case "fr":
    language="Francese"
    break;
    case "en":
    language="Inglese"
    break;
    case "el":
    language="Greco"
    break;
    default:
    language="Inglese"
  }

  return language;
}

function init(){
  var searchInput=$("#search-input");
  var magnifier=$("#magnifier");

  searchInput.on('keydown', function(e) {
    var myQuery=searchInput.val();
    if (e.which == 13) {
      if (myQuery.length>0) {
        searchFilm(myQuery);
      } else {
        alert("Immettere un parametro di ricerca!");
      }
    }
  });

  magnifier.click(function functionName() {
    var myQuery=searchInput.val();
    if (myQuery.length>0) {
      searchFilm(myQuery);
    } else {
      alert("Immettere un parametro di ricerca!");
    }
  });
}

$(document).ready(init);
